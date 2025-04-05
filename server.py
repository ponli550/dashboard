from flask import Flask, send_from_directory, jsonify, request
import os
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import logging
from flask_cors import CORS
import json

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Data paths
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'Experiment')
MINERAL_EXTRACTION_PATH = os.path.join(DATA_DIR, 'm.csv')
WATER_QUALITY_PATH = os.path.join(DATA_DIR, 'd.csv')
TIMBER_PRODUCTION_PATH = os.path.join(DATA_DIR, 't.csv')

# Cache for analysis results
analysis_cache = {}

def load_datasets():
    """Load all datasets"""
    datasets = {}
    
    try:
        # Load mineral extraction data
        if os.path.exists(MINERAL_EXTRACTION_PATH):
            mineral_df = pd.read_csv(MINERAL_EXTRACTION_PATH)
            # Convert date to datetime if it exists
            if 'date' in mineral_df.columns:
                # Try common date formats
                try:
                    # Try MM/DD/YY format first
                    mineral_df['date'] = pd.to_datetime(mineral_df['date'], format='%m/%d/%y', errors='coerce')
                except:
                    # Fall back to flexible parsing
                    mineral_df['date'] = pd.to_datetime(mineral_df['date'], errors='coerce')
                    logger.info("Using flexible date parsing - consider standardizing date format")
                
                mineral_df['year'] = mineral_df['date'].dt.year
            datasets['mineral_extraction'] = mineral_df
            logger.info(f"Loaded mineral extraction data: {len(mineral_df)} rows")
        else:
            logger.warning(f"Mineral extraction data file not found: {MINERAL_EXTRACTION_PATH}")
            # Create mock data for testing
            datasets['mineral_extraction'] = create_mock_mineral_data()
        
        # Load water quality data if available
        if os.path.exists(WATER_QUALITY_PATH):
            water_df = pd.read_csv(WATER_QUALITY_PATH)
            datasets['water_quality'] = water_df
            logger.info(f"Loaded water quality data: {len(water_df)} rows")
        
        # Load timber production data if available
        if os.path.exists(TIMBER_PRODUCTION_PATH):
            timber_df = pd.read_csv(TIMBER_PRODUCTION_PATH)
            datasets['timber_production'] = timber_df
            logger.info(f"Loaded timber production data: {len(timber_df)} rows")
            
    except Exception as e:
        logger.error(f"Error loading datasets: {str(e)}")
        # Create mock data for testing
        datasets['mineral_extraction'] = create_mock_mineral_data()
    
    return datasets

def create_mock_mineral_data():
    """Create mock mineral data for testing"""
    logger.info("Creating mock mineral data for testing")
    
    # Define states, types, and commodities
    states = ['Selangor', 'Johor', 'Perak', 'Sabah', 'Sarawak', 'Penang', 'Kedah']
    types = ['energy', 'metallic', 'non-metallic']
    commodities = {
        'energy': ['coal', 'natural gas', 'petroleum'],
        'metallic': ['gold', 'tin', 'iron', 'bauxite', 'copper'],
        'non-metallic': ['limestone', 'clay', 'silica', 'kaolin', 'marble']
    }
    
    # Create years
    years = list(range(2015, 2023))
    
    # Create empty dataframe
    data = []
    
    # Generate data
    for year in years:
        for state in states:
            for type_name in types:
                for commodity in commodities[type_name]:
                    # Generate random production value with increasing trend
                    base_production = np.random.randint(1000, 10000)
                    yearly_increase = np.random.uniform(0.05, 0.2)
                    production = base_production * (1 + yearly_increase) ** (year - 2015)
                    
                    # Add some randomness
                    production *= np.random.uniform(0.8, 1.2)
                    
                    data.append({
                        'date': f'1/1/{str(year)[2:]}',
                        'state': state,
                        'type': type_name,
                        'commodity': commodity,
                        'production': int(production)
                    })
    
    return pd.DataFrame(data)

