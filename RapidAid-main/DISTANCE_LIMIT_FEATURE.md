# Distance Limit Feature - RapidAid

## Overview
This document describes the **Distance Limit Feature** added to the RapidAid Emergency Ambulance Response System. The feature enforces a distance constraint between patients (users) and ambulances:

- **Minimum Distance:** 5 km
- **Maximum Distance:** 80 km

## Purpose
The distance limit ensures that:
1. **Ambulances are not too close** - Prevents assigning ambulances that are immediately at the patient's location
2. **Ambulances are not too far** - Prevents long response times by rejecting ambulances beyond 80km range
3. **Optimal ETA** - Ensures reasonable arrival times for emergency services

## Configuration

### Distance Limits (in `backend/config.py`)
```python
MIN_DISTANCE_KM = 5     # Minimum distance between user and ambulance
MAX_DISTANCE_KM = 80    # Maximum distance between user and ambulance
```

These values are used throughout the backend and can be easily modified if needed.

## Implementation Details

### 1. Updated Database Models (`backend/models.py`)

#### Modified `Ambulance.find_nearest()` method
- **Previous behavior:** Only had a minimum distance check
- **New behavior:** Enforces both minimum (5km) and maximum (80km) distance limits
- **Parameters:**
  - `user_lat`, `user_lng` - User coordinates
  - `min_distance_km=5` - Minimum distance (default: 5km)
  - `max_distance_km=80` - Maximum distance (default: 80km)

**Logic Flow:**
1. First, finds ambulances within the optimal 5-80km range
2. If none found, tries to find available ambulances at least 5km away
3. Last resort: accepts any available ambulance
4. Returns the closest ambulance from the suitable list

#### New `Ambulance.get_available_within_range()` method
```python
get_available_within_range(user_lat, user_lng, min_distance_km=5, max_distance_km=80)
```
- Gets **all** available ambulances within the specified distance range
- Returns list sorted by distance (nearest first)
- Useful for showing multiple ambulance options to users

### 2. Updated API Endpoints (`backend/app.py`)

#### POST `/api/requests`
**Creates a new request with distance limit validation**

Request parameters:
```json
{
    "user_id": 1,
    "latitude": 30.6800,
    "longitude": 76.6050
}
```

Response (Success - ambulance found within range):
```json
{
    "status": "success",
    "message": "Ambulance assigned (2.45 km away)",
    "request_id": 1,
    "ambulance": { ... },
    "distance_km": 2.45,
    "eta_minutes": 4,
    "distance_limit": {
        "min_km": 5,
        "max_km": 80
    }
}
```

Response (Pending - no ambulances in range):
```json
{
    "status": "pending",
    "message": "No ambulances available within 5-80km range",
    "request_id": 1,
    "distance_limit": {
        "min_km": 5,
        "max_km": 80
    }
}
```

#### GET `/api/ambulances/nearest`
**Find nearest ambulance to given coordinates (with distance validation)**

Request parameters:
```
GET /api/ambulances/nearest?lat=30.6800&lng=76.6050
```

Response:
```json
{
    "status": "success",
    "ambulance": {
        "id": 1,
        "driver_name": "Amit Singh",
        "phone": "9876543221",
        "status": "available",
        "latitude": 30.6790,
        "longitude": 76.6040,
        "vehicle_number": "PB-01-CD-5678",
        "distance": 2.45
    },
    "distance_limit": {
        "min_km": 5,
        "max_km": 80
    }
}
```

#### GET `/api/ambulances/within-range` (NEW)
**Get all available ambulances within distance range**

Request parameters:
```
GET /api/ambulances/within-range?lat=30.6800&lng=76.6050&min_km=5&max_km=80
```

Query parameters:
- `lat` - User latitude (required)
- `lng` - User longitude (required)
- `min_km` - Minimum distance (optional, default: 5)
- `max_km` - Maximum distance (optional, default: 80)

Response:
```json
{
    "status": "success",
    "ambulances": [
        {
            "id": 1,
            "driver_name": "Amit Singh",
            "phone": "9876543221",
            "status": "available",
            "latitude": 30.6790,
            "longitude": 76.6040,
            "vehicle_number": "PB-01-CD-5678",
            "distance": 2.45
        },
        {
            "id": 3,
            "driver_name": "Vikram Patel",
            "phone": "9876543223",
            "status": "available",
            "latitude": 30.6780,
            "longitude": 76.6030,
            "vehicle_number": "PB-01-GH-3456",
            "distance": 3.67
        }
    ],
    "count": 2,
    "distance_filter": {
        "min_km": 5,
        "max_km": 80
    },
    "user_location": {
        "latitude": 30.6800,
        "longitude": 76.6050
    }
}
```

