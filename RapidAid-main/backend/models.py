import sqlite3
import math

class Database:
    DB_NAME = "rapidaid.db"
    
    @staticmethod
    def get_connection():
        conn = sqlite3.connect(Database.DB_NAME)
        conn.row_factory = sqlite3.Row
        return conn
    
    @staticmethod
    def execute_query(query, params=None, fetch=False):
        conn = Database.get_connection()
        cursor = conn.cursor()
        result = None
        try:
            cursor.execute(query, params or ())
            if fetch:
                result = cursor.fetchall()
                result = [dict(row) for row in result]
            else:
                conn.commit()
                result = cursor.lastrowid
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()
        return result
    
    @staticmethod
    def init_database():
        conn = Database.get_connection()
        cursor = conn.cursor()
        cursor.execute("""CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL UNIQUE,
            email TEXT, password TEXT NOT NULL, latitude REAL, longitude REAL,
            emergency_contact TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)""")
        cursor.execute("""CREATE TABLE IF NOT EXISTS ambulances (
            id INTEGER PRIMARY KEY AUTOINCREMENT, driver_name TEXT NOT NULL, phone TEXT NOT NULL UNIQUE,
            status TEXT DEFAULT 'available', latitude REAL, longitude REAL,
            vehicle_number TEXT NOT NULL UNIQUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)""")
        cursor.execute("""CREATE TABLE IF NOT EXISTS requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, ambulance_id INTEGER,
            status TEXT DEFAULT 'pending', request_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            user_lat REAL, user_lng REAL, driver_lat REAL, driver_lng REAL,
            eta_minutes INTEGER, completed_at TIMESTAMP NULL,
            FOREIGN KEY (user_id) REFERENCES users(id), FOREIGN KEY (ambulance_id) REFERENCES ambulances(id))""")
        cursor.execute("SELECT COUNT(*) FROM users")
        if cursor.fetchone()[0] == 0:
            # Sample users
            cursor.execute("INSERT INTO users (name, phone, email, password, latitude, longitude, emergency_contact) VALUES (?,?,?,?,?,?,?)", ('John Doe','9876543210','john@example.com','password123',30.6800,76.6050,'9876543211'))
            cursor.execute("INSERT INTO users (name, phone, email, password, latitude, longitude, emergency_contact) VALUES (?,?,?,?,?,?,?)", ('Jane Smith','9876543212','jane@example.com','password123',30.6820,76.6080,'9876543213'))
            cursor.execute("INSERT INTO users (name, phone, email, password, latitude, longitude, emergency_contact) VALUES (?,?,?,?,?,?,?)", ('Rahul Kumar','9876543214','rahul@example.com','password123',30.6780,76.6020,'9876543215'))
            # Sample ambulances at proper distances (5km+ from user at 30.6800, 76.6050)
            # Using ~0.045 degrees ≈ 5km distance
            cursor.execute("INSERT INTO ambulances (driver_name, phone, status, latitude, longitude, vehicle_number) VALUES (?,?,?,?,?,?)", ('Amit Singh','9876543221','available',30.7300,76.6050,'PB-01-CD-5678'))
            cursor.execute("INSERT INTO ambulances (driver_name, phone, status, latitude, longitude, vehicle_number) VALUES (?,?,?,?,?,?)", ('Suresh Yadav','9876543222','busy',30.6800,76.6600,'PB-01-EF-9012'))
            cursor.execute("INSERT INTO ambulances (driver_name, phone, status, latitude, longitude, vehicle_number) VALUES (?,?,?,?,?,?)", ('Vikram Patel','9876543223','available',30.6300,76.6050,'PB-01-GH-3456'))
            cursor.execute("INSERT INTO ambulances (driver_name, phone, status, latitude, longitude, vehicle_number) VALUES (?,?,?,?,?,?)", ('Mohammad Khan','9876543224','available',30.6800,76.5500,'PB-01-IJ-7890'))
        conn.commit()
        cursor.close()
        conn.close()

Database.init_database()

class User:
    @staticmethod
    def create(name, phone, email, password, latitude=None, longitude=None, emergency_contact=None):
        query = "INSERT INTO users (name, phone, email, password, latitude, longitude, emergency_contact) VALUES (?, ?, ?, ?, ?, ?, ?)"
        return Database.execute_query(query, (name, phone, email, password, latitude, longitude, emergency_contact))
    
    @staticmethod
    def get_by_id(user_id):
        query = "SELECT * FROM users WHERE id = ?"
        result = Database.execute_query(query, (user_id,), fetch=True)
        return result[0] if result else None
    
    @staticmethod
    def get_by_phone(phone):
        query = "SELECT * FROM users WHERE phone = ?"
        result = Database.execute_query(query, (phone,), fetch=True)
        return result[0] if result else None
    
    @staticmethod
    def update_location(user_id, latitude, longitude):
        query = "UPDATE users SET latitude = ?, longitude = ? WHERE id = ?"
        Database.execute_query(query, (latitude, longitude, user_id))

