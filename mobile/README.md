# Setu (सेतु) — Native Flutter Mobile Application

A production-grade native Flutter mobile client for **Setu (सेतु)** — the Civic Intelligence & Document Understanding Platform.

This mobile application directly interfaces with the existing Setu backend (`http://localhost:4000/api` or `http://10.0.2.2:4000/api` on Android emulators), sharing the exact same user identity system, server-persisted dossiers, public datasets, and civic resources.

---

## Architecture Overview

Setu Mobile is designed with a strict, maintainable layered architecture:

```
mobile/
├── android/                   # Native Android configuration (SDK 35, Permissions, CMake)
├── lib/
│   ├── main.dart              # Dependency injection, bootstrap, and multi-listenable root
│   ├── core/
│   │   ├── config/            # Platform-aware API configuration & runtime override
│   │   │   └── api_config.dart
│   │   ├── localization/      # English & Hindi dictionary, Locale & Font Scale providers
│   │   │   ├── app_translations.dart
│   │   │   └── locale_provider.dart
│   │   ├── services/          # Low-level platform hardware abstractions
│   │   │   ├── storage_service.dart     (FlutterSecureStorage + SharedPreferences fallback)
│   │   │   ├── audio_tts_service.dart   (FlutterTTS senior-friendly read-aloud)
│   │   │   └── voice_input_service.dart (State machine with pause, explicit analyse & cancel)
│   │   └── theme/             # Civic design system (Cobalt, Saffron, Jade, Ivory, Navy Slate)
│   │       ├── app_colors.dart
│   │       └── app_theme.dart
│   ├── data/
│   │   ├── models/            # Type-safe data contracts matching backend JSON schemas
│   │   │   ├── user_model.dart
│   │   │   ├── auth_response.dart
│   │   │   ├── understand_model.dart
│   │   │   ├── public_data_model.dart
│   │   │   ├── civic_resource_model.dart
│   │   │   └── saved_item_model.dart
│   │   ├── services/          # Central HTTP client with Bearer auth and session header injection
│   │   │   └── setu_api_client.dart
│   │   └── repositories/      # Business logic and cross-session state orchestration
│   │       ├── auth_repository.dart
│   │       ├── understand_repository.dart
│   │       ├── public_data_repository.dart
│   │       ├── resources_repository.dart
│   │       └── saved_records_repository.dart
│   └── ui/
│       ├── home_navigation_shell.dart   # Bottom navigation shell with live backend health monitor
│       ├── core/widgets/                # Shared civic widgets
│       │   ├── setu_app_bar.dart
│       │   ├── status_banner.dart
│       │   ├── verified_badge.dart
│       │   ├── server_settings_dialog.dart
│       │   └── voice_control_sheet.dart
│       └── features/
│           ├── auth/views/auth_modal_sheet.dart         # 2-step OTP registration & sign-in
│           ├── understand/views/understand_screen.dart   # Primary document input & voice recording
│           ├── understand/views/case_file_view.dart     # 5-stage case file dossier
│           ├── public_data/views/public_data_screen.dart # Mandi, Hospitals, AQI, Exams
│           ├── resources/views/resources_screen.dart     # Curated Civic Directory
│           └── saved/views/saved_records_screen.dart     # Server-synced dossiers & offline viewer
└── test/
    ├── models_test.dart       # Serialization, deserialization, and schema integrity tests
    └── widget_test.dart       # Smoke tests for branding, localization, tabs, and font scaling
```

---

## Key Features

1. **Shared Authentication with Website:**
   - 2-step OTP registration and sign-in against `POST /api/auth/send-otp` and `POST /api/auth/verify-otp`.
   - Bearer token (`setu_<hex>`) stored in hardware-backed `FlutterSecureStorage` (Android Keystore).
   - Session restoration on launch via `GET /api/auth/me`.
   - Automatic logout and token revocation on 401 Unauthorized responses.
   - Cross-platform shared account: a record saved on web is immediately visible on mobile and vice-versa.

