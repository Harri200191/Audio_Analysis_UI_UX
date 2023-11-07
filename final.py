import tkinter as tk 
import speech_recognition as sr 
from tkinter import filedialog 
import shutil
import moviepy.editor as mp 
from pydub import AudioSegment 
import spacy

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
    
    return person_count, topics
 
if __name__ == "__main__":
    mp3_file = select_and_store_file()  

    if (mp3_file.split(".")[-1] == "mp3"):
        result = mp3_to_text(mp3_file)

        if "Error" in result:
            print(result)
        else:
            print("Text from MP3 file:")
            print(result)

            person_count, topics = analyze_text(result)
    
            print(f"Number of people speaking: {person_count}")
            print("Topics or keywords:", topics)
    
    else:
        converted_tomp3 = video_to_mp3(mp3_file)
        result = mp3_to_text(converted_tomp3)

        if "Error" in result:
            print(result)
        else:
            print("Text from MP3 file:")
            print(result)

            person_count, topics = analyze_text(result)
    
            print(f"Number of people speaking: {person_count}")
            print("Topics or keywords:", topics)

 
        
 
