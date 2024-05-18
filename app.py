import os  
from pyannote.audio import Pipeline 
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer 
from flask import Flask, request, jsonify
from flask_cors import CORS 
from transformers import pipeline
import spacy 
from moviepy.editor import VideoFileClip  
from googletrans import Translator
from gensim.summarization import summarize 
import subprocess 
import os 
from dotenv import load_dotenv
import pysrt 

load_dotenv() 
HUGGING_FACE_API_KEY = os.environ.get("HUGGING_FACE_API_KEY") 

def convert_srt_to_string(srt_file_path): 
    subs = pysrt.open(srt_file_path) 
    converted_content = '' 
    finstr = ''
    for sub in subs:  
        finstr += sub.text + ' '
        start_time = sub.start.to_time().strftime("%H:%M:%S,%f")[:-3]
        end_time = sub.end.to_time().strftime("%H:%M:%S,%f")[:-3] 
        converted_content += f"\n<strong>[{start_time} --> {end_time}]</strong>: {sub.text}\n"

    return converted_content.strip(), finstr

def remove_duplicates(lst):
    return list(set(lst))

app = Flask(__name__)
CORS(app, origins="http://localhost:3000", supports_credentials=True)

nlp = spacy.load("en_core_web_sm")
diarization_pipeline = Pipeline.from_pretrained(
    "pyannote/speaker-diarization-3.1",
    use_auth_token=HUGGING_FACE_API_KEY)

@app.route('/api/analyze-audio/<string:text>', methods=['POST'])
def analyze_text(text):
    if len(text) == 0:
        return jsonify({'error': 'No text provided'}), 400
    
    doc = nlp(text) 
    person_count = len([ent.text for ent in doc.ents if ent.label_ == "PERSON"]) 
    topics = [token.text for token in doc if token.is_alpha and not token.is_stop]

    name = request.form['name']
    file = request.files['file']

    name = name.strip()
    name = name.replace(" ", "_")

    directory_path = os.path.join('uploads', name) 
    filesname, extension = os.path.splitext(file.filename)
    filesname = filesname.strip()
    filesname = filesname.replace(" ", "_")
    text_path = os.path.join(directory_path, "{}.txt".format(filesname))  

    with open(text_path, 'a') as fil:
        fil.write("\nPerson Count: {}\n".format(str(person_count + 1)))

    diarization = diarization_pipeline(f"./uploads/{name}/{filesname}.mp3")
    
    temp_lis = []
    for _, _, speaker in diarization.itertracks(yield_label=True):
        temp_lis.append(speaker)
   
    temp_lis = remove_duplicates(temp_lis)

    return jsonify({'person_count' : len(temp_lis) , 'topic' : topics[0]})

@app.route('/api/convert-video-to-mp3', methods=['POST'])
def convert_video_to_mp3():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    video_file = request.files['file']
    name = request.form['name']
    name = name.strip()
    name = name.replace(" ", "_")

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

@app.route('/api/convert-mp3-to-text', methods=['POST'])
def convert_mp3_to_text():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file'] 
    name = request.form['name']
     
    name = name.strip()
    name = name.replace(" ", "_")

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file:  
        filesname, extension = os.path.splitext(file.filename) 
        filesname = filesname.strip()
        filesname = filesname.replace(" ", "_")

        full_filename = filesname+extension
        directory_path = os.path.join('uploads', name)
        os.makedirs(directory_path, exist_ok=True) 
        mp3_filename = os.path.join(directory_path, full_filename)

        file.save(mp3_filename) 
        segment_dir = 'segments'  
        os.makedirs(segment_dir, exist_ok=True)  
        
        #-----------------------------------------------------------------------------------------
        command1 = f"ffmpeg -i ./uploads/{name}/{filesname}.mp3 -ar 16000 -ac 1 -c:a pcm_s16le ./uploads/{name}/final.wav"  
        command2 = f".\\WHISPER_EXE_FILES\\main.exe -f ./uploads/{name}/final.wav -m .\\WHISPER_EXE_FILES\\ggml-base.en.bin -osrt -t 8 --language auto --translate true" 
        
        result = subprocess.run(command1, shell=True, capture_output=True, text=True)
        result2 = subprocess.run(command2, shell=True, capture_output=True, text=True)  

        srt_file_path = f'./uploads/{name}/final.wav.srt'
        text_path = os.path.join(directory_path, "{}.txt".format(filesname)) 
        result_string, joined_text = convert_srt_to_string(srt_file_path)
        os.remove(f"./uploads/{name}/final.wav")

        #-----------------------------------------------------------------------------------------
        diarization = diarization_pipeline(f'./uploads/{name}/{filesname}.mp3')

        temp_str = "\n\n-------------------------------\n"
        for turn, _, speaker in diarization.itertracks(yield_label=True):
            x = f'start={turn.start:.1f}s stop={turn.end:.1f}s ---> {speaker}\n\n'
            temp_str = temp_str + x

        result_string = result_string + temp_str
        result_string = result_string.replace("\n", "<br>")

        with open(text_path, 'w') as fil:
            fil.write("\nConverted Text: {}\n".format(str(joined_text)))
 
        return jsonify({'text': joined_text, 'whisper_str': result_string})

