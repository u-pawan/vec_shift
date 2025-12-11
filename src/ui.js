// ui.js
// Displays the drag-and-drop pipeline UI with React Flow
// Uses React useState directly to avoid Zustand compatibility issues
// --------------------------------------------------

import { useState, useRef, useCallback, useMemo } from 'react';
import ReactFlow, {
  Controls,
  Background,
  ReactFlowProvider,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType
} from 'reactflow';

// Import all node types
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

// Register all available node types - must be outside component to avoid recreation
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

// Inner component that contains the flow logic
const Flow = ({ nodes, edges, setNodes, setEdges, nodeIDsRef }) => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

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

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      if (event?.dataTransfer?.getData('application/reactflow')) {
        const appData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
        const type = appData?.nodeType;

        // check if the dropped element is valid
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
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        proOptions={proOptions}
        snapGrid={[gridSize, gridSize]}
        connectionLineType='smoothstep'
      >
        <Background color="#334155" gap={gridSize} />
        <Controls className="flow-controls" />
      </ReactFlow>
    </div>
  );
};

// Export nodes and edges via a custom hook so submit.js can access them
let globalNodes = [];
let globalEdges = [];

export const getNodesAndEdges = () => ({
  nodes: globalNodes,
  edges: globalEdges
});

// Main component wrapper with ReactFlowProvider
export const PipelineUI = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const nodeIDsRef = useRef({});

  // Keep global references updated for submit button
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
