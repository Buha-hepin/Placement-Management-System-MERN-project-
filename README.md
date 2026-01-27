# Placement Management System

<div align="center">

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?logo=express)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)

A comprehensive web application for managing campus placements, connecting students, companies, and administrators in a seamless recruitment ecosystem.

[Features](#features) • [Tech Stack](#tech-stack) • [Installation](#installation) • [Usage](#usage) • [API Documentation](#api-documentation) • [Contributing](#contributing)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Overview

The **Placement Management System** is a modern, full-stack web application designed to streamline the campus recruitment process. Built with the MERN stack, it provides a centralized platform where:

- **Students** can browse job opportunities, apply for positions, and track their application status
- **Companies** can post job openings, review applicants, and manage their recruitment pipeline
- **Administrators** can oversee the entire placement process, manage users, and monitor company activities

This system eliminates manual processes, reduces paperwork, and creates a transparent, efficient recruitment workflow.

---

## Features

### For Students
- **User Registration & Authentication** - Secure login system with JWT authentication
- **Profile Management** - Create and update detailed student profiles with resume uploads
- **Job Listings** - Browse available job opportunities with advanced filtering
- **Application Tracking** - Apply for jobs and track application status in real-time
- **Dashboard** - Personalized dashboard showing application statistics and updates

### For Companies
- **Company Registration** - Onboard companies with complete profile information
- **Job Posting** - Create and manage job postings with detailed requirements
- **Applicant Management** - Review student applications and resumes
- **Company Dashboard** - Overview of posted jobs and applicant statistics
- **Profile Management** - Update company information and branding

### For Administrators
- **User Management** - Manage student and company accounts
- **Company Verification** - Approve or reject company registrations
- **System Overview** - Monitor placement activities and statistics
- **Data Management** - Comprehensive control over the placement ecosystem

### Technical Features
- **Responsive Design** - Mobile-first approach using TailwindCSS
- **File Upload** - Secure resume and document upload using Cloudinary
- **RESTful API** - Well-structured API endpoints for all operations
- **Error Handling** - Comprehensive error handling and validation
- **Secure Authentication** - JWT-based authentication system
- **Data Validation** - Input validation on both client and server side

---

## Tech Stack

### Frontend
- **React.js** - Modern UI library for building interactive interfaces
- **TailwindCSS** - Utility-first CSS framework for rapid styling
- **Vite** - Next-generation frontend tooling for faster development
- **Axios** - Promise-based HTTP client for API requests
- **React Router** - Client-side routing for single-page application

### Backend
- **Node.js** - JavaScript runtime for server-side development
- **Express.js** - Fast, minimalist web framework
- **MongoDB** - NoSQL database for flexible data storage
- **Mongoose** - Elegant MongoDB object modeling
- **Cloudinary** - Cloud-based image and file management
- **Multer** - Middleware for handling multipart/form-data

### Development Tools
- **ESLint** - Code linting for consistent code quality
- **Nodemon** - Auto-restart server during development
- **Git** - Version control system

---

## Project Structure

```
Placement-Management-System/
│
├── backend/                    # Backend server
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   │   ├── user.controller.js
│   │   │   ├── company.controller.js
│   │   │   └── job.controller.js
│   │   ├── models/            # Database schemas
│   │   │   ├── user.model.js
│   │   │   ├── company.model.js
│   │   │   ├── job.model.js
│   │   │   └── application.model.js
│   │   ├── routes/            # API routes
│   │   │   ├── user.routes.js
│   │   │   ├── company.routes.js
│   │   │   └── job.routes.js
│   │   ├── middlewares/       # Custom middlewares
│   │   │   └── multer.middleware.js
│   │   ├── utils/             # Utility functions
│   │   │   ├── cloudinary.js
│   │   │   ├── apierror.js
│   │   │   ├── apiResponse.js
│   │   │   └── asynchandler.js
│   │   ├── db/                # Database configuration
│   │   │   └── index.js
│   │   ├── app.js             # Express app setup
│   │   ├── index.js           # Server entry point
│   │   └── constant.js        # Constants
│   ├── public/
│   │   └── temp/              # Temporary file storage
│   └── package.json
│
└── frontend/                   # Frontend application
    ├── src/
    │   ├── pages/             # Page components
    │   │   ├── Intro.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Admin/         # Admin pages
    │   │   │   ├── AdminDashboard.jsx
    │   │   │   ├── AdminLayout.jsx
    │   │   │   ├── AllCompanies.jsx
    │   │   │   └── AllStudents.jsx
    │   │   ├── Company/       # Company pages
    │   │   │   ├── CompanyDashboard.jsx
    │   │   │   ├── CompanyProfile.jsx
    │   │   │   ├── CompanyApplicants.jsx
    │   │   │   └── PostJob.jsx
    │   │   └── Student/       # Student pages
    │   │       ├── StudentDashboard.jsx
    │   │       ├── StudentProfile.jsx
    │   │       ├── JobListings.jsx
    │   │       └── MyApplications.jsx
    │   ├── components/        # Reusable components
    │   │   └── CompanyLayout.jsx
    │   ├── services/          # API service layer
    │   │   └── api.js
    │   ├── assets/            # Static assets
    │   ├── app.js             # Main App component
    │   ├── main.jsx           # Application entry point
    │   ├── App.css            # Global styles
    │   └── index.css          # Tailwind imports
    ├── public/                # Public static files
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.cjs
    └── eslint.config.js
```

---

## Installation

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14.0.0 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git**

### Clone Repository

```bash
git clone https://github.com/yourusername/placement-management-system.git
cd placement-management-system
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```bash
touch .env
```

4. Configure environment variables (see [Environment Variables](#environment-variables))

5. Start the backend server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The backend server will start on `http://localhost:8000` (or your configured port)

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```bash
touch .env
```

4. Add the backend API URL:
```env
VITE_API_URL=http://localhost:8000/api
```

5. Start the development server:
```bash
npm run dev
```

The frontend application will start on `http://localhost:5173`

---

## Environment Variables

### Backend (.env)

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/placement_management
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/placement_management

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:8000/api
```

---

## Usage

### Admin Access

1. Navigate to `http://localhost:5173`
2. Click on **Admin Login**
3. Use admin credentials (created during initial setup)
4. Access the admin dashboard to:
   - View all registered students
   - Manage company registrations
   - Monitor placement statistics
   - Oversee the entire placement process

### Company Access

1. Navigate to `http://localhost:5173`
2. Click on **Company Registration** to create a new account
3. Wait for admin approval
4. After approval, login and:
   - Complete your company profile
   - Post job opportunities
   - Review student applications
   - Manage your recruitment pipeline

### Student Access

1. Navigate to `http://localhost:5173`
2. Click on **Student Registration**
3. Complete your profile with academic details
4. Upload your resume
5. Browse and apply for jobs
6. Track your application status

---

## API Documentation

### Base URL
```
http://localhost:8000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/users/register` | Register new student | No |
| POST | `/users/login` | User login | No |
| POST | `/users/logout` | User logout | Yes |
| GET | `/users/profile` | Get user profile | Yes |
| PUT | `/users/profile` | Update user profile | Yes |

### Company Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/companies/register` | Register company | No |
| GET | `/companies` | Get all companies | Yes (Admin) |
| GET | `/companies/:id` | Get company details | Yes |
| PUT | `/companies/:id` | Update company | Yes (Company) |
| DELETE | `/companies/:id` | Delete company | Yes (Admin) |

### Job Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/jobs` | Create job posting | Yes (Company) |
| GET | `/jobs` | Get all jobs | Yes |
| GET | `/jobs/:id` | Get job details | Yes |
| PUT | `/jobs/:id` | Update job | Yes (Company) |
| DELETE | `/jobs/:id` | Delete job | Yes (Company) |
| POST | `/jobs/:id/apply` | Apply for job | Yes (Student) |

### Response Format

#### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

---

## Screenshots

<!-- Add screenshots of your application here -->

### Landing Page
*Coming soon...*

### Student Dashboard
*Coming soon...*

### Company Dashboard
*Coming soon...*

### Admin Panel
*Coming soon...*

---

## Contributing

We welcome contributions to improve the Placement Management System! Here's how you can help:

### How to Contribute

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/placement-management-system.git
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Make Your Changes**
   - Write clean, maintainable code
   - Follow the existing code style
   - Add comments where necessary
   - Update documentation as needed

4. **Commit Your Changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

5. **Push to the Branch**
   ```bash
   git push origin feature/AmazingFeature
   ```

6. **Open a Pull Request**
   - Provide a clear description of the changes
   - Reference any related issues
   - Wait for review and feedback

### Code of Conduct

- Be respectful and inclusive
- Write clear commit messages
- Test your changes thoroughly
- Update documentation when needed
- Follow the project's coding standards

### Reporting Issues

If you find a bug or have a suggestion:
1. Check if the issue already exists
2. Create a detailed issue report
3. Include steps to reproduce (for bugs)
4. Add screenshots if applicable

---

## Future Enhancements

- [ ] Email notifications for application updates
- [ ] Advanced search and filtering options
- [ ] Interview scheduling system
- [ ] Analytics dashboard with charts
- [ ] Export reports to PDF/Excel
- [ ] Multi-language support
- [ ] Mobile application
- [ ] Integration with LinkedIn
- [ ] Video interview integration
- [ ] Automated resume parsing

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 Placement Management System

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Contact

**Project Maintainer:** Your Name

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)

**Project Link:** [https://github.com/yourusername/placement-management-system](https://github.com/yourusername/placement-management-system)

---

## Acknowledgments

- Thanks to all contributors who have helped improve this project
- Icons and images from [source]
- Inspiration from existing placement management systems
- Built with love using the MERN stack

---

<div align="center">

**If you find this project useful, please consider giving it a ⭐️!**

Made with ❤️ by the Placement Management System Team

</div>