#### POST `/api/driver/accept`
**Driver accepts a request (with distance validation)**

Request parameters:
```json
{
    "request_id": 1,
    "ambulance_id": 2
}
```

Response (Success - distance valid):
```json
{
    "status": "success",
    "message": "Request accepted. Distance: 2.45km",
    "eta_minutes": 4,
    "distance_km": 2.45
}
```

Response (Error - ambulance too close):
```json
{
    "status": "error",
    "message": "Ambulance is too close (0.5km). Minimum distance: 5km",
    "distance_km": 0.5,
    "distance_limit": {"min_km": 5, "max_km": 80}
}
```

Response (Error - ambulance too far):
```json
{
    "status": "error",
    "message": "Ambulance is too far (90km). Maximum distance: 80km",
    "distance_km": 90,
    "distance_limit": {"min_km": 5, "max_km": 80}
}
```

## Distance Calculation

The system uses the **Haversine Formula** to calculate great-circle distances between coordinates:

$$d = 2R \cdot \arctan2\left(\sqrt{a}, \sqrt{1-a}\right)$$

Where:
- $R = 6371$ km (Earth's radius)
- $a = \sin^2\left(\frac{\Delta\text{lat}}{2}\right) + \cos(\text{lat}_1) \cdot \cos(\text{lat}_2) \cdot \sin^2\left(\frac{\Delta\text{lon}}{2}\right)$

This formula accounts for Earth's curvature and provides accurate distance calculations.

## Testing

### Test Case 1: Request with ambulance in range
```
POST /api/requests
{"user_id": 1, "latitude": 30.6800, "longitude": 76.6050}
Expected: Ambulance assigned successfully with distance 2.45km
```

### Test Case 2: Request with no ambulances in range
```
POST /api/requests
{"user_id": 1, "latitude": 50.0000, "longitude": 100.0000}
Expected: Status 'pending' - no ambulances in acceptable range
```

### Test Case 3: Driver accepts with invalid distance
```
POST /api/driver/accept
{"request_id": 1, "ambulance_id": X}
Expected: Error response with distance validation message
```

### Test Case 4: Find ambulances within range
```
GET /api/ambulances/within-range?lat=30.6800&lng=76.6050
Expected: List of ambulances sorted by distance
```

## Files Modified

1. **backend/config.py**
   - Added `MIN_DISTANCE_KM = 5`
   - Added `MAX_DISTANCE_KM = 80`

2. **backend/models.py**
   - Updated `Ambulance.find_nearest()` method
   - Added `Ambulance.get_available_within_range()` method

3. **backend/app.py**
   - Import Config class
   - Updated POST `/api/requests` endpoint
   - Updated GET `/api/ambulances/nearest` endpoint
   - Updated POST `/api/driver/accept` endpoint
   - Added GET `/api/ambulances/within-range` endpoint

## Frontend Integration Tips

When integrating with frontend:

1. **Display Distance Limits**
   - Show "5-80 km service range" in UI
   - Display ambulance distance in real-time

2. **Handle Error Cases**
   - Show user-friendly message when no ambulances available
   - Display ETA with distance information

3. **Show Available Options**
   - Use `/api/ambulances/within-range` to show multiple ambulance options
   - Display distance and estimated arrival time for each

4. **Real-time Updates**
   - Fetch ambulance location updates periodically
   - Recalculate ETA as ambulance moves closer

## Future Enhancements

1. **Dynamic Distance Limits**
   - Allow different limits based on area (urban vs rural)
   - Adjust limits based on ambulance count

2. **Traffic-aware ETA**
   - Integrate with maps API for real traffic data
   - Provide more accurate arrival times

3. **Priority Matching**
   - Prioritize ambulances closest to range boundaries
   - Consider ambulance specialization

4. **Analytics**
   - Track average distances
   - Monitor rejection rates due to distance limits

## Conclusion

The distance limit feature ensures efficient ambulance dispatch by:
- Preventing assignment of ambulances that are too close or too far
- Providing reasonable ETA estimates
- Maintaining response quality across all service areas

The 5-80km range can be adjusted in `config.py` based on your service requirements.
