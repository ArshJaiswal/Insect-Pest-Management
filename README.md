# Insect Pest Identification and Management System

A full-stack web application for identifying and managing insect pests in agricultural crops.

## Tech Stack

- **Frontend**: React + JavaScript
- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas

## Features

- User and Admin authentication
- Browse crops categorized by type
- View pest information for each crop
- Upload images for pest identification
- Admin panel for managing crops and pests

## Setup Instructions

### Backend Setup

1. Navigate to backend folder:
```
cd backend
```

2. Install dependencies:
```
npm install
```

3. Create `.env` file:
```
cp .env.example .env
```

4. Update `.env` with your MongoDB Atlas connection string and JWT secret

5. Create uploads folder:
```
mkdir uploads
```

6. Start the server:
```
npm run dev
```

Backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to frontend folder:
```
cd frontend
```

2. Install dependencies:
```
npm install
```

3. Start the development server:
```
npm start
```

Frontend will run on http://localhost:3000

## Default Admin Account

To create an admin account, register a user and manually update the role in MongoDB:
```
db.users.updateOne({email: "admin@example.com"}, {$set: {role: "admin"}})
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user

### Crops
- GET `/api/crops` - Get all crops
- GET `/api/crops/:id` - Get single crop
- GET `/api/crops/category/:category` - Get crops by category
- POST `/api/crops` - Create crop (Admin only)
- PUT `/api/crops/:id` - Update crop (Admin only)
- DELETE `/api/crops/:id` - Delete crop (Admin only)

### Pests
- GET `/api/pests` - Get all pests
- GET `/api/pests/:id` - Get single pest
- POST `/api/pests` - Create pest (Admin only)
- PUT `/api/pests/:id` - Update pest (Admin only)
- DELETE `/api/pests/:id` - Delete pest (Admin only)

### Upload
- POST `/api/upload/identify` - Upload image for pest identification

## Google Cloud Vision API Integration

The app now supports real AI-powered pest identification using Google Cloud Vision API!

### Setup Google Cloud Vision:

1. Follow the detailed guide in `GOOGLE_CLOUD_SETUP.md`
2. Download your service account JSON key
3. Save it as `backend/google-cloud-key.json`
4. Add to your `.env`:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=./google-cloud-key.json
   ```
5. Restart the backend server

**Cost**: First 1,000 requests/month are FREE!

### How it works:

1. User uploads an image of a pest or affected crop
2. Google Cloud Vision analyzes the image
3. System matches detected labels with pest database
4. Returns identified pest with:
   - Confidence score
   - Symptoms to look for
   - Management solutions
   - Affected crops

**Note**: If Google Cloud Vision is not configured, the system falls back to mock identification for testing.

## Future Enhancements

- Train custom ML model for better pest-specific identification
- Add more detailed pest management strategies
- Implement image gallery for pests
- Add search and filter functionality
- Mobile app version
- Multi-language support
