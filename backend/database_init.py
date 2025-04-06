from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json
import os

# Initialize Flask app
app = Flask(__name__)

# Set up SQLAlchemy
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///pipeline_platform.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {"connect_args": {"check_same_thread": False}}
db = SQLAlchemy(app)


# Models
class Pipeline(db.Model):
    __tablename__ = "pipelines"

    id = db.Column(db.String(36), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    nodes = db.Column(db.Text, nullable=False)  # JSON serialized nodes
    edges = db.Column(db.Text, nullable=False)  # JSON serialized edges
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    def __init__(self, id, name, description=None, nodes=None, edges=None):
        self.id = id
        self.name = name
        self.description = description
        self.nodes = json.dumps(nodes or [])
        self.edges = json.dumps(edges or [])

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "nodes": json.loads(self.nodes),
            "edges": json.loads(self.edges),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Model(db.Model):
    __tablename__ = "models"

    id = db.Column(db.String(36), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    model_type = db.Column(
        db.String(50), nullable=False
    )  # e.g., 'classification', 'regression', etc.
    version = db.Column(db.String(20), nullable=False)
    file_path = db.Column(db.String(255), nullable=True)  # Path to saved model file
    parameters = db.Column(db.Text, nullable=True)  # JSON serialized parameters
    metrics = db.Column(db.Text, nullable=True)  # JSON serialized metrics
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    def __init__(
        self,
        id,
        name,
        model_type,
        version,
        description=None,
        file_path=None,
        parameters=None,
        metrics=None,
    ):
        self.id = id
        self.name = name
        self.description = description
        self.model_type = model_type
        self.version = version
        self.file_path = file_path
        self.parameters = json.dumps(parameters or {})
        self.metrics = json.dumps(metrics or {})

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "model_type": self.model_type,
            "version": self.version,
            "file_path": self.file_path,
            "parameters": json.loads(self.parameters),
            "metrics": json.loads(self.metrics),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


# Create the database and tables
def init_db():
    # Create a models directory if it doesn't exist
    if not os.path.exists("models"):
        os.makedirs("models")

    # Create the database
    db.create_all()
    print("Databases initialized successfully!")


if __name__ == "__main__":
    with app.app_context():
        init_db()
