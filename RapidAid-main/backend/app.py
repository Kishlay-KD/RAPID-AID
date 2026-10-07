"""
RapidAid - Smart Emergency Ambulance Response System
Backend API + Frontend Server using Python Flask with SQLite Database
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime
import math
import os
import sys

# Add parent directory to path to import models
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from models import User, Ambulance, Request, calculate_distance, Database, calculate_eta_time, format_time_display
from config import Config

# Get the base directory of the project
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

app = Flask(__name__)
CORS(app)

# Distance limit configuration
MIN_DISTANCE_KM = Config.MIN_DISTANCE_KM
MAX_DISTANCE_KM = Config.MAX_DISTANCE_KM

# Initialize database on startup
Database.init_database()
print("Database initialized successfully!")

# ==================== Frontend Routes ====================

@app.route('/')
def index():
    return send_from_directory(os.path.join(BASE_DIR, 'pages'), 'index.html')

@app.route('/home')
def home():
    return send_from_directory(os.path.join(BASE_DIR, 'pages'), 'home.html')

@app.route('/pages/<path:path>')
def serve_pages(path):
    return send_from_directory(os.path.join(BASE_DIR, 'pages'), path)

@app.route('/<path:path>')
def serve_static(path):
    try:
        return send_from_directory(os.path.join(BASE_DIR, 'pages'), path)
    except:
        try:
            return send_from_directory(BASE_DIR, path)
        except:
            return send_from_directory(os.path.join(BASE_DIR, 'pages'), path)

@app.route('/favicon.ico')
def favicon():
    """Serve favicon to avoid 404 errors in logs"""
    try:
        return send_from_directory(os.path.join(BASE_DIR, 'pages'), 'favicon.ico')
    except:
        # Return a 204 No Content response if favicon doesn't exist
        return '', 204

# ==================== API Routes ====================

@app.route('/api/health')
def health():
    return jsonify({'status': 'healthy', 'service': 'RapidAid API'})

# ==================== Authentication Routes ====================

@app.route('/api/users/login', methods=['POST'])
def patient_login():
    """Patient login endpoint"""
    data = request.get_json()
    phone = data.get('phone')
    password = data.get('password')
    
    user = User.get_by_phone(phone)
    
    if user and user['password'] == password:
        return jsonify({
            'status': 'success',
            'message': 'Login successful',
            'user': dict(user)
        })
    else:
        return jsonify({
            'status': 'error',
            'message': 'Invalid phone or password'
        }), 401

@app.route('/api/driver/login', methods=['POST'])
def driver_login():
    """Driver login endpoint"""
    data = request.get_json()
    ambulance_id = data.get('ambulance_id')
    
    # Find ambulance by ID
    amb = Ambulance.get_by_id(ambulance_id)
    
    if not amb:
        return jsonify({
            'status': 'error',
            'message': 'Ambulance not found'
        }), 404
    
    return jsonify({
        'status': 'success',
        'message': 'Login successful',
        'driver': {
            'id': amb['id'],
            'driver_name': amb['driver_name'],
            'phone': amb['phone']
        },
        'ambulance': dict(amb)
    })

@app.route('/api/users/register', methods=['POST'])
def register_user():
    """Register a new patient"""
    data = request.get_json()
    
    # Check if phone already exists
    existing_user = User.get_by_phone(data.get('phone'))
    if existing_user:
        return jsonify({
            'status': 'error',
            'message': 'Phone number already registered'
        }), 400
    
    new_user = User.create(
        name=data.get('name'),
        phone=data.get('phone'),
        email=data.get('email', ''),
        password=data.get('password'),
        latitude=data.get('latitude', 30.6800),
        longitude=data.get('longitude', 76.6050),
        emergency_contact=data.get('emergency_contact', '')
    )
    
    # Get the created user
    user = User.get_by_phone(data.get('phone'))
    
    return jsonify({
        'status': 'success',
        'message': 'User registered successfully',
        'user': dict(user)
    })

@app.route('/api/requests', methods=['POST'])
def create_request():
    """Create a new request with distance limit validation (5km - 80km)"""
    data = request.get_json()
    
    user_id = data.get('user_id', 1)
    user_lat = data.get('latitude') or data.get('lat', 30.6800)
    user_lng = data.get('longitude') or data.get('lng', 76.6050)
    
    # Create request in database
    request_id = Request.create(user_id, user_lat, user_lng)
    
    # Find nearest available ambulance within distance limits (5km - 80km)
    nearest = Ambulance.find_nearest(user_lat, user_lng, MIN_DISTANCE_KM, MAX_DISTANCE_KM)
    
    if nearest:
        eta_minutes = nearest.get('eta_minutes', 10)
        time_display = format_time_display(eta_minutes)
        Request.assign_ambulance(request_id, nearest['id'], eta_minutes)
        amb = Ambulance.get_by_id(nearest['id'])
        
        return jsonify({
            'status': 'success',
            'message': f'Ambulance assigned ({nearest["distance"]:.2f} km away)',
            'request_id': request_id,
            'ambulance': dict(amb),
            'distance_km': round(nearest['distance'], 2),
            'eta_minutes': eta_minutes,
            'eta_time': time_display,
            'distance_limit': {
                'min_km': MIN_DISTANCE_KM,
                'max_km': MAX_DISTANCE_KM
            }
        })
    else:
        return jsonify({
            'status': 'pending',
            'message': f'No ambulances available within {MIN_DISTANCE_KM}-{MAX_DISTANCE_KM}km range. Please try again in a moment.',
            'request_id': request_id,
            'distance_limit': {
                'min_km': MIN_DISTANCE_KM,
                'max_km': MAX_DISTANCE_KM
            }
        })

@app.route('/api/ambulances/available')
def get_available_ambulances():
    """Get all available ambulances"""
    available = Ambulance.get_available()
    return jsonify({'status': 'success', 'ambulances': available})

@app.route('/api/ambulances/nearest')
def get_nearest_ambulance():
    """Find nearest ambulance within distance limits (5km - 80km)"""
    lat = float(request.args.get('lat', 30.6800))
    lng = float(request.args.get('lng', 76.6050))
    
    nearest = Ambulance.find_nearest(lat, lng, MIN_DISTANCE_KM, MAX_DISTANCE_KM)
    
    if nearest:
        eta_minutes = nearest.get('eta_minutes', 10)
        time_display = format_time_display(eta_minutes)
        return jsonify({
            'status': 'success',
            'ambulance': nearest,
            'eta_minutes': eta_minutes,
            'eta_time': time_display,
            'distance_limit': {
                'min_km': MIN_DISTANCE_KM,
                'max_km': MAX_DISTANCE_KM
            }
        })
    else:
        return jsonify({
            'status': 'error',
            'message': f'No ambulances available within {MIN_DISTANCE_KM}-{MAX_DISTANCE_KM}km range',
            'distance_limit': {
                'min_km': MIN_DISTANCE_KM,
                'max_km': MAX_DISTANCE_KM
            }
        }), 404

@app.route('/api/ambulances')
def get_all_ambulances():
    """Get all ambulances"""
    ambulances = Ambulance.get_all()
    return jsonify({'status': 'success', 'ambulances': ambulances})

@app.route('/api/ambulances/within-range')
def get_ambulances_within_range():
    """Get all available ambulances within distance range (5km - 80km)"""
    lat = float(request.args.get('lat', 30.6800))
    lng = float(request.args.get('lng', 76.6050))
    
    # Use custom min/max from query params or defaults
    min_dist = float(request.args.get('min_km', MIN_DISTANCE_KM))
    max_dist = float(request.args.get('max_km', MAX_DISTANCE_KM))
    
    ambulances_in_range = Ambulance.get_available_within_range(lat, lng, min_dist, max_dist)
    
    # Add time display for each ambulance
    for amb in ambulances_in_range:
        if 'eta_minutes' in amb:
            amb['eta_time'] = format_time_display(amb['eta_minutes'])
    
    return jsonify({
        'status': 'success',
        'ambulances': ambulances_in_range,
        'count': len(ambulances_in_range),
        'distance_filter': {
            'min_km': min_dist,
            'max_km': max_dist
        },
        'user_location': {
            'latitude': lat,
            'longitude': lng
        }
    })

@app.route('/api/requests/<int:req_id>')
def get_request(req_id):
    req = Request.get_by_id(req_id)
    if not req:
        return jsonify({'status': 'error', 'message': 'Request not found'}), 404
    
    amb = None
    if req.get('ambulance_id'):
        amb = Ambulance.get_by_id(req['ambulance_id'])
    
    # Calculate real-time distance and ETA
    distance_km = None
    eta_minutes = None
    time_display = None
    if amb and req.get('user_lat') and req.get('user_lng'):
        distance_km = calculate_distance(
            amb['latitude'], amb['longitude'], 
            req['user_lat'], req['user_lng']
        )
        eta_minutes = calculate_eta_time(distance_km)
        time_display = format_time_display(eta_minutes)
    
    return jsonify({
        'status': 'success', 
        'request': dict(req), 
        'ambulance': dict(amb) if amb else None,
        'distance_km': round(distance_km, 2) if distance_km else None,
        'eta_minutes': eta_minutes,
        'eta_time': time_display
    })

@app.route('/api/requests/pending')
def get_pending():
    requests = Request.get_pending()
    return jsonify({'status': 'success', 'requests': requests})

@app.route('/api/users/<int:user_id>/requests')
def user_requests(user_id):
    user_reqs = Request.get_by_user(user_id)
    return jsonify({'status': 'success', 'requests': user_reqs})

@app.route('/api/driver/accept', methods=['POST'])
def driver_accept():
    """Driver accepts a request (with distance validation)"""
    data = request.get_json()
    req_id = data.get('request_id')
    amb_id = data.get('ambulance_id')
    
    req = Request.get_by_id(req_id)
    amb = Ambulance.get_by_id(amb_id)
    
    if req and amb:
        dist = calculate_distance(amb['latitude'], amb['longitude'], req['user_lat'], req['user_lng'])
        
        # Validate distance is within limits
        if dist < MIN_DISTANCE_KM:
            return jsonify({
                'status': 'error',
                'message': f'Ambulance is too close ({dist:.2f}km). Minimum distance: {MIN_DISTANCE_KM}km',
                'distance_km': round(dist, 2),
                'distance_limit': {'min_km': MIN_DISTANCE_KM, 'max_km': MAX_DISTANCE_KM}
            }), 400
        
        if dist > MAX_DISTANCE_KM:
            return jsonify({
                'status': 'error',
                'message': f'Ambulance is too far ({dist:.2f}km). Maximum distance: {MAX_DISTANCE_KM}km',
                'distance_km': round(dist, 2),
                'distance_limit': {'min_km': MIN_DISTANCE_KM, 'max_km': MAX_DISTANCE_KM}
            }), 400
        
        # Distance is valid, assign ambulance
        eta = calculate_eta_time(dist)
        time_display = format_time_display(eta)
        Request.assign_ambulance(req_id, amb_id, eta)
        return jsonify({
            'status': 'success',
            'message': f'Request accepted. Reaching in {time_display}',
            'eta_minutes': eta,
            'eta_time': time_display,
            'distance_km': round(dist, 2)
        })
    
    return jsonify({'status': 'error', 'message': 'Request or ambulance not found'}), 404

@app.route('/api/driver/<int:ambulance_id>/requests')
def driver_requests(ambulance_id):
    """Get all requests for a specific ambulance/driver"""
    all_requests = Request.get_pending()
    driver_reqs = [r for r in all_requests if r.get('ambulance_id') == ambulance_id]
    return jsonify({'status': 'success', 'requests': driver_reqs})

@app.route('/api/requests/<int:req_id>/status', methods=['PUT'])
def update_status(req_id):
    data = request.get_json()
    req = Request.get_by_id(req_id)
    
    if req:
        Request.update_status(req_id, data.get('status', req['status']))
        return jsonify({'status': 'success'})
    
    return jsonify({'status': 'error', 'message': 'Request not found'}), 404

if __name__ == '__main__':
    print("=" * 50)
    print("🚑 RapidAid - Full Stack App Running!")
    print("=" * 50)
    print("Database: SQLite (rapidaid.db)")
    print("Open your browser and go to: http://localhost:5000")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)

