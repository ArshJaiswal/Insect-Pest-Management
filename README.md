# AgroGuard — Insect Pest Identification & Crop Management System

A full-stack, AI-powered agricultural web application designed to help farmers, agronomists, and growers identify insect pests, diagnose crop damage, and access integrated pest management (IPM) advisories in real time.

---

## 🌟 Key Features

- **Multimodal AI Pest Identification**:
  - Upload or drag-and-drop photos of insects, pests, or affected plant leaves/stems.
  - Powered by **Google Gemini Vision API** with multi-model automatic failover (`gemini-3.1-flash-lite`, `gemini-3.5-flash`, `gemini-flash-latest`, `gemini-3.6-flash`).
  - **Dynamic Database Matching**: Automatically matches recognized pests with MongoDB records, displaying your stored high-resolution photos, symptoms, and crop linkages.
  - **Input Validation & Non-Pest Warnings**: Detects non-agricultural images (such as desktop screenshots, documents, and random objects) and provides an informative warning rather than making false diagnoses.
  - **Household & Storage Pest Classification**: Accurately identifies household/structural pests (e.g., Cockroaches) and displays specialized domestic sanitation and baiting guidelines.
  - **Beneficial Insect Alerts**: Identifies beneficial predators (e.g., Ladybirds / Ladybugs) and advises against chemical pesticide spraying.
- **Multilingual AI Crop Doctor Chatbot**:
  - Interactive agricultural assistant supporting English, Hindi, and regional languages.
  - Text and image-based queries for soil health, fertilizers, crop rotation, and symptoms.
- **Crop & Pest Catalog**:
  - Browse crops categorized by type (Cereals, Vegetables, Fiber, Legumes, Cash Crops).
  - Detailed profiles with biological cycles, damage symptoms, cultural/mechanical controls, and chemical thresholds.
- **Role-Based Authentication & Admin Panel**:
  - JWT-based authentication for Users and Administrators.
  - Admin management for creating, updating, and deleting crops and pest records.
- **Farmer Feedback System**:
  - Submit suggestions, pest reports, and platform feedback directly to the administration dashboard.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router v6, Tailwind CSS, Lucide Icons, Axios
- **Backend**: Node.js, Express.js, Multer, Sharp
- **Database**: MongoDB (Mongoose ODM)
- **AI / Computer Vision**: Google Gemini 2.5 / 3.x Multimodal Vision API

---

## 🚀 Quick Start Guide

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally on port 27017 (or MongoDB Atlas connection string)
- [Google Gemini API Key](https://aistudio.google.com/app/apikey)

---

### 1. Database Setup & Seeding

Ensure MongoDB service is running, then seed the initial crops and pests dataset:

```bash
cd backend
node seedData.js
```

*(This seeds 10 major crops and 12 common agricultural pests with cross-referenced relationships).*

---

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your environment variables in `backend/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/pest_management
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-3.1-flash-lite
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will be running on `http://localhost:5000`.*

---

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Ensure `frontend/.env` is configured:
   ```env
   BROWSER=none
   PORT=3000
   ```

4. Start the frontend development server:
   ```bash
   npm start
   ```
   *The frontend will launch at `http://localhost:3000`.*

---

## 🔑 Default Admin Account

To grant admin privileges to an account:
1. Register a user through the UI at `http://localhost:3000/register`.
2. In your MongoDB database, set the user's role to `admin`:
   ```javascript
   db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } });
   ```

---

## 📡 API Endpoints

### 🔐 Authentication
- `POST /api/auth/register` — Register a new account
- `POST /api/auth/login` — Log in and receive JWT token

### 🌾 Crops
- `GET /api/crops` — Fetch all crops
- `GET /api/crops/:id` — Fetch single crop by ID
- `GET /api/crops/category/:category` — Filter crops by category
- `POST /api/crops` — Add new crop (*Admin only*)
- `PUT /api/crops/:id` — Update crop (*Admin only*)
- `DELETE /api/crops/:id` — Remove crop (*Admin only*)

### 🐛 Pests
- `GET /api/pests` — Fetch all pests
- `GET /api/pests/:id` — Fetch single pest by ID
- `POST /api/pests` — Add new pest (*Admin only*)
- `PUT /api/pests/:id` — Update pest (*Admin only*)
- `DELETE /api/pests/:id` — Remove pest (*Admin only*)

### 🔍 Vision Identification
- `POST /api/upload/identify` — Upload image (`multipart/form-data`) for AI pest & disease identification
- `POST /api/upload` — General image upload for admin catalog management

### 🤖 Chatbot & Advisory
- `POST /api/chatbot/message` — Send text message to AgroGuard AI Crop Advisory
- `POST /api/chatbot/analyze-image` — Multimodal image inquiry via chatbot
- `GET /api/chatbot/health` — Check chatbot AI engine status

### 💬 Feedback
- `POST /api/feedback` — Submit user feedback
- `GET /api/feedback` — Fetch all feedback submissions (*Admin only*)

---

## 🧠 How the AI Identification Engine Works

1. **Image Upload & Preprocessing**: The uploaded image is received and inspected for validity and size constraints.
2. **Gemini Multimodal Vision Analysis**: The image is analyzed using Google's vision models (`gemini-3.1-flash-lite`, `gemini-3.5-flash`, etc.) with structured JSON schema output.
3. **Classification & Validation**:
   - **Non-Agricultural / Digital Screens**: If a computer screenshot, text document, or non-pest photo is detected, the system generates a clear warning and prompts for an authentic pest or plant photo.
   - **Database Matching**: If the identified insect or disease matches an entry in your MongoDB database, the full stored record (curated images, symptoms, affected crops) is returned.
   - **Household / Storage Pests**: When a domestic pest (such as an American Cockroach) is identified, it provides domestic IPM guidelines and a non-crop warning.
   - **Beneficial Insects**: If predatory species (e.g., Ladybirds) are identified, the system alerts the user to preserve them rather than applying chemical controls.
4. **Integrated Pest Management Advisory**: Delivers life-cycle information, damage symptoms, cultural controls, biological solutions, and targeted chemical treatments.

---

## 📄 License

This project is licensed under the MIT License.
