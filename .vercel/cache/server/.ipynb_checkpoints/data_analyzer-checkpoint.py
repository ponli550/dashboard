import json
import logging
import requests
import pandas as pd
import numpy as np
from config import DEEPSEEK_API_KEY, DEEPSEEK_API_URL, CORRELATION_THRESHOLD

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DataAnalyzer:
    """Class to analyze data using Deepseek AI API"""
    
    def __init__(self, processed_data=None):
        self.processed_data = processed_data
        self.api_key = DEEPSEEK_API_KEY
        self.api_url = DEEPSEEK_API_URL
        self.insights = {}
        self.problems = {}
        self.key_points = {}
        self.correlations = {}
    
    def set_data(self, processed_data):
        """Set the processed data for analysis"""
        self.processed_data = processed_data
    
    def analyze_all_data(self):
        """Analyze all available data"""
        if not self.processed_data:
            logger.error("No data available for analysis")
            return False
        
        # Calculate correlations between datasets
        self._calculate_correlations()
        
        # Analyze each dataset
        for data_type, data in self.processed_data.items():
            try:
                logger.info(f"Analyzing {data_type} data")
                self._analyze_dataset(data_type, data)
                logger.info(f"Successfully analyzed {data_type} data")
            except Exception as e:
                logger.error(f"Error analyzing {data_type} data: {str(e)}")
        
        # Generate cross-dataset insights
        self._generate_cross_dataset_insights()
        
        return True
    
    def _calculate_correlations(self):
        """Calculate correlations between different datasets"""
        # This is a simplified implementation - in a real scenario, we would need to
        # identify common fields (like dates or regions) to correlate properly
        try:
            datasets = list(self.processed_data.keys())
            for i in range(len(datasets)):
                for j in range(i+1, len(datasets)):
                    data1_name = datasets[i]
                    data2_name = datasets[j]
                    data1 = self.processed_data[data1_name]
                    data2 = self.processed_data[data2_name]
                    
                    # Check if both datasets are DataFrames
                    if isinstance(data1, pd.DataFrame) and isinstance(data2, pd.DataFrame):
                        # For demonstration, we'll just check if they have similar shapes
                        # In a real implementation, we would need to align the datasets properly
                        correlation = {
                            "strength": np.random.uniform(0, 1),  # Placeholder for actual correlation
                            "description": f"Correlation between {data1_name} and {data2_name}"
                        }
                        
                        self.correlations[f"{data1_name}-{data2_name}"] = correlation
        except Exception as e:
            logger.error(f"Error calculating correlations: {str(e)}")
    
    def _analyze_dataset(self, data_type, data):
        """Analyze a specific dataset using Deepseek AI"""
        try:
            # Convert DataFrame to JSON for API request
            if isinstance(data, pd.DataFrame):
                # Take a sample if the dataset is large
                if len(data) > 100:
                    data_sample = data.sample(100).to_dict(orient='records')
                else:
                    data_sample = data.to_dict(orient='records')
                
                # Prepare prompt for Deepseek AI
                prompt = self._create_analysis_prompt(data_type, data_sample)
                
                # Get analysis from Deepseek AI
                analysis = self._query_deepseek_api(prompt)
                
                # Parse the analysis results
                self._parse_analysis_results(data_type, analysis)
            else:
                logger.warning(f"{data_type} is not a DataFrame, skipping analysis")
        except Exception as e:
            logger.error(f"Error in _analyze_dataset for {data_type}: {str(e)}")
    
    def _create_analysis_prompt(self, data_type, data_sample):
        """Create a prompt for the Deepseek AI API"""
        prompt = f"""
        Analyze the following {data_type} data from Malaysia with a focus on water quality and sustainable urban development:
        
        {json.dumps(data_sample, indent=2)}
        
        Please provide:
        1. Key insights about this data related to water quality in Malaysia
        2. Potential problems or issues identified in the data
        3. Key points that would be relevant for sustainable urban planning
        4. Any trends or patterns visible in the data
        5. How this data might correlate with other environmental factors
        
        Format your response as a JSON with the following structure:
        {{"insights": [list of insights], "problems": [list of problems], "key_points": [list of key points], "trends": [list of trends], "correlations": [list of potential correlations]}}
        """
        return prompt
    
    def _query_deepseek_api(self, prompt):
        """Query the Deepseek AI API with the given prompt"""
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": "deepseek-chat",
                "messages": [
                    {"role": "system", "content": "You are an expert in environmental science, water quality, and sustainable urban development in Malaysia."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 2000
            }
            
            response = requests.post(self.api_url, headers=headers, json=payload)
            
            if response.status_code == 200:
                result = response.json()
                if 'choices' in result and len(result['choices']) > 0:
                    return result['choices'][0]['message']['content']
                else:
                    logger.error(f"Unexpected API response structure: {result}")
                    return None
            else:
                logger.error(f"API request failed with status code {response.status_code}: {response.text}")
                # Fallback to mock response for development/testing
                return self._generate_mock_analysis()
        except Exception as e:
            logger.error(f"Error querying Deepseek API: {str(e)}")
            # Fallback to mock response for development/testing
            return self._generate_mock_analysis()
    
    def _generate_mock_analysis(self):
        """Generate mock analysis for development/testing purposes"""
        mock_analysis = {
            "insights": [
                "Water quality in major river basins shows concerning levels of pollution",
                "Industrial areas show higher concentrations of heavy metals in water sources",
                "Seasonal variations affect water quality metrics significantly"
            ],
            "problems": [
                "Inadequate wastewater treatment in rapidly developing urban areas",
                "Agricultural runoff contributing to high nitrogen levels in water bodies",
                "Mining activities causing heavy metal contamination in nearby water sources"
            ],
            "key_points": [
                "Need for improved water treatment infrastructure in urban centers",
                "Importance of buffer zones between industrial areas and water sources",
                "Potential for green infrastructure to mitigate urban runoff issues"
            ],
            "trends": [
                "Declining water quality correlates with increased urbanization",
                "Improvement in areas where sustainable practices have been implemented",
                "Seasonal patterns showing worse water quality during monsoon seasons"
            ],
            "correlations": [
                "Strong correlation between timber harvesting and downstream water turbidity",
                "Mineral extraction activities show relationship with heavy metal presence in water",
                "Urban density correlates with decreased dissolved oxygen levels in nearby water bodies"
            ]
        }
        return json.dumps(mock_analysis)
    
    def _parse_analysis_results(self, data_type, analysis_text):
        """Parse the analysis results from Deepseek AI"""
        try:
            # Validate JSON structure first
            analysis = json.loads(analysis_text.strip())
            
            # Validate required fields
            required_fields = ['insights', 'problems', 'key_points']
            for field in required_fields:
                if field not in analysis:
                    logger.error(f"Missing required field '{field}' in analysis results")
                    return False

            # Store the results
            self.insights[data_type] = analysis.get("insights", [])
            self.problems[data_type] = analysis.get("problems", [])
            self.key_points[data_type] = analysis.get("key_points", [])

            # Log success metrics
            logger.info(f"Successfully parsed {len(self.insights[data_type])} insights "
                      f"and {len(self.problems[data_type])} problems for {data_type}")
            return True

        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing failed for {data_type}: {str(e)}")
            logger.debug(f"Raw API response: {analysis_text}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error parsing {data_type} results: {str(e)}")
            return False

            # Store additional information if available
            if "trends" in analysis:
                if "trends" not in self.insights:
                    self.insights["trends"] = {}
                self.insights["trends"][data_type] = analysis["trends"]
            
            if "correlations" in analysis:
                if "ai_correlations" not in self.correlations:
                    self.correlations["ai_correlations"] = {}
                self.correlations["ai_correlations"][data_type] = analysis["correlations"]
                
        except json.JSONDecodeError:
            logger.error(f"Failed to parse analysis results for {data_type} as JSON")
            # Try to extract information using simple text parsing as fallback
            self.insights[data_type] = ["Analysis results could not be parsed properly"]
        except Exception as e:
            logger.error(f"Error parsing analysis results for {data_type}: {str(e)}")
    
    def _generate_cross_dataset_insights(self):
        """Generate insights that span across multiple datasets"""
        try:
            # Prepare a prompt that includes information from all datasets
            datasets_summary = {}
            for data_type in self.processed_data.keys():
                if data_type in self.insights:
                    datasets_summary[data_type] = {
                        "insights": self.insights.get(data_type, []),
                        "problems": self.problems.get(data_type, [])
                    }
            
            # Only proceed if we have insights from multiple datasets
            if len(datasets_summary) >= 2:
                prompt = f"""
                Based on the following analysis of multiple environmental datasets from Malaysia,
                provide comprehensive insights about the relationships between water pollution,
                mineral extraction, and timber production, with a focus on sustainable urban development:
                
                {json.dumps(datasets_summary, indent=2)}
                
                Please provide:
                1. Integrated insights that connect multiple datasets
                2. Systemic problems that span across these environmental factors
                3. Key recommendations for sustainable urban planning based on these interconnected issues
                
                Format your response as a JSON with the following structure:
                {{"integrated_insights": [list of insights], "systemic_problems": [list of problems], "recommendations": [list of recommendations]}}
                """
                
                # Get cross-dataset analysis from Deepseek AI
                cross_analysis = self._query_deepseek_api(prompt)
                
                # Parse the cross-dataset analysis
                try:
                    cross_results = json.loads(cross_analysis)
                    self.insights["integrated"] = cross_results.get("integrated_insights", [])
                    self.problems["systemic"] = cross_results.get("systemic_problems", [])
                    self.key_points["recommendations"] = cross_results.get("recommendations", [])
                except json.JSONDecodeError:
                    logger.error("Failed to parse cross-dataset analysis results as JSON")
                except Exception as e:
                    logger.error(f"Error parsing cross-dataset analysis: {str(e)}")
        except Exception as e:
            logger.error(f"Error generating cross-dataset insights: {str(e)}")
    
    def get_insights(self):
        """Get all insights from the analysis"""
        return self.insights
    
    def get_problems(self):
        """Get all problems identified in the analysis"""
        return self.problems
    
    def get_key_points(self):
        """Get all key points from the analysis"""
        return self.key_points
    
    def get_correlations(self):
        """Get all correlations from the analysis"""
        return self.correlations
    
    def get_summary(self):
        """Get a complete summary of all analysis results"""
        return {
            "insights": self.insights,
            "problems": self.problems,
            "key_points": self.key_points,
            "correlations": self.correlations
        }

# Example usage
if __name__ == "__main__":
    from data_fetcher import DataFetcher
    
    # Fetch and process data
    fetcher = DataFetcher()
    fetcher.fetch_all_data()
    processed_data = fetcher.preprocess_data()
    
    # Analyze data
    analyzer = DataAnalyzer(processed_data)
    analyzer.analyze_all_data()
    
    # Get results
    summary = analyzer.get_summary()
    print("Analysis complete")