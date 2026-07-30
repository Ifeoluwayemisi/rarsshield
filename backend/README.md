# RARS Shield Backend

AI-Powered Financial Safety & Inclusion Platform for NITHUB Innovation Fair 2026.

## Architecture

- Modular Monolith
- Express.js controllers → services → repositories → Prisma persistence
- JWT Authentication with refresh token rotation
- OpenAI-powered scam analysis and financial coaching
- Payment logic abstracted behind `PaymentProvider`
- Redis-backed queues for AI, notification, and retry jobs

## Getting Started

1. Copy `.env.example` to `.env` and populate secrets.
2. Run `npm install`.
3. Run `npx prisma generate`.
4. Run `npm run prisma:migrate -- --name init`.
5. Run `npm run dev`.

## Notes

- BMONI integration is intentionally deferred behind `PaymentProvider`.
- Business logic lives in services, repositories handle persistence, controllers only orchestrate requests.
