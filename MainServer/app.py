import os
import subprocess
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline
import spacy
import pysrt
from moviepy.editor import VideoFileClip
from googletrans import Translator
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import nltk

# Load environment variables
load_dotenv()
HUGGING_FACE_API_KEY = os.environ.get("HUGGING_FACE_API_KEY")

# Initialize FastAPI app
app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

nlp = spacy.load("en_core_web_sm")
nltk.download('vader_lexicon')

# Utility function to process SRT file
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

@app.post("/api/convert-video-to-mp3")
async def convert_video_to_mp3(file: UploadFile = File(...), name: str = Form(...)):
    try:
        name = name.replace(" ", "_")
        directory_path = os.path.join('uploads', name)
        os.makedirs(directory_path, exist_ok=True)
        video_path = os.path.join(directory_path, file.filename)
        filesname, _ = os.path.splitext(file.filename)
        audio_path = os.path.join(directory_path, f"{filesname}.mp3")
        
        with open(video_path, "wb") as buffer:
            buffer.write(await file.read())
        
        video_clip = VideoFileClip(video_path)
        video_clip.audio.write_audiofile(audio_path)
        video_clip.close()

        return {"message": "Video converted to MP3 successfully", "audio_file": audio_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/sentiment")
async def analyze_sentiment(text: str = Form(...)):
    analyzer = SentimentIntensityAnalyzer()
    scores = analyzer.polarity_scores(text)
    positive_percent = round(scores['pos'] * 100, 2)
    negative_percent = round(scores['neg'] * 100, 2)
    total = positive_percent + negative_percent
    fin_pos = round((positive_percent / total) * 100, 2) if total != 0 else 50
    fin_neg = round((negative_percent / total) * 100, 2) if total != 0 else 50
    return {"positive": fin_pos, "negative": fin_neg}

@app.post("/api/translate")
async def translate_text(text: str = Form(...), target_lang: str = Form(...)):
    translator = Translator()
    translation = translator.translate(text, src='auto', dest=target_lang).text
    return {"translated_text": translation}

@app.post("/api/summarize")
async def summarize_text(text: str = Form(...)):
    summarizer = pipeline("summarization", model="google/pegasus-xsum")
    summary = summarizer(text, max_length=130, min_length=30, do_sample=False)[0]['summary_text']
    return {"summary": summary}

# Run the FastAPI app using Uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)