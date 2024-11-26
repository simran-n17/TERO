package html.file_compression;
// H.264 (libx264) video codec algo.
import java.io.*;
import java.util.concurrent.TimeUnit;

public class FFmpegVideoCompressor {

    public static void compressVideo(String inputFilePath, String outputFilePath) throws IOException, InterruptedException {
        // Ensure full path to ffmpeg is used, or ensure ffmpeg is in PATH
        String ffmpegPath = "ffmpeg"; // Replace with full path to ffmpeg if required
        String[] command = {
            ffmpegPath, "-y", // Overwrite output without asking
            "-i", inputFilePath, // Input file
            "-vcodec", "libx264", // Video codec
            "-crf", "28", // Compression rate factor (lower is better quality)
            "-preset", "ultrafast", // Faster compression
            outputFilePath // Output file
        };

        System.out.println("Running command: " + String.join(" ", command));

        ProcessBuilder processBuilder = new ProcessBuilder(command);
        processBuilder.redirectErrorStream(true); // Combine stdout and stderr

        Process process = processBuilder.start();

        // Capture FFmpeg's output
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println("FFmpeg Output: " + line);
            }
        }

        // Wait for the process to complete or timeout
        boolean finished = process.waitFor(10, TimeUnit.MINUTES);
        if (!finished) {
            process.destroyForcibly();
            throw new RuntimeException("FFmpeg process timed out.");
        }

        int exitCode = process.exitValue();
        if (exitCode != 0) {
            throw new RuntimeException("FFmpeg failed with exit code: " + exitCode);
        }

        System.out.println("Video compression completed successfully.");
    }

    public static void main(String[] args) {
        if (args.length < 2) {
            System.out.println("Usage: java FFmpegVideoCompressor <inputFilePath> <outputFilePath>");
            return;
        }

        String inputFilePath = args[0];
        String outputFilePath = args[1];

        try {
            compressVideo(inputFilePath, outputFilePath);
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }
}
