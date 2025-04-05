FROM python:3.9-slim

WORKDIR /app

# Copy only requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Python files
COPY *.py ./
COPY dashboard.html ./

# Create necessary directories
RUN mkdir -p /app/Experiment
RUN mkdir -p /app/static
RUN mkdir -p /app/templates

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Expose the port
EXPOSE 8000

# Run the application
CMD ["python", "server.py"]