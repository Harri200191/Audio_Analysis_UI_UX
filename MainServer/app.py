import os 
import speech_recognition as sr 
import nltk
import string
from nltk.sentiment.vader import SentimentIntensityAnalyzer 
from flask import Flask, request, jsonify
from flask_cors import CORS
from pydub import AudioSegment  
from transformers import pipeline
import spacy
import moviepy.editor as mp 
from moviepy.editor import VideoFileClip  
from googletrans import Translator 
from openai import OpenAI
import math
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=api_key)

app = Flask(__name__)
CORS(app, origins="http://localhost:3000", supports_credentials=True)

nlp = spacy.load("en_core_web_sm")

@app.route('/api/analyze-audio/<string:text>', methods=['POST'])
def analyze_text(text):
    if len(text) == 0:
        return jsonify({'error': 'No text provided'}), 400
    
    doc = nlp(text) 
    person_count = len([ent.text for ent in doc.ents if ent.label_ == "PERSON"]) 
    topics = [token.text for token in doc if token.is_alpha and not token.is_stop]

    name = request.form['name']
    file = request.files['file']

    directory_path = os.path.join('uploads', name) 
    filesname, extension = os.path.splitext(file.filename)
    text_path = os.path.join(directory_path, "{}.txt".format(filesname))  

    with open(text_path, 'a') as fil:
        fil.write("\nPerson Count: {}\n".format(str(person_count + 1)))
   
    return jsonify({'person_count' : person_count + 1 , 'topic' : topics[0], 'topic2' : topics[1]})

@app.route('/api/convert-video-to-mp3', methods=['POST'])
def convert_video_to_mp3():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    video_file = request.files['file']
    name = request.form['name']

    if video_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if video_file: 
        try:  
            print(video_file.filename)
            directory_path = os.path.join('uploads', name)
            os.makedirs(directory_path, exist_ok=True) 
            video_path = os.path.join(directory_path, video_file.filename) 
            filesname, extension = os.path.splitext(video_file.filename)
            audio_path = os.path.join(directory_path, "{}.mp3".format(filesname)) 
            video_file.save(video_path)
            video_clip = VideoFileClip(video_path)
            audio_clip = video_clip.audio
            audio_clip.write_audiofile(audio_path)
            audio_clip.close()
            video_clip.close()

            return jsonify({'message': 'Video converted to MP3 successfully', 'audio_file': audio_path}), 200
        except Exception as e:
            return jsonify({'error': 'Conversion error', 'details': str(e)}), 500

def get_audio_length(audio_filename):
    audio = AudioSegment.from_file(audio_filename)
    return len(audio) / 1000  # Return length in seconds    

def split_audio(input_audio, output_dir, segment_length_ms=60000):
    print("Proccessing Input........") 
    audio = AudioSegment.from_file(input_audio) 
    total_length_ms = len(audio) 
    num_segments = total_length_ms // segment_length_ms 

    for i in range(num_segments):
        start_time = i * segment_length_ms
        end_time = (i + 1) * segment_length_ms
        segment = audio[start_time:end_time] 
        segment.export(os.path.join(output_dir, f"segment_{i}.wav"), format="wav")
        
    if total_length_ms % segment_length_ms > 0:
        start_time = num_segments * segment_length_ms
        end_time = total_length_ms
        last_segment = audio[start_time:end_time]
        last_segment.export(os.path.join(output_dir, f"segment_{num_segments}.wav"), format="wav")

def transcribe_audio_segments(segment_dir, lan):
    print("Converting to text........")
    recognizer = sr.Recognizer()
    
    transcribed_texts = []
    
    for filename in os.listdir(segment_dir): 
        audio_file = os.path.join(segment_dir, filename)
        
        with sr.AudioFile(audio_file) as source:
            audio_text = recognizer.record(source)
            text = recognizer.recognize_google(audio_text, language=lan)
            transcribed_texts.append(text) 

    return transcribed_texts

def join_transcribed_texts(texts):
    return " ".join(texts)

def convert_mp3_to_wav(mp3_filename):
    wav_filename = mp3_filename.replace('.mp3', '.wav')
    audio = AudioSegment.from_mp3(mp3_filename)
    audio.export(wav_filename, format="wav")
    return wav_filename

