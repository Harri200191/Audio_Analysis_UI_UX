FROM python:3.11
LABEL Name="Audio Analysis App" Version=1.0
LABEL org.opencontainers.image.source = "https://github.com/Harri200191/Audio_Analysis_UI_UX"
ARG srcDir=MainServer
WORKDIR /app
COPY $srcDir/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY $srcDir/app.py .  
EXPOSE 5000
CMD ["flask", "run"]

#### LEARNING FOR COMMANDS

