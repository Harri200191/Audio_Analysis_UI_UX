# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Define environment variable
ENV HUGGING_FACE_API_KEY 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

# Run app.py when the container launches
CMD ["flask", "run"]
