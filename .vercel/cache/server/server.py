from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import os
import logging
from data_fetcher import DataFetcher
from data_analyzer import DataAnalyzer

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize data fetcher and analyzer
data_fetcher = DataFetcher()
data_analyzer = DataAnalyzer()

@app.route('/')
def index():
    """Serve the dashboard HTML"""
    # For Vercel deployment, use a relative path
    return send_from_directory('public', 'dashboard.html')

@app.route('/api/data')
def get_data():
    """API endpoint to fetch and analyze data"""
    try:
        # Fetch data from APIs
        logger.info("Fetching data from APIs")
        raw_data = data_fetcher.fetch_all_data()
        
        # Preprocess the data
        logger.info("Preprocessing data")
        processed_data = data_fetcher.preprocess_data()
        
        # Set the processed data for analysis
        data_analyzer.set_data(processed_data)
        
        # Analyze the data
        logger.info("Analyzing data")
        data_analyzer.analyze_all_data()
        
        # Format the data for the dashboard
        formatted_data = {
            "water_quality": {
                "quality_index": 84,  # Default value if data not available
                "trends": [{"month": "Jan", "value": 80}, {"month": "Feb", "value": 82}, {"month": "Mar", "value": 85}, {"month": "Apr", "value": 83}, {"month": "May", "value": 87}, {"month": "Jun", "value": 90}]
            },
            "mineral_extraction": {
                "extraction_rate": "15.2 tons/day",
                "impact_score": 7.8
            },
            "timber_production": {
                "production_volume": "1200 m³",
                "sustainability_index": 92
            },
            "recommendations": [
                # Default recommendations if AI analysis is not available
                "Implement buffer zones between industrial areas and water sources",
                "Improve wastewater treatment infrastructure in urban centers",
                "Develop green infrastructure to mitigate urban runoff issues"
            ]
        }
        
        # Get AI-generated recommendations if available
        if hasattr(data_analyzer, 'key_points') and data_analyzer.key_points:
            # Try to get recommendations from the cross-dataset analysis
            if 'recommendations' in data_analyzer.key_points:
                formatted_data['recommendations'] = data_analyzer.key_points['recommendations']
            # If no cross-dataset recommendations, use key points from individual datasets
            elif len(data_analyzer.key_points) > 0:
                recommendations = []
                for dataset_key_points in data_analyzer.key_points.values():
                    if isinstance(dataset_key_points, list):
                        recommendations.extend(dataset_key_points)
                if recommendations:
                    formatted_data['recommendations'] = recommendations[:5]  # Limit to top 5 recommendations
        
        # Try to get actual data if available
        try:
            if "Water Pollution" in raw_data and raw_data["Water Pollution"] is not None:
                formatted_data["water_quality"]["quality_index"] = raw_data["Water Pollution"].get("quality_index", 84)
                
                # Extract water pollution trend data if available
                if "trends" in raw_data["Water Pollution"] and isinstance(raw_data["Water Pollution"]["trends"], list):
                    formatted_data["water_quality"]["trends"] = raw_data["Water Pollution"]["trends"]
                # If no trend data in raw_data, keep the default trend data
            
            if "Mineral Extraction" in raw_data and raw_data["Mineral Extraction"] is not None:
                formatted_data["mineral_extraction"]["extraction_rate"] = raw_data["Mineral Extraction"].get("extraction_rate", "15.2 tons/day")
            
            if "Timber Production" in raw_data and raw_data["Timber Production"] is not None:
                formatted_data["timber_production"]["production_volume"] = raw_data["Timber Production"].get("production_volume", "1200 m³")
        except Exception as e:
            logger.error(f"Error formatting data: {str(e)}")
        
        return jsonify(formatted_data)
    except Exception as e:
        logger.error(f"API Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

# For local development
if __name__ == '__main__':
    app.run(debug=True, port=8000)
else:
    # For Vercel serverless deployment
    # The app variable will be used by Vercel
    pass