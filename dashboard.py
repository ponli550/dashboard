from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
import dash
from dash import dcc, html, callback, Input, Output
import dash_bootstrap_components as dbc
from data_analyzer import DataAnalyzer
from data_fetcher import DataFetcher
from config import DASHBOARD_TITLE, DASHBOARD_PORT, DASHBOARD_DEBUG
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Flask server
server = Flask(__name__)
CORS(server)

# Initialize Dash app
app = dash.Dash(
    __name__,
    server=server,
    external_stylesheets=[dbc.themes.BOOTSTRAP],
    routes_pathname_prefix='/dash/'
)

app.title = DASHBOARD_TITLE

# Define the layout
app.layout = dbc.Container([
    dbc.Row([
        dbc.Col([
            html.H1(DASHBOARD_TITLE, className="text-center mb-4"),
            html.P("AI-Powered Insights for Sustainable Resource Management", className="text-center")
        ])
    ], className="mt-4 mb-5"),
    
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("Data Analysis Status"),
                dbc.CardBody([
                    html.Div(id="analysis-status", children="No data analyzed yet")
                ])
            ])
        ])
    ], className="mb-4"),
    
    dbc.Row([
        dbc.Col([
            dbc.Button("Analyze Data", id="analyze-button", color="primary", className="mb-3"),
            dcc.Loading(
                id="loading-analysis",
                type="circle",
                children=html.Div(id="analysis-output")
            )
        ])
    ])
])

@callback(
    Output("analysis-status", "children"),
    Output("analysis-output", "children"),
    Input("analyze-button", "n_clicks"),
    prevent_initial_call=True
)
def analyze_data(n_clicks):
    if n_clicks is None:
        return "No data analyzed yet", ""
    
    try:
        # Fetch and process data
        fetcher = DataFetcher()
        fetcher.fetch_all_data()
        processed_data = fetcher.preprocess_data()
        
        # Analyze data
        analyzer = DataAnalyzer(processed_data)
        success = analyzer.analyze_all_data()
        
        if success:
            summary = analyzer.get_summary()
            
            # Create a summary display
            insights_list = []
            for data_type, insights in summary["insights"].items():
                if data_type != "integrated" and insights:
                    insights_list.append(html.H5(f"{data_type} Insights:"))
                    insights_list.append(html.Ul([html.Li(insight) for insight in insights[:3]]))
            
            if "integrated" in summary["insights"]:
                insights_list.append(html.H5("Integrated Insights:"))
                insights_list.append(html.Ul([html.Li(insight) for insight in summary["insights"]["integrated"][:3]]))
            
            return "Analysis completed successfully", html.Div(insights_list)
        else:
            return "Analysis failed", html.Div("Failed to analyze data. Check logs for details.")
    
    except Exception as e:
        logger.error(f"Error in analyze_data: {str(e)}")
        return f"Error: {str(e)}", html.Div("An error occurred during analysis.")

# Flask routes
@server.route('/')
def index():
    return send_from_directory('.', 'dashboard.html')

@server.route('/api/data')
def get_data():
    try:
        # Fetch and process data
        fetcher = DataFetcher()
        fetcher.fetch_all_data()
        processed_data = fetcher.preprocess_data()
        
        # Analyze data
        analyzer = DataAnalyzer(processed_data)
        analyzer.analyze_all_data()
        
        # Get results
        summary = analyzer.get_summary()
        return jsonify(summary)
    except Exception as e:
        logger.error(f"Error in get_data: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    server.run(debug=DASHBOARD_DEBUG, port=DASHBOARD_PORT)