@app.route('/api/convert-mp3-to-text', methods=['POST'])
def convert_mp3_to_text():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    language = request.form['language']
    name = request.form['name']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file:  
        directory_path = os.path.join('uploads', name)
        os.makedirs(directory_path, exist_ok=True) 
        mp3_filename = os.path.join(directory_path, file.filename)

        file.save(mp3_filename) 
        segment_dir = 'segments'  
        os.makedirs(segment_dir, exist_ok=True)
        audio_length = get_audio_length(mp3_filename)

        audio_file = open(mp3_filename, "rb")
        transcript = client.audio.transcriptions.create(
            file=audio_file,
            model="whisper-1",
            response_format="verbose_json",
            timestamp_granularities=["word"]
        ) 

        filesname, extension = os.path.splitext(file.filename)
        text_path = os.path.join(directory_path, "{}.txt".format(filesname)) 

        with open(text_path, 'w') as fil:
            fil.write("Converted Text: " + transcript.text + "\n")

        ######### ADDING TIMESTAMPS TO THE CONVERTED TEXT ############
        current_time = 0
        text_string = ""
        
        for index in range(len(transcript.words)):
            word = transcript.words[index]['word']
            start_time = transcript.words[index]['start']
            
            if index % 10 == 0:
                minutes = int(current_time / 60)
                seconds = round(current_time % 60, 1)
                timestamp = f"[{minutes}:{seconds}]"
                text_string += " " + timestamp
            
            text_string += " " + word 
            current_time = start_time

        minutes = int(current_time / 60)
        seconds = round(current_time % 60, 1)
        final_timestamp = f"[{minutes}:{seconds}]"
        text_string += " " + final_timestamp
 
        return jsonify({'text': text_string, 'simple_text': transcript.text})

@app.route('/api/convert-mp4-to-text', methods=['POST'])
def convert_mp4_to_text():
    language = request.form['language']
    file = request.files['file']
    name = request.form['name']

    filesname, extension = os.path.splitext(file.filename)
    directory_path = os.path.join('uploads', name)
    os.makedirs(directory_path, exist_ok=True)  

    file = os.path.abspath('./uploads/{}/{}.mp3'.format(name, filesname)) 

    if file: 
        mp3_filename = file
        wav_filename = mp3_filename.replace('.mp3', '.wav') 
        AudioSegment.from_mp3(mp3_filename).export(wav_filename, format="wav")

    segment_dir = 'segments'
    try:
        if not os.path.exists(segment_dir):
            os.mkdir(segment_dir)
    except Exception as e:
        print(f"Error creating directory: {e}")

    audio_length = get_audio_length(mp3_filename)

    audio_file = open(mp3_filename, "rb")
    transcript = client.audio.transcriptions.create(
            file=audio_file,
            model="whisper-1",
            response_format="verbose_json",
            timestamp_granularities=["word"]
        ) 
 
    text_path = os.path.join(directory_path, "{}.txt".format(filesname)) 

    with open(text_path, 'w') as fil:
        fil.write("Converted Text: " + transcript.text + "\n")

    ######### ADDING TIMESTAMPS TO THE CONVERTED TEXT ############
    current_time = 0
    text_string = ""
    
    for index in range(len(transcript.words)):
        word = transcript.words[index]['word']
        start_time = transcript.words[index]['start']
        
        if index % 10 == 0:
            minutes = int(current_time / 60)
            seconds = round(current_time % 60, 1)
            timestamp = f"[{minutes}:{seconds}]"
            text_string += " " + timestamp
        
        text_string += " " + word 
        current_time = start_time

    minutes = int(current_time / 60)
    seconds = round(current_time % 60, 1)
    final_timestamp = f"[{minutes}:{seconds}]"
    text_string += " " + final_timestamp

    directory_path = os.path.join('uploads', name)
    text_path = os.path.join(directory_path, "{}.txt".format(filesname)) 

    with open(text_path, 'w') as fil:
        fil.write("Converted Text: " + transcript.text + "\n")

    return jsonify({'text': text_string, 'simple_text': transcript.text})


@app.route('/api/translate_toar/<string:text>', methods=['GET'], endpoint='translate_to_ar')
def translate_to_ar(text):    
    translator = Translator() 
    arabic_translation = translator.translate(text,  src='auto', dest='ar').text
    return jsonify({'translated_txt': arabic_translation})

