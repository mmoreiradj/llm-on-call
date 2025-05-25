import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { config } from "../config.js";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export type K8sVoiceToolRequest = {
  action: "check" | "wait_for_response";
};

export type K8sVoiceToolResponse = {
  result?: {
    status: "fixed" | "needs_help" | "waiting" | "error";
    message: string;
    audioPath?: string;
    transcriptPath?: string;
  };
  error?: unknown;
};

/**
 * `K8sVoiceTool` is a tool that checks for k8s cluster problems and handles voice interaction.
 * It can check for problems and wait for voice responses from users.
 *
 * @param {K8sVoiceToolRequest} request - The request object containing the action to perform.
 * @returns {Promise<K8sVoiceToolResponse>} - A promise that resolves to the status and any generated files.
 */
async function K8sVoiceTool({
  action,
}: K8sVoiceToolRequest): Promise<K8sVoiceToolResponse> {
  try {
    if (action === "check") {
      // Check k8s cluster status
      const { stdout: k8sStatus } = await execAsync("kubectl get pods --all-namespaces");
      
      // Check for any pods not in Running state
      const hasProblems = k8sStatus.split("\n").some(line => 
        line.includes("Error") || 
        line.includes("CrashLoopBackOff") || 
        line.includes("ImagePullBackOff")
      );

      if (hasProblems) {
        // Create audio directory if it doesn't exist
        const audioDir = path.join(process.cwd(), 'audio');
        if (!fs.existsSync(audioDir)) {
          fs.mkdirSync(audioDir, { recursive: true });
        }

        // Generate voice message about the problem
        const message = "I've detected some issues in the Kubernetes cluster. Could you please check the pods and let me know if you'll fix them?";
        const filename = `k8s_alert_${Date.now()}.wav`;
        const audioPath = path.join(audioDir, filename);

        // Call TTS API
        const ttsResponse = await fetch(`${config.ttsApiUrl}/api/tts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: message }),
        });

        const ttsData = await ttsResponse.json();
        if (!ttsData.success) {
          throw new Error(ttsData.error || 'Failed to generate voice message');
        }

        // Save the audio file
        const audioBuffer = Buffer.from(ttsData.audio, 'base64');
        fs.writeFileSync(audioPath, audioBuffer);

        return {
          result: {
            status: "needs_help",
            message: "Issues detected in k8s cluster. Voice message generated.",
            audioPath,
          },
        };
      }

      return {
        result: {
          status: "fixed",
          message: "No issues detected in k8s cluster.",
        },
      };
    } else if (action === "wait_for_response") {
      // Check for new audio files in the STT directory
      const sttDir = path.join(process.cwd(), 'stt');
      if (!fs.existsSync(sttDir)) {
        fs.mkdirSync(sttDir, { recursive: true });
      }

      const files = fs.readdirSync(sttDir);
      const audioFiles = files.filter(file => file.endsWith('.wav'));

      if (audioFiles.length === 0) {
        return {
          result: {
            status: "waiting",
            message: "No response received yet. Waiting for audio file in STT directory.",
          },
        };
      }

      // Process the most recent audio file
      const latestFile = audioFiles
        .map(file => ({ file, time: fs.statSync(path.join(sttDir, file)).mtime.getTime() }))
        .sort((a, b) => b.time - a.time)[0].file;

      const audioPath = path.join(sttDir, latestFile);

      // Create FormData
      const formData = new FormData();
      const fileBuffer = fs.readFileSync(audioPath);
      const blob = new Blob([fileBuffer], { type: 'audio/wav' });
      formData.append('audio', blob, latestFile);

      // Send to STT API
      const response = await fetch(`${config.ttsApiUrl}/api/stt`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to convert speech to text');
      }

      // Save transcript
      const transcriptsDir = path.join(process.cwd(), 'transcripts');
      if (!fs.existsSync(transcriptsDir)) {
        fs.mkdirSync(transcriptsDir, { recursive: true });
      }

      const transcriptPath = path.join(transcriptsDir, `response_${Date.now()}.txt`);
      fs.writeFileSync(transcriptPath, data.text);

      // Check if the response indicates the user will fix the issue
      const willFix = data.text.toLowerCase().includes("yes") || 
                     data.text.toLowerCase().includes("i'll fix") ||
                     data.text.toLowerCase().includes("i will fix");

      return {
        result: {
          status: willFix ? "fixed" : "needs_help",
          message: willFix ? "User will fix the issues." : "User needs more help.",
          transcriptPath,
        },
      };
    }

    throw new Error("Invalid action specified");
  } catch (error: unknown) {
    return {
      error,
    };
  }
}

export const K8sVoiceToolTool = tool(K8sVoiceTool, {
  name: "K8sVoiceTool",
  description: "Checks for k8s cluster problems and handles voice interaction. Can check for issues and wait for voice responses from users.",
  schema: z.object({
    action: z.enum(["check", "wait_for_response"]).describe("Action to perform: check for problems or wait for voice response"),
  }),
}); 