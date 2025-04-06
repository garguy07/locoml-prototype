import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  Handle,
} from 'reactflow';
import { useNavigate } from 'react-router-dom';
import 'reactflow/dist/style.css';
import './PipelinePlayground.css';

// Node types and their colors
const nodeTypes = {
  input: { label: 'Input', color: '#d5f6fb' },  // Light blue
  asr: { label: 'ASR', color: '#ebccff' },      // Light green
  mt: { label: 'MT', color: '#d1feb8' },        // Light gray
  tts: { label: 'TTS', color: '#f6f3a9' },      // Light yellow
  ocr: { label: 'OCR', color: '#ffcae9' },      // Light orange
};

// Custom node component with delete button and visible handles
const CustomNode = ({ id, data, isConnectable }) => {
  const fileInputRef = useRef(null);
  
  const onDeleteClick = (event) => {
    // Stop event propagation to prevent node selection
    event.stopPropagation();

    // Call the delete function provided in the node data
    if (data.onDelete) {
      data.onDelete(id);
    }
  };

  const handleUploadClick = (event) => {
    event.stopPropagation();
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && data.onFileUpload) {
      data.onFileUpload(id, file);
    }
  };

  return (
    <div className="custom-node" style={{ backgroundColor: data.color }}>
      <div className="delete-button" onClick={onDeleteClick}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash-fill" viewBox="0 0 16 16">
          <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
        </svg>
      </div>
      
      <Handle
        type="source"
        position="right"
        className="handle source-handle"
        isConnectable={isConnectable}
      />
      
      <Handle
        type="target"
        position="left"
        className="handle target-handle"
        isConnectable={isConnectable}
      />
      
      <div className="node-label">{data.label}</div>
      
      {/* Show upload button only for input nodes */}
      {data.label === 'Input' && (
        <div className="input-node-controls">
          <button 
            className={`upload-button ${data.inputFile ? 'has-file' : ''}`} 
            onClick={handleUploadClick}
          >
            {data.inputFile ? data.inputFile.name : 'Upload'}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileChange}
          />
        </div>
      )}
    </div>
  );
};

const nodeTypes2 = {
  customNode: CustomNode,
};

