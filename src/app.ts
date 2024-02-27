import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { exec } from "child_process";
import path, { dirname, join } from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";
import multer from "multer";
import { mkdirSync } from "fs";
const app = express();
const port = 3000;

const extractErrorMessage = (output: string): string | null => {
    const lines = output.split("\n");
    for (const line of lines) {
        if (line.startsWith("! ")) {
            // Found an error message line
            return line.substring(2); // Remove the "!" prefix
        }
    }
    return null; // No error message found
};

const execAsync = promisify(exec);

//create temp dir

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tempDir = join(__dirname, "temp");
mkdirSync(tempDir, { recursive: true });
const upload = multer({ dest: tempDir });

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

// POST endpoint to generate PDF from LaTeX
app.post(
    "/api/latex-to-pdf",
    upload.single("latexFile"),
    async (req: Request, res: Response) => {
        const latexFile = req.file;
        if (!latexFile) {
            return res
                .status(400)
                .json({ error: "Missing LaTeX file in the request body." });
        }
        console.log("The uploaded path", latexFile.path);
        const command = `pdflatex -interaction=nonstopmode -halt-on-error  -output-directory=${tempDir} -jobname=output ${latexFile.path} `;

        exec(command, (error, stdout, stderr) => {
            console.log("output is ", stdout);
            if (error) {
                const executionErrorMsg = "Command execusion Error: " + error;
                const standardErrorMsg = "Standard Error: " + stderr;
                console.log(stdout);
                console.log(extractErrorMessage(stdout));
                return res.status(500).json({
                    error: executionErrorMsg,
                    stderr: standardErrorMsg,
                    extractedError: extractErrorMessage(stdout),
                });
            }

            res.status(200).sendFile("output.pdf", { root: tempDir });
        });
    }
);
app.get("/api/health", (req: Request, res: Response) => {
    console.log("The app is up and running");
    res.status(200).json({ status: "ok" });
});
// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
