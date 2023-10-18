import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pydub import AudioSegment 
import speech_recognition as sr 
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns 
from googletrans import Translator  

app = Flask(__name__)
CORS(app, origins="http://localhost:3000", supports_credentials=True)

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
 
 

if __name__ == '__main__':
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    app.run(debug=True)
