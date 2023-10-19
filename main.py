import os 
import speech_recognition as sr 
from googletrans import Translator
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from transformers import AutoTokenizer, AutoModelForSequenceClassification, AutoModelForSeq2SeqLM
from flask import Flask, request, jsonify
from flask_cors import CORS
from pydub import AudioSegment  
from transformers import pipeline
from moviepy.editor import VideoFileClip

app = Flask(__name__)
CORS(app, origins="http://localhost:3000", supports_credentials=True)

@app.route('/api/convert-video-to-mp3', methods=['POST'])
def convert_video_to_mp3():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    video_file = request.files['file']
    if video_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if video_file: 
        try: 
            video_path = os.path.join('./uploads', video_file.filename)  
            print(video_path)
            video_file.save(video_path)
 
            audio_path = os.path.abspath('./uploads/output.mp3') 
            video_clip = VideoFileClip(video_path)
            audio_clip = video_clip.audio
            audio_clip.write_audiofile(audio_path)
            audio_clip.close()
            video_clip.close()

            return jsonify({'message': 'Video converted to MP3 successfully', 'audio_file': audio_path}), 200
        except Exception as e:
            return jsonify({'error': 'Conversion error', 'details': str(e)}), 500
        

@app.route('/api/convert-mp3-to-text', methods=['POST'])
def convert_mp3_to_text():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file: 
        mp3_filename = os.path.join('uploads', file.filename)
        file.save(mp3_filename)
 
        wav_filename = mp3_filename.replace('.mp3', '.wav')
        AudioSegment.from_mp3(mp3_filename).export(wav_filename, format="wav")
 
        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_filename) as source:
            audio = recognizer.record(source)

        try:
            text = recognizer.recognize_google(audio)
            return jsonify({'text': text})
        except sr.UnknownValueError:
            return jsonify({'error': 'Could not understand audio'}), 400
        except sr.RequestError as e:
            return jsonify({'error': f'Speech Recognition error: {e}'}), 500
        

@app.route('/api/convert-mp4-to-text', methods=['POST'])
def convert_mp4_to_text():
    file = os.path.abspath('./uploads/output.mp3') 

    if file: 
        mp3_filename = file
        wav_filename = mp3_filename.replace('.mp3', '.wav') 
        AudioSegment.from_mp3(mp3_filename).export(wav_filename, format="wav")
 
        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_filename) as source:
            audio = recognizer.record(source)

        try:
            text = recognizer.recognize_google(audio)
            return jsonify({'text': text})
        except sr.UnknownValueError:
            return jsonify({'error': 'Could not understand audio'}), 400
        except sr.RequestError as e:
            return jsonify({'error': f'Speech Recognition error: {e}'}), 500
        

@app.route('/api/translate_toar/<string:text>', methods=['GET'])
def translate_to_ar(text):    
    translator = Translator() 
    arabic_translation = translator.translate(text, src='en', dest='ar').text
    return jsonify({'translated_txt': arabic_translation})


@app.route('/api/translate_totr/<string:text>', methods=['GET'])
def translate_to_tr(text):  
    translator = Translator()    
    turkish_translation = translator.translate(text, src='en', dest='tr').text
    return jsonify({'translated_txt': turkish_translation})

@app.route('/api/findtopic/<string:text>', methods=['GET'])
def topic_finder(text):
    pipe = pipeline("summarization", model="google/pegasus-xsum")
    topic = pipe(text, max_length = 100)
    topic = topic[0]['summary_text']
    return jsonify({'topic': topic})

@app.route('/api/findSummary/<string:text>', methods=['GET'])
def summary_find(text):
    pipe = pipeline("summarization", model="google/pegasus-xsum")
    output = pipe(text, max_length = 200)
    final_summary = output[0]['summary_text']

    translator = Translator() 
    arabic_summary = translator.translate(final_summary, src='en', dest='ar').text
    turkish_summary = translator.translate(final_summary, src='en', dest='tr').text

    return jsonify({'summary_en': final_summary, 'summary_ar': arabic_summary, 'summary_tr': turkish_summary})


@app.route('/api/sentiment/<string:text>', methods=['GET'])
def sentiment(text):
    nltk.download('vader_lexicon')
    analyzer = SentimentIntensityAnalyzer()
    scores = analyzer.polarity_scores(text)
    positive_percent = round(scores['pos'] * 100, 2)
    negative_percent = round(scores['neg'] * 100, 2)

    return jsonify({'positive': positive_percent, 'negative': negative_percent})

if __name__ == '__main__': 
    app.run(debug=False)