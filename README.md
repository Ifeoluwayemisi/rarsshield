# RARS Shield

RARS Shield is an AI-powered financial trust platform built for the NITHUB Innovation Fair Hackathon 2026. The backend acts as the orchestration layer between users, AI analysis, and the BMONI sandbox financial infrastructure.

## Vision

RARS Shield helps people recognize suspicious financial communications, understand their money behavior, and make safer financial decisions before they lose money.

## What this backend does

The backend currently provides:

- Authentication and session management
- AI-based scam and communication analysis
- BMONI wallet onboarding, balance, and transaction flows
- Financial insight generation from wallet activity
- User settings and profile management
- Webhook ingestion for events from external providers
- Health and documentation endpoints

## Architecture

- Node.js + TypeScript
- Express.js
- Prisma + PostgreSQL
- JWT authentication
- OpenAI for risk analysis and financial guidance
- BMONI sandbox integration
- Redis-backed background-ready infrastructure

## Current MVP scope

### Authentication

- Signup
- Login
- JWT access and refresh tokens
- Logout
- Forgot password
- Password reset
- Email verification
- Google auth entry point

### Scam analysis

- Analyze text, links, emails, and related content
- Return risk score, risk level, explanation, recommendation, and confidence

### Wallet and BMONI integration

- Wallet onboarding
- Wallet sync
- Wallet balance lookup
- Transaction history lookup
- Wallet summary data
- Financial insight sync

### User management

- View and update profile
- Manage notification/privacy settings

### Webhooks

- Receive and validate webhook events
- Persist notifications and audit logs

## API endpoints

### Health

- GET /api/health

### Auth

- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/google
- POST /api/auth/forgot-password
- GET /api/auth/verify-email
- POST /api/auth/verify-email
- GET /api/auth/reset-password
- POST /api/auth/reset-password
- POST /api/auth/refresh
- POST /api/auth/logout

### Users

- GET /api/users/me
- PUT /api/users/me

### Settings

- GET /api/settings
- PUT /api/settings

### Transactions

- POST /api/transactions
- GET /api/transactions
- GET /api/transactions/balance

### Scam analysis

- POST /api/analysis

### Wallet

- POST /api/wallet/onboard
- POST /api/wallet/sync
- GET /api/wallet/me
- GET /api/wallet/info
- GET /api/wallet/summary
- GET /api/wallet/balance
- GET /api/wallet/transactions

### Financial insights

- POST /api/financial-insights/sync
- GET /api/financial-insights/me

### Webhooks

- POST /api/webhooks/events

### Documentation

- GET /api/docs

## Environment variables

The backend expects the following environment variables:

- NODE_ENV
- PORT
- APP_NAME
- APP_URL
- TRUSTED_ORIGINS
- DATABASE_URL
- JWT_ACCESS_TOKEN_SECRET
- JWT_REFRESH_TOKEN_SECRET
- JWT_ACCESS_TOKEN_EXPIRES_IN
- JWT_REFRESH_TOKEN_EXPIRES_IN
- OPENAI_API_KEY
- OPENAI_MODEL
- REDIS_URL
- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASSWORD
- EMAIL_FROM
- BMONI_API_BASE_URL
- BMONI_API_KEY
- WEBHOOK_SECRET

## Running locally

```bash
cd backend
npm install
npm run build
npm run start
```

## Postman collection

You can import the API collection and environment from the backend folder:

- [backend/postman_collection.json](backend/postman_collection.json)
- [backend/postman_environment.json](backend/postman_environment.json)

Import the environment first, then the collection. After logging in, the collection will use the returned access token automatically.

## Notes

This repository is currently focused on the backend only. The mobile client is out of scope for the hackathon MVP.
