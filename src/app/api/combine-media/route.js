// src/app/api/combine-media/route.js
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request) {
    const { images, audioContents } = await request.json();
    const debugMode = process.env.DEBUG_MODE === 'true';

    const tempDir = path.join(process.cwd(), 'temp');
    const finalDir = path.join(process.cwd(), 'final_products');
    await fs.mkdir(tempDir, { recursive: true });
    await fs.mkdir(finalDir, { recursive: true });

    const audioPaths = [];
    const imagePaths = [];

    // Save audio contents and images
    for (let i = 0; i < audioContents.length; i++) {
        // Save audio file
        const audioPath = path.join(tempDir, `audio_${i}.mp3`);
        const audioBuffer = Buffer.from(audioContents[i], 'base64');
        await fs.writeFile(audioPath, audioBuffer);
        audioPaths.push(audioPath);

        // Save image file
        const imageUrl = Array.isArray(images[i]) ? images[i][0] : images[i];
        const imagePath = path.join(tempDir, `image_${i}.png`);
        const response = await fetch(imageUrl);
        const imageBuffer = await response.buffer();
        await fs.writeFile(imagePath, imageBuffer);
        imagePaths.push(imagePath);
    }


    // Create individual video segments for each audio-image pair
    const segmentPaths = [];
    for (let i = 0; i < audioPaths.length; i++) {
        const segmentPath = path.join(tempDir, `segment_${i}.mp4`);
        const ffmpegCommand = `ffmpeg -loop 1 -i ${imagePaths[i]} -i ${audioPaths[i]} -c:v libx264 -c:a aac -strict experimental -b:a 192k -shortest ${segmentPath}`;
        await new Promise((resolve, reject) => {
            exec(ffmpegCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing ffmpeg: ${error.message}`);
                    reject(error);
                } else {
                    console.log(`ffmpeg output: ${stdout}`);
                    console.error(`ffmpeg stderr: ${stderr}`);
                    resolve();
                }
            });
        });
        segmentPaths.push(segmentPath);
    }

    // Concatenate all segments into a final video
    const videoListPath = path.join(tempDir, 'video_list.txt');
    const videoPath = path.join(finalDir, `output_${Date.now()}.mp4`);
    await fs.writeFile(videoListPath, segmentPaths.map(p => `file '${p}'`).join('\n'));

    const concatCommand = `ffmpeg -f concat -safe 0 -i ${videoListPath} -c copy ${videoPath}`;
    await new Promise((resolve, reject) => {
        exec(concatCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing ffmpeg: ${error.message}`);
                reject(error);
            } else {
                console.log(`ffmpeg output: ${stdout}`);
                console.error(`ffmpeg stderr: ${stderr}`);
                resolve();
            }
        });
    });

    // Clean up temporary files
    for (const path of [...audioPaths, ...imagePaths, ...segmentPaths, videoListPath]) {
        await fs.unlink(path);
    }

    if (debugMode) {
        const debugVideoPath = path.join(process.cwd(), 'debug', `video_${Date.now()}.mp4`);
        await fs.mkdir(path.dirname(debugVideoPath), { recursive: true });
        await fs.copyFile(videoPath, debugVideoPath);
    }

    return NextResponse.json({ videoUrl: videoPath });
}
