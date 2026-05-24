<p align="center">
  <a href="https://cariff.com" target="blank"><img src="https://cariff-logo.s3.eu-north-1.amazonaws.com/cariff-logo.png" width="120" alt="Cariff Logo" /></a>
</p>
<h1 align="center">Cariff API Gateway</h1>

<p align="center">
  The central entry point and API Gateway for the <strong>Cariff</strong> platform.
</p>

---

## 📖 Description

This repository contains the API Gateway for Cariff. It acts as the primary interface for client applications (Frontend/Mobile), handling HTTP requests, authentication, and routing traffic to the underlying microservices via **Kafka** message broker.

### 🔗 API Documentation (Swagger)

The API is fully documented using Swagger/OpenAPI.

- **Production Docs:** [https://api.cariff.com/api/docs](https://api.cariff.com/api/docs)
- **Local Docs:** `http://localhost:<PORT>/api/docs` _(when running locally)_

---

## 🏗 System Domains (Endpoints)

The Gateway exposes the following main domain controllers:

- **`AuthController`** - JWT authentication, login, registration, and token refresh.
- **`UserController`** - User profile management and preferences.
- **`ListingController`** - Car listings, search, and catalog interactions.
- **`VehicleDataController`** - Technical specifications and external vehicle data integration.
- **`FavouritesController`** - Managing user's saved/favorite vehicles.
- **`UploadController`** - Media and file uploads (images, documents).
- **`WebhooksController`** - External third-party callbacks (e.g., AWS SNS, payment gateways).
- **`HealthController`** - Liveness and readiness checks for orchestration.

---

## 🛠 Tech Stack

- **Framework:** [NestJS](https://nestjs.com/) (Express under the hood)
- **Transport:** Kafka (Microservices communication)
- **Validation:** `class-validator` & `class-transformer`
- **Package Manager:** `yarn`

---

## 🚀 Project Setup

1. **Install dependencies:**

```bash
yarn install
```
