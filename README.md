# CurriculumCrafter

A web application for managing academic plans with course requirements, prerequisites, and graduation tracking.

## Project Structure

- `react-flask/client-side/` - React frontend application
- `react-flask/flask-server/` - Flask backend API with MySQL database
- `doc/` - Project documentation and design documents

## Technology Stack

**Frontend:**
- React 18 with React Router
- JWT authentication
- Responsive UI with glassmorphic design

**Backend:**
- Flask with Flask-JWT-Extended
- MySQL database (Aiven cloud-hosted)
- SQLAlchemy ORM
- bcrypt password hashing

## Setup Instructions

### Prerequisites

- Node.js and npm
- Python 3.8+
- MySQL database (local or cloud)

### Backend Setup

1. Navigate to the Flask server directory:
```bash
cd react-flask/flask-server
```

2. Create and activate a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file with your database credentials:
```
MYSQL_HOST=your-host
MYSQL_PORT=your-port
MYSQL_DATABASE=your-database
MYSQL_USER=your-user
MYSQL_PASSWORD=your-password
JWT_SECRET_KEY=your-secret-key
JWT_ACCESS_TOKEN_EXPIRES=3600
FLASK_ENV=development
FLASK_DEBUG=True
```

5. Initialize the database (first time only):
```bash
python init_mysql_db.py
```

6. Run the Flask server:
```bash
PORT=5001 python server_mysql.py
```

The backend will be available at `http://localhost:5001`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd react-flask/client-side
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```
REACT_APP_API_URL=http://localhost:5001
```

4. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## Features

- User authentication with JWT tokens
- Academic plan creation and management
- Course prerequisite tracking
- Graduation requirement verification
- Major and program support
- Secure password storage with bcrypt

## Database Schema

The application uses 8 main tables:
- `User` - Authentication credentials
- `Student` - Student information
- `Academic_Plan` - Student academic plans
- `Course_Catalog` - Available courses
- `Planned_Course` - Courses in student plans
- `Prerequisite` - Course prerequisites
- `Requirement` - Graduation requirements
- `AP_Credit` - AP/transfer credits


## License

This project was developed as part of CS411 coursework. Additional Contributions made by **Karthik Bagavathy** out of pure interest.
