// src/app/api/text-to-speech/route.js
import { NextResponse } from 'next/server';
import { detect } from 'langdetect';
import { promises as fs } from 'fs';
import path from 'path';

// Mapping of detected languages to Google TTS language codes and default voice names
const languageMap = {
    'en': { languageCode: 'en-US', voiceName: 'en-US-Wavenet-D' },
    'es': { languageCode: 'es-ES', voiceName: 'es-ES-Standard-A' },
    'fr': { languageCode: 'fr-FR', voiceName: 'fr-FR-Wavenet-A' },
    'de': { languageCode: 'de-DE', voiceName: 'de-DE-Wavenet-A' },
    'zh': { languageCode: 'zh-CN', voiceName: 'cmn-CN-Wavenet-A' },
    'he': { languageCode: 'he-IL', voiceName: 'he-IL-Wavenet-A' },
    // Add more mappings as needed
};

export async function POST(request) {
    const { segments } = await request.json();
    const debugMode = process.env.DEBUG_MODE === 'true';
    const audioContents = [];

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];

        // Detect the language of the input text
        const detectedLang = detect(segment)[0].lang;
        const { languageCode, voiceName } = languageMap[detectedLang] || languageMap['en'];

        const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                input: { text: segment },
                voice: { languageCode, name: voiceName },
                audioConfig: { audioEncoding: 'MP3' },
            }),
        });

        const data = await response.json();
        const audioContent = data.audioContent;
        audioContents.push(audioContent);

        // Write the audio content to a file if DEBUG_MODE is true
        if (debugMode) {
            const filePath = path.join(process.cwd(), 'debug', `audio_${Date.now()}_${i}.mp3`);
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            const audioBuffer = Buffer.from(audioContent, 'base64');
            await fs.writeFile(filePath, audioBuffer);
        }
    }

    return NextResponse.json({ audioContents });
}
