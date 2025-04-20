import requests
import pandas as pd
import json
import logging
import time
from config import API_ENDPOINTS

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DataFetcher:
    """Class to fetch data from Malaysian government APIs"""
    
    def __init__(self):
        self.endpoints = API_ENDPOINTS
        self.data = {}
    
    def fetch_all_data(self):
        """Fetch data from all configured endpoints"""
        for data_type, endpoint in self.endpoints.items():
            try:
                logger.info(f"Fetching {data_type} data from {endpoint}")
                self.data[data_type] = self.fetch_data(endpoint)
                logger.info(f"Successfully fetched {data_type} data")
            except Exception as e:
                logger.error(f"Error fetching {data_type} data: {str(e)}")
                self.data[data_type] = None
        return self.data
    
    def fetch_data(self, endpoint):
        """Fetch data from a specific endpoint"""
        # Add retry logic for network issues
        max_retries = 1
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                response = requests.get(endpoint, timeout=10)
                
                if response.status_code == 200:
                    # Check if response is empty
                    if not response.content or response.content.isspace():
                        logger.warning(f"Empty response received from {endpoint}")
                        return {"data": [], "message": "No data available"}
                    
                    try:
                        # Try to parse as JSON first
                        json_data = response.json()
                        # Validate that the response is a dictionary or list
                        if isinstance(json_data, dict):
                            return json_data
                        elif isinstance(json_data, list):
                            # Convert list to dictionary with 'data' key
                            return {"data": json_data}
                        else:
                            logger.warning(f"Unexpected JSON data type: {type(json_data)}")
                            return {"data": [], "message": "Invalid data format"}
                    except json.JSONDecodeError as e:
                        logger.warning(f"JSON decode error: {str(e)}. Trying CSV format.")
                        # If not JSON, try to parse as CSV
                        try:
                            df = pd.read_csv(endpoint)
                            # Convert DataFrame to dictionary
                            return {"data": df.to_dict(orient='records')}
                        except Exception as csv_e:
                            logger.warning(f"CSV parsing failed: {str(csv_e)}")
                            # If neither works, return structured error response
                            return {"data": [], "message": "Data format not recognized", "raw": response.text}
                elif response.status_code == 429:  # Too Many Requests
                    retry_count += 1
                    logger.warning(f"Rate limited (429). Retry {retry_count}/{max_retries}")
                    time.sleep(2 * retry_count)  # Exponential backoff
                    continue
                else:
                    logger.error(f"Failed to fetch data: HTTP {response.status_code}")
                    return {"data": [], "error": f"HTTP {response.status_code}", "message": "API request failed"}
            
            except requests.exceptions.RequestException as e:
                retry_count += 1
                logger.warning(f"Request failed: {str(e)}. Retry {retry_count}/{max_retries}")
                if retry_count >= max_retries:
                    logger.error(f"Max retries reached for {endpoint}")
                    return {"data": [], "error": str(e), "message": "Connection error"}
                time.sleep(2 * retry_count)  # Exponential backoff
        
        # This should not be reached, but just in case
        return {"data": [], "message": "Failed to fetch data after retries"}
    
    def get_water_pollution_data(self):
        """Get water pollution specific data"""
        if "Water Pollution" not in self.data or self.data["Water Pollution"] is None:
            try:
                self.data["Water Pollution"] = self.fetch_data(self.endpoints["Water Pollution"])
            except Exception as e:
                logger.error(f"Error fetching Water Pollution data: {str(e)}")
                return None
        return self.data["Water Pollution"]
    
    def get_mineral_extraction_data(self):
        """Get mineral extraction specific data"""
        if "Mineral Extraction" not in self.data or self.data["Mineral Extraction"] is None:
            try:
                self.data["Mineral Extraction"] = self.fetch_data(self.endpoints["Mineral Extraction"])
            except Exception as e:
                logger.error(f"Error fetching Mineral Extraction data: {str(e)}")
                return None
        return self.data["Mineral Extraction"]
    
    def get_timber_production_data(self):
        """Get timber production specific data"""
        if "Timber Production" not in self.data or self.data["Timber Production"] is None:
            try:
                self.data["Timber Production"] = self.fetch_data(self.endpoints["Timber Production"])
            except Exception as e:
                logger.error(f"Error fetching Timber Production data: {str(e)}")
                return None
        return self.data["Timber Production"]
    
    def preprocess_data(self):
        """Preprocess the fetched data for analysis"""
        processed_data = {}
        
        # Process water pollution data
        if "Water Pollution" in self.data and self.data["Water Pollution"] is not None:
            water_data = self.data["Water Pollution"]
            if isinstance(water_data, pd.DataFrame):
                processed_data["Water Pollution"] = water_data
            elif isinstance(water_data, dict) or isinstance(water_data, list):
                processed_data["Water Pollution"] = pd.DataFrame(water_data)
            else:
                logger.warning("Water Pollution data format not recognized")
        
        # Process mineral extraction data
        if "Mineral Extraction" in self.data and self.data["Mineral Extraction"] is not None:
            mineral_data = self.data["Mineral Extraction"]
            if isinstance(mineral_data, pd.DataFrame):
                processed_data["Mineral Extraction"] = mineral_data
            elif isinstance(mineral_data, dict) or isinstance(mineral_data, list):
                processed_data["Mineral Extraction"] = pd.DataFrame(mineral_data)
            else:
                logger.warning("Mineral Extraction data format not recognized")
        
        # Process timber production data
        if "Timber Production" in self.data and self.data["Timber Production"] is not None:
            timber_data = self.data["Timber Production"]
            if isinstance(timber_data, pd.DataFrame):
                processed_data["Timber Production"] = timber_data
            elif isinstance(timber_data, dict) or isinstance(timber_data, list):
                processed_data["Timber Production"] = pd.DataFrame(timber_data)
            else:
                logger.warning("Timber Production data format not recognized")
        
        return processed_data

# Example usage
if __name__ == "__main__":
    fetcher = DataFetcher()
    data = fetcher.fetch_all_data()
    processed_data = fetcher.preprocess_data()
    print("Data fetching and preprocessing complete")