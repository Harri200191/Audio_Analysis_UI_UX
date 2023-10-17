import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pydub import AudioSegment
import speech_recognition as sr 

app = Flask(__name__)
CORS(app, origins="*")

@app.route('/api/convert-mp3-to-text', methods=['POST'])
def convert_mp3_to_text():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file:
        # Save the received MP3 file
        mp3_filename = os.path.join('uploads', file.filename)
        file.save(mp3_filename)

        # Convert MP3 to WAV for better compatibility
        wav_filename = mp3_filename.replace('.mp3', '.wav')
        AudioSegment.from_mp3(mp3_filename).export(wav_filename, format="wav")

        # Perform speech recognition
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

if __name__ == '__main__':
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    app.run(debug=True)
