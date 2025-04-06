CREATE TABLE models (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    version VARCHAR(20) NOT NULL,
    description TEXT,
    parameters JSONB,
    input_format VARCHAR(50) NOT NULL,
    output_format VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Populate with sample data
INSERT INTO models (name, type, version, description, parameters, input_format, output_format) VALUES
(
    'Whisper ASR', 
    'asr', 
    '1.0.0', 
    'Speech recognition model that converts audio to text.',
    '{"model_size": "medium", "language": "en", "beam_size": 5}',
    'audio/wav',
    'text/plain'
),
(
    'BERT OCR', 
    'ocr', 
    '2.1.3', 
    'Optical character recognition model for extracting text from images.',
    '{"resolution": "high", "language": "en", "preprocessing": true}',
    'image/png',
    'text/plain'
),
(
    'MarianMT English-Spanish', 
    'mt', 
    '1.5.2', 
    'Neural machine translation model for English to Spanish translation.',
    '{"beam_size": 4, "length_penalty": 0.6, "max_length": 200}',
    'text/plain',
    'text/plain'
),
(
    'MarianMT Spanish-English', 
    'mt', 
    '1.5.2', 
    'Neural machine translation model for Spanish to English translation.',
    '{"beam_size": 4, "length_penalty": 0.6, "max_length": 200}',
    'text/plain',
    'text/plain'
),
(
    'FastPitch TTS', 
    'tts', 
    '0.9.1', 
    'Text-to-speech synthesis model with natural-sounding voice.',
    '{"voice": "female", "speed": 1.0, "pitch": 0.0}',
    'text/plain',
    'audio/wav'
),
(
    'YOLOv8 Object Detection', 
    'input', 
    '8.0.0', 
    'Real-time object detection for identifying and localizing objects in images.',
    '{"confidence_threshold": 0.25, "iou_threshold": 0.45, "max_detections": 100}',
    'image/jpeg',
    'application/json'
),
(
    'Wav2Vec2 Audio Processing', 
    'input', 
    '2.0.1', 
    'Advanced audio feature extraction model for processing raw audio.',
    '{"sample_rate": 16000, "normalize": true, "return_attention": false}',
    'audio/wav',
    'application/json'
),
(
    'GPT-4 Text Generation', 
    'input', 
    '4.0', 
    'Large language model for text generation and completion.',
    '{"temperature": 0.7, "max_tokens": 1000, "top_p": 0.95}',
    'text/plain',
    'text/plain'
);