class Ambulance:
    @staticmethod
    def get_all():
        query = "SELECT * FROM ambulances"
        return Database.execute_query(query, fetch=True)
    
    @staticmethod
    def get_available():
        # Return all ambulances regardless of status for emergency situations
        query = "SELECT * FROM ambulances"
        return Database.execute_query(query, fetch=True)
    
    @staticmethod
    def get_by_id(ambulance_id):
        query = "SELECT * FROM ambulances WHERE id = ?"
        result = Database.execute_query(query, (ambulance_id,), fetch=True)
        return result[0] if result else None
    
    @staticmethod
    def update_status(ambulance_id, status):
        query = "UPDATE ambulances SET status = ? WHERE id = ?"
        Database.execute_query(query, (status, ambulance_id))
    
    @staticmethod
    def find_nearest(user_lat, user_lng, min_distance_km=1, max_distance_km=80):
        """
        Find nearest available ambulance within distance range (1km - 80km)
        - min_distance_km: Minimum distance from user (default: 1km)
        - max_distance_km: Maximum distance from user (default: 80km)
        Returns: Ambulance with distance and ETA, or None if no suitable ambulance
        """
        ambulances = Ambulance.get_available()
        if not ambulances: return None
        
        suitable = []
        
        # Find ambulances within the distance range (1-80km)
        for amb in ambulances:
            if amb['latitude'] and amb['longitude']:
                dist = calculate_distance(user_lat, user_lng, amb['latitude'], amb['longitude'])
                # Only consider ambulances within min-max distance range
                if min_distance_km <= dist <= max_distance_km:
                    eta = calculate_eta_time(dist)
                    suitable.append({**amb, 'distance': dist, 'eta_minutes': eta})
        
        if not suitable: 
            return None  # No ambulance meets minimum 1km requirement
        
        # Return the closest one from suitable ambulances
        return min(suitable, key=lambda x: x['distance'])
    
    @staticmethod
    def get_available_within_range(user_lat, user_lng, min_distance_km=1, max_distance_km=80):
        """
        Get all available ambulances within the specified distance range
        Returns list sorted by distance with ETA information
        """
        ambulances = Ambulance.get_available()
        if not ambulances: return []
        
        within_range = []
        for amb in ambulances:
            if amb['latitude'] and amb['longitude']:
                dist = calculate_distance(user_lat, user_lng, amb['latitude'], amb['longitude'])
                # Strictly enforce minimum distance
                if min_distance_km <= dist <= max_distance_km:
                    eta = calculate_eta_time(dist)
                    within_range.append({**amb, 'distance': dist, 'eta_minutes': eta})
        
        # Sort by distance (nearest first)
        return sorted(within_range, key=lambda x: x['distance'])

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates using Haversine formula (returns km)"""
    R = 6371
    a = math.sin(math.radians(lat2-lat1)/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(math.radians(lon2-lon1)/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

def calculate_eta_time(distance_km):
    """Calculate ETA in minutes based on distance (assumes 40 km/h average speed)"""
    # Average ambulance speed: 40 km/h
    eta_minutes = int((distance_km / 40) * 60)
    return max(eta_minutes, 2)  # Minimum 2 minutes

def format_time_display(minutes):
    """Format minutes into human-readable time (e.g., '15 minutes' or '1 hour 20 minutes')"""
    if minutes < 60:
        return f"{minutes} minute{'s' if minutes != 1 else ''}"
    else:
        hours = minutes // 60
        mins = minutes % 60
        if mins == 0:
            return f"{hours} hour{'s' if hours != 1 else ''}"
        else:
            return f"{hours} hour{'s' if hours != 1 else ''} {mins} minute{'s' if mins != 1 else ''}"

class Request:
    @staticmethod
    def create(user_id, user_lat, user_lng):
        query = "INSERT INTO requests (user_id, user_lat, user_lng, status) VALUES (?, ?, ?, 'pending')"
        return Database.execute_query(query, (user_id, user_lat, user_lng))
    
    @staticmethod
    def get_by_id(request_id):
        query = "SELECT * FROM requests WHERE id = ?"
        result = Database.execute_query(query, (request_id,), fetch=True)
        return result[0] if result else None
    
    @staticmethod
    def get_by_user(user_id):
        query = "SELECT * FROM requests WHERE user_id = ? ORDER BY request_time DESC"
        return Database.execute_query(query, (user_id,), fetch=True)
    
    @staticmethod
    def get_pending():
        query = "SELECT * FROM requests WHERE status = 'pending' ORDER BY request_time DESC"
        return Database.execute_query(query, fetch=True)
    
    @staticmethod
    def assign_ambulance(request_id, ambulance_id, eta_minutes):
        query = "UPDATE requests SET ambulance_id = ?, status = 'accepted', eta_minutes = ? WHERE id = ?"
        Database.execute_query(query, (ambulance_id, eta_minutes, request_id))
        Ambulance.update_status(ambulance_id, 'busy')
    
    @staticmethod
    def update_status(request_id, status):
        query = "UPDATE requests SET status = ? WHERE id = ?"
        Database.execute_query(query, (status, request_id))
        if status in ['completed', 'cancelled']:
            req = Request.get_by_id(request_id)
            if req and req['ambulance_id']:
                Ambulance.update_status(req['ambulance_id'], 'available')
