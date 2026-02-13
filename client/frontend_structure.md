# Blog App – Frontend Integration Guide

This document contains:

- All backend APIs
- Request format
- Response format
- Authentication details
- Frontend folder structure
- Screen breakdown (Landing → Profile)

------------------------------------------------------------
BASE URL
------------------------------------------------------------

http://localhost:5000/api

------------------------------------------------------------
AUTHENTICATION
------------------------------------------------------------

Protected routes require:

Authorization: Bearer <token>

Token is returned from login API.

------------------------------------------------------------
AUTH APIs
------------------------------------------------------------

1) Register User
POST /api/auth/register

Request:
{
  "username": "param",
  "email": "param@gmail.com",
  "password": "123456"
}

Response:
{
  "status": "success",
  "message": "User registered successfully"
}


2) Login User
POST /api/auth/login

Request:
{
  "email": "param@gmail.com",
  "password": "123456"
}

Response:
{
  "status": "success",
  "token": "jwt_token_here",
  "user": {
    "_id": "userId",
    "username": "param",
    "email": "param@gmail.com"
  }
}

------------------------------------------------------------
BLOG APIs (Protected)
------------------------------------------------------------

1) Create Blog
POST /api/posts/

Request:
{
  "title": "My First Blog",
  "content": "This is blog content",
  "isAnonymous": false
}

Response:
{
  "status": "success",
  "blog": { ...blogObject }
}


2) Get All Blogs (Logged-in)
GET /api/posts/posts

Response:
{
  "status": "success",
  "blogs": [ ...arrayOfBlogs ]
}


3) Get Single Blog
GET /api/posts/:postId

Response:
{
  "status": "success",
  "blog": { ...blogObject }
}


4) Update Blog
PUT /api/posts/:postId

Request:
{
  "title": "Updated title",
  "content": "Updated content"
}

Response:
{
  "status": "success",
  "blog": { ...updatedBlog }
}


5) Delete Blog
DELETE /api/posts/:postId

Response:
{
  "status": "success",
  "message": "Blog deleted successfully"
}


6) Like Blog
POST /api/posts/:postId/like

Response:
{
  "status": "success",
  "likesCount": 5
}

------------------------------------------------------------
PUBLIC APIs (No Auth Required)
------------------------------------------------------------

1) Get First 10 Public Posts
GET /api/public/posts

Response:
{
  "status": "success",
  "posts": [ ...arrayOfPublicPosts ]
}


2) Get Public Single Post
GET /api/public/posts/:postId

Response:
{
  "status": "success",
  "post": { ...postObject }
}

------------------------------------------------------------
USER APIs (Protected)
------------------------------------------------------------

1) Get Logged-in User Profile
GET /api/user/me

Response:
{
  "status": "success",
  "user": {
    "_id": "userId",
    "username": "param",
    "email": "param@gmail.com"
  }
}


2) Get User’s Own Posts
GET /api/user/posts

Response:
{
  "status": "success",
  "posts": [ ...userPosts ]
}


3) Update Own Post
PATCH /api/user/:postId

Request:
{
  "title": "Updated title"
}

Response:
{
  "status": "success",
  "post": { ...updatedPost }
}

------------------------------------------------------------
BLOG OBJECT STRUCTURE
------------------------------------------------------------

{
  "_id": "postId",
  "title": "Blog Title",
  "content": "Blog content",
  "author": {
    "_id": "userId",
    "username": "param"
  },
  "isAnonymous": false,
  "likes": ["userId1", "userId2"],
  "createdAt": "date",
  "updatedAt": "date"
}

------------------------------------------------------------
FRONTEND STRUCTURE (React + Tailwind)
------------------------------------------------------------

blog-frontend/
│
├── public/
│
├── src/
│
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── MainLayout.jsx
│   │   │
│   │   ├── blog/
│   │   │   ├── BlogCard.jsx
│   │   │   ├── BlogList.jsx
│   │   │   ├── BlogContent.jsx
│   │   │   ├── CreateBlogForm.jsx
│   │   │   ├── EditBlogForm.jsx
│   │   │   └── BlogActions.jsx
│   │   │
│   │   ├── comment/
│   │   │   ├── CommentCard.jsx
│   │   │   ├── CommentList.jsx
│   │   │   └── CommentForm.jsx
│   │   │
│   │   ├── user/
│   │   │   ├── ProfileHeader.jsx
│   │   │   ├── ProfileTabs.jsx
│   │   │   └── UserPostList.jsx
│   │   │
│   │   └── common/
│   │       ├── Button.jsx
│   │       ├── Input.jsx
│   │       ├── Modal.jsx
│   │       ├── Loader.jsx
│   │       └── EmptyState.jsx
│   │
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Home.jsx
│   │   ├── SingleBlog.jsx
│   │   ├── CreateBlog.jsx
│   │   ├── EditBlog.jsx
│   │   ├── Profile.jsx
│   │   └── NotFound.jsx
│   │
│   ├── routes/
│   │   └── AppRoutes.jsx
│   │
│   ├── services/
│   │   ├── axiosInstance.js
│   │   ├── authService.js
│   │   ├── blogService.js
│   │   ├── commentService.js
│   │   └── userService.js
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useFetch.js
│   │   └── useDebounce.js
│   │
│   ├── utils/
│   │   ├── formatDate.js
│   │   ├── truncateText.js
│   │   └── constants.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── .env
├── package.json
└── tailwind.config.js

------------------------------------------------------------
SCREEN FLOW
------------------------------------------------------------

1) Landing Page
   - Shows first 10 public blogs
   - Login / Register button

2) Login Page
   - Email + Password form

3) Register Page
   - Username + Email + Password form

4) Home Page
   - All blogs (logged in)
   - Like button
   - Navigate to Single Blog
   - Create blog button

5) Single Blog Page
   - Blog content
   - Like button
   - Comment section
   - Edit/Delete (if owner)

6) Create Blog Page
   - Title
   - Content
   - Anonymous toggle

7) Edit Blog Page
   - Prefilled form

8) Profile Page
   - User info
   - User posts list
   - Edit own posts

------------------------------------------------------------
END OF DOCUMENT
------------------------------------------------------------
