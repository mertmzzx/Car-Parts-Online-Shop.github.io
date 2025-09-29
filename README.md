# 🚗 Silver Star Parts – Full-Stack Web App for Car Parts
Silver Star Parts is a full-stack demo web application built with ASP.NET Core(C#) for the backend and React (Bootstrap) for the frontend.
It simulates a real online shop for car parts, designed to showcase modern web development, clean architecture, and e-commerce features.

## 🚀 Features

● User-facing store
Browse, search, and filter car parts by category and price
Product detail pages with SKU, pricing, and images
Shopping cart with live updates and checkout flow
Order placement with shipping address snapshots & payment method 
User account: login, register, profile dashboard -> orders, addresses

● Admin panel
Dashboard with quick stats and recent actions
Manage users (roles, block, delete)
Track and update order status with history logging
View admin activity logs

## 🛠️ Tech Stack
### Frontend
⚛️ React (with React Router)
🎨 Bootstrap 5 (React-Bootstrap)
📦 Context API (Auth & Cart state management)

### Backend
🖥 ASP.NET Core Web API (C#)
🗄 Entity Framework Core (Code-First Migrations)
🔑 Identity + JWT Authentication
🛡 Role-based Authorization (Admin, Sales Assistant, Customer)

### Database
📘 SQL Server (local via Docker, can run on cloud DB)

### Other Tools & Libraries
🔍 Swagger (API documentation)
🔧 Axios (API calls in frontend)
📊 ESLint + Prettier (code quality & formatting)
