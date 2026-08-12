# 🌾 FarmET — Ethiopian Farm Management System

FarmET is a web application that helps Ethiopian farmers **manage their livestock, crops, and finances** — all in one place. It also includes a built-in **marketplace** where farmers can list animals and crops for sale so other users can browse and contact them.

---

## What the Program Does

| Feature | Description |
|---|---|
| **Authentication** | Farmers register and log in to their own account. All data is private and user-specific. |
| **Onboarding** | New users set up their farm profile (name, location, currency, unit system). |
| **Animal Management** | Add, edit, and track livestock (cattle, sheep, goats, horses, etc.) with details like age, sex, weight, breed, and status. |
| **Crop Management** | Add, edit, and track crops (Teff, Coffee, Wheat, etc.) with variety, days to maturity, harvest units, and value. |
| **Transaction Ledger** | Record income and expenses for financial tracking. |
| **Financial Reports** | View a yearly financial summary of farm income vs. expenses. |
| **Marketplace** | Any animal or crop set to **"For Sale"** is automatically listed on the public marketplace — visible to all users like a product grid. Other farmers can browse by category, search, filter by price, and sort results. |

---

## Architecture

The project has **two separate parts** that must both be running at the same time:

```
FARMET/
├── farm-et/              ← Frontend (Next.js 14, TypeScript)
└── farm-et-backend/      ← Backend API (Laravel 11, PHP, PostgreSQL)
```

- The **frontend** runs on `http://localhost:3000`
- The **backend API** runs on `http://127.0.0.1:8000`
- The frontend talks to the backend through a built-in API proxy

---

## Prerequisites

Install all of the following before running the project:

### Backend requirements
| Tool | Version | Download |
|---|---|---|
| **PHP** | 8.2 or higher | https://www.php.net/downloads |
| **Composer** | Latest | https://getcomposer.org |
| **PostgreSQL** | 14 or higher | https://www.postgresql.org/download |

### Frontend requirements
| Tool | Version | Download |
|---|---|---|
| **Node.js** | 18 or higher | https://nodejs.org |
| **npm** | Comes with Node.js | — |

---

## Setup & Running

Follow these steps **in order**. You need two terminal windows open.

---

### Step 1 — Set up the Database

1. Open **pgAdmin** or the `psql` shell and create a new database:
   ```sql
   CREATE DATABASE farm_et_db;
   ```

---

### Step 2 — Set up the Backend

Open a terminal and navigate to the backend folder:

```bash
cd FARMET/farm-et-backend
```

**Install PHP dependencies:**
```bash
composer install
```

**Create the environment file:**
```bash
copy .env.example .env
```

**Edit `.env`** and set your PostgreSQL connection:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=farm_et_db
DB_USERNAME=postgres
DB_PASSWORD=your_password_here
```

**Generate the application key:**
```bash
php artisan key:generate
```

**Run database migrations** (creates all tables):
```bash
php artisan migrate
```

**Start the backend server:**
```bash
php artisan serve
```

The API is now running at `http://127.0.0.1:8000`. **Keep this terminal open.**

---

### Step 3 — Set up the Frontend

Open a **second terminal** and navigate to the frontend folder:

```bash
cd FARMET/farm-et
```

**Install Node.js dependencies:**
```bash
npm install
```

**Start the frontend development server:**
```bash
npm run dev
```

The app is now running at `http://localhost:3000`. **Keep this terminal open too.**

---

### Step 4 — Open the App

Go to **http://localhost:3000** in your browser.

- Click **"Get Started"** to create a new account
- Complete the farm setup (onboarding) to enter your farm details
- You will be taken to your dashboard

---

## Quick Reference — Running the Project

Every time you want to use FarmET, open **two terminals** and run:

**Terminal 1 (Backend):**
```bash
cd FARMET/farm-et-backend
php artisan serve
```

**Terminal 2 (Frontend):**
```bash
cd FARMET/farm-et
npm run dev
```

Then open **http://localhost:3000**.

---

## How the Marketplace Works

1. Add an animal or crop in your account
2. Open the **⋮ menu** on any row in the Animals or Crops table
3. Click **"Sell Animal"** or **"Sell Crop"**
4. The item's status instantly changes to **🏷️ For Sale**
5. It immediately appears on the **Market → Dashboard** page for all users to see
6. Other farmers can browse, filter, and contact you through the marketplace

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Laravel 11, PHP 8.2 |
| Database | PostgreSQL |
| Auth | Laravel Sanctum (token-based) |
| API Style | RESTful JSON API |