@app.route('/api/convert-mp4-to-text', methods=['POST'])
def convert_mp4_to_text():
    language = request.form['language']
    file = request.files['file']
    name = request.form['name']
    
    name = name.strip()
    name = name.replace(" ", "_")

    filesname, extension = os.path.splitext(file.filename)
    filesname = filesname.strip()
    filesname = filesname.replace(" ", "_")

    file = os.path.abspath('./uploads/{}/{}.mp3'.format(name, filesname)) 
    directory_path = os.path.join('uploads', name)
    os.makedirs(directory_path, exist_ok=True)
    if file: 
        mp3_filename = file   
        command1 = f"ffmpeg -i ./uploads/{name}/{filesname}.mp3 -ar 16000 -ac 1 -c:a pcm_s16le ./uploads/{name}/final.wav"  
        result = subprocess.run(command1, shell=True, capture_output=True, text=True)

    segment_dir = 'segments'
    try:
        if not os.path.exists(segment_dir):
            os.mkdir(segment_dir)
    except Exception as e:
        print(f"Error creating directory: {e}")

    command2 = f".\\WHISPER_EXE_FILES\\main.exe -f ./uploads/{name}/final.wav -m .\\WHISPER_EXE_FILES\\ggml-base.en.bin -osrt -t 8 --language auto --translate true " 
    result2 = subprocess.run(command2, shell=True, capture_output=True, text=True)  

    srt_file_path = f'./uploads/{name}/final.wav.srt'
    text_path = os.path.join(directory_path, "{}.txt".format(filesname)) 
    result_string, joined_text = convert_srt_to_string(srt_file_path)
    os.remove(f"./uploads/{name}/final.wav")

    # -----------------------------------------------------------------------------------------
    diarization = diarization_pipeline(f'./uploads/{name}/{filesname}.mp3')

    temp_str = "\n\n-------------------------------\n"
    for turn, _, speaker in diarization.itertracks(yield_label=True):
        x = f'start={turn.start:.1f}s stop={turn.end:.1f}s ---> {speaker}\n\n'
        temp_str = temp_str + x

    result_string = result_string + temp_str 
    result_string = result_string.replace("\n", "<br>")

    with open(text_path, 'w') as fil:
        fil.write("\nConverted Text: {}\n".format(str(joined_text)))

    return jsonify({'text': joined_text, 'whisper_str': result_string})

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

@app.route('/api/findtopic/<string:text>', methods=['POST'])
def topic_finder(text):
    name = request.form['name']
    file = request.files['file']

    name = name.strip()
    name = name.replace(" ", "_")

    directory_path = os.path.join('uploads', name) 
    filesname, extension = os.path.splitext(file.filename)
    filesname = filesname.strip()
    filesname = filesname.replace(" ", "_")
    text_path = os.path.join(directory_path, "{}.txt".format(filesname))  

    topic = pipeline("summarization", device=0)
    f = topic(text, max_length=15, min_length=2, do_sample=False)
    topic2 = f[0]['summary_text']

    with open(text_path, 'a') as fil:
        fil.write("\nTopic: {}\n".format(topic2))
    
    return jsonify({'topic': "", 'topic2': topic2})

@app.route('/api/findSummary', methods=['POST'])
def summary_find():
    text = request.form['text']
    pipe = pipeline("summarization", model="google/pegasus-xsum")
    
    temp = add_newlines_every_n_words(text, 30)
    try: 
        summary = summarize(temp)
        print("len: ", len(summary))
    except:
        print("Error in summarization using gensim") 
        summary = ""

    if len(summary) == 0:
        output = pipe(text) 
        summary = output[0]['summary_text']
             
    translator = Translator() 
    arabic_summary = translator.translate(summary, src='en', dest='ar').text
    turkish_summary = translator.translate(summary, src='en', dest='tr').text

    name = request.form['name']
    file = request.files['file']

    name = name.strip()
    name = name.replace(" ", "_")

    directory_path = os.path.join('uploads', name) 
    filesname, extension = os.path.splitext(file.filename)
    filesname = filesname.strip()
    filesname = filesname.replace(" ", "_")
    text_path = os.path.join(directory_path, "{}.txt".format(filesname))  

    # NEW PIPELINE FOR SUMMARIZATION
    summarizer = pipeline("summarization")
    f = summarizer(text, max_length=130, min_length=30, do_sample=False)
    summary = f[0]['summary_text']

    with open(text_path, 'a') as fil:
        fil.write("\nSummary: {}\n".format(str(summary)))

    return jsonify({'summary_en': str(summary), 'summary_ar': arabic_summary, 'summary_tr': turkish_summary})

@app.route('/api/sentiment/<string:text>', methods=['POST'])
def sentiment(text):
    name = request.form['name']
    file = request.files['file']

    name = name.strip()
    name = name.replace(" ", "_")

    nltk.download('vader_lexicon')
    analyzer = SentimentIntensityAnalyzer()
    scores = analyzer.polarity_scores(text)
    positive_percent = round(scores['pos'] * 100, 2)
    negative_percent = round(scores['neg'] * 100, 2)

    total = positive_percent + negative_percent
    if (total == 0):
        fin_pos = 50
        fin_neg = 50
    else:
        fin_pos = round((positive_percent/total)*100, 2)
        fin_neg = round((negative_percent/total)*100, 2) 

    directory_path = os.path.join('uploads', name) 
    filesname, extension = os.path.splitext(file.filename)
    filesname = filesname.strip()
    filesname = filesname.replace(" ", "_")
    text_path = os.path.join(directory_path, "{}.txt".format(filesname))  

    with open(text_path, 'a') as fil:
        fil.write("\nPositive Sentiment: {}% \nNegative Sentiment: {}%".format(fin_pos, fin_neg))

    return jsonify({'positive': fin_pos, 'negative': fin_neg})

if __name__ == '__main__': 
    app.run(debug=False)