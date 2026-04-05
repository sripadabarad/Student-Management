# Student Management API 

A backend project built with Node.js, Express, and MongoDB to manage student data with proper authentication and role-based access control.

This project focuses on writing clean, structured backend code and implementing real-world concepts like JWT authentication, RBAC, pagination, filtering, and soft delete.

# Live API
Base URL:https://student-api-zia3.onrender.com

 # Key Features
1. JWT Authentication (Access + Refresh Tokens)
2. Role-Based Access Control (Admin / Teacher / User)
3. Complete Student CRUD Operations
4. Soft Delete (data not permanently removed)
5. Search & Filtering
6. Pagination for large datasets
7. Email system using SendGrid
8. Clean Architecture (MVC + Service Layer)

## Tech Stack :--
Backend: Node.js, Express.js
Database: MongoDB + Mongoose
Auth: JWT (Access + Refresh Token)
Architecture: MVC + Service Layer
Email Service: SendGrid
Security: RBAC (Role-Based Access Control)

## What this project does:----
1. Users can log in and get a JWT token
2. Access to APIs is controlled using roles (admin, teacher, user)
3. Students can be created, updated, fetched, and deleted
4. Deleted data is not removed permanently (soft delete used)
5. Supports pagination and search for handling large data

## Project Structure :--
The project follows a clean structure with separation of logic:
Client → Routes → Controller → Service → Model → Database
This helps keep the code maintainable and easy to extend.
Clear separation of concerns ensures:
Better scalability
Easier debugging
Production-level code structure


## Authentication & Authorization :--

### Authentication:-
Authentication is handled using JWT.
After login, a token is generated which must be sent in the request header.

### Authorization (RBAC):--
Authorization is implemented using roles:--

Admin --> Full access to student data (Create, Update, Delete, Read)
Teacher --> Read + Create student
User	 --> Read only 

## API Capabilities :--

Auth API Endpoints:--
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh-token
POST /api/auth/change-password
POST /api/auth/forgot-password
POST /api/auth/reset-password

## Student APIs :--

GET /api/students/:id  Get single student 
GET /api/students?isDeleted=false  → Get all active students
POST /api/students
PUT /api/students/:id      (for fully update)
PATCH /api/students/:id    (for partial update)
DELETE /api/students/:id  


##  Pagination & Filtering :--

### Pagination:
GET /api/students?page=1&limit=10

### Search:
GET /api/students?search=rahul

### Soft Delete :-
Instead of removing records permanently, the API uses a soft delete approach:
isDeleted = true
This helps prevent accidental data loss and is commonly used in production systems.


project-root/
|
├── config/
├── controllers/ 
├── middleware/ 
├── models/ 
├── routes/
├── services/
├── utils/ 
├──app.js
├── server.js


# Environment Setup:--
PORT=5001
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=your_frontend_url

JWT_ACCESS_TOKEN=your_access_token_secret
JWT_REFRESH_TOKEN=your_refresh_token_secret

SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=your_email_address

# Postman Testing

All APIs are tested using Postman:

JWT authentication enabled
Role-based access tested
Full CRUD verification done

👉 Import collection:
Student-Management.postman_collection.json
Student-Management.postman_environment.json



 # Run Locally :--

git clone https://github.com/sripadabarad/Student-Management.git
cd Student-Management
npm install
npm start

# Testing :--

All APIs are tested using Postman with proper authentication and role-based access control.

# Deployment Status :--

Backend deployed on cloud platform (Render / Railway / etc.)
Auto deployment enabled via GitHub integration
Environment variables configured in production


# What Makes This Project Stand Out?
1. Not just CRUD — includes real-world backend concepts
2. Clean architecture used in production systems
3. Proper separation of logic using service layer
4. Secure authentication and role-based authorization
5. Scalable design with pagination & filtering

# Author :-

Sripada Barad
Backend Developer (Node.js)

# Note :--

This project reflects a strong understanding of backend fundamentals and real-world application design.
It is built to demonstrate industry-ready development practices, not just basic functionality.