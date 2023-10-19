# Use an official Python runtime as a parent image
FROM python:3.11

# Set the working directory in the container
WORKDIR /main

# Copy the requirements file into the container
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install -r requirements.txt

# Copy the entire project folder into the container
COPY . .

# Expose the port your app runs on
EXPOSE 5000

# Define the command to run your application
CMD ["python", "main.py"]
