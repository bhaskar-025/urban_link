Team Name - SDLC

Team Members-
1) Shresth Singh
2) Bhaskar Kumar 
3) Dhruv Dhull
4) Aryan Patil
5) Arihant kurlikar


# CitySync: Intelligent Urban Protocol & Community Grid

CitySync is an advanced, AI-driven urban management platform designed to streamline civic reporting, automate administrative routing, and empower community-led prioritization of city issues.

## Key Features

### Smart Administrative Routing
- **AI Classification**: Complaints are automatically categorized by department and priority using LLMs.
- **Geospatial Mapping**: Real-time visualization of urban anomalies using interactive maps.
- **Workflow Automation**: Automated status updates from "Pending" to "Resolved" with permanent history logging.

### Community Grid & Engagement
- **Live Transmission**: Real-time city-specific chat grids powered by Socket.io.
- **AI Intelligence Reports**: Automated synthesis of community discussions to identify emerging urban trends.
- **Issues & Voting**: A community-driven ranking system where citizens upvote critical issues, directly influencing the administrative priority queue.

### Multi-Channel Notifications
- **Vonage SMS Integration**: Automated text alerts for complaint registration and status changes.
- **EmailJS Integration**: Real-time email notifications mirrored with SMS updates for guaranteed delivery.

### Premium Design System
- **Brutalist Aesthetics**: A high-impact, high-contrast monochrome UI designed for clarity and urban utility.
- **Multi-Language Support**: Full localization support (i18next) for diverse urban populations.

## Technology Stack

### Frontend & Admin
- **Framework**: React 18 with Vite
- **Styling**: Vanilla CSS (Custom Design Tokens)
- **Mapping**: Leaflet & OpenStreetMap
- **State Management**: Zustand
- **Real-time**: Socket.io-client
- **Analytics**: Recharts

### Backend
- **Runtime**: Node.js & TypeScript
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Communication**: Socket.io
- **APIs**: Vonage Messages API, EmailJS REST API, Groq SDK

### AI Service
- **Environment**: Python 3.11+
- **Framework**: FastAPI
- **Orchestration**: LangGraph & LangChain
- **Vector DB**: Pinecone
- **Models**: Groq-powered LLMs for classification and sentiment analysis

## Project Structure

```text
CitySync/
├── AIService/     # Python AI logic (LangGraph, Vector DB)
├── admin/         # Administrative dashboard (React)
├── backend/       # Core API & Socket.io server (Node.js)
└── frontend/      # Citizen portal & Community Grid (React)
```

## Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/bhaskar-025/urban_link.git
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Configure .env with MONGO_URI, JWT_SECRET, VONAGE_KEYS, etc.
   npm run dev
   ```

3. **Frontend & Admin Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **AI Service Setup**:
   ```bash
   cd AIService
   pip install -r requirements.txt
   # Configure .env with PINECONE_API_KEY, GROQ_API_KEY
   uvicorn app.main:app --reload
   ```

---

*CitySync — Engineering more resilient urban futures.*
