import sys
import whisper

def speech_to_text(audio_path):
    try:
        print("Loading Whisper model...", file=sys.stderr)
        model = whisper.load_model("base")
        print("Model loaded successfully", file=sys.stderr)
        
        print(f"Transcribing audio file: {audio_path}", file=sys.stderr)
        result = model.transcribe(audio_path)
        print("Transcription completed", file=sys.stderr)
        
        # Only print the text to stdout
        print(result["text"])
        return True
    except Exception as e:
        print("Error in speech_to_text:", str(e), file=sys.stderr)
        print("Full traceback:", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return False

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python stt_converter.py <audio_file_path>", file=sys.stderr)
        sys.exit(1)
    
    audio_path = sys.argv[1]
    success = speech_to_text(audio_path)
    sys.exit(0 if success else 1) 