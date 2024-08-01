// src/components/VideoGenerator.js
'use client';

import {useState} from 'react';
import axios from 'axios';

const VideoGenerator = () => {
    const [text, setText] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        setText(e.target.value);
    };

    const handleButtonClick = async () => {
        setLoading(true);

        try {
            // Step 1: Generate Story
            const storyResponse = await axios.post('/api/generate-story', {prompt: text});
            const story = storyResponse.data.story;

            // Step 2: Generate Segments
            const segmentsResponse = await axios.post('/api/generate-segments', {story});
            const segments = segmentsResponse.data.segments;

            // Step 3: Generate Images
            const imagesResponse = await axios.post('/api/generate-images', {segments});
            const images = imagesResponse.data.images;

            // Step 4: Convert Text to Speech
            const ttsResponse = await axios.post('/api/text-to-speech', {segments});
            const audioContents = ttsResponse.data.audioContents;

            // Step 5: Combine Images and Audio into a Video
            const combineResponse = await axios.post('/api/combine-media', {images, audioContents});
            setVideoUrl(combineResponse.data.videoUrl);
        } catch (error) {
            console.error('Error generating video:', error);
        }

        setLoading(false);
    };

    return (
        <div>
            <textarea
                value={text}
                onChange={handleInputChange}
                placeholder="Enter your text here..."
                rows="10"
                style={{width: '100%', fontSize: '16px'}}
            />
            <button
                onClick={handleButtonClick}
                disabled={loading}
                style={{display: 'block', marginTop: '20px', padding: '10px 20px', fontSize: '16px'}}
            >
                {loading ? 'Generating...' : 'Generate Video'}
            </button>
            {videoUrl && (
                <div style={{marginTop: '20px'}}>
                    <video controls style={{width: '100%'}}>
                        <source src={videoUrl} type="video/mp4"/>
                        Your browser does not support the video tag.
                    </video>
                </div>
            )}
        </div>
    );
};

export default VideoGenerator;

