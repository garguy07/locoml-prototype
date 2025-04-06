from database_init import app, db, Pipeline, Model
import uuid
from datetime import datetime

# Sample data for pipelines
sample_pipelines = [
    {
        "id": str(uuid.uuid4()),
        "name": "Data Preprocessing Pipeline",
        "description": "A pipeline for cleaning and preprocessing data",
        "nodes": [
            {
                "id": "node1",
                "type": "dataLoader",
                "position": {"x": 100, "y": 100},
                "data": {"name": "CSV Loader"},
            },
            {
                "id": "node2",
                "type": "transform",
                "position": {"x": 300, "y": 100},
                "data": {"name": "Missing Value Imputer"},
            },
            {
                "id": "node3",
                "type": "transform",
                "position": {"x": 500, "y": 100},
                "data": {"name": "Normalization"},
            },
        ],
        "edges": [
            {"id": "edge1-2", "source": "node1", "target": "node2"},
            {"id": "edge2-3", "source": "node2", "target": "node3"},
        ],
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Classification Workflow",
        "description": "End-to-end classification pipeline",
        "nodes": [
            {
                "id": "node1",
                "type": "dataLoader",
                "position": {"x": 100, "y": 100},
                "data": {"name": "Database Connector"},
            },
            {
                "id": "node2",
                "type": "transform",
                "position": {"x": 300, "y": 100},
                "data": {"name": "Feature Engineering"},
            },
            {
                "id": "node3",
                "type": "model",
                "position": {"x": 500, "y": 100},
                "data": {"name": "Random Forest"},
            },
            {
                "id": "node4",
                "type": "evaluation",
                "position": {"x": 700, "y": 100},
                "data": {"name": "Performance Metrics"},
            },
        ],
        "edges": [
            {"id": "edge1-2", "source": "node1", "target": "node2"},
            {"id": "edge2-3", "source": "node2", "target": "node3"},
            {"id": "edge3-4", "source": "node3", "target": "node4"},
        ],
    },
]

# Sample data for models
sample_models = [
    {
        "id": str(uuid.uuid4()),
        "name": "Customer Churn Predictor",
        "description": "Predicts customer churn based on usage patterns",
        "model_type": "classification",
        "version": "1.0.0",
        "file_path": "models/churn_model_v1.pkl",
        "parameters": {
            "algorithm": "RandomForest",
            "n_estimators": 100,
            "max_depth": 10,
            "min_samples_split": 2,
        },
        "metrics": {
            "accuracy": 0.85,
            "precision": 0.82,
            "recall": 0.79,
            "f1_score": 0.80,
        },
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Product Recommendation Engine",
        "description": "Recommends products based on user behavior",
        "model_type": "recommendation",
        "version": "2.1.0",
        "file_path": "models/recommendation_v2.1.pkl",
        "parameters": {
            "algorithm": "CollaborativeFiltering",
            "factors": 50,
            "regularization": 0.01,
            "iterations": 20,
        },
        "metrics": {"rmse": 0.92, "mae": 0.75, "ndcg": 0.68},
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Time Series Forecaster",
        "description": "Forecasts sales for the next quarter",
        "model_type": "time_series",
        "version": "1.2.3",
        "file_path": "models/forecast_v1.2.3.pkl",
        "parameters": {"algorithm": "ARIMA", "p": 2, "d": 1, "q": 2, "seasonal": True},
        "metrics": {"mape": 12.5, "rmse": 145.3, "mae": 98.7},
    },
]


def add_sample_data():
    with app.app_context():
        # Add sample pipelines
        for pipeline_data in sample_pipelines:
            pipeline = Pipeline(
                id=pipeline_data["id"],
                name=pipeline_data["name"],
                description=pipeline_data["description"],
                nodes=pipeline_data["nodes"],
                edges=pipeline_data["edges"],
            )
            db.session.add(pipeline)

        # Add sample models
        for model_data in sample_models:
            model = Model(
                id=model_data["id"],
                name=model_data["name"],
                description=model_data["description"],
                model_type=model_data["model_type"],
                version=model_data["version"],
                file_path=model_data["file_path"],
                parameters=model_data["parameters"],
                metrics=model_data["metrics"],
            )
            db.session.add(model)

        # Commit the changes
        db.session.commit()
        print(
            f"Added {len(sample_pipelines)} sample pipelines and {len(sample_models)} sample models to the database."
        )


if __name__ == "__main__":
    add_sample_data()
