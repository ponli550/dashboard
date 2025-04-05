# Azure App Service entry point
from server import app

# This file is used by Azure App Service to start the application
if __name__ == '__main__':
    app.run()