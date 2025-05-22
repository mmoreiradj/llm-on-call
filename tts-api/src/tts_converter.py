import sys
import os
import hashlib
from TTS.api import TTS

def get_audio_path(text):
    # Generate SHA-256 hash of the text
    text_hash = hashlib.sha256(text.encode('utf-8')).hexdigest()
    # Create path in the audio_cache directory
    cache_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'audio_cache')
    # Ensure the cache directory exists
    os.makedirs(cache_dir, exist_ok=True)
    # Get absolute path
    abs_path = os.path.abspath(os.path.join(cache_dir, f"{text_hash}.wav"))
    print(f"Cache directory: {cache_dir}", file=sys.stderr)
    print(f"Absolute file path: {abs_path}", file=sys.stderr)
    return abs_path

def text_to_speech(text):
    try:
        # Get the cache path for this text
        output_path = get_audio_path(text)
        
        # Check if the audio file already exists
        if os.path.exists(output_path):
            print(f"Found cached audio for text hash: {os.path.basename(output_path)}", file=sys.stderr)
            return output_path

        print("Initializing TTS...", file=sys.stderr)
        # Redirect stdout to stderr during TTS initialization
        original_stdout = sys.stdout
        sys.stdout = sys.stderr
        tts = TTS(model_name="tts_models/en/ljspeech/tacotron2-DDC")
        print("TTS initialized successfully", file=sys.stderr)

        print(f"Converting text: {text}", file=sys.stderr)
        # Generate speech and save to cache
        tts.tts_to_file(text=text, file_path=output_path)
        # Restore stdout
        sys.stdout = original_stdout
        
        # Verify the file was created
        if not os.path.exists(output_path):
            print(f"Error: File was not created at {output_path}", file=sys.stderr)
            return None
            
        # Verify the file has content
        if os.path.getsize(output_path) == 0:
            print(f"Error: File was created but is empty at {output_path}", file=sys.stderr)
            return None
            
        print(f"Speech generated and cached at: {output_path}", file=sys.stderr)
        return output_path
    except Exception as e:
        print("Error in text_to_speech:", str(e), file=sys.stderr)
        print("Full traceback:", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return None

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python tts_converter.py <text>", file=sys.stderr)
        sys.exit(1)
    
    text = sys.argv[1]
    output_path = text_to_speech(text)
    
    if output_path and os.path.exists(output_path) and os.path.getsize(output_path) > 0:
        # Only print the path to stdout, everything else goes to stderr
        print(output_path)
        sys.exit(0)
    else:
        print("Failed to generate audio file", file=sys.stderr)
        sys.exit(1) 