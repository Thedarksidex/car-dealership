# Maruti Suzuki Dealership — Comprehensive Documentation

A full-stack dealership management web application built with HTML/CSS/JS (frontend), Node.js/Express (backend), and PostgreSQL (database).

---

## Features

**Customer Features**
- Browse all Maruti Suzuki car models with filters (fuel, transmission, price range)
- View detailed car page with specs, features, colors & FAQs
- Book test drives with date/time slots
- Submit enquiries (purchase, finance, service, general)
- Manage wishlist
- User registration & login with JWT authentication
- View and manage own bookings & enquiries

**Admin Features**
- Dashboard with live stats (users, cars, pending test drives & enquiries)
- Full CRUD for Cars, Offers, FAQs
- Manage test drive statuses (confirm, complete, cancel)
- Manage enquiry statuses
- View all registered users

---

## Project Structure

```
dealership/
├── backend/
│   ├── config/
│   │   └── db.js               # PostgreSQL connection pool
│   ├── middleware/
│   │   └── auth.js             # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js             # Register, Login, Profile
│   │   ├── cars.js             # Car CRUD
│   │   ├── testDrives.js       # Test drive booking
│   │   ├── enquiries.js        # Customer enquiries
│   │   ├── offers.js           # Offer management
│   │   ├── wishlist.js         # User wishlist
│   │   ├── faqs.js             # FAQ management
│   │   └── admin.js            # Admin dashboard & user management
│   ├── server.js               # Express app entry point
│   ├── package.json
│   └── .env.example            # Environment variable template
├── frontend/
│   ├── css/
│   │   ├── style.css           # Main stylesheet
│   │   └── admin.css           # Admin panel styles
│   ├── js/
│   │   ├── api.js              # Centralised API helper
│   │   ├── auth.js             # Auth state + navbar
│   │   ├── auth-pages.js       # Login/register logic
│   │   ├── main.js             # Home page
│   │   ├── cars.js             # Cars listing page
│   │   ├── car-detail.js       # Car detail page
│   │   ├── test-drive.js       # Test drive booking
│   │   ├── offers.js           # Offers page
│   │   ├── contact.js          # Contact/enquiry page
│   │   ├── wishlist-page.js    # Wishlist page
│   │   ├── my-bookings.js      # User's bookings
│   │   ├── my-enquiries.js     # User's enquiries
│   │   ├── profile.js          # User profile
│   │   └── admin.js            # Admin panel
│   ├── pages/
│   │   ├── cars.html
│   │   ├── car-detail.html
│   │   ├── test-drive.html
│   │   ├── offers.html
│   │   ├── contact.html
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── my-bookings.html
│   │   ├── my-enquiries.html
│   │   ├── wishlist.html
│   │   ├── profile.html
│   │   └── admin.html
│   ├── images/             # Car images go here
│   └── index.html          # Home page
└── database/
    └── schema.sql          # Full DB schema + seed data
```

---

## Setup Instructions

### Prerequisites
- Node.js v18+
- PostgreSQL 14+
- npm

### 1. Set up the Database

```bash
# Create the database in psql
psql -U postgres
CREATE DATABASE maruti_dealership;
\q

# Run the schema file
psql -U postgres -d maruti_dealership -f database/schema.sql
```

### 2. Configure the Backend

```bash
cd backend

# Copy environment file
copy .env.example .env
```

Edit `.env` and set your PostgreSQL credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=maruti_dealership
DB_USER=postgres
DB_PASSWORD=your_actual_password

JWT_SECRET=your_strong_secret_key
JWT_EXPIRES_IN=7d

PORT=5000
```

### 3. Install Dependencies & Start Server

```bash
cd backend
npm install
npm run dev    # for development with auto-reload
# or
npm start      # for production
```

The API will run on **http://localhost:5000**

### 4. Access the Frontend

Open `frontend/index.html` in a browser.  
If using VS Code, use the **Live Server** extension (right-click → `Open with Live Server`).

> The API origin `http://localhost:5000` is already whitelisted in CORS for Live Server's default port `5500`.

---

## Demo Credentials

| Role  | Email                          | Password   |
|-------|--------------------------------|------------|
| Admin | admin@marutishowroom.com       | Admin@123  |

**Note:** You can register regular user accounts via the Register page.

---

## API Endpoints

| Method | Endpoint                        | Auth     | Description              |
|--------|---------------------------------|----------|--------------------------|
| POST   | /api/auth/register              | Public   | User registration        |
| POST   | /api/auth/login                 | Public   | User login               |
| GET    | /api/auth/me                    | User     | Get profile              |
| PUT    | /api/auth/profile               | User     | Update profile           |
| GET    | /api/cars                       | Public   | List all cars (+ filters)|
| GET    | /api/cars/:id                   | Public   | Car detail + FAQs        |
| POST   | /api/cars                       | Admin    | Add car                  |
| PUT    | /api/cars/:id                   | Admin    | Update car               |
| DELETE | /api/cars/:id                   | Admin    | Delete car               |
| POST   | /api/test-drives                | User     | Book test drive          |
| GET    | /api/test-drives/my             | User     | My bookings              |
| GET    | /api/test-drives                | Admin    | All bookings             |
| PUT    | /api/test-drives/:id/status     | Admin    | Update status            |
| DELETE | /api/test-drives/:id            | User     | Cancel booking           |
| POST   | /api/enquiries                  | Public   | Submit enquiry           |
| GET    | /api/enquiries                  | Admin    | All enquiries            |
| GET    | /api/enquiries/my               | User     | My enquiries             |
| PUT    | /api/enquiries/:id/status       | Admin    | Update status            |
| GET    | /api/offers                     | Public   | Active offers            |
| GET    | /api/offers/all                 | Admin    | All offers               |
| POST   | /api/offers                     | Admin    | Add offer                |
| PUT    | /api/offers/:id                 | Admin    | Update offer             |
| DELETE | /api/offers/:id                 | Admin    | Delete offer             |
| GET    | /api/wishlist                   | User     | Get wishlist             |
| POST   | /api/wishlist                   | User     | Add to wishlist          |
| DELETE | /api/wishlist/:car_id           | User     | Remove from wishlist     |
| GET    | /api/faqs                       | Public   | Get FAQs (+ filter)      |
| POST   | /api/faqs                       | Admin    | Add FAQ                  |
| DELETE | /api/faqs/:id                   | Admin    | Delete FAQ               |
| GET    | /api/admin/dashboard            | Admin    | Dashboard stats          |
| GET    | /api/admin/users                | Admin    | All users                |
| DELETE | /api/admin/users/:id            | Admin    | Delete user              |

---

## Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Frontend | HTML5, CSS3, Vanilla JS |
| Backend  | Node.js, Express.js     |
| Database | PostgreSQL              |
| Auth     | JWT (jsonwebtoken)      |
| Password | bcryptjs                |
| Icons    | Font Awesome 6          |