const PipelinePlayground = () => {
  // Initialize with no nodes and edges
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [projectName, setProjectName] = useState("New Project");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const nodeIdRef = useRef(0); // Use ref to keep track of node IDs
  const navigate = useNavigate();
  const [inputFiles, setInputFiles] = useState({});

  // For generating unique node IDs
  const getId = () => {
    nodeIdRef.current += 1;
    return `node_${nodeIdRef.current}`;
  };

  // Handle file upload for input nodes
  const handleFileUpload = useCallback((nodeId, file) => {
    // Store the file information
    setInputFiles(prev => ({
      ...prev,
      [nodeId]: file
    }));
    
    // Update the node to display the file name
    setNodes(nds => 
      nds.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              inputFile: file
            }
          };
        }
        return node;
      })
    );
    
    // Store input file info in localStorage
    const fileInfo = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    };
    
    localStorage.setItem(`inputFile_${nodeId}`, JSON.stringify(fileInfo));
  }, [setNodes]);

  // Load saved project from localStorage if available
  useEffect(() => {
    const currentPipeline = localStorage.getItem('currentPipeline');
    
    if (currentPipeline) {
      const pipeline = JSON.parse(currentPipeline);
      
      // Set project name
      setProjectName(pipeline.name);
      
      // Find the highest node ID to update the counter
      if (pipeline.nodes.length > 0) {
        const nodeIds = pipeline.nodes.map(node => {
          const idNum = parseInt(node.id.replace('node_', ''));
          return isNaN(idNum) ? 0 : idNum;
        });
        
        nodeIdRef.current = Math.max(...nodeIds);
      }
      
      // Load input file information for each node
      const loadedInputFiles = {};
      const nodesWithHandlers = pipeline.nodes.map(node => {
        // Check if this node had an input file
        const inputFileInfo = localStorage.getItem(`inputFile_${node.id}`);
        let inputFile = null;
        
        if (inputFileInfo && node.data.label === 'Input') {
          inputFile = JSON.parse(inputFileInfo);
          loadedInputFiles[node.id] = inputFile;
        }
        
        return {
          ...node,
          data: {
            ...node.data,
            onDelete: deleteNode,
            onFileUpload: handleFileUpload,
            inputFile: inputFile
          }
        };
      });
      
      // Update input files state
      setInputFiles(loadedInputFiles);
      
      // Set nodes and edges
      setNodes(nodesWithHandlers);
      setEdges(pipeline.edges);
      
      // Clear the currentPipeline from localStorage after loading
      localStorage.removeItem('currentPipeline');
    }
  }, [setNodes, setEdges, handleFileUpload]);

  // Function to delete a node and its connected edges
  const deleteNode = useCallback((nodeId) => {
    // Remove the node
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    
    // Remove any edges connected to this node
    setEdges((eds) => eds.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    ));
    
    // Remove input file if it was an input node
    setInputFiles(prev => {
      const newFiles = {...prev};
      delete newFiles[nodeId];
      return newFiles;
    });
    
    // Remove from localStorage
    localStorage.removeItem(`inputFile_${nodeId}`);
  }, [setNodes, setEdges]);

  // Connect nodes when connections are made
  const onConnect = useCallback(
    (params) => {
      // Create a new edge with a unique ID
      const edge = {
        ...params,
        id: `e${params.source}-${params.target}`,
        type: 'default',  // Default edge is an arrow
        animated: true,   // Add animation for better visibility
      };
      
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  // Handle dragging a node from the sidebar to the canvas
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      // Check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      // Get drop position
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Create new node with delete handler
      const newNode = {
        id: getId(),
        type: 'customNode',
        position,
        data: { 
          label: nodeTypes[type].label,
          color: nodeTypes[type].color,
          onDelete: deleteNode,
          onFileUpload: handleFileUpload  // Add file upload handler
        },
      };

      // Add the new node to the existing nodes array
      setNodes((nds) => [...nds, newNode]);
    },
    [reactFlowInstance, setNodes, deleteNode, handleFileUpload]
  );

  // Clear the canvas
  const handleClear = () => {
    // Remove all input file information from localStorage
    nodes.forEach(node => {
      localStorage.removeItem(`inputFile_${node.id}`);
    });
    
    setNodes([]);
    setEdges([]);
    setInputFiles({});
    nodeIdRef.current = 0; // Reset the node ID counter
    setProjectName("New Project");
  };

  // Validate if all input nodes have files
  const validateInputNodes = () => {
    const inputNodes = nodes.filter(node => node.data.label === 'Input');
    
    if (inputNodes.length === 0) {
      return true; // No input nodes, so valid
    }
    
    const missingFiles = inputNodes.filter(node => !inputFiles[node.id]);
    
    if (missingFiles.length > 0) {
      alert('Error: Some input nodes do not have files uploaded. Please upload files for all input nodes.');
      return false;
    }
    
    return true;
  };

  // Run the pipeline (currently just logs the configuration)
  const handleRun = () => {
    // Validate input nodes first
    if (!validateInputNodes()) {
      return;
    }
    
    console.log('Running pipeline with configuration:');
    console.log('Nodes:', nodes);
    console.log('Edges:', edges);
    console.log('Input Files:', inputFiles);
    
    // Verify if the pipeline is properly connected
    if (edges.length < nodes.length - 1 && nodes.length > 1) {
      alert('Warning: Some nodes may not be connected in your pipeline.');
      return;
    }
    
    alert('Pipeline is running! Check the console for details.');
  };

  // Show save dialog
  const handleSaveClick = () => {
    if (nodes.length === 0) {
      alert('Cannot save an empty pipeline');
      return;
    }
    
    // Validate input nodes first
    if (!validateInputNodes()) {
      return;
    }
    
    setShowSaveDialog(true);
  };

  // Save the pipeline to localStorage
  const handleSave = () => {
    if (projectName.trim() === '') {
      alert('Please enter a project name');
      return;
    }
    
    // Prepare nodes for saving (removing function references which can't be serialized)
    const serializableNodes = nodes.map(node => {
      // Create a serializable version of inputFile data if it exists
      let inputFileData = null;
      if (node.data.inputFile) {
        inputFileData = {
          name: node.data.inputFile.name,
          size: node.data.inputFile.size,
          type: node.data.inputFile.type,
          lastModified: node.data.inputFile.lastModified
        };
      }
      
      return {
        ...node,
        data: {
          label: node.data.label,
          color: node.data.color,
          inputFile: inputFileData
        }
      };
    });
    
    const pipeline = {
      id: Date.now().toString(),
      name: projectName,
      nodes: serializableNodes,
      edges,
      timestamp: new Date().toISOString(),
    };
    
    // Get existing pipelines or initialize empty array
    const existingPipelines = JSON.parse(localStorage.getItem('pipelines') || '[]');
    
    // Check if a pipeline with this name already exists
    const pipelineIndex = existingPipelines.findIndex(p => p.name === projectName);
    
    if (pipelineIndex >= 0) {
      // Update existing pipeline
      existingPipelines[pipelineIndex] = pipeline;
    } else {
      // Add new pipeline
      existingPipelines.push(pipeline);
    }
    
    // Save back to localStorage
    localStorage.setItem('pipelines', JSON.stringify(existingPipelines));
    setShowSaveDialog(false);
    alert('Pipeline saved successfully!');
  };

  // Enable nodes to be dragged from the sidebar
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Handle navigation to home
  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <div className="pipeline-container">
      {/* Sidebar with draggable nodes */}
      <div className="sidebar">
        <h2 className="sidebar-title">Models</h2>
        
        {Object.entries(nodeTypes).map(([type, { label, color }]) => (
          <div
            key={type}
            onDragStart={(event) => onDragStart(event, type)}
            draggable
            className="draggable-node"
            style={{ backgroundColor: color }}
          >
            {label}
          </div>
        ))}
        
        <div className="instructions">
          <p><strong>How to use:</strong></p>
          <p>1. Drag models to the canvas.</p>
          <p>2. Connect nodes: drag from right handle to left handle.</p>
          <p>3. Delete nodes: click the × on any node.</p>
          <p>4. For Input nodes: upload your dataset.</p>
          <p>5. To obtain API, head over to the Pipeline Hub.</p>
        </div>
        
        <button onClick={handleHomeClick} className="button home-button">
          Back to Home
        </button>
      </div>

      {/* Main flow canvas */}
      <div className="flow-canvas" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes2}
          fitView
          defaultEdgeOptions={{ 
            type: 'default',  // Use default edge type (arrow)
            animated: true    // Add animation for better visibility
          }}
        >
          <Controls />
          <MiniMap />
          <Background color="#aaa" gap={16} />
          
          {/* Top panel with project name */}
          <Panel position="top-center" className="project-name-panel">
            <div className="project-name">
              <span>Project: </span>
              <span className="project-name-value">{projectName}</span>
            </div>
          </Panel>
          
          {/* Bottom panel with buttons */}
          <Panel position="bottom" className="control-panel">
            <button onClick={handleClear} className="button clear-button">
              Clear
            </button>
            <button onClick={handleRun} className="button run-button">
              Run
            </button>
            <button onClick={handleSaveClick} className="button save-button">
              Save
            </button>
          </Panel>
        </ReactFlow>
      </div>
      
      {/* Save dialog */}
      {showSaveDialog && (
        <div className="save-dialog-overlay">
          <div className="save-dialog">
            <h3>Save Pipeline</h3>
            <div className="dialog-content">
              <label htmlFor="projectName">Project Name:</label>
              <input
                type="text"
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
                autoFocus
              />
            </div>
            <div className="dialog-buttons">
              <button onClick={() => setShowSaveDialog(false)} className="button cancel-button">
                Cancel
              </button>
              <button onClick={handleSave} className="button confirm-save-button">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PipelinePlayground;