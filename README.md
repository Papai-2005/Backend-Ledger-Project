# Ledger — Backend Account & Transaction Management API

A backend REST API for managing user accounts and financial transactions, built with **Node.js, Express.js, MongoDB, and JWT authentication**.

The project explores backend engineering concepts such as account management, ledger entries, transaction idempotency, authentication, email notifications, and containerized development with Docker Compose.

**Repository:** [Backend-Ledger-Project](https://github.com/Papai-2005/Backend-Ledger-Project)  
**Live API:** [backend-ledger-project.onrender.com](https://backend-ledger-project.onrender.com)

> **Note:** This is an educational portfolio project. It is not intended for processing real money or production banking operations.

## Features

- **Authentication & Authorization** — JWT-based authentication and protected API routes.
- **Password Security** — Password hashing using `bcryptjs`.
- **Account Management** — Backend operations for managing user accounts and account-related information.
- **Ledger-Based Transactions** — Records debit and credit entries to maintain a transaction history.
- **Idempotent Transfers** — Supports safe retries of transaction requests using idempotency keys.
- **Transaction Tracking** — Maintains transaction records and their processing status.
- **Email Notifications** — Email functionality implemented using Nodemailer.
- **MongoDB Integration** — Persistent data storage using MongoDB and Mongoose.
- **Docker Support** — Dockerfile and Docker Compose configuration for containerized development.

## Tech Stack

| Category | Technology |
|---|---|
| Runtime | Node.js |
| Backend Framework | Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JSON Web Tokens (JWT) |
| Password Hashing | bcryptjs |
| Email Service | Nodemailer |
| Configuration | dotenv |
| Containerization | Docker, Docker Compose |
| Development Tools | Git, GitHub, Postman |

## Architecture Overview

The API follows a modular backend structure that separates request handling, routing, middleware, and data persistence.

```text
Client / API Consumer
        |
        v
   Express Server
        |
        v
   API Routes
        |
        v
Authentication Middleware
        |
        v
   Controllers
        |
        v
 Business Operations
        |
        v
 MongoDB / Mongoose
        |
        v
Accounts | Transactions | Ledger Entries

Additional service: Email Notifications
```

This separation makes the application easier to maintain, debug, and extend.

## How the Ledger Works

A ledger records financial events as entries rather than relying solely on a manually updated balance.

For example, a transfer of 100 units from Account A to Account B can be represented as:

| Account | Entry Type | Amount |
|---|---|---:|
| Account A | Debit | 100 |
| Account B | Credit | 100 |

A ledger-based design helps preserve transaction history and makes account activity easier to audit.

**Important:** The exact consistency guarantees depend on the implementation. Atomicity across multiple database writes requires appropriate transaction handling and database configuration.

## Idempotency

Network failures can cause clients to retry a request even when the original request may have been processed.

An idempotency key allows the server to recognize repeated requests and avoid creating duplicate transactions, provided the key is stored and validated correctly.

Conceptually:

```text
Client sends transaction request
             |
             v
       Check request key
             |
       +-----+-----+
       |           |
    Existing     New key
       |           |
Return prior    Process request
result          and record key
```

This is an important concept in payment and transaction APIs because duplicate processing can lead to incorrect financial records.

## Getting Started

### Prerequisites

Install the following before running the project:

- [Node.js](https://nodejs.org/)
- npm
- [MongoDB](https://www.mongodb.com/) or a MongoDB Atlas database
- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) if using Docker

If your implementation uses MongoDB multi-document transactions, configure MongoDB with a supported replica set.

### 1. Clone the repository

```bash
git clone https://github.com/Papai-2005/Backend-Ledger-Project.git

cd Backend-Ledger-Project
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root and add the configuration required by your application.

Example template:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
```

Add any additional variables required by your email service or other integrations. Use the exact variable names expected by your source code.

**Security:** Never commit your `.env` file, database credentials, JWT secrets, email passwords, or OAuth tokens to GitHub. Provide an `.env.example` containing placeholder values instead.

### 4. Start the development server

```bash
npm run dev
```

To start the application normally:

```bash
npm start
```

The API should be available at:

```text
https://backend-ledger-project.onrender.com
```

### 5. Run with Docker

The repository includes a `Dockerfile` and `docker-compose.yml`.

From the project root, run:

```bash
docker pull gourab004/backend-ledger:v1.0
```

Check the Compose configuration to confirm which services and environment variables are required. If MongoDB transactions are enabled, ensure the database service is configured appropriately.

## API Overview

The API provides authentication, account management, and transaction-related functionality.

The following table describes the expected resource groups. Confirm the exact HTTP methods, paths, request fields, and response formats against the current route files before using these as API documentation.

| Resource | Purpose |
|---|---|
| Authentication | Registration, login, and authentication-related operations |
| Accounts | Account creation and account information |
| Transactions | Transaction requests and transaction history |
| Ledger | Debit and credit records associated with transactions |

Protected endpoints require the authentication mechanism configured by the application.

### Testing the API

You can use [Postman](https://www.postman.com/) or `curl` to send HTTP requests to the running server.

When testing, verify:

- Successful and unsuccessful authentication.
- Rejection of invalid input.
- Access control for protected routes.
- Behavior when an account has insufficient funds.
- Repeated requests using the same idempotency key.
- Correct debit and credit ledger entries.
- Appropriate error responses for missing or invalid resources.

For financial operations, also test failure cases and concurrent requests before claiming strong consistency guarantees.

## Project Structure

The repository contains the following visible top-level files and directory:

```text
Backend-Ledger-Project/
├── src/
├── .dockerignore
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package.json
├── package-lock.json
└── server.js
```

The `src/` directory contains the application's backend implementation. Consult the source files for the exact route, controller, middleware, model, and service organization.

## Engineering Concepts Demonstrated

This project is intended to demonstrate practical understanding of:

- REST API design and request handling.
- Authentication and protected routes.
- Password hashing and environment-based configuration.
- Database modeling with MongoDB and Mongoose.
- Ledger entries and transaction history.
- Idempotency and safe request retries.
- Error handling and input validation.
- Email integration.
- Containerized development workflows.

## Future Improvements

Potential improvements for the project include:

- Automated unit and integration tests.
- API documentation with OpenAPI/Swagger.
- Structured logging and request tracing.
- Rate limiting and additional security hardening.
- Improved transaction and concurrency testing.
- CI workflows for automated checks.
- Clearer API examples and response schemas.

These are roadmap items, not claims that the features are already implemented.

## Author

**Gourab Kundu**

- GitHub: [@Papai-2005](https://github.com/Papai-2005)
- LinkedIn: [Gourab Kundu](https://www.linkedin.com/in/gourab-kundu-7985ab289)

---

Built as a backend engineering portfolio project to explore account management, transaction processing, and reliable API design using the Node.js ecosystem.
