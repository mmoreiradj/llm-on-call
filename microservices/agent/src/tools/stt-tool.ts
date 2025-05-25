import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { config } from "../config.js";
import fs from "fs";
import path from "path";

export type STTToolRequest = {
  audioFilePath: string;
};

export type STTToolResponse = {
  result?: {
    text: string;
    textFilePath: string;  // path to the saved text file
  };
  error?: unknown;
};

/**
 * `STTTool` is a tool that converts speech to text using the TTS API.
 * It sends an audio file to the STT API endpoint and saves the transcribed text to a file.
 *
 * @param {STTToolRequest} request - The request object containing the path to the audio file.
 * @returns {Promise<STTToolResponse>} - A promise that resolves to the transcribed text and file path.
 */
export async function STTTool({
  audioFilePath,
}: STTToolRequest): Promise<STTToolResponse> {
  try {
    // Verify the audio file exists
    if (!fs.existsSync(audioFilePath)) {
      throw new Error(`Audio file not found at path: ${audioFilePath}`);
    }

    // Read the audio file
    const audioBuffer = fs.readFileSync(audioFilePath);
    
    // Create form data manually
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const formData = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="audio"; filename="audio.wav"',
      'Content-Type: audio/wav',
      '',
      audioBuffer,
      `--${boundary}--`,
    ].join('\r\n');

    const response = await fetch(`${config.ttsApiUrl}/api/stt`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to convert speech to text');
    }

    // Create transcripts directory if it doesn't exist
    const transcriptsDir = path.join(process.cwd(), 'transcripts');
    if (!fs.existsSync(transcriptsDir)) {
      fs.mkdirSync(transcriptsDir, { recursive: true });
    }

    // Generate unique filename based on timestamp
    const filename = `transcript_${Date.now()}.txt`;
    const textFilePath = path.join(transcriptsDir, filename);

    // Save the transcribed text to a file
    fs.writeFileSync(textFilePath, data.text);

    return {
      result: {
        text: data.text,
        textFilePath,
      },
    };
  } catch (error: unknown) {
    return {
      error,
    };
  }
}

export const STTToolTool = tool(STTTool, {
  name: "STTTool",
  description: "Converts speech to text using the TTS API. Takes an audio file path, transcribes it, and saves the text to a file.",
  schema: z.object({
    audioFilePath: z.string().describe("Path to the audio file to transcribe"),
  }),
}); 