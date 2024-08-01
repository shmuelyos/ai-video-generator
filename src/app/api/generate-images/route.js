// src/app/api/generate-images/route.js
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request) {
    const { segments } = await request.json();
    const debugMode = process.env.DEBUG_MODE === 'true';

    // Generate images for the segments
    const images = [];

    for (let index = 0; index < segments.length; index++) {
        const segment = segments[index];
        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({ prompt: segment }),
        });
        const data = await response.json();
        const imageVariants = data.data.map(image => image.url);
        images.push(imageVariants);

        // If DEBUG_MODE is true, store each image variant
        if (debugMode) {
            for (let variantIndex = 0; variantIndex < imageVariants.length; variantIndex++) {
                const imageUrl = imageVariants[variantIndex];
                const imageResponse = await fetch(imageUrl);
                const imageBuffer = await imageResponse.buffer();
                const filePath = path.join(process.cwd(), 'debug', `image_${Date.now()}_${index}_${variantIndex}.png`);
                await fs.mkdir(path.dirname(filePath), { recursive: true });
                await fs.writeFile(filePath, imageBuffer);
            }
        }
    }

    return NextResponse.json({ images });
}
