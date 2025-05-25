import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { config } from "../config.js";
import fs from "fs";
import path from "path";

export type TTSToolRequest = {
  text: string;
};

export type TTSToolResponse = {
  result?: {
    filePath: string;  // path to the saved audio file
  };
  error?: unknown;
};

/**
 * `TTSTool` is a tool that converts text to speech using the TTS API.
 * It sends the text to the TTS API endpoint and saves the generated audio to a file.
 *
 * @param {TTSToolRequest} request - The request object containing the text to convert to speech.
 * @returns {Promise<TTSToolResponse>} - A promise that resolves to the audio file path.
 */
export async function TTSTool({
  text,
}: TTSToolRequest): Promise<TTSToolResponse> {
  try {
    const response = await fetch(`${config.ttsApiUrl}/api/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to convert text to speech');
    }

    // Create audio directory if it doesn't exist
    const audioDir = path.join(process.cwd(), 'audio');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    // Generate unique filename based on text
    const filename = `tts_${Date.now()}.wav`;
    const filePath = path.join(audioDir, filename);

    // Convert base64 to buffer and save to file
    const audioBuffer = Buffer.from(data.audio, 'base64');
    fs.writeFileSync(filePath, audioBuffer);

    return {
      result: {
        filePath,
      },
    };
  } catch (error: unknown) {
    return {
      error,
    };
  }
}

export const TTSToolTool = tool(TTSTool, {
  name: "TTSTool",
  description: "Converts text to speech using the TTS API. Generate a vocal response for the given text. Saves the audio to a file and returns the file path.",
  schema: z.object({
    text: z.string().describe("The text to convert to speech"),
  }),
});
