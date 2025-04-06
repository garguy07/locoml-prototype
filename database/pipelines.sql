CREATE TABLE pipelines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    nodes JSONB NOT NULL,
    edges JSONB NOT NULL,
    created_by INTEGER,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Populate with sample data
INSERT INTO pipelines (name, description, nodes, edges, created_by, is_public) VALUES
(
    'Speech Translation Pipeline',
    'A pipeline that transcribes audio, translates the text, and converts it back to speech',
    '[
        {
            "id": "node_1",
            "type": "customNode",
            "position": {"x": 100, "y": 200},
            "data": {
                "label": "Input",
                "color": "#d5f6fb"
            }
        },
        {
            "id": "node_2",
            "type": "customNode",
            "position": {"x": 300, "y": 200},
            "data": {
                "label": "ASR",
                "color": "#ebccff"
            }
        },
        {
            "id": "node_3",
            "type": "customNode",
            "position": {"x": 500, "y": 200},
            "data": {
                "label": "MT",
                "color": "#d1feb8"
            }
        },
        {
            "id": "node_4",
            "type": "customNode",
            "position": {"x": 700, "y": 200},
            "data": {
                "label": "TTS",
                "color": "#f6f3a9"
            }
        }
    ]',
    '[
        {
            "id": "enode_1-node_2",
            "source": "node_1",
            "target": "node_2",
            "type": "default",
            "animated": true
        },
        {
            "id": "enode_2-node_3",
            "source": "node_2",
            "target": "node_3",
            "type": "default",
            "animated": true
        },
        {
            "id": "enode_3-node_4",
            "source": "node_3",
            "target": "node_4",
            "type": "default",
            "animated": true
        }
    ]',
    1,
    true
),
(
    'Document Processing Flow',
    'Extract text from images and translate it',
    '[
        {
            "id": "node_1",
            "type": "customNode",
            "position": {"x": 100, "y": 200},
            "data": {
                "label": "Input",
                "color": "#d5f6fb"
            }
        },
        {
            "id": "node_2",
            "type": "customNode",
            "position": {"x": 300, "y": 200},
            "data": {
                "label": "OCR",
                "color": "#ffcae9"
            }
        },
        {
            "id": "node_3",
            "type": "customNode",
            "position": {"x": 500, "y": 200},
            "data": {
                "label": "MT",
                "color": "#d1feb8"
            }
        }
    ]',
    '[
        {
            "id": "enode_1-node_2",
            "source": "node_1",
            "target": "node_2",
            "type": "default",
            "animated": true
        },
        {
            "id": "enode_2-node_3",
            "source": "node_2",
            "target": "node_3",
            "type": "default",
            "animated": true
        }
    ]',
    2,
    true
),
(
    'Audio Transcription Service',
    'Simple pipeline that converts speech to text',
    '[
        {
            "id": "node_1",
            "type": "customNode",
            "position": {"x": 100, "y": 200},
            "data": {
                "label": "Input",
                "color": "#d5f6fb"
            }
        },
        {
            "id": "node_2",
            "type": "customNode",
            "position": {"x": 300, "y": 200},
            "data": {
                "label": "ASR",
                "color": "#ebccff"
            }
        }
    ]',
    '[
        {
            "id": "enode_1-node_2",
            "source": "node_1",
            "target": "node_2",
            "type": "default",
            "animated": true
        }
    ]',
    3,
    false
),
(
    'Image to Speech',
    'Extract text from images and convert it to audio',
    '[
        {
            "id": "node_1",
            "type": "customNode",
            "position": {"x": 100, "y": 200},
            "data": {
                "label": "Input",
                "color": "#d5f6fb"
            }
        },
        {
            "id": "node_2",
            "type": "customNode",
            "position": {"x": 300, "y": 200},
            "data": {
                "label": "OCR",
                "color": "#ffcae9"
            }
        },
        {
            "id": "node_3",
            "type": "customNode",
            "position": {"x": 500, "y": 200},
            "data": {
                "label": "TTS",
                "color": "#f6f3a9"
            }
        }
    ]',
    '[
        {
            "id": "enode_1-node_2",
            "source": "node_1",
            "target": "node_2",
            "type": "default",
            "animated": true
        },
        {
            "id": "enode_2-node_3",
            "source": "node_2",
            "target": "node_3",
            "type": "default",
            "animated": true
        }
    ]',
    1,
    true
),
(
    'Multilingual Audio Chain',
    'Convert speech from one language to another via text',
    '[
        {
            "id": "node_1",
            "type": "customNode",
            "position": {"x": 100, "y": 150},
            "data": {
                "label": "Input",
                "color": "#d5f6fb"
            }
        },
        {
            "id": "node_2",
            "type": "customNode",
            "position": {"x": 300, "y": 150},
            "data": {
                "label": "ASR",
                "color": "#ebccff"
            }
        },
        {
            "id": "node_3",
            "type": "customNode",
            "position": {"x": 500, "y": 150},
            "data": {
                "label": "MT",
                "color": "#d1feb8"
            }
        },
        {
            "id": "node_4",
            "type": "customNode",
            "position": {"x": 500, "y": 300},
            "data": {
                "label": "MT",
                "color": "#d1feb8"
            }
        },
        {
            "id": "node_5",
            "type": "customNode",
            "position": {"x": 700, "y": 225},
            "data": {
                "label": "TTS",
                "color": "#f6f3a9"
            }
        }
    ]',
    '[
        {
            "id": "enode_1-node_2",
            "source": "node_1",
            "target": "node_2",
            "type": "default",
            "animated": true
        },
        {
            "id": "enode_2-node_3",
            "source": "node_2",
            "target": "node_3",
            "type": "default",
            "animated": true
        },
        {
            "id": "enode_2-node_4",
            "source": "node_2",
            "target": "node_4",
            "type": "default",
            "animated": true
        },
        {
            "id": "enode_3-node_5",
            "source": "node_3",
            "target": "node_5",
            "type": "default",
            "animated": true
        },
        {
            "id": "enode_4-node_5",
            "source": "node_4",
            "target": "node_5",
            "type": "default",
            "animated": true
        }
    ]',
    2,
    false
);