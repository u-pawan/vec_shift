// This component renders the main flow canvas using React Flow.
// It handles all the drag-and-drop logic and node rendering.

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  ReactFlowProvider,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType
} from 'reactflow';

// Import all our custom node types.
import { InputNode } from './nodes/inputNode';
import { LLMNode } from './nodes/llmNode';
import { OutputNode } from './nodes/outputNode';
import { TextNode } from './nodes/textNode';
import { TimestampNode } from './nodes/TimestampNode';
import { TransformNode } from './nodes/TransformNode';
import { FilterNode } from './nodes/FilterNode';
import { PromptNode } from './nodes/PromptNode';
import { JoinNode } from './nodes/JoinNode';

import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };

// We register the node types here. (Must be outside the component to prevent re-creation issues).
const nodeTypes = {
  customInput: InputNode,
  llm: LLMNode,
  customOutput: OutputNode,
  text: TextNode,
  timestamp: TimestampNode,
  transform: TransformNode,
  filter: FilterNode,
  prompt: PromptNode,
  join: JoinNode,
};

// The internal flow component where the magic happens.
const Flow = ({ nodes, edges, setNodes, setEdges, nodeIDsRef }) => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [eraserMode, setEraserMode] = useState(false);

  const getNodeID = useCallback((type) => {
    if (nodeIDsRef.current[type] === undefined) {
      nodeIDsRef.current[type] = 0;
    }
    nodeIDsRef.current[type] += 1;
    return `${type}-${nodeIDsRef.current[type]}`;
  }, [nodeIDsRef]);

  const getInitNodeData = useCallback((nodeID, type) => {
    return { id: nodeID, nodeType: `${type}` };
  }, []);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge({
      ...connection,
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.Arrow, height: '20px', width: '20px' }
    }, eds)),
    [setEdges]
  );

  // Removes a node if the user clicks it while in "Eraser Mode".
  const onNodeClick = useCallback(
    (event, node) => {
      if (eraserMode) {
        setNodes((nds) => nds.filter((n) => n.id !== node.id));
        // Clean up any connections to this node too.
        setEdges((eds) => eds.filter((e) => e.source !== node.id && e.target !== node.id));
      }
    },
    [eraserMode, setNodes, setEdges]
  );

  // Removes a connection if the user clicks it while in "Eraser Mode".
  const onEdgeClick = useCallback(
    (event, edge) => {
      if (eraserMode) {
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      }
    },
    [eraserMode, setEdges]
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      if (event?.dataTransfer?.getData('application/reactflow')) {
        const appData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
        const type = appData?.nodeType;

        // Make sure the dropped item is actually a node.
        if (typeof type === 'undefined' || !type) {
          return;
        }

        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const nodeID = getNodeID(type);
        const newNode = {
          id: nodeID,
          type,
          position,
          data: getInitNodeData(nodeID, type),
        };

        setNodes((nds) => [...nds, newNode]);
      }
    },
    [reactFlowInstance, getNodeID, getInitNodeData, setNodes]
  );

  // Listen for drop events from mobile devices.
  useEffect(() => {
    const handleMobileDrop = (event) => {
      const { nodeType, x, y } = event.detail;

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();

      // Figure out where precisely on the canvas they dropped it.
      const position = reactFlowInstance.project({
        x: x - reactFlowBounds.left,
        y: y - reactFlowBounds.top,
      });

      const nodeID = getNodeID(nodeType);
      const newNode = {
        id: nodeID,
        type: nodeType,
        position,
        data: getInitNodeData(nodeID, nodeType),
      };

      setNodes((nds) => [...nds, newNode]);
    };

    window.addEventListener('node-dropped', handleMobileDrop);

    return () => {
      window.removeEventListener('node-dropped', handleMobileDrop);
    };
  }, [reactFlowInstance, getNodeID, getInitNodeData, setNodes]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div ref={reactFlowWrapper} className="pipeline-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        proOptions={proOptions}
        snapGrid={[gridSize, gridSize]}
        connectionLineType='smoothstep'
      >
        <Background color="#334155" gap={gridSize} />

        {/* The Eraser Tool button */}
        <div className="eraser-control">
          <button
            className={`eraser-button ${eraserMode ? 'active' : ''}`}
            onClick={() => setEraserMode(!eraserMode)}
            title={eraserMode ? 'Exit Eraser Mode' : 'Enter Eraser Mode'}
          >
            🗑️
          </button>
        </div>

        <Controls className="flow-controls" />

        {/* The MiniMap in the corner */}
        <MiniMap
          className="flow-minimap"
          nodeColor="#6366f1"
          maskColor="rgba(15, 23, 42, 0.8)"
          position="bottom-right"
        />
      </ReactFlow>
    </div>
  );
};

// Expose the current nodes and edges so the submit button can grab them.
let globalNodes = [];
let globalEdges = [];

export const getNodesAndEdges = () => ({
  nodes: globalNodes,
  edges: globalEdges
});

// The main wrapper that provides the React Flow context.
export const PipelineUI = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const nodeIDsRef = useRef({});

  // Keep our global variables in sync.
  globalNodes = nodes;
  globalEdges = edges;

  return (
    <ReactFlowProvider>
      <Flow
        nodes={nodes}
        edges={edges}
        setNodes={setNodes}
        setEdges={setEdges}
        nodeIDsRef={nodeIDsRef}
      />
    </ReactFlowProvider>
  );
}