2. **Primary Workflow — 5-Stage Case File Dossier:**
   - Accepts legal/official notices, letters, complaints, and forms via text input or native document upload (PDF, PNG, JPG, WEBP, TXT up to 20MB).
   - Sends payload to backend `POST /api/understand` utilizing Google Gemini 2.5 Flash / Groq.
   - **Stage 1 — Plain-Language Summary:** Clear executive explanation with legal/medical disclaimer and emergency flags.
   - **Stage 2 — Unverified Information & Ambiguities:** Prominently lists items requiring independent verification.
   - **Stage 3 — Verifiable Evidence Quotes:** Exact verbatim quotes extracted directly from the uploaded document.
   - **Stage 4 — Legal & Bureaucratic Glossary:** Explains difficult terminology in plain language with pronunciation and civic significance.
   - **Stage 5 — Action Checklist & Matched Resources:** Step-by-step numbered checklist with deadlines, urgent caveats, and matched official civic resources.

3. **Accessibility & Linguistic Inclusivity (Senior-Friendly):**
   - Instant 1-tap switching between **English** and **Hindi (हिन्दी)** with full bilingual translations.
   - Built-in **3-stage font scaler** (A Normal 1.0x, A+ Large 1.15x, A++ Senior 1.3x) adapting the entire app typography.
   - WCAG AAA high-contrast color palette: Civic Cobalt (`#0C4A60`), Saffron (`#D97706`), Jade (`#059669`), Ivory Surface (`#FFFFFF`), Navy Slate (`#18181B`).
   - Native **Text-to-Speech (TTS)** read-aloud with play, pause, and stop controls.
   - Native **Voice Dictation** with controlled state machine: pause, resume, explicit Analyse, and Cancel (no accidental auto-submission on speech pauses).

4. **Public Data Explorer (`POST /api/find/query`):**
   - Daily Mandi Crop Prices (data.gov.in integration).
   - Public & PM-JAY Hospital Directory.
   - City Air Quality & Pollution (AQI).
   - Competitive Exams & Higher Education schedules.
   - Clear distinction between fresh live data and cached/mock data via visual badges.

5. **Curated Civic Directory (`GET /api/resources`):**
   - Searchable, category-filtered database of official government schemes, legal aid (NALSA), scholarships, and consumer helplines.
   - Direct launch of verified government URLs (`.gov.in`, `.nic.in`) via `url_launcher`.

6. **Flexible Backend Host Configuration:**
   - Platform-aware defaults: automatically uses `10.0.2.2:4000/api` when running inside the Android emulator, and `localhost:4000/api` on desktop/web.
   - Supports build-time configuration: `--dart-define=SETU_API_BASE_URL=https://your-backend.run.app/api`.
   - In-app **Server Settings Dialog** (via the app bar status pill) to switch endpoints on-the-fly without recompiling.

---

## Setup & Running Instructions

### Prerequisites
- Flutter SDK 3.24+ (tested on Flutter 3.47.7, Dart 3.13.5).
- Android SDK 34/35/36 installed (or Android Studio / VS Code).
- Setu Backend server running on port 4000 (`npm run dev` in the root repository).

### 1. Run in Development on Android Emulator
```bash
cd mobile
flutter pub get
flutter run
```
*Note: The Android emulator automatically routes `10.0.2.2:4000` to the host machine's port 4000.*

### 2. Run on a Physical Android Device
Find your computer's local Wi-Fi IP address (e.g. `192.168.1.15`), then run:
```bash
flutter run --dart-define=SETU_API_BASE_URL=http://192.168.1.15:4000/api
```
*(Alternatively, tap the Server Status pill in the app bar and enter the URL directly in the app).*

### 3. Run on Windows Desktop
```bash
flutter run -d windows
```

### 4. Run Static Analysis & Tests
```bash
# Static analysis (0 errors, 0 warnings)
dart analyze lib test

# Unit and widget test suite
flutter test
```

### 5. Build Release APK
```bash
flutter build apk --release --dart-define=SETU_API_BASE_URL=https://api.setu.gov.in/api
```
The resulting APK will be located at:
`build/app/outputs/flutter-apk/app-release.apk`
