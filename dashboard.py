from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
import dash
from dash import dcc, html, callback, Input, Output
import dash_bootstrap_components as dbc
from data_analyzer import DataAnalyzer
from config import DASHBOARD_TITLE, DASHBOARD_PORT, DASHBOARD_DEBUG
import logging