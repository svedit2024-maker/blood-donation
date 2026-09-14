# 🩸 Blood Donor Finder

A full-stack web application that helps users find available blood donors based on their blood group and location.

The application provides user authentication, donor registration, donor search, donor availability, consent-based listing, and personal donor profile management.

---

## 📌 Project Overview

Finding a suitable blood donor during an emergency can be difficult when there is no simple way to search for available donors nearby.

**Blood Donor Finder** aims to provide a simple platform where users can:

- Create an account
- Login securely
- Register themselves as blood donors
- Select their blood group
- Provide their location
- Search for available blood donors
- View matching donor information
- Manage their donor profile

The project is built using a traditional client-server architecture with a vanilla JavaScript frontend, Node.js/Express backend, and MongoDB database.

---

## ✨ Features

### 👤 User Authentication

- User registration with name, email, and password
- User login using email and password
- Google authentication
- Session-based authentication
- Secure logout
- Password hashing using bcrypt

### 🩸 Donor Registration

Registered users can become donors by providing:

- Name
- Blood group
- Date of birth
- Gender
- Phone number
- State
- City
- Area
- Donor consent

Each user can have only one donor profile.

### 🔎 Donor Search

Users can search for donors using:

- Blood group
- Location

Location search supports:

- State
- City
- Area

Only donors who are:

- Available
- Have given consent

are displayed in the search results.

### 📊 Dashboard

The dashboard provides:

- Registered donor count
- Blood donor search
- Become a donor option
- Recent donor activity
- My Profile
- Logout

### 👤 My Donor Profile

A registered donor can view their donor information through their personal profile.

### 🕒 Recent Activity

The dashboard displays the latest donor registrations.

The most recently registered donors appear first.

### 🔐 Validation & Security

The backend includes:

- Authentication checks
- Password hashing
- Session protection
- HTTP-only cookies
- SameSite cookie protection
- Phone number validation
- Blood group validation
- Location search input escaping
- Donor consent validation
- Protection against duplicate donor registration

---

# 🛠️ Tech Stack

## Frontend

- HTML5
- CSS3
- JavaScript
- Fetch API

No React or frontend framework is used.

## Backend

- Node.js
- Express.js
- Passport.js
- Passport Local Strategy
- Passport Google OAuth 2.0
- Express Session
- bcrypt
- dotenv

## Database

- MongoDB
- Mongoose

---

# 🏗️ Application Architecture

The application follows a basic client-server architecture:

```text
                ┌─────────────────────┐
                │       Browser       │
                │                     │
                │ HTML / CSS / JS     │
                └──────────┬──────────┘
                           │
                           │ HTTP Requests
                           │ Fetch API
                           ▼
                ┌─────────────────────┐
                │     Node.js         │
                │     Express.js      │
                │                     │
                │ Authentication      │
                │ API Routes          │
                │ Validation          │
                │ Session Management  │
                └──────────┬──────────┘
                           │
                           │ Mongoose
                           ▼
                ┌─────────────────────┐
                │      MongoDB        │
                │                     │
                │ Users Collection    │
                │ Donors Collection   │
                └─────────────────────┘