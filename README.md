
## Getting started

> **Prerequisites:**
> - [NodeJS](https://nodejs.org/en/) installed on your system
> - [MongoDB](https://www.mongodb.com/) installed and running locally, or use MongoDB Atlas

### Installation

1. Install the dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

3. Update the `.env` file with your MongoDB connection string, JWT secret, and SMTP email settings.

### Running the Application

**Option 1: Run frontend and backend separately**

Terminal 1 - Frontend:
```bash
npm run dev
```

Terminal 2 - Backend:
```bash
npm run server
```

**Option 2: Run both together**
```bash
npm run dev:all
```

### Access the Application

- **Frontend**: [http://localhost:5173/](http://localhost:5173/)
- **Backend API**: [http://localhost:5000/](http://localhost:5000/)

### API Endpoints

**Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Send password reset email
- `POST /api/auth/reset-password` - Reset password from email link
- `GET /api/auth/verify` - Verify JWT token

### Password Reset Email

The forgot password flow sends email from the backend with SMTP settings from `.env`.
For Gmail, create an App Password and use it as `SMTP_PASS`.

```bash
CLIENT_URL=http://127.0.0.1:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="MyChart Portal <your-email@gmail.com>"
```

### Build for Production

```bash
npm run build
```

### Test

```bash
npm test
```

### Features

✅ User Registration with validation
✅ User Login with JWT authentication
✅ Password hashing with bcrypt
✅ Protected routes
✅ Token-based authentication
✅ MongoDB database integration
