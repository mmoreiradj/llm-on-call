import express, { Request, Response, RequestHandler } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { spawn } from "child_process";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import fs from "fs";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configure multer for file uploads
const upload = multer({ 
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'audio/wav' || file.originalname.toLowerCase().endsWith('.wav')) {
            cb(null, true);
        } else {
            cb(new Error('Only WAV files are allowed'));
        }
    }
});

// Types
interface TTSRequest {
    text: string;
}

// Text to Speech route
app.post("/api/tts", (async (req: Request<{}, any, TTSRequest>, res: Response) => {
    try {
        const { text } = req.body;
        console.log("Text", text);
        if (!text) {
            return res.status(400).json({ success: false, error: "Text is required" });
        }

        // Call Python script
        const pythonProcess = spawn('python3', [
            path.join(__dirname, 'tts_converter.py'),
            text
        ]);

        let output = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            error += data.toString();
            console.log('Python process log:', data.toString());
        });

        pythonProcess.on('close', async (code) => {
            if (code === 0) {
                const wavPath = output.trim();
                console.log('Audio file path:', wavPath);
                
                try {
                    // Verify the file exists and has content
                    if (!fs.existsSync(wavPath)) {
                        console.error('Audio file does not exist:', wavPath);
                        // List directory contents to help debug
                        const dir = path.dirname(wavPath);
                        console.log('Directory contents:', fs.readdirSync(dir));
                        return res.status(500).json({ success: false, error: 'Audio file was not created' });
                    }

                    const stats = fs.statSync(wavPath);
                    console.log('File stats:', stats);
                    
                    if (stats.size === 0) {
                        console.error('Audio file is empty:', wavPath);
                        return res.status(500).json({ success: false, error: 'Audio file is empty' });
                    }

                    // Read the WAV file and convert to base64
                    const wavBuffer = fs.readFileSync(wavPath);
                    console.log('File read successfully, size:', wavBuffer.length);
                    const base64Audio = wavBuffer.toString('base64');
                    
                    res.json({ success: true, audio: base64Audio });
                } catch (err) {
                    console.error('Error processing WAV file:', err);
                    // List directory contents to help debug
                    try {
                        const dir = path.dirname(wavPath);
                        console.log('Directory contents:', fs.readdirSync(dir));
                    } catch (dirErr) {
                        console.error('Error listing directory:', dirErr);
                    }
                    res.status(500).json({ 
                        success: false, 
                        error: 'Failed to process audio file',
                        details: err instanceof Error ? err.message : 'Unknown error'
                    });
                }
            } else {
                console.error('Python process error:', error);
                res.status(500).json({ 
                    success: false, 
                    error: 'Failed to convert text to speech',
                    details: error
                });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to convert text to speech',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}) as RequestHandler);

// Speech to Text route
app.post("/api/stt", upload.single('audio'), (async (req: Request & { file?: Express.Multer.File }, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'Audio file is required' });
    }

    try {
        console.log('Processing audio file:', req.file.path);
        const pythonProcess = spawn('python3', [
            path.join(__dirname, 'stt_converter.py'),
            req.file.path
        ]);

        let output = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            error += data.toString();
            console.log('Python process log:', data.toString());
        });

        pythonProcess.on('close', (code) => {
            // Clean up the uploaded file
            fs.unlink(req.file!.path, (err) => {
                if (err) console.error('Error deleting temporary file:', err);
            });

            if (code === 0) {
                res.json({ success: true, text: output.trim() });
            } else {
                console.error('Python process error:', error);
                res.status(500).json({ 
                    success: false, 
                    error: 'Failed to convert speech to text',
                    details: error
                });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to convert speech to text',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}) as RequestHandler);

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