def analyze_mineral_extraction(df):
    """Analyze mineral extraction data"""
    results = {}
    
    try:
        # Ensure year column exists and make a copy of the dataframe to avoid modifying the original
        df_analysis = df.copy()
        
        if 'year' not in df_analysis.columns and 'date' in df_analysis.columns:
            df_analysis['date'] = pd.to_datetime(df_analysis['date'], errors='coerce')
            df_analysis['year'] = df_analysis['date'].dt.year
        
        # Make sure we're not including date columns in aggregations
        numeric_columns = df_analysis.select_dtypes(include=['number']).columns
        if 'production' not in numeric_columns:
            logger.warning("No 'production' column found in numeric columns")
            # Try to convert production column to numeric if it exists
            if 'production' in df_analysis.columns:
                df_analysis['production'] = pd.to_numeric(df_analysis['production'], errors='coerce')
        
        # Explicitly exclude date columns from aggregations
        if 'date' in df_analysis.columns:
            df_analysis = df_analysis.drop('date', axis=1)
        
        # Overall production trends by year
        yearly_production = df_analysis.groupby(['year', 'type']).sum()['production'].unstack(fill_value=0)
        results['yearly_production_by_type'] = yearly_production.to_dict()
        
        # Top commodities by production volume
        commodity_totals = df_analysis.groupby('commodity').sum()['production'].sort_values(ascending=False)
        results['top_commodities'] = commodity_totals.head(10).to_dict()
        
        # State-wise production
        state_production = df_analysis.groupby(['state', 'year']).sum()['production'].unstack(fill_value=0)
        results['state_production'] = state_production.to_dict()
        
        # Growth rates for commodities
        pivot_df = df_analysis.pivot_table(index='year', columns='commodity', values='production', aggfunc='sum', fill_value=0)
        
        # Calculate growth rates between first and last year
        first_year = pivot_df.index.min()
        last_year = pivot_df.index.max()
        
        growth_rates = {}
        for commodity in pivot_df.columns:
            if pivot_df.loc[first_year, commodity] > 0:
                growth_rate = ((pivot_df.loc[last_year, commodity] - pivot_df.loc[first_year, commodity]) / 
                              pivot_df.loc[first_year, commodity]) * 100
                growth_rates[commodity] = growth_rate
        
        results['commodity_growth_rates'] = growth_rates
        
        # Cluster states by production patterns
        state_commodity_pivot = df_analysis.pivot_table(
            index='state', 
            columns='commodity', 
            values='production', 
            aggfunc='sum',
            fill_value=0
        )
        
        if len(state_commodity_pivot) >= 3:
            scaler = StandardScaler()
            scaled_data = scaler.fit_transform(state_commodity_pivot)
            
            # Determine optimal number of clusters (simplified)
            k = min(5, len(state_commodity_pivot) - 1)
            
            kmeans = KMeans(n_clusters=k, random_state=42)
            clusters = kmeans.fit_predict(scaled_data)
            
            state_clusters = {state: int(cluster) for state, cluster in zip(state_commodity_pivot.index, clusters)}
            
            # Analyze what defines each cluster
            cluster_profiles = {}
            for cluster in range(k):
                cluster_states = [state for state, c in state_clusters.items() if c == cluster]
                cluster_data = state_commodity_pivot.loc[cluster_states]
                top_commodities = cluster_data.mean().nlargest(5).index.tolist()
                cluster_profiles[int(cluster)] = {
                    'states': cluster_states,
                    'top_commodities': top_commodities
                }
            
            results['state_clusters'] = state_clusters
            results['cluster_profiles'] = cluster_profiles
        
        # Generate key insights
        insights = []
        
        # Top producing states
        state_total = df_analysis.groupby('state').sum()['production'].sort_values(ascending=False)
        top_state = state_total.index[0]
        insights.append(f"{top_state} is the highest mineral producing state with {state_total.iloc[0]:,.0f} units of production.")
        
        # Fastest growing commodity
        if growth_rates:
            fastest_growing = max(growth_rates, key=growth_rates.get)
            insights.append(f"{fastest_growing} shows the highest growth rate at {growth_rates[fastest_growing]:.1f}%.")
        
        # Most significant decline
        if growth_rates:
            fastest_declining = min(growth_rates, key=growth_rates.get)
            insights.append(f"{fastest_declining} shows the most significant decline at {growth_rates[fastest_declining]:.1f}%.")
        
        # Production distribution
        type_distribution = df_analysis.groupby('type').sum()['production']
        dominant_type = type_distribution.idxmax()
        dominant_pct = (type_distribution[dominant_type] / type_distribution.sum()) * 100
        insights.append(f"{dominant_type} minerals dominate production at {dominant_pct:.1f}% of total volume.")
        
        results['insights'] = insights
        
    except Exception as e:
        logger.error(f"Error analyzing mineral extraction data: {str(e)}")
        results['error'] = str(e)
        # Provide fallback insights
        results['insights'] = [
            "Analysis encountered an error. Using fallback insights.",
            "Mineral production shows varying trends across different states.",
            "Consider reviewing the data format for more accurate analysis."
        ]
    
    return results

