# Farm-ET 🌾

Farm-ET is a comprehensive farm management and direct-to-consumer marketplace platform designed specifically for the Ethiopian agricultural ecosystem. 

By bridging the gap between traditional agricultural practices and modern data-driven management, Farm-ET provides farmers with the tools they need to track livestock, plan crops, manage accounting, and sell directly to consumers—all in one unified platform.

---

## 🌟 Key Features

- **🐾 Livestock Management:** Track individual animal health, breeding cycles, genetics, treatments, and market readiness.
- **🌿 Crop Planning:** Map your fields, plan crop rotations, log harvests, and monitor soil treatments to maximize yield per hectare.
- **📈 Farm Accounting:** Automatically track expenses, sales, and generate Profit & Loss reports tailored for agricultural businesses.
- **🛒 Direct Marketplace:** Cut out the middleman. List your harvest or livestock directly on the Farm-ET marketplace to connect with buyers instantly.
- **🌍 Localized Architecture:** Built with support for multiple unit systems, local currencies, and agricultural workflows specific to Ethiopia.

---

## 🛠 Tech Stack

- **Frontend:** Next.js (React), Tailwind CSS, Lucide Icons
- **Backend:** Laravel 11 (PHP 8.3), Sanctum Authentication
- **Database:** PostgreSQL 16
- **Infrastructure:** Docker & Docker Compose

---

## 🚀 Getting Started (Local Development)

The easiest way to run Farm-ET locally is using Docker. Our `docker-compose.yml` is configured to spin up the entire stack (Database, Backend API, and Frontend) with a single command.

### Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop) installed and running.
- [Git](https://git-scm.com/) installed.

### Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-org/farm-et.git
   cd farm-et
   ```

2. **Set Up the Backend Environment**
   Navigate to the backend directory and duplicate the example `.env` file.
   ```bash
   cd farm-et-backend
   cp .env.example .env
   cd ..
   ```
   *Note: The `docker-compose.yml` file is already configured to pass the correct database credentials into the backend container, so you don't need to manually edit the DB details in your `.env` for local Docker development.*

3. **Start the Docker Containers**
   From the root of the project (where `docker-compose.yml` is located), build and start the containers in detached mode:
   ```bash
   docker compose up --build -d
   ```

4. **Install Dependencies & Run Migrations**
   Once the containers are running, you need to install the PHP dependencies and migrate the database schema inside the backend container.
   ```bash
   # Install PHP dependencies
   docker compose exec backend composer install

   # Generate Laravel application key
   docker compose exec backend php artisan key:generate

   # Run database migrations
   docker compose exec backend php artisan migrate
   ```

5. **Access the Application**
   - **Frontend:** [http://localhost:3000](http://localhost:3000)
   - **Backend API:** [http://localhost:8000](http://localhost:8000)
   - **Database (PostgreSQL):** Accessible on port `5432` with user `postgres` and password `secretpassword`

---

## 🛑 Stopping the Application

To stop the running containers without deleting your database data:
```bash
docker compose stop
```

To stop the containers and completely remove them (including the database volume):
```bash
docker compose down -v
```

---

