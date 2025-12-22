# Docker Deployment Guide

## Build & Run

1. Build and start all services:
   ```sh
   docker-compose up --build
   ```
2. Access frontend at http://localhost
3. Backend API at http://localhost:5000/api

## Notes
- Edit VITE_API_URL in docker-compose.yml if backend URL changes.
- Uploads folder is mounted for backend persistence.
