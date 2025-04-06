from flask import Flask, request, jsonify
from flask_cors import CORS
from database_init import db, Pipeline, Model
import uuid
import json
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# Configure the SQLite database
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///pipeline_platform.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {"connect_args": {"check_same_thread": False}}

# Initialize the app with the database
db.init_app(app)


# Pipeline Routes
@app.route("/api/pipelines", methods=["GET"])
def get_all_pipelines():
    with app.app_context():
        pipelines = Pipeline.query.order_by(Pipeline.updated_at.desc()).all()
        return jsonify([p.to_dict() for p in pipelines])


@app.route("/api/pipelines", methods=["POST"])
def create_pipeline():
    data = request.json

    # Validate request
    if not data or not isinstance(data, dict):
        return jsonify({"error": "Invalid request data"}), 400

    if "name" not in data:
        return jsonify({"error": "Pipeline name is required"}), 400

    # Create new pipeline
    pipeline_id = str(uuid.uuid4())

    with app.app_context():
        pipeline = Pipeline(
            id=pipeline_id,
            name=data["name"],
            description=data.get("description", ""),
            nodes=data.get("nodes", []),
            edges=data.get("edges", []),
        )

        db.session.add(pipeline)
        db.session.commit()

        return jsonify(pipeline.to_dict()), 201


@app.route("/api/pipelines/<pipeline_id>", methods=["GET"])
def get_pipeline(pipeline_id):
    with app.app_context():
        pipeline = Pipeline.query.get(pipeline_id)

        if not pipeline:
            return jsonify({"error": "Pipeline not found"}), 404

        return jsonify(pipeline.to_dict())


@app.route("/api/pipelines/<pipeline_id>", methods=["PUT"])
def update_pipeline(pipeline_id):
    data = request.json

    # Validate request
    if not data or not isinstance(data, dict):
        return jsonify({"error": "Invalid request data"}), 400

    with app.app_context():
        pipeline = Pipeline.query.get(pipeline_id)

        if not pipeline:
            return jsonify({"error": "Pipeline not found"}), 404

        # Update pipeline fields
        if "name" in data:
            pipeline.name = data["name"]

        if "description" in data:
            pipeline.description = data["description"]

        if "nodes" in data:
            pipeline.nodes = json.dumps(data["nodes"])

        if "edges" in data:
            pipeline.edges = json.dumps(data["edges"])

        pipeline.updated_at = datetime.utcnow()

        db.session.commit()
        return jsonify(pipeline.to_dict())


@app.route("/api/pipelines/<pipeline_id>", methods=["DELETE"])
def delete_pipeline(pipeline_id):
    with app.app_context():
        pipeline = Pipeline.query.get(pipeline_id)

        if not pipeline:
            return jsonify({"error": "Pipeline not found"}), 404

        db.session.delete(pipeline)
        db.session.commit()

        return jsonify({"message": "Pipeline deleted successfully"})


@app.route("/api/pipelines/<pipeline_id>/execute", methods=["POST"])
def execute_pipeline(pipeline_id):
    input_data = request.json

    with app.app_context():
        pipeline = Pipeline.query.get(pipeline_id)

        if not pipeline:
            return jsonify({"error": "Pipeline not found"}), 404

        # This is where you would implement the actual pipeline execution logic
        # For now, we'll just return a mock response

        try:
            # In a real implementation, this would process the nodes and edges
            # to create a data processing pipeline

            # Mock pipeline execution
            result = {
                "input": input_data,
                "processed": True,
                "nodesExecuted": len(json.loads(pipeline.nodes)),
                "executionTime": "0.5s",  # Mock execution time
                "timestamp": datetime.now().isoformat(),
            }

            return jsonify(
                {
                    "success": True,
                    "pipelineId": pipeline_id,
                    "pipelineName": pipeline.name,
                    "result": result,
                }
            )

        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500


# Model Routes
@app.route("/api/models", methods=["GET"])
def get_all_models():
    with app.app_context():
        models = Model.query.order_by(Model.updated_at.desc()).all()
        return jsonify([m.to_dict() for m in models])


@app.route("/api/models", methods=["POST"])
def create_model():
    data = request.json

    # Validate request
    if not data or not isinstance(data, dict):
        return jsonify({"error": "Invalid request data"}), 400

    required_fields = ["name", "model_type", "version"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    # Create new model
    model_id = str(uuid.uuid4())

    with app.app_context():
        model = Model(
            id=model_id,
            name=data["name"],
            description=data.get("description", ""),
            model_type=data["model_type"],
            version=data["version"],
            file_path=data.get("file_path"),
            parameters=data.get("parameters", {}),
            metrics=data.get("metrics", {}),
        )

        db.session.add(model)
        db.session.commit()

        return jsonify(model.to_dict()), 201


@app.route("/api/models/<model_id>", methods=["GET"])
def get_model(model_id):
    with app.app_context():
        model = Model.query.get(model_id)

        if not model:
            return jsonify({"error": "Model not found"}), 404

        return jsonify(model.to_dict())


@app.route("/api/models/<model_id>", methods=["PUT"])
def update_model(model_id):
    data = request.json

    # Validate request
    if not data or not isinstance(data, dict):
        return jsonify({"error": "Invalid request data"}), 400

    with app.app_context():
        model = Model.query.get(model_id)

        if not model:
            return jsonify({"error": "Model not found"}), 404

        # Update model fields
        if "name" in data:
            model.name = data["name"]

        if "description" in data:
            model.description = data["description"]

        if "model_type" in data:
            model.model_type = data["model_type"]

        if "version" in data:
            model.version = data["version"]

        if "file_path" in data:
            model.file_path = data["file_path"]

        if "parameters" in data:
            model.parameters = json.dumps(data["parameters"])

        if "metrics" in data:
            model.metrics = json.dumps(data["metrics"])

        model.updated_at = datetime.utcnow()

        db.session.commit()
        return jsonify(model.to_dict())


@app.route("/api/models/<model_id>", methods=["DELETE"])
def delete_model(model_id):
    with app.app_context():
        model = Model.query.get(model_id)

        if not model:
            return jsonify({"error": "Model not found"}), 404

        # If model has a file, you might want to delete it here
        if model.file_path and os.path.exists(model.file_path):
            os.remove(model.file_path)

        db.session.delete(model)
        db.session.commit()

        return jsonify({"message": "Model deleted successfully"})


# Model deployment endpoint
@app.route("/api/models/<model_id>/predict", methods=["POST"])
def model_predict(model_id):
    input_data = request.json

    if not input_data:
        return jsonify({"error": "Input data is required"}), 400

    with app.app_context():
        model = Model.query.get(model_id)

        if not model:
            return jsonify({"error": "Model not found"}), 404

        # In a real implementation, you would load the model from file_path
        # and use it to make predictions

        # Mock prediction
        try:
            # This is a placeholder for actual model prediction
            predictions = {
                "predictions": (
                    [0.9, 0.1]
                    if model.model_type == "classification"
                    else [42.5, 67.3, 89.1]
                ),
                "model_name": model.name,
                "model_version": model.version,
                "timestamp": datetime.now().isoformat(),
            }

            return jsonify(
                {"success": True, "model_id": model_id, "result": predictions}
            )

        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500


if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # Create tables if they don't exist
    app.run(debug=True, port=5000)
