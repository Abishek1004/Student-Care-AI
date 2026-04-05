# 🧠 Student Mental Health Analyzer — Spring Boot Backend

A production-ready Spring Boot 3 backend for assessing and tracking student mental health.
Features OTP-based email login, ML-powered risk prediction, test history, and report APIs.

---

## 🏗️ Project Structure

```
src/main/java/com/mentalhealth/
├── StudentMentalHealthApplication.java   ← Entry point
├── config/
│   ├── CorsConfig.java                   ← CORS for React frontend
│   └── GlobalExceptionHandler.java       ← Centralised error handling
├── controller/
│   ├── AuthController.java               ← POST /auth/send-otp, /auth/verify-otp
│   ├── PredictionController.java         ← POST /api/predict
│   └── ReportController.java             ← GET /api/history/{userId}, /api/report/{id}
├── service/
│   ├── AuthService.java                  ← OTP generation & validation logic
│   ├── MailService.java                  ← Gmail SMTP email sender
│   ├── PredictionService.java            ← ML scoring (built-in + external HTTP)
│   ├── SuggestionService.java            ← Personalised suggestions generator
│   └── ReportService.java                ← History & report retrieval
├── repository/
│   ├── UserRepository.java
│   └── TestResultRepository.java
├── entity/
│   ├── User.java
│   └── TestResult.java
└── dto/
    ├── SendOtpRequest.java
    ├── VerifyOtpRequest.java
    ├── AuthResponse.java
    ├── PredictRequest.java
    ├── PredictResponse.java
    ├── TestResultDTO.java
    └── ApiResponse.java
```

---

## ⚙️ Setup Instructions

### 1. Prerequisites
- Java 17+
- Maven 3.8+
- MySQL 8+

### 2. Database
```sql
CREATE DATABASE mental_health_db;
```
Or apply `src/main/resources/schema.sql` manually.
> Spring Boot (`ddl-auto=update`) will create/update tables automatically on startup.

### 3. Configure `application.properties`
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/mental_health_db?...
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD

spring.mail.username=your_gmail@gmail.com
spring.mail.password=YOUR_APP_PASSWORD   # Gmail App Password (not your real password)
```

#### Gmail App Password setup:
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Security → 2-Step Verification (enable if not already)
3. Security → App Passwords → Generate for "Mail"
4. Paste the 16-character password into `application.properties`

### 4. Run
```bash
mvn spring-boot:run
```
Server starts at **http://localhost:8080**

---

## 📡 API Reference

### Authentication

The system supports **two parallel login methods**:

| Method | When to use |
|---|---|
| **OTP login** | Quick access — no password needed, just email + OTP |
| **Password login** | Standard login after registering with a password |

---

#### `POST /auth/register` — Register with password
Creates a new account and sends an OTP to verify the email.
```json
{ "name": "Riya Sharma", "email": "riya@example.com", "password": "MyPass@123" }
```
Response:
```json
{ "success": true, "message": "Registration successful! An OTP has been sent to riya@example.com. Please verify your email to activate your account.", "data": null }
```

---

#### `POST /auth/send-otp` — Request OTP (OTP-only login)
For existing users who want to log in without a password, or to re-verify.
```json
{ "email": "riya@example.com" }
```

---

#### `POST /auth/verify-otp` — Verify OTP
Activates account after registration OR completes an OTP-only login.
```json
{ "email": "riya@example.com", "otp": "483921" }
```
Response:
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": { "userId": 1, "name": "Riya Sharma", "email": "riya@example.com", "message": "OTP verified successfully! Welcome, Riya Sharma" }
}
```

---

