# Azure App Service entry point
from server import app

if __name__ == '__main__':
    import os
    from config import AZURE_DEPLOYMENT
    
    # Get port from environment variable for Azure or use config
    port = int(os.environ.get('PORT', AZURE_DEPLOYMENT["port"]))
    app.run(host=AZURE_DEPLOYMENT["host"], port=port)