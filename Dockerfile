# Use an official Python runtime as a parent image
FROM python:3.11

RUN apt-get update -y && apt-get install -y ffmpeg

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install -r requirements.txt

# Copy your Python script into the container
COPY main.py .

# Expose the port your app runs on (if applicable)
EXPOSE 5000

# Define the command to run your application
CMD ["python", "main.py"]
