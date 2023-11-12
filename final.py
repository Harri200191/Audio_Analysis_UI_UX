import tkinter as tk 
import speech_recognition as sr 
from tkinter import filedialog 
import shutil
import moviepy.editor as mp 
from pydub import AudioSegment 
import spacy
import os 

#----------------------------------------------------------------------
def split_audio(input_audio, output_dir, segment_length_ms):
    print("Proccessing Input........")
    # Load the audio file
    audio = AudioSegment.from_file(input_audio)
    
    # Calculate the segment length in milliseconds
    total_length_ms = len(audio)
    
    # Calculate the number of segments
    num_segments = total_length_ms // segment_length_ms
    
    # Split the audio into 1-minute segments
    for i in range(num_segments):
        start_time = i * segment_length_ms
        end_time = (i + 1) * segment_length_ms
        segment = audio[start_time:end_time]
        
        # Save each segment as a separate audio file
        segment.export(os.path.join(output_dir, f"segment_{i}.wav"), format="wav")
    
    # Split the last segment (if it's not a full minute)
    if total_length_ms % segment_length_ms > 0:
        start_time = num_segments * segment_length_ms
        end_time = total_length_ms
        last_segment = audio[start_time:end_time]
        last_segment.export(os.path.join(output_dir, f"segment_{num_segments}.wav"), format="wav")

def transcribe_audio_segments(segment_dir):
    print("Converting to text........")
    recognizer = sr.Recognizer()
    
    transcribed_texts = []
    
    for filename in os.listdir(segment_dir):
        if filename.endswith(".wav"):
            audio_file = os.path.join(segment_dir, filename)
            
            with sr.AudioFile(audio_file) as source:
                audio_text = recognizer.record(source)
                text = recognizer.recognize_google(audio_text)
                transcribed_texts.append(text)
    
    return transcribed_texts

def join_transcribed_texts(texts):
    return " ".join(texts)

# Load a spaCy NLP model
nlp = spacy.load("en_core_web_sm")

def video_to_mp3(video_file):
    try:  
        video_clip = mp.VideoFileClip(video_file) 
        audio_clip = video_clip.audio 
        mp3_file = video_file.rsplit(".", 1)[0] + ".mp3"
        audio_clip.write_audiofile(mp3_file, codec="mp3")

        return mp3_file
    except Exception as e:
        return f"Error: {str(e)}"

def select_and_store_file():
    root = tk.Tk()
    root.withdraw()  

    file_path = filedialog.askopenfilename(filetypes=[("Video and Audio Files", "*.mp3 *.mp4 *.wav *.flac *.avi *.mkv")])

    if file_path: 
        file_name = file_path.split("/")[-1]
        extension = file_name.split(".")[-1]
        destination_path = f"./mainFile.{extension}"

        try: 
            shutil.copyfile(file_path, destination_path)

            print(f'Selected file copied to current directory: {destination_path}')
        except Exception as e:
            print(f"Error copying the file: {str(e)}")

        return destination_path
    else:
        print("No file selected.") 

def mp3_to_text(mp3_file):
    print("Loading........")
    try:  
        wav_filename = mp3_file.replace('.mp3', '.wav')
        AudioSegment.from_mp3(mp3_file).export(wav_filename, format="wav")

        # Initialize the recognizer
        recognizer = sr.Recognizer() 
        with sr.AudioFile(wav_filename) as source:
            audio_text = recognizer.record(source)
            text = recognizer.recognize_google(audio_text)

        return text
    
    except Exception as e:
        return f"Error: {str(e)}"
 
# Process transcribed text with spaCy
def analyze_text(text):
    doc = nlp(text) 
    person_count = len([ent.text for ent in doc.ents if ent.label_ == "PERSON"]) 
    topics = [token.text for token in doc if token.is_alpha and not token.is_stop]
    
    return person_count + 1 , topics
 
if __name__ == "__main__":
    mp3_file = select_and_store_file()  
    output_directory = "audio_segments" 
    
    # Create the output directory if it doesn't exist
    if not os.path.exists(output_directory):
        os.mkdir(output_directory)
    
    segment_length_ms = 60000  # 1 minute in milliseconds
    
    if (mp3_file.split(".")[-1] == "mp3"): 
        split_audio(mp3_file, output_directory, segment_length_ms)
        transcribed_texts = transcribe_audio_segments(output_directory)
        final_transcribed_text = join_transcribed_texts(transcribed_texts)
                    
        print("\nFinal Transcribed Text:")
        print(final_transcribed_text)

        person_count, topics = analyze_text(final_transcribed_text)

        print(f"Number of people speaking: {person_count}")
        print("Topics or keywords:", topics)
    
    else:
        converted_tomp3 = video_to_mp3(mp3_file)
        split_audio(converted_tomp3, output_directory, segment_length_ms)
        transcribed_texts = transcribe_audio_segments(output_directory)
        final_transcribed_text = join_transcribed_texts(transcribed_texts)
                    
        print("\nFinal Transcribed Text:")
        print(final_transcribed_text)

        person_count, topics = analyze_text(final_transcribed_text)

        print(f"Number of people speaking: {person_count}")
        print("Topics or keywords:", topics)
    

 
        
 
