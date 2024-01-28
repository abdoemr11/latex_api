import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { exec } from "child_process";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";
import multer from "multer";
import { mkdirSync } from "fs";
const app = express();
const port = 3000;

const execAsync = promisify(exec);

//create temp dir
const tempDir = path.join(
    path.dirname(new URL(import.meta.url).pathname),
    "temp"
);
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
        const command = `pdflatex -interaction=batchmode -halt-on-error  -output-directory=${tempDir} -jobname=output ${latexFile.path} `;

        exec(command, (error, stdout, stderr) => {
            console.log("output is ", stdout);
            if (error) {
                console.error("command execusion Error: ", error);
                console.error("Standard Error: ", stderr);
                return res.status(500).json({ error: " .", stderr });
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
