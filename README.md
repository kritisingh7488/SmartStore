# SmartStore AI

SmartStore AI is a MERN admin assistant for e-commerce teams. It includes authentication, product management, AI content generation, revenue analytics, top product views, pricing suggestions, and low-stock alerts.

## Stack

- Frontend: React, Vite, Tailwind CSS, Chart.js
- Backend: Node.js, Express, MongoDB, JWT, bcrypt
- AI: Gemini API via `GEMINI_API_KEY`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment files:

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

3. Fill in the values, especially `MONGODB_URI`, `JWT_SECRET`, and `GEMINI_API_KEY`.

4. Start both apps:

```bash
npm run dev
```

Backend runs on `http://localhost:5000` and frontend on `http://localhost:5173` by default.

## Features

- Signup/Login with JWT
- Add/Edit/Delete products
- Generate AI product descriptions, SEO tags, captions, and pricing ideas
- Revenue analytics dashboard
- Top products and inventory alerts