#### `POST /auth/login` — Password login
Standard email + BCrypt-verified password login.
```json
{ "email": "riya@example.com", "password": "MyPass@123" }
```
Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": { "userId": 1, "name": "Riya Sharma", "email": "riya@example.com", "message": "Login successful! Welcome back, Riya Sharma" }
}
```

---

#### `POST /auth/change-password` — Change password
Requires the current password for verification.
```json
{ "userId": 1, "currentPassword": "MyPass@123", "newPassword": "NewPass@456" }
```
Response:
```json
{ "success": true, "message": "Password changed successfully.", "data": null }
```

---

#### `POST /auth/forgot-password?email=riya@example.com` — Forgot password
Decrypts the AES-256 stored copy and emails the original password to the user.
```
POST /auth/forgot-password?email=riya@example.com
```
Response:
```json
{ "success": true, "message": "Your password has been sent to your registered email address.", "data": null }
```

---

### Prediction

#### `POST /api/predict`
Run the mental health assessment:
```json
{
  "userId": 1,
  "age": 20,
  "gender": "Female",
  "sleepHours": 5.0,
  "screenTimeHours": 9.0,
  "socialMediaHours": 4.0,
  "gamingHours": 1.0,
  "studyHoursPerDay": 7.0,
  "playTimeHoursPerDay": 1.0,
  "exercisePerWeek": 1,
  "academicStress": 8,
  "socialSupport": 3,
  "concentrationProblem": 7,
  "feelsLonely": 6,
  "feelsHopeless": 5,
  "overthinking": 8,
  "timeWaste": 6,
  "distractionLevel": 7,
  "drugUsage": false,
  "foodAddiction": false,
  "hypertension": false
}
```
Response:
```json
{
  "success": true,
  "message": "Prediction completed",
  "data": {
    "riskLevel": "High",
    "score": 74,
    "suggestions": [
      "🆘 Please consider speaking with a mental health counselor or therapist immediately.",
      "😴 You're sleeping less than 6 hours. Aim for 7–9 hours of quality sleep per night.",
      "📚 High academic stress detected. Try the Pomodoro technique: 25 min study + 5 min break.",
      "📱 Your screen time is very high. Use app timers and take a 20-20-20 eye break rule.",
      "🏃 You're barely exercising. Even a 20-minute walk daily can significantly improve mood."
    ],
    "testResultId": 12
  }
}
```

---

### History & Reports

#### `GET /api/history/{userId}`
All past tests for a user (newest first):
```
GET /api/history/1
```

#### `GET /api/report/{id}`
Full detail for one test result:
```
GET /api/report/12
```

---

## 🤖 ML Model Integration

By default the app uses a **built-in weighted scoring algorithm**. To connect your own Python/FastAPI model:

1. Set in `application.properties`:
   ```properties
   app.ml.model-url=http://localhost:5000/predict
   ```

2. Your ML service must accept a `POST` request with all the input fields and return:
   ```json
   { "risk_level": "High", "score": 78 }
   ```

If the external model is unreachable, the app **automatically falls back** to the built-in scorer.

---

## 🧮 Built-in Scoring Algorithm

| Factor | Weight | Notes |
|---|---|---|
| Academic Stress (1–10) | ×2.0 | Major contributor |
| Feels Hopeless (1–10) | ×2.0 | Major contributor |
| Overthinking (1–10) | ×1.5 | High impact |
| Concentration Problems | ×1.0 | Medium impact |
| Feels Lonely | ×1.0 | Medium impact |
| Social Support | −×1.0 | Protective factor |
| Sleep < 6 hrs | +10 pts | |
| Screen time > 8 hrs | +8 pts | |
| Exercise ≥ 4 days/wk | −8 pts | Protective |
| Drug Usage | +15 pts | High risk |
| Hypertension | +8 pts | |

**Risk Levels:** Low (0–34) · Medium (35–59) · High (60–100)

---

## 🔐 Password Security Architecture

The system uses **two complementary techniques** for password storage:

### 1. BCrypt Hash — for login verification (one-way)

```
User password "MyPass@123"
        │
        ▼
BCryptPasswordEncoder(strength=12)
        │
        ▼
"$2a$12$abc...xyz"  ← stored in password_hash column
```

- **One-way** — the original password cannot be recovered from this hash
- BCrypt automatically generates and embeds a **random salt** per-user
- Strength 12 = ~250ms per check — fast for users, very slow for attackers
- Used for: `POST /auth/login` and `POST /auth/change-password` verification

### 2. AES-256-CBC Encryption — for password recovery (two-way)

```
User password "MyPass@123"
        │
        ▼
AES-256-CBC ( key = PBKDF2(app.encryption.secret-key) + random IV )
        │
        ▼
Base64( IV || Ciphertext )  ← stored in password_encrypted column
```

- **Reversible** — can be decrypted back to the original plaintext
- Each encryption uses a **new random 16-byte IV** — same password produces different ciphertext each time
- Key is derived from your `app.encryption.secret-key` using **PBKDF2WithHmacSHA256** (65536 iterations)
- Used ONLY for: `POST /auth/forgot-password` — decrypts and emails the original password

### What's stored in the database

| Column | Content | Algorithm | Purpose |
|---|---|---|---|
| `password_hash` | `$2a$12$...` | BCrypt (one-way) | Login verification |
| `password_encrypted` | `Base64(IV\|\|cipher)` | AES-256-CBC (two-way) | Password recovery email |
| `password_set` | `true/false` | — | Whether user has a password |

### Production checklist
- Change `app.encryption.secret-key` to a strong random value
- Store the secret key in environment variables, not in source code
- Use HTTPS in production so passwords are never sent in plaintext over the wire
- Consider rotating the encryption key periodically (requires re-encrypting all `password_encrypted` values)
