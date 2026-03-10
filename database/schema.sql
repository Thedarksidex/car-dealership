-- ============================================
-- Maruti Suzuki Dealership Database Schema
-- ============================================

-- Create Database (run separately if needed)
-- CREATE DATABASE maruti_dealership;

-- Create Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Cars Table
CREATE TABLE cars (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    mileage VARCHAR(50) NOT NULL,
    fuel_type VARCHAR(50) NOT NULL,
    transmission VARCHAR(50) NOT NULL,
    engine_cc VARCHAR(50),
    seating_capacity INT,
    description TEXT,
    image_url VARCHAR(255),
    color_images JSONB,
    features TEXT,
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Test Drive Bookings Table
CREATE TABLE test_drives (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    car_id INT NOT NULL REFERENCES cars(id),
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    preferred_location VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Enquiries Table
CREATE TABLE enquiries (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    car_id INT NOT NULL REFERENCES cars(id),
    message TEXT,
    type VARCHAR(50) DEFAULT 'purchase',
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Offers Table
CREATE TABLE offers (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    discount_percent DECIMAL(5, 2),
    valid_from DATE,
    valid_till DATE,
    applicable_cars VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Wishlist Table
CREATE TABLE wishlist (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    car_id INT NOT NULL REFERENCES cars(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, car_id)
);

-- ============================================
-- Migration: If the table already exists, run:
--   ALTER TABLE cars DROP COLUMN IF EXISTS color_options;
--   ALTER TABLE cars ADD COLUMN IF NOT EXISTS color_images JSONB;
-- ============================================

-- Create FAQs Table
CREATE TABLE faqs (
    id SERIAL PRIMARY KEY,
    car_id INT REFERENCES cars(id),
    question VARCHAR(255) NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SEED DATA
-- ============================================

-- Insert Demo Admin User (password: Admin@123)
INSERT INTO users (name, email, phone, password, role) VALUES
('Admin User', 'admin@marutishowroom.com', '9876543210', '$2a$10$rrdqMzp7t76O8WuV8fgqTO4yyQBGmVhfrDGcn4E1R1F1UNXYYKewm', 'admin');

-- Insert Demo Cars
INSERT INTO cars (name, model, price, mileage, fuel_type, transmission, engine_cc, seating_capacity, description, image_url, color_options, features, stock) VALUES
('Swift', 'DZire', 600000, '22 km/l', 'Petrol', 'Manual', '1200cc', 5, 'Reliable sedan for daily commute', '/images/swift.jpg', 'Silver, Black, White, Red', 'Power Steering, ABS, Airbags, Touchscreen', 5),
('Baleno', 'Baleno', 800000, '23 km/l', 'Petrol', 'Automatic', '1200cc', 5, 'Premium hatchback with modern features', '/images/baleno.jpg', 'Silver, Blue, White, Grey', 'Climate Control, Cruise Control, Parking Sensors', 8),
('Brezza', 'Brezza', 1200000, '20 km/l', 'Petrol', 'Manual', '1500cc', 5, 'Compact SUV for adventurers', '/images/brezza.jpg', 'Silver, Black, Red, Pearl', 'Roof Rails, Alloy Wheels, Touchscreen', 3),
('Fronx', 'Fronx', 950000, '19 km/l', 'Petrol', 'Manual', '1200cc', 5, 'Stylish compact SUV', '/images/fronx.jpg', 'Black, Silver, White, Red', 'LED DRLs, Alloy Wheels, Fog Lights', 6),
('Ertiga', 'Ertiga', 1100000, '18 km/l', 'Petrol', 'Manual', '1500cc', 7, 'Family MPV with spacious interiors', '/images/ertiga.jpg', 'Silver, Black, White', 'Power Windows, Power Steering, ABS', 4),
('Grand Vitara', 'Grand Vitara', 1600000, '17 km/l', 'Hybrid', 'Automatic', '1800cc', 5, 'Premium hybrid SUV', '/images/grand-vitara.jpg', 'Pearl, Black, Silver', 'All-Wheel Drive, Sunroof, Leather Seats, Panoramic Display', 2);

-- Insert Demo Offers
INSERT INTO offers (title, description, discount_percent, valid_from, valid_till, applicable_cars) VALUES
('Festival Offer', 'Upto 5% discount on all cars', 5.00, '2026-03-01', '2026-03-31', 'All'),
('Student Discount', 'Special 3% discount for students', 3.00, '2026-03-01', '2026-12-31', 'Swift, Baleno'),
('Exchange Bonus', 'Get upto 10% bonus on old car exchange', 10.00, '2026-01-01', '2026-12-31', 'All');

-- Insert Demo FAQs
INSERT INTO faqs (car_id, question, answer) VALUES
(1, 'What is the mileage of Swift DZire?', 'The Swift DZire delivers approximately 22 km/l under standard driving conditions.'),
(2, 'Does Baleno have automatic transmission?', 'Yes, the Baleno is available with an automatic transmission option.'),
(3, 'Is Brezza good for off-road driving?', 'The Brezza is a compact SUV suitable for mild off-road terrains and city driving.'),
(6, 'What makes Grand Vitara a hybrid?', 'The Grand Vitara uses a mild hybrid system that combines a petrol engine with an electric motor for better fuel efficiency.');
