import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { exec } from "child_process";
import { dirname } from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 3000;

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

// POST endpoint to generate PDF from LaTeX
app.post("/api/latex-to-pdf", (req: Request, res: Response) => {
    const { latexString } = req.body;

    if (!latexString) {
        return res
            .status(400)
            .json({ error: "Missing LaTeX string in the request body." });
    }

    // Use pdflatex to compile LaTeX to PDF
    const command = `pdflatex -interaction=batchmode -halt-on-error`;
    exec(`which pdflatex`, (error, stdout, stderr) => {
        console.log(stdout);
        if (error) {
            console.log(error);
            return res
                .status(500)
                .json({ error: "Can't find pdflatex.", stderr });
        }
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        res.status(200).sendFile("output.pdf", { root: __dirname });
    });
    exec(`echo "${latexString}" | ${command}`, (error, stdout, stderr) => {
        console.log(stdout);
        if (error) {
            console.log(error);
            return res
                .status(500)
                .json({ error: "Error compiling LaTeX to PDF.", stderr });
        }

        res.status(200).sendFile("output.pdf", { root: __dirname });
    });
});
app.get("/api/health", (req: Request, res: Response) => {
    console.log("The app is up and running");
    res.status(200).json({ status: "ok" });
});
// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
