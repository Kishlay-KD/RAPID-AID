# RapidAid - Smart Emergency Ambulance Response System

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/Platform-Web-orange.svg" alt="Platform">
</p>

> **Tagline**: When Every Second Counts

RapidAid is a comprehensive emergency ambulance response system that enables users to request an ambulance instantly, share live GPS location, and connect with the nearest available ambulance driver for faster emergency response.

## 🚑 Features

- **One Tap SOS**: Press the emergency SOS button for instant ambulance request
- **Live GPS Location**: Automatic location sharing with dispatch system
- **Google Maps Integration**: Interactive maps for tracking and navigation
- **Fast Ambulance Dispatch**: Smart algorithm finds the nearest available ambulance
- **Real-Time Tracking**: Track ambulance arrival with live updates and ETA
- **Driver Dashboard**: Separate panel for ambulance drivers to manage requests
- **Emergency Contacts**: Quick access to emergency services
- **Request History**: View all past emergency requests

## 🏗️ System Architecture

```
User Mobile/Web App
        │
        │  (SOS Request + Location)
        ▼
Frontend (HTML / CSS / JavaScript)
        │
        │ API Request
        ▼
Backend Server (Python Flask)
        │
        ├── Database (SQL)
        │
        └── REST API
                │
                ▼
         Ambulance Driver Dashboard
```

## 📁 Project Structure

```
RapidAid/
├── backend/
│   ├── app.py              # Flask REST API (Demo - In-Memory)
│   ├── config.py           # Configuration settings
│   ├── models.py           # Database models
│   ├── database.sql        # SQL schema and sample data
│   └── requirements.txt    # Python dependencies
│
├── frontend/
│   ├── index.html          # Landing page
│   ├── home.html           # Home screen with SOS
│   ├── tracking.html       # Live tracking screen
│   ├── driver.html         # Driver dashboard
│   ├── css/
│   │   └── style.css       # CSS styling
│   └── js/
│       └── main.js        # JavaScript logic
│
├── README.md              # Project documentation
└── TODO.md                # Task tracking
```

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3 (Responsive Design)
- JavaScript (Vanilla)
- Font Awesome Icons

### Backend
- Python 3
- Flask (Web Framework)
- Flask-CORS
- In-Memory Database (Demo) / MySQL (Production)
- REST API

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Web Browser
- Internet connection (for Google Maps)

### Installation

1. **Clone the repository**
   ```bash
   cd RapidAid
   ```

2. **Install Python dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   python app.py
   ```
   
   The application will start at `http://localhost:5000`
   
   > **Note**: This version uses an in-memory database for demo purposes. No MySQL setup required!

### Running in Production Mode (with MySQL)

If you want to use MySQL database instead of the in-memory demo:

1. **Set up the database**
   ```bash
   # Login to MySQL
   mysql -u root -p
   
   # Run the SQL script
   SOURCE backend/database.sql;
   ```

2. **Configure database connection**
   
   Edit `backend/config.py` with your MySQL credentials:
   ```python
   MYSQL_HOST = 'localhost'
   MYSQL_USER = 'root'
   MYSQL_PASSWORD = 'your_password'
   MYSQL_DATABASE = 'rapidaid'
   ```

3. **Configure your application for MySQL**
   
   Edit `backend/config.py` with your MySQL credentials and update your app.py accordingly.

## 📡 API Endpoints

### General Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check endpoint |

### SOS & Request Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sos` | Create SOS request (finds nearest ambulance automatically) |
| GET | `/api/requests/<id>` | Get request details |
| GET | `/api/requests/pending` | Get all pending requests |
| GET | `/api/users/<id>/requests` | Get user request history |
| POST | `/api/driver/accept` | Driver accepts a request |
| PUT | `/api/requests/<id>/status` | Update request status (completed/cancelled) |

> **Note**: The demo version uses an in-memory database. The SOS endpoint automatically finds the nearest available ambulance when creating a request.

## 🗄️ Database Schema

### Users Table
```sql
users
------
id (PK)
name
phone
email
password
latitude
longitude
emergency_contact
created_at
```

### Ambulances Table
```sql
ambulances
----------
id (PK)
driver_name
phone
status (available/busy/offline)
latitude
longitude
vehicle_number
created_at
```

### Requests Table
```sql
requests
--------
id (PK)
user_id (FK)
ambulance_id (FK)
status (pending/accepted/completed/cancelled)
request_time
user_lat
user_lng
driver_lat
driver_lng
eta_minutes
completed_at
```

## 📱 User Flow

1. **Press SOS**: User taps the SOS button on home screen
2. **Share Location**: GPS location is automatically captured
3. **Find Ambulance**: System searches for the nearest available ambulance
4. **Driver Notification**: Driver receives the request notification
5. **Accept Request**: Driver accepts and starts driving
6. **Live Tracking**: User sees ambulance location and ETA in real-time
7. **Arrival**: Ambulance arrives at the user's location

## 🎨 UI Screens

### Landing Page
- Hero section with emergency theme
- Features showcase
- How It Works section
- Impact statement

### Home Screen
- Map view
- Large SOS button
- Quick action buttons
- Request history access

### Tracking Screen
- Live ambulance tracking
- Driver information
- ETA display
- Call driver button

### Driver Dashboard
- Pending requests list
- Accept/Reject buttons
- Current job display
- Navigation integration

## 📝 Sample Data

The in-memory database includes sample data for testing:
- 2 users (patients)
- 3 ambulances with different statuses (available/busy)

> **Note**: For production with MySQL, use `backend/database.sql` which includes 3 users and 5 ambulances.

## 🔧 Configuration

### Google Maps API Setup

To enable full Google Maps functionality, you need to:

1. **Get a Google Maps API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable the following APIs:
     - Maps JavaScript API
     - Geocoding API
     - Distance Matrix API
   - Create credentials (API Key)

2. **Configure the API Key:**

   **For Backend (`backend/config.py`):**
   ```python
   GOOGLE_MAPS_API_KEY = 'your_actual_api_key_here'
   ```

   **For Frontend (`frontend/home.html`, `frontend/tracking.html`, `frontend/driver.html`):**
   Replace `YOUR_API_KEY_HERE` with your actual API key:
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&libraries=places"></script>
   ```

3. **Security Best Practices:**
   - Restrict your API key to specific domains in Google Cloud Console
   - Never commit API keys to version control
   - Use environment variables for production

### Environment Variables

Create a `.env` file in the backend directory:

```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=rapidaid
SECRET_KEY=your-secret-key
DEBUG=True
```

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Font Awesome for icons
- Flask documentation
- Google Maps API (optional for production)

---

<p align="center">Made with ❤️ for emergency response</p>

