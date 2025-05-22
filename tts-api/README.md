# TTS API

A Node.js API for Text-to-Speech and Speech-to-Text conversion built with TypeScript.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory and add your configuration:
```
PORT=3000
```

3. Development:
```bash
# Run in development mode with hot reload
npm run dev

# Build the project
npm run build

# Run in production mode
npm start
```

## API Endpoints

### Text to Speech (TTS)
- **Endpoint:** `POST /api/tts`
- **Request Body:**
  ```json
  {
    "text": "Text to convert to speech"
  }
  ```
- **Response:** Base64 encoded audio

### Speech to Text (STT)
- **Endpoint:** `POST /api/stt`
- **Request Body:** Audio file
- **Response:** Transcribed text

## Development

The API is built with:
- TypeScript
- Express.js
- CORS for cross-origin requests
- dotenv for environment variables 