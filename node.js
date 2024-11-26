const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const AdmZip = require('adm-zip');
const sharp = require('sharp');
const { exec } = require('child_process');
const fileType = require('file-type');

const app = express();
const port = 3000;

// Ensure 'compressed' directory exists
const compressedDir = path.resolve(__dirname, 'compressed');
if (!fs.existsSync(compressedDir)) {
    fs.mkdirSync(compressedDir);
}

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public')); // Serve frontend files

// Serve homepage
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>File Compression</title>
        </head>
        <body>
            <h1>Upload a File for Compression</h1>
            <form action="/upload" method="POST" enctype="multipart/form-data">
                <label for="file">Choose a file:</label>
                <input type="file" id="file" name="file" required>
                <button type="submit">Upload</button>
            </form>
        </body>
        </html>
    `);
});

// Video Compression Function
const compressVideo = (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
        const command = `ffmpeg -y -i "${inputPath}" -vcodec libx264 -crf 28 "${outputPath}"`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('FFmpeg Error:', stderr);
                reject(error);
            } else {
                console.log('FFmpeg Output:', stdout);
                resolve(outputPath);
            }
        });
    });
};

// Image Compression Function
const compressImage = async (inputPath, outputPath) => {
    try {
        await sharp(inputPath)
            .resize({ width: 800 }) // Optional: Resize image
            .toFile(outputPath);
        console.log('Image compression successful');
    } catch (err) {
        console.error('Error compressing image:', err);
        throw new Error('Error compressing image');
    }
};

// PDF Compression Function
const compressPDF = async (inputPath, outputPath) => {
    try {
        const pdfBytes = fs.readFileSync(inputPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const newPdfDoc = await PDFDocument.create();
        const pages = await newPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
        pages.forEach((page) => newPdfDoc.addPage(page));
        const compressedBytes = await newPdfDoc.save({ useObjectStreams: true });
        fs.writeFileSync(outputPath, compressedBytes);
    } catch (err) {
        console.error('Error compressing PDF:', err);
        throw new Error('Error compressing PDF');
    }
};

// Word File Compression Function
const compressWordFile = async (inputPath, outputPath) => {
    try {
        const zip = new AdmZip(inputPath);
        const newZip = new AdmZip();

        zip.getEntries().forEach(entry => {
            newZip.addFile(entry.entryName, entry.getData());
        });

        newZip.writeZip(outputPath);
        console.log('Word file compression successful');
    } catch (err) {
        console.error('Error compressing Word file:', err);
        throw new Error('Error compressing Word file');
    }
};

// Handle file upload and compression
app.post('/upload', upload.single('file'), async (req, res) => {
    const filePath = path.resolve(req.file.path);
    const originalName = req.file.originalname;
    const compressedFilePath = path.resolve(compressedDir, `compressed_${originalName}`);

    try {
        const fileTypeResult = await fileType.fromFile(filePath);
        const fileExtension = fileTypeResult?.ext || path.extname(originalName).slice(1).toLowerCase();

        if (fileExtension === 'pdf') {
            await compressPDF(filePath, compressedFilePath);
        } else if (fileExtension === 'docx') {
            await compressWordFile(filePath, compressedFilePath);
        } else if (fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png') {
            await compressImage(filePath, compressedFilePath);
        } else if (fileExtension === 'mp4' || fileExtension === 'avi' || fileExtension === 'mov') {
            await compressVideo(filePath, compressedFilePath);
        } else {
            return res.status(400).send('Unsupported file type. Please upload a PDF, Word document, image, or video file.');
        }
        res.send(
            `File compressed successfully! <a href="/download/${path.basename(compressedFilePath)}" download>Download Compressed File</a>`
        );
    } catch (error) {
        console.error('Error compressing file:', error);
        return res.status(500).send('Error compressing file');
    } finally {
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error cleaning up uploaded file:', err);
        });
    }
});

// Route to serve compressed file for download
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.resolve(compressedDir, filename);

    res.download(filePath, (err) => {
        if (err) {
            console.error('Error in download:', err);
            return res.status(500).send('Error downloading file');
        }
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error cleaning up compressed file:', err);
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`File compression server listening at http://localhost:${port}`);
});
