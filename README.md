# SpendLens 

A full-stack personal finance tracker built with the MERN stack, featuring intelligent anomaly detection to flag unusual spending patterns.

## Features
- JWT authentication (register/login)
- Add, delete, and import transactions via CSV
- Auto-categorization of expenses by keyword matching
- Monthly budget goals with progress tracking
- Spending breakdown with pie and bar charts
- 6-month spending trend line chart
- Z-score based anomaly detection with real-time alerts
- Export transactions to CSV
- Dark/Light mode toggle

## Tech Stack
Frontend:React, Vite, Recharts, React Router, React Hot Toast

Backend:Node.js, Express.js, MongoDB, Mongoose, JWT, Bcrypt

ML Logic:Z-score statistical anomaly detection (no external ML library)

## Setup

### Backend
```bash
cd backend
npm install
```
Connect to MongoDB Compass
Create a `.env` file in the backend folder:


### Frontend
```bash
cd frontend
npm install
npm run dev
```

## How Anomaly Detection Works
For each spending category, the system calculates the mean and standard deviation across the past 6 months. If the current month's spending has a Z-score above 1.5, it triggers an alert — flagging it as statistically abnormal compared to historical patterns.


## Author
Vismaya S Dinesh — [GitHub](https://github.com/vismaya-10) | [LinkedIn](https://linkedin.com/in/vismaya-s-dinesh)