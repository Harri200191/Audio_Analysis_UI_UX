#FROM python:3.11
#LABEL Name="Audio Analysis App" Version=1.0
#LABEL org.opencontainers.image.source = "https://github.com/Harri200191/Audio_Analysis_UI_UX"
#ARG srcDir=MainServer
#WORKDIR /app
#COPY $srcDir/requirements.txt .
#RUN pip install --no-cache-dir -r requirements.txt
#COPY $srcDir/app.py .  
#EXPOSE 5000 
#CMD ["flask", "run"]

# ----------------------------------------------------------------------------------------------#
#### LEARNING FOR COMMANDS
##### BLUEPRINT FOR CREATING IMAGES #####
# FIRST LINE ALWAYS STARTS WITH FROM
FROM node:lts-alpine3.19

# SETTING ENVIRONMENT VARIABLES
ENV MONGO_INITDB_ROOT_USERNAME: root MONGO_INITDB_ROOT_PASSWORD: example 

# USING RUN TO RUN ANY LINUX COMMANDS
# In the given command, /home/app directory will be created inside the docker container and not on our own personal Systems!
RUN mkdir -p /home/app

# USING THE COPY COMMAND TO COPY THE CURRENT DIRECTORY OF OUR LAPTOP INTO THE /home/app directory of the docker container
COPY ./backend /home/app 
RUN ls /home/app && cd /home/app/ 
# The final command to run when running this docker container.
CMD ["node", "/home/app/server.js"]








