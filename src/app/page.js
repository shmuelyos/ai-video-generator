// src/app/page.js
import VideoGenerator from '@/components/VideoGenerator';

export default function HomePage() {
  return (
      <div style={{ padding: '20px' }}>
        <h1>Video Generator</h1>
        <VideoGenerator />
      </div>
  );
}
