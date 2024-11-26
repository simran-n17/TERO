const sharp = require('sharp');

/**
 * Compresses an image file using lossless compression with Sharp.
 * @param {string} inputPath - Path to the input image file.
 * @param {string} outputPath - Path to save the compressed image file.
 * @returns {Promise} - Resolves when the image compression is complete.
 */
async function compressImage(inputPath, outputPath) {
    try {
        await sharp(inputPath)
            .toFormat('png') // Output as PNG for lossless compression
            .png({ compressionLevel: 9 }) // Set compression level
            .toFile(outputPath);
        console.log('Image compressed successfully:', outputPath);
    } catch (error) {
        console.error('Error during image compression:', error);
    }
}

module.exports = { compressImage };
