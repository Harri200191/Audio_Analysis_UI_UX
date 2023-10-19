import os
from pydub import AudioSegment 
import speech_recognition as sr 
from flask import Flask, request, jsonify
from flask_cors import CORS

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
            return text
        except sr.UnknownValueError:
            return "error"
        except sr.RequestError as e:
            return "error"
         
        
