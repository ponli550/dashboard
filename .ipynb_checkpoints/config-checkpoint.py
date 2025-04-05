# Configuration settings for the Sustainable Urban Development Dashboard

# API endpoints for Malaysian government data
API_ENDPOINTS = {
    "Water Pollution": "https://api.data.gov.my/data-catalogue?id=water_pollution_basin&limit=30",
    "Mineral Extraction": "https://api.data.gov.my/data-catalogue?id=mineral_extraction&limit=30",
    "Timber Production": "https://api.data.gov.my/data-catalogue?id=timber_production&limit=30"
}

# Deepseek AI API configuration
DEEPSEEK_API_KEY = "sk-726c5951977940b290358b9171bd3e96"
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

# Dashboard configuration
DASHBOARD_TITLE = "Malaysia Sustainable Urban Development - Water Quality Focus"
DASHBOARD_PORT = 8050
DASHBOARD_DEBUG = True

# Data analysis parameters
ANALYSIS_TIMEFRAME = "monthly"  # Options: daily, monthly, yearly
CORRELATION_THRESHOLD = 0.7     # Threshold for highlighting strong correlations