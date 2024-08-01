// src/app/api/generate-segments/route.js
import {NextResponse} from 'next/server';

export async function POST(request) {
    const {story} = await request.json();
    const numOfSegments = process.env.NUM_OF_IMAGES || 10;
    // Split the story into sentences based on the delimiter '###'
    const sentences = story.split('###').map(str => str.trim());

    // Remove the first element if it is an empty string
    if (sentences[0] === '') {
        sentences.shift();
    }

    // Calculate the number of sentences per segment
    const sentencesPerSegment = Math.ceil(sentences.length / numOfSegments);

    // Generate segments by combining sentences
    const segments = [];
    for (let i = 0; i < sentences.length; i += sentencesPerSegment) {
        const segment = sentences.slice(i, i + sentencesPerSegment).join(' ');
        segments.push(segment);
    }

    return NextResponse.json({segments});
}
