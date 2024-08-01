// src/app/api/generate-story/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
    const { prompt } = await request.json();
    const minLetters = process.env.MIN_LETTERS || 1000;
    let instruction = '';

    if (prompt.length > minLetters) {
        instruction = `Refine the following story (return a story written in the same input language). Ensure the text is error-free and the details are more vivid without drastically changing the story. If the story is well-detailed, return it as it is.`;
    } else {
        instruction = `Refine the following story (return a story written in the same input language). Ensure the text is error-free and the details are more vivid without drastically changing the story. Make it longer by using your creativity. It should reach about ${minLetters} letters in total.`;
    }

    // Add an instruction to split the story into segments
    instruction += `\nPlease return the story in segments, where each segment is separated by a delimiter '###'.`;

    const fullPrompt = `${instruction}\n\n${prompt}`;

    const response = await fetch('https://api.openai.com/v1/engines/davinci-codex/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            prompt: fullPrompt,
            max_tokens: parseInt(process.env.OPEN_AI_MAX_TOKENS,10),
        }),
    });

    const data = await response.json();
    const story = data.choices[0].text;

    return NextResponse.json({ story });
}
