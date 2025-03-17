# Use an official Python runtime as a parent image
FROM python:3.12

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the microservice code into the container
COPY . .

# Make port 5005 available to the world outside this container
EXPOSE 5005

# Define environment variable
ENV FLASK_APP=app.py

# Use Gunicorn as the WSGI server for production
CMD ["gunicorn", "-w", "4", "-k", "gevent", "-b", "0.0.0.0:5005", "--timeout", "30000", "app:app"]