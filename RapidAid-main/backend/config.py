import os

class Config:
    """Configuration settings for RapidAid application."""
    
    # Database Configuration
    MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
    MYSQL_USER = os.getenv('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', 'password')
    MYSQL_DATABASE = os.getenv('MYSQL_DATABASE', 'rapidaid')
    
    # Flask Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'rapidaid-secret-key-2024')
    DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'
    
    # Distance Limit Configuration
    MIN_DISTANCE_KM = 1     # Minimum distance between user and ambulance
    MAX_DISTANCE_KM = 80    # Maximum distance between user and ambulance
    
    # API Keys - Use environment variables in production!
    # Store these in a .env file (never commit to git)
    # GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY', '')
    # GEOAPIFY_API_KEY = os.getenv('GEOAPIFY_API_KEY', '')
    # OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY', '')
    # HERE_API_KEY = os.getenv('HERE_API_KEY', '')

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
