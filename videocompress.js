const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const compressVideo = (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .videoCodec('libx265')
            .outputOptions([
                '-preset medium',
                '-crf 28',          // Lower CRF for higher compression
                '-c:a aac',         // Audio codec
                '-b:a 96k',         // Lower audio bitrate
                '-movflags +faststart'
            ])
            .on('end', () => {
                console.log('Video compression completed');
                resolve();
            })
            .on('error', (err) => {
                console.error('Error compressing video:', err);
                reject(err);
            })
            .save(outputPath);
    });
};

module.exports = compressVideo;
