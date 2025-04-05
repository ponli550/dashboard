#!/bin/bash
echo "Deploying to Azure..."
echo "Setting up Python environment..."
python -m pip install --upgrade pip
echo "Installing requirements..."
python -m pip install -r requirements.txt
echo "Starting application..."
gunicorn --bind=0.0.0.0 --timeout 600 app:app
echo "Deployment complete!"