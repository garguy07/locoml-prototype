import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PipelineHub.css';

const PipelineHub = () => {
  const [pipelines, setPipelines] = useState([]);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showApiDialog, setShowApiDialog] = useState(false);
  const [apiPipeline, setApiPipeline] = useState(null);
  const navigate = useNavigate();

  // Load saved pipelines from localStorage
  useEffect(() => {
    const savedPipelines = JSON.parse(localStorage.getItem('pipelines') || '[]');
    // Sort by most recently updated
    savedPipelines.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setPipelines(savedPipelines);
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle new pipeline button click
  const handleNewPipeline = () => {
    // Clear any existing currentPipeline in localStorage to ensure a clean state
    localStorage.removeItem('currentPipeline');
    navigate('/playground');
  };

  // Handle load pipeline
  const handleLoadPipeline = (pipeline) => {
    // Store the selected pipeline to localStorage so playground can access it
    localStorage.setItem('currentPipeline', JSON.stringify(pipeline));
    navigate('/playground');
  };

  // Handle delete pipeline
  const handleDeleteClick = (pipeline, event) => {
    event.stopPropagation(); // Prevent the card click handler from firing
    setSelectedPipeline(pipeline);
    setShowDeleteConfirm(true);
  };

  // Handle get API button click
  const handleGetApiClick = (pipeline, event) => {
    event.stopPropagation(); // Prevent the card click handler from firing
    setApiPipeline(pipeline);
    setShowApiDialog(true);
  };

  // Confirm delete pipeline
  const confirmDelete = () => {
    if (selectedPipeline) {
      // Fixed deletion logic - only filter out the pipeline with matching ID
      const updatedPipelines = pipelines.filter(p => p.id !== selectedPipeline.id);
      
      // Save the updated pipelines list back to localStorage
      localStorage.setItem('pipelines', JSON.stringify(updatedPipelines));
      
      // Update state with the filtered pipelines
      setPipelines(updatedPipelines);
      
      // Close the dialog and reset selected pipeline
      setShowDeleteConfirm(false);
      setSelectedPipeline(null);
    }
  };

  // Generate API code for the selected pipeline
  const generateApiCode = (pipeline) => {
    // Create a simplified REST API example based on the pipeline
    const apiEndpoint = `/api/pipelines/${pipeline.id}/execute`;
    
    return `
// Node.js Express API Example
const express = require('express');
const router = express.Router();

/**
 * POST ${apiEndpoint}
 * Execute the "${pipeline.name}" pipeline with provided input
 */
router.post('${apiEndpoint}', async (req, res) => {
  try {
    // Get input data from request body
    const inputData = req.body;
    
    // Pipeline configuration (${pipeline.nodes.length} nodes, ${pipeline.edges.length} connections)
    const pipelineConfig = ${JSON.stringify(pipeline, null, 2)};
    
    // Execute pipeline logic here...
    // This would implement the actual processing based on the pipeline configuration
    
    // Example response
    res.json({
      success: true,
      pipelineId: '${pipeline.id}',
      pipelineName: '${pipeline.name}',
      result: {
        // Pipeline execution results would go here
        processed: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
    `;
  };

  // Copy API code to clipboard
  const copyApiCode = () => {
    const codeElement = document.getElementById('api-code');
    if (codeElement) {
      navigator.clipboard.writeText(codeElement.textContent);
      // You could add a toast notification here
      alert('API code copied to clipboard!');
    }
  };

  // Go back to home
  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <div className="hub-container">
      <header className="hub-header">
        <h1>Pipeline Hub</h1>
        <div className="hub-actions">
          <button onClick={handleHomeClick} className="home-button">Home</button>
          {/* <button onClick={handleNewPipeline} className="new-pipeline-button">New Pipeline</button> */}
        </div>
      </header>

      <div className="pipeline-grid">
        {pipelines.length === 0 ? (
          <div className="no-pipelines">
            <p>No saved pipelines found.</p>
            <button onClick={handleNewPipeline} className="create-first-button">Create your first pipeline</button>
          </div>
        ) : (
          pipelines.map((pipeline) => (
            <div 
              key={pipeline.id} 
              className="pipeline-card"
              onClick={() => handleLoadPipeline(pipeline)}
            >
              <div className="pipeline-card-header">
                <h3>{pipeline.name}</h3>
                <button 
                  onClick={(e) => handleDeleteClick(pipeline, e)} 
                  className="delete-pipeline-button"
                >
                  ×
                </button>
              </div>
              <div className="pipeline-details">
                <span className="pipeline-stats">
                  {pipeline.nodes.length} nodes, {pipeline.edges.length} connections
                </span>
                <span className="pipeline-date">
                  Last modified: {formatDate(pipeline.timestamp)}
                </span>
                <button 
                  onClick={(e) => handleGetApiClick(pipeline, e)}
                  className="get-api-button"
                >
                  Get API
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="dialog-overlay">
          <div className="delete-dialog">
            <h3>Delete Pipeline</h3>
            <p>Are you sure you want to delete "{selectedPipeline?.name}"?</p>
            <p className="delete-warning">This action cannot be undone.</p>
            <div className="dialog-buttons">
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className="cancel-delete-button"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="confirm-delete-button"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Dialog */}
      {showApiDialog && apiPipeline && (
        <div className="dialog-overlay">
          <div className="api-dialog">
            <h3>API for "{apiPipeline.name}"</h3>
            <p>Deploy this API code to your server to expose your pipeline as a REST endpoint.</p>
            <div className="api-code-container">
              <pre id="api-code">
                {generateApiCode(apiPipeline)}
              </pre>
            </div>
            <div className="dialog-buttons">
              <button 
                onClick={() => setShowApiDialog(false)} 
                className="cancel-button"
              >
                Close
              </button>
              <button 
                onClick={copyApiCode} 
                className="copy-button"
              >
                Copy Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PipelineHub;