# Software Engineering Job Platform

A full-stack recruitment platform for job seekers, companies, and administrators.

## Features

- User registration and login
- Company registration and login
- Admin authentication
- CV upload and verification
- Job posting and approval workflow
- Job application tracking
- Company applicant management
- Role-based access control

## Tech Stack

- React
- Vite
- Node.js
- Express.js
- Microsoft SQL Server
- JWT Authentication
- Axios

## User Roles

### User
Users can manage their profile and CV, browse approved job listings, save jobs, apply for positions, and track their application status.

### Company
Companies can manage their company profile, create job drafts, submit job listings for approval, and manage applicants.

### Admin
Admins can review pending CVs and job postings before approving or rejecting them.

## Workflow

### Job Posting
Company creates a job → Draft → Pending Approval → Admin Review → Approved → Visible to users.

### CV Verification
User uploads CV → Pending Verification → Admin Review → Approved / Rejected.

## Setup

Backend:

```bash
cd backend
npm install
node server.js