def analyze_water_quality(df):
    """Analyze water quality data"""
    results = {}
    
    try:
        # Basic analysis for water quality data
        if 'location' in df.columns and 'ph' in df.columns:
            # Average pH by location
            avg_ph = df.groupby('location')['ph'].mean().to_dict()
            results['average_ph_by_location'] = avg_ph
            
            # Overall water quality status
            if 'quality_index' in df.columns:
                quality_status = df.groupby('location')['quality_index'].mean().to_dict()
                results['water_quality_status'] = quality_status
            
            # Generate insights
            insights = []
            
            # pH levels
            if 'ph' in df.columns:
                avg_overall_ph = df['ph'].mean()
                insights.append(f"Average water pH level across all locations is {avg_overall_ph:.2f}.")
                
                # Locations with concerning pH
                concerning_ph = df[df['ph'] < 6.5].groupby('location').size().to_dict()
                if concerning_ph:
                    top_concerning = max(concerning_ph, key=concerning_ph.get)
                    insights.append(f"{top_concerning} has the most samples with pH below recommended levels.")
            
            # Contamination
            if 'contaminant_level' in df.columns:
                high_contaminant = df[df['contaminant_level'] > df['contaminant_level'].quantile(0.75)]
                if not high_contaminant.empty:
                    top_contaminant_loc = high_contaminant.groupby('location').size().idxmax()
                    insights.append(f"{top_contaminant_loc} shows elevated contaminant levels that require attention.")
            
            results['insights'] = insights
        else:
            results['status'] = "Insufficient data columns for water quality analysis"
            results['insights'] = ["Water quality data lacks required columns for comprehensive analysis."]
    except Exception as e:
        logger.error(f"Error analyzing water quality data: {str(e)}")
        results['error'] = str(e)
        results['insights'] = ["Water quality analysis encountered an error."]
    
    return results

def analyze_timber_production(df):
    """Analyze timber production data"""
    results = {}
    
    try:
        # Basic analysis for timber production data
        if 'region' in df.columns and 'production' in df.columns:
            # Production by region
            production_by_region = df.groupby('region')['production'].sum().to_dict()
            results['production_by_region'] = production_by_region
            
            # Production trends if year data is available
            if 'year' in df.columns:
                yearly_production = df.groupby('year')['production'].sum().to_dict()
                results['yearly_production'] = yearly_production
            
            # Generate insights
            insights = []
            
            # Top producing region
            top_region = max(production_by_region, key=production_by_region.get)
            insights.append(f"{top_region} is the highest timber producing region with {production_by_region[top_region]:,.0f} units.")
            
            # Sustainability metrics if available
            if 'sustainability_index' in df.columns:
                avg_sustainability = df.groupby('region')['sustainability_index'].mean().to_dict()
                least_sustainable = min(avg_sustainability, key=avg_sustainability.get)
                insights.append(f"{least_sustainable} has the lowest sustainability index at {avg_sustainability[least_sustainable]:.2f}.")
            
            # Species diversity if available
            if 'species' in df.columns:
                species_count = df.groupby('region')['species'].nunique().to_dict()
                most_diverse = max(species_count, key=species_count.get)
                insights.append(f"{most_diverse} has the highest timber species diversity with {species_count[most_diverse]} different species.")
            
            results['insights'] = insights
        else:
            results['status'] = "Insufficient data columns for timber production analysis"
            results['insights'] = ["Timber production data lacks required columns for comprehensive analysis."]
    except Exception as e:
        logger.error(f"Error analyzing timber production data: {str(e)}")
        results['error'] = str(e)
        results['insights'] = ["Timber production analysis encountered an error."]
    
    return results

