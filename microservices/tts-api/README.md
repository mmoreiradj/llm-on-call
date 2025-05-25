# TTS API

A Node.js API for Text-to-Speech and Speech-to-Text conversion built with TypeScript.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory and add your configuration:
```
PORT=3001
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

## Frontend

The API includes a simple web interface for testing both TTS and STT functionality. To access it:

1. Start the server:
```bash
npm start
```

2. Open your browser and navigate to:
```
http://localhost:3001
```

### Features
- **Text to Speech:**
  - Enter text in the textarea
  - Click "Convert to Speech" to generate audio
  - Play the generated audio directly in the browser

- **Speech to Text:**
  - Drag and drop a WAV file or click to select
  - View the transcription result below
  - Supports only WAV format files

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
- **Request Body:** Audio file (WAV format)
- **Response:** Transcribed text

## Development

The API is built with:
- TypeScript
- Express.js
- CORS for cross-origin requests
- dotenv for environment variables

### Python Dependencies
The API uses Python scripts for TTS and STT conversion. Make sure you have the following Python packages installed:
```bash
pip install TTS openai-whisper
```

### Caching System

The API implements a SHA-256 based caching system for TTS audio files to optimize performance:

1. **How it works:**
   - When text is submitted for TTS conversion, a SHA-256 hash is generated from the text
   - The hash is used as the filename for the audio file (e.g., `78de55bf5404f737a991b472126539288eea1e147058436dcba45bd0e7e84b37.wav`)
   - Files are stored in the `audio_cache` directory

2. **Benefits:**
   - **Performance:** Subsequent requests for the same text are served instantly from cache
   - **Storage Efficiency:** Each unique text generates only one audio file
   - **Persistence:** Cache persists across server restarts
   - **Deterministic:** Same text always generates the same hash, ensuring consistent caching

3. **Cache Location:**
   - Audio files are stored in the `audio_cache` directory
   - The directory is created automatically if it doesn't exist
   - Files are never automatically deleted, allowing for persistent caching

4. **Example:**
   ```python
   # First request for "Hello World"
   text = "Hello World"
   hash = hashlib.sha256(text.encode('utf-8')).hexdigest()
   # Generates: 185f8db32271fe25f561a6fc938b2e264306ec304eda518007d1764826381969.wav
   # File is generated and cached
   
   # Subsequent request for "Hello World"
   # Same hash is generated, file is served from cache
   ```

### Directory Structure
```
tts-api/
├── src/
│   ├── public/          # Frontend files
│   │   └── index.html   # Web interface
│   ├── tts_converter.py # TTS Python script
│   ├── stt_converter.py # STT Python script
│   └── index.ts         # API server
├── audio_cache/         # Cached audio files
└── uploads/            # Temporary upload directory
``` 