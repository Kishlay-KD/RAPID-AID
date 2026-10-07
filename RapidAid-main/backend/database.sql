-- RapidAid Database Schema
-- MySQL

-- Create database
CREATE DATABASE IF NOT EXISTS rapidaid;
USE rapidaid;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    emergency_contact VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ambulances Table
CREATE TABLE IF NOT EXISTS ambulances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    driver_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    status ENUM('available', 'busy', 'offline') DEFAULT 'available',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    vehicle_number VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Requests Table
CREATE TABLE IF NOT EXISTS requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    ambulance_id INT,
    status ENUM('pending', 'accepted', 'completed', 'cancelled') DEFAULT 'pending',
    request_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_lat DECIMAL(10, 8),
    user_lng DECIMAL(11, 8),
    driver_lat DECIMAL(10, 8),
    driver_lng DECIMAL(11, 8),
    eta_minutes INT,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (ambulance_id) REFERENCES ambulances(id)
);

-- Insert sample users (Near User's Location: 30.6807, 76.6052)
INSERT INTO users (name, phone, email, password, latitude, longitude, emergency_contact) VALUES
('John Doe', '9876543210', 'john@example.com', 'password123', 30.6800, 76.6050, '9876543211'),
('Jane Smith', '9876543212', 'jane@example.com', 'password123', 30.6820, 76.6080, '9876543213'),
('Rahul Kumar', '9876543214', 'rahul@example.com', 'password123', 30.6780, 76.6020, '9876543215'),
('Amit Patel', '9876543216', 'amit@example.com', 'password123', 30.6850, 76.6100, '9876543217'),
('Priya Sharma', '9876543218', 'priya@example.com', 'password123', 30.6750, 76.6000, '9876543219');

-- Insert sample ambulances (Near User's Location: 30.6807, 76.6052)
INSERT INTO ambulances (driver_name, phone, status, latitude, longitude, vehicle_number) VALUES
('Amit Singh', '9876543221', 'available', 30.6790, 76.6040, 'PB-01-CD-5678'),
('Suresh Yadav', '9876543222', 'busy', 30.6830, 76.6070, 'PB-01-EF-9012'),
('Vikram Patel', '9876543223', 'available', 30.6780, 76.6030, 'PB-01-GH-3456'),
('Mohammad Khan', '9876543224', 'available', 30.6850, 76.6090, 'PB-01-IJ-7890'),
('Harpreet Singh', '9876543225', 'available', 30.6760, 76.6010, 'PB-01-KL-2468'),
('Gurpreet Singh', '9876543226', 'busy', 30.6880, 76.6120, 'PB-01-MN-1357'),
('Davinder Kumar', '9876543227', 'offline', 30.6740, 76.5990, 'PB-01-OP-9753');

-- Insert sample requests
INSERT INTO requests (user_id, ambulance_id, status, user_lat, user_lng, eta_minutes) VALUES
(1, 2, 'accepted', 30.6800, 76.6050, 5),
(2, NULL, 'pending', 30.6820, 76.6080, NULL);