@app.route('/')
def index():
    """Serve the dashboard HTML"""
    return send_from_directory('.', 'dashboard.html')

@app.route('/dashboard.html')
def dashboard():
    """Alternative route to serve the dashboard HTML"""
    return send_from_directory('.', 'dashboard.html')

@app.route('/api/data')
def get_data():
    """API endpoint to get analyzed data"""
    # Clear cache if requested
    if request.args.get('refresh') == 'true':
        analysis_cache.clear()
    
    # Check if we have cached results
    if not analysis_cache:
        datasets = load_datasets()
        
        # Analyze datasets
        results = {}
        
        if 'mineral_extraction' in datasets:
            try:
                results['mineral_extraction'] = analyze_mineral_extraction(datasets['mineral_extraction'])
            except Exception as e:
                logger.error(f"Failed to analyze mineral extraction data: {str(e)}")
                # Provide fallback data
                results['mineral_extraction'] = {
                    'error': str(e),
                    'insights': ['Analysis failed due to data format issues. Please check the data structure.'],
                    'yearly_production_by_type': {},
                    'top_commodities': {},
                    'state_production': {},
                    'commodity_growth_rates': {}
                }
        
        # Analyze water quality data if available
        if 'water_quality' in datasets:
            try:
                results['water_quality'] = analyze_water_quality(datasets['water_quality'])
            except Exception as e:
                logger.error(f"Failed to analyze water quality data: {str(e)}")
                results['water_quality'] = {
                    'error': str(e),
                    'insights': ['Water quality analysis failed due to data format issues.'],
                    'status': "Analysis failed"
                }
        else:
            # Create mock water quality data and analysis
            results['water_quality'] = {
                'status': "Mock data generated for demonstration",
                'insights': [
                    "This is simulated water quality data for demonstration purposes.",
                    "In a real scenario, water quality metrics would be analyzed here.",
                    "Parameters like pH, dissolved oxygen, and contaminant levels would be tracked."
                ]
            }
        
        # Analyze timber production data if available
        if 'timber_production' in datasets:
            try:
                results['timber_production'] = analyze_timber_production(datasets['timber_production'])
            except Exception as e:
                logger.error(f"Failed to analyze timber production data: {str(e)}")
                results['timber_production'] = {
                    'error': str(e),
                    'insights': ['Timber production analysis failed due to data format issues.'],
                    'status': "Analysis failed"
                }
        else:
            # Create mock timber production data and analysis
            results['timber_production'] = {
                'status': "Mock data generated for demonstration",
                'insights': [
                    "This is simulated timber production data for demonstration purposes.",
                    "In a real scenario, timber harvesting and sustainability metrics would be analyzed.",
                    "Factors like species diversity, reforestation rates, and production volumes would be tracked."
                ]
            }
        
        # Cache the results
        analysis_cache.update(results)
    
    return jsonify(analysis_cache)

# Vercel serverless function handler
@app.route('/api/vercel', methods=['GET'])
def vercel_handler():
    """Handler for Vercel serverless function"""
    return jsonify({
        "message": "Vercel serverless function is working!",
        "environment": "Vercel"
    })

# Add a catch-all route to handle 404 errors gracefully
@app.errorhandler(404)
def page_not_found(e):
    return jsonify({
        "error": "The requested URL was not found on the server.",
        "status": 404,
        "message": "Please check the URL and try again."
    }), 404

# At the bottom of your file
if __name__ == '__main__':
    # Get port from environment variable for Heroku
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port)