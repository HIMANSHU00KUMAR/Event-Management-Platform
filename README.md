
https://github.com/user-attachments/assets/a7246bb9-b94e-4064-95b7-8ad3f7bdf5ba

A full-stack application for creating and managing events with real-time updates and user authentication.

## 🚀 Features

- **User Authentication**
  - Register/Login functionality
  - Guest access
  - Protected routes
  - JWT-based authentication

- **Event Management**
  - Create, read, update, and delete events
  - Join/leave events
  - Real-time attendee updates
  - Event categories and filtering
  - Capacity management

- **Real-time Updates**
  - Live attendee count
  - Instant notifications
  - Socket.IO integration

- **Responsive Design**
  - Mobile-first approach
  - Material-UI components
  - Cross-browser compatibility

## 🛠️ Tech Stack

### Frontend
- React
- TypeScript
- Material-UI
- Socket.IO Client
- React Router
- Axios

### Backend
- Node.js
- Express
- MongoDB
- Socket.IO
- JWT Authentication
  
## 📦 Installation

1. Clone the repository:
git clone (https://github.com/HIMANSHU00KUMAR/Event-Management-Platform.git)
cd event-management
2. Install dependencies for both frontend and backend:
cd frontend
npm install
cd ../backend
npm install
3. Create `.env` files:

Frontend (.env):REACT_APP_API_URL=http://localhost:5000/api
plaintext
PORT=5000
MONGODB_URI=mongodb://localhost:27017/event-management
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
4. Start the development servers:
Start backend server
cd backend
npm run dev
Start frontend server (in a new terminal)
cd frontend
npm start