@app.route('/api/translate_totr/<string:text>', methods=['GET'], endpoint='translate_to_tr')
def translate_to_tr(text):  
    translator = Translator()    

    turkish_translation = translator.translate(text, src='auto', dest='tr').text
    return jsonify({'translated_txt': turkish_translation})

@app.route('/api/translate_toen/<string:text>', methods=['GET'], endpoint='translate_to_en')
def translate_to_en(text):  
    translator = Translator()    

    english_translation = translator.translate(text, src='auto', dest='en').text
    return jsonify({'translated_txt': english_translation})

@app.route('/api/translate_tohi/<string:text>', methods=['GET'], endpoint='translate_to_hi')
def translate_to_hi(text):  
    translator = Translator()    

    hindi_translation = translator.translate(text, src='auto', dest='hi').text
    return jsonify({'translated_txt': hindi_translation})

def add_newlines_every_n_words(input_string, n=10):
    words = input_string.split()
    output_string = ''
    for i, word in enumerate(words):
        if i > 0 and i % n == 0:
            output_string += '\n'
        output_string += word + ' '
    return output_string.strip()

def remove_punctuation(sentence): 
    translator = str.maketrans('', '', string.punctuation) 
    cleaned_sentence = sentence.translate(translator)
    return cleaned_sentence

@app.route('/api/findtopic/<string:text>', methods=['POST'])
def topic_finder(text):
    name = request.form['name']
    file = request.files['file']

    cleaned_text = remove_punctuation(text)
    words_list_next = cleaned_text.split() 
    if len(words_list_next)<450:
        selected_string = words_list_next
    else:
        selected_words = words_list_next[:450]
        selected_string = ' '.join(selected_words)

    pipe = pipeline("text-classification", model="unitary/toxic-bert")
    pipe2 = pipeline("summarization", model="google/pegasus-xsum")

    topic = pipe(selected_string)  
    topic = topic[0]['label']

    topic2 = pipe2(selected_string, max_length = 20)
    topic2 = topic2[0]['summary_text']

    directory_path = os.path.join('uploads', name) 
    filesname, extension = os.path.splitext(file.filename)
    text_path = os.path.join(directory_path, "{}.txt".format(filesname))  

    with open(text_path, 'a') as fil:
        fil.write("\nTopic: {}\n".format(topic2))
    
    return jsonify({'topic': topic, 'topic2': topic2})

@app.route('/api/findSummary', methods=['POST'])
def summary_find():
    text = request.form['text']
    pipe = pipeline("summarization", model="google/pegasus-xsum")
     
    output = pipe(text) 
    summary = output[0]['summary_text']
             
    translator = Translator() 
    arabic_summary = translator.translate(summary, src='en', dest='ar').text
    turkish_summary = translator.translate(summary, src='en', dest='tr').text

    name = request.form['name']
    file = request.files['file']

    directory_path = os.path.join('uploads', name) 
    filesname, extension = os.path.splitext(file.filename)
    text_path = os.path.join(directory_path, "{}.txt".format(filesname))  

    with open(text_path, 'a') as fil:
        fil.write("\nSummary: {}\n".format(str(summary)))

    return jsonify({'summary_en': str(summary), 'summary_ar': arabic_summary, 'summary_tr': turkish_summary})

@app.route('/api/sentiment/<string:text>', methods=['POST'])
def sentiment(text):
    name = request.form['name']
    file = request.files['file']

    nltk.download('vader_lexicon')
    analyzer = SentimentIntensityAnalyzer()
    scores = analyzer.polarity_scores(text)
    positive_percent = round(scores['pos'] * 100, 2)
    negative_percent = round(scores['neg'] * 100, 2)

    total = positive_percent + negative_percent
    fin_pos = round((positive_percent/total)*100, 2)
    fin_neg = round((negative_percent/total)*100, 2) 

    directory_path = os.path.join('uploads', name) 
    filesname, extension = os.path.splitext(file.filename)
    text_path = os.path.join(directory_path, "{}.txt".format(filesname))  

    with open(text_path, 'a') as fil:
        fil.write("\nPositive Sentiment: {}% \nNegative Sentiment: {}%".format(fin_pos, fin_neg))

    return jsonify({'positive': fin_pos, 'negative': fin_neg})

if __name__ == '__main__': 
    app.run(debug=False)