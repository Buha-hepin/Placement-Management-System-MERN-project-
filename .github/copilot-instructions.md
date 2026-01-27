# Placement Management System - AI Coding Agent Instructions

## Project Overview
A MERN stack placement/recruitment management system with three distinct user roles: **Students**, **Companies**, and **Admins**. Backend uses Express + MongoDB; frontend uses React + Vite + Tailwind CSS.

## Architecture & Data Flow

### Three-Role System
- **Students (User model)**: Browse jobs, apply, manage profile/resume, track placement status
- **Companies (Company model)**: Post jobs, review applicants, manage company profile  
- **Admins**: Moderate job postings (approve/reject), view all companies/students

### Dual Model Authentication
Registration/login uses `role` field to route between models:
- `role: "student"` → User model ([user.model.js](../backend/src/models/user.model.js))
- `role: "company"` → Company model ([company.model.js](../backend/src/models/company.model.js))

Both models have separate schemas but share authentication patterns (bcrypt password hashing, JWT tokens).

### Job Posting Flow
1. Company creates job → Job model with `status: "pending"`
2. Admin moderates → Changes status to `"approved"` or `"rejected"`
3. Students browse → Only approved jobs visible
4. Student applies → `applicants` array updated in Job model

## Backend Conventions

### Error Handling Pattern
All controllers wrapped with `asyncHandler` ([asynchandler.js](../backend/src/utils/asynchandler.js)) to avoid try-catch boilerplate:
```javascript
export const controllerName = asyncHandler(async (req, res) => {
    // Controller logic
    throw new apierror(400, "Error message"); // Global handler catches this
});
```

Responses use custom classes:
- Success: `new apiResponse(statusCode, data, message)` ([apiResponse.js](../backend/src/utils/apiResponse.js))
- Error: `new apierror(statusCode, message)` ([apierror.js](../backend/src/utils/apierror.js))

### File Upload Pipeline
Multer → Local temp storage → Cloudinary → Delete local file:
1. [multer.middleware.js](../backend/src/middlewares/multer.middleware.js) saves to `public/temp/`
2. [cloudinary.js](../backend/src/utils/cloudinary.js) `uploadoncloudinary()` uploads and **always** deletes temp file
3. Store Cloudinary URL in database (e.g., `resumeUrl` in User model)

### Route Organization
API namespacing: `/api/v1/{resource}`
- [user.routes.js](../backend/src/routes/user.routes.js): Student/Company auth + student profile + company actions
- [job.routes.js](../backend/src/routes/job.routes.js): Job CRUD, applications, admin moderation
- [company.routes.js](../backend/src/routes/company.routes.js): Company-specific operations

**Note**: Route organization shows merge artifacts - student and company routes coexist in user.routes.js. Follow existing patterns when adding endpoints.

### Database Connection
[index.js](../backend/src/index.js) connects to MongoDB before starting Express server. Connection string: `${MONGODB_URI}/${DB_NAME}` where `DB_NAME` from [constant.js](../backend/src/constant.js).

## Frontend Conventions

### Routing Structure
Role-based nested routes in [app.js](../frontend/src/app.js):
- `/` → Login page
- `/student` → StudentDashboard (tabs for jobs/applications/profile)
- `/company` → CompanyLayout (sidebar) with nested routes:
  - `/company/dashboard`
  - `/company/post-job`
  - `/company/applicants/:jobId?`
  - `/company/profile`
- `/admin` → AdminLayout with nested routes for dashboard/companies/students

### API Service Layer
[api.js](../frontend/src/services/api.js) wraps all fetch calls:
- Base URL from `VITE_API_BASE_URL` env var (default: `http://localhost:8000`)
- Always include `credentials: 'include'` for cookie-based auth
- User role stored in `localStorage` after login

### State Management
No Redux/Context - role stored in `localStorage.getItem('userRole')`. When adding features requiring shared state, follow this pattern or propose Context API migration.

## Development Workflow

### Running the Project
**Backend** (from `backend/` directory):
```bash
npm run dev  # Uses nodemon with dotenv, runs on port 8000
```

**Frontend** (from `frontend/` directory):
```bash
npm run dev  # Vite dev server on port 5173
```

### Environment Variables Required
**Backend** (`.env` in `backend/`):
- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (default 8000)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `ACCESS_TOKEN_SECRET`, `ACCESS_TOKEN_EXPIRY` (JWT - currently commented in models)
- `REFRESH_TOKEN_SECRET`, `REFRESH_TOKEN_EXPIRY`

**Frontend** (`.env` in `frontend/`):
- `VITE_API_BASE_URL` - Backend API URL

### Key Dependencies
- Backend: Express 5, Mongoose 8, bcrypt, jsonwebtoken, multer, cloudinary
- Frontend: React 19, React Router 7, Tailwind CSS 4, Vite 7, axios

## Project-Specific Quirks

1. **ES Modules Everywhere**: Both backend and frontend use `"type": "module"` - always use `import/export`, never `require()`

2. **Password Hashing Pre-save Hook**: User/Company models auto-hash passwords on save. Use `isModified("password")` check to avoid re-hashing on non-password updates.

3. **CORS Configuration**: [app.js](../backend/src/app.js) uses origin callback function allowing `localhost:5173` and `localhost:8000` with credentials.

4. **Duplicate express.json() Calls**: [app.js](../backend/src/app.js#L19-L27) has redundant middleware setup - avoid adding more duplicates when modifying.

5. **Commented JWT Methods**: User model has commented `generateAccessToken()` - likely WIP for refresh token implementation.

6. **Application Model Unused**: [application.model.js](../backend/src/models/application.model.js) exists but applications tracked via `applicants` array in Job model.

## When Adding Features

- **New endpoints**: Follow asyncHandler + apiResponse/apierror pattern, add to appropriate routes file
- **New models**: Include bcrypt pre-save hook if password field exists
- **File uploads**: Use multer middleware → cloudinary utility → save URL to model
- **Frontend pages**: Add route in app.js under appropriate role section, create component in `pages/{Role}/`
- **API calls**: Add function to services/api.js, use BASE_URL constant and credentials: 'include'

## Testing Strategy
No test framework currently configured. When adding tests, consider:
- Jest/Vitest for unit tests
- Supertest for API endpoint testing
- React Testing Library for component tests
