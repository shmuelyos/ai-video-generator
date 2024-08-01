# Video Generator

This project generates a video based on a user-provided text input. The text is refined, split into segments, converted into images and audio, and finally combined into a video. The project leverages OpenAI's GPT-3 for text processing, DALL-E for image generation, and Google's Text-to-Speech API for audio synthesis.

## Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Debug Mode](#debug-mode)
- [License](#license)

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/your-repo/video-generator.git
    cd video-generator
    ```

2. Install dependencies:
    ```bash
    pnpm install
    ```

3. Install Python dependencies for language detection:
    ```bash
    pip install langdetect
    ```

## Environment Variables

Create a `.env.local` file in the root directory of your project and add the following environment variables:

```env
OPENAI_API_KEY=your_actual_openai_api_key
GOOGLE_API_KEY=your_actual_google_api_key
NUM_OF_IMAGES=10  # Number of images/segments
MIN_LETTERS=1000
OPEN_AI_MAX_TOKENS=3500
DEBUG_MODE=true  # Set to true to enable debug mode
```

## Usage

1. Start the development server:
    ```bash
    pnpm dev
    ```

2. Open your browser and navigate to `http://localhost:3000`.

3. Enter the text you want to convert into a video and click "Generate Video".

## API Endpoints

### `/api/generate-story`
- **Method**: `POST`
- **Description**: Refines the input text and splits it into segments.
- **Request Body**:
    ```json
    {
        "prompt": "Your text input here"
    }
    ```
- **Response**:
    ```json
    {
        "story": "Refined story with segments separated by '###'"
    }
    ```

### `/api/generate-segments`
- **Method**: `POST`
- **Description**: Splits the story into segments based on the number of images.
- **Request Body**:
    ```json
    {
        "story": "Refined story with segments separated by '###'"
    }
    ```
- **Response**:
    ```json
    {
        "segments": ["Segment 1", "Segment 2", "..."]
    }
    ```

### `/api/generate-images`
- **Method**: `POST`
- **Description**: Generates images based on the text segments.
- **Request Body**:
    ```json
    {
        "segments": ["Segment 1", "Segment 2", "..."]
    }
    ```
- **Response**:
    ```json
    {
        "images": [["image_variant_1_url"], ["image_variant_2_url"], "..."]
    }
    ```

### `/api/text-to-speech`
- **Method**: `POST`
- **Description**: Converts text segments into speech.
- **Request Body**:
    ```json
    {
        "segments": ["Segment 1", "Segment 2", "..."]
    }
    ```
- **Response**:
    ```json
    {
        "audioContents": ["audio_content_base64_1", "audio_content_base64_2", "..."]
    }
    ```

### `/api/combine-media`
- **Method**: `POST`
- **Description**: Combines images and audio into a video.
- **Request Body**:
    ```json
    {
        "images": [["image_variant_1_url"], ["image_variant_2_url"], "..."],
        "audioContents": ["audio_content_base64_1", "audio_content_base64_2", "..."]
    }
    ```
- **Response**:
    ```json
    {
        "videoUrl": "path_to_generated_video.mp4"
    }
    ```

## Debug Mode

If `DEBUG_MODE` is set to `true`, all generated images and audio files will be stored in the `debug` directory for review.

## License

This project is licensed under the MIT License.
