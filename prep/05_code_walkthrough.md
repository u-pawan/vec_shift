# Code Walkthrough

## 1. Main Application Flow (App.js)

```javascript
// App.js - Entry point that combines all major components

import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';

function App() {
  return (
    <div>
      <PipelineToolbar />  {/* Sidebar with draggable nodes */}
      <PipelineUI />       {/* Main canvas with React Flow */}
      <SubmitButton />     {/* Submit button at bottom */}
    </div>
  );
}
```

**Key Points:**
- Simple composition of three main components
- No state at this level - managed in child components
- Clean separation of concerns

---

## 2. Drag-and-Drop System

### Step 1: Draggable Node (draggableNode.js)

```javascript
export const DraggableNode = ({ type, label }) => {
  const onDragStart = (event) => {
    // Store the node type in the drag event
    event.dataTransfer.setData(
      'application/reactflow',
      JSON.stringify({ nodeType: type }),
    );
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className={type}
      onDragStart={onDragStart}
      draggable
    >
      {label}
    </div>
  );
};
```

### Step 2: Drop Handler (ui.js)

```javascript
const onDrop = useCallback((event) => {
  event.preventDefault();
  
  // 1. Get the node type from drag data
  const appData = JSON.parse(
    event.dataTransfer.getData('application/reactflow')
  );
  const type = appData?.nodeType;
  
  // 2. Calculate drop position on canvas
  const position = reactFlowInstance.project({
    x: event.clientX - reactFlowBounds.left,
    y: event.clientY - reactFlowBounds.top,
  });
  
  // 3. Generate unique ID
  const nodeID = getNodeID(type);  // e.g., "text-3"
  
  // 4. Create and add node
  const newNode = {
    id: nodeID,
    type,
    position,
    data: { id: nodeID, nodeType: type },
  };
  
  setNodes((nds) => [...nds, newNode]);
}, [reactFlowInstance, getNodeID, setNodes]);
```

---

## 3. BaseNode Abstraction Pattern

```javascript
// BaseNode.js - Reusable wrapper for all nodes

export const BaseNode = ({ 
  id,           // Unique node ID
  title,        // Display title
  icon,         // Emoji or component
  children,     // Custom body content
  handles = [], // Array of handle configs
  className,    // Additional CSS classes
}) => {
  return (
    <div className={`node-base ${className}`}>
      {/* Header with icon and title */}
      <div className="node-header">
        {icon && <span className="node-icon">{icon}</span>}
        <span className="node-title">{title}</span>
      </div>
      
      {/* Body contains custom content */}
      <div className="node-body">
        {children}
      </div>
      
      {/* Render all handles dynamically */}
      {handles.map((handle, index) => (
        <Handle
          key={handle.id || `handle-${index}`}
          type={handle.type}
          position={handle.position}
          id={handle.id}
          style={handle.style}
        />
      ))}
    </div>
  );
};
```

### Usage in InputNode

```javascript
export const InputNode = ({ id, data }) => {
  const [inputName, setInputName] = useState('');
  const [inputType, setInputType] = useState('Text');
  
  return (
    <BaseNode
      id={id}
      title="Input"
      icon="📥"
      handles={[
        { type: 'source', position: Position.Right, id: `${id}-output` }
      ]}
    >
      <label>
        Name:
        <input 
          value={inputName} 
          onChange={(e) => setInputName(e.target.value)} 
        />
      </label>
      <label>
        Type:
        <select value={inputType} onChange={(e) => setInputType(e.target.value)}>
          <option value="Text">Text</option>
          <option value="File">File</option>
        </select>
      </label>
    </BaseNode>
  );
};
```

---

## 4. TextNode Variable Detection Logic

```javascript
// textNode.js - Most complex node with dynamic handles

// Pattern to match {{ variableName }}
const extractVariables = (text) => {
  const variables = [];
  const seen = new Set();
  
  // Match {{ anything }}
  const regex = /\{\{\s*([^{}]+?)\s*\}\}/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const varName = match[1].trim();
    
    if (!seen.has(varName)) {
      seen.add(varName);
      variables.push({
        name: varName,
        // Validate: must be valid JS identifier
        isValid: /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(varName)
      });
    }
  }
  
  return variables;
};

export const TextNode = memo(({ id, data }) => {
  const [currText, setCurrText] = useState('{{input}}');
  
  // Extract and validate variables (memoized)
  const variables = useMemo(() => extractVariables(currText), [currText]);
  const validVariables = variables.filter(v => v.isValid);
  const invalidVariables = variables.filter(v => !v.isValid);
  
  return (
    <div className="node-base text-node">
      {/* ... header ... */}
      <div className="node-body">
        <textarea value={currText} onChange={e => setCurrText(e.target.value)} />
        
        {/* Show warnings for invalid variables */}
        {invalidVariables.map(v => (
          <span className="warning">⚠️ Invalid: {v.name}</span>
        ))}
      </div>
      
      {/* Output handle (always present) */}
      <Handle type="source" position={Position.Right} id={`${id}-output`} />
      
      {/* DYNAMIC handles for valid variables */}
      {validVariables.map((variable, index) => {
        // Calculate vertical position
        const topPercent = ((index + 1) / (validVariables.length + 1)) * 100;
        
        return (
          <Handle
            key={`${id}-var-${variable.name}`}
            type="target"
            position={Position.Left}
            id={`${id}-var-${variable.name}`}
            style={{ top: `${topPercent}%` }}
          />
        );
      })}
    </div>
  );
});
```

---

## 5. Submit Flow

```javascript
// submit.js - Sends pipeline to backend

export const SubmitButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // 1. Get current pipeline state
      const { nodes, edges } = getNodesAndEdges();
      
      // 2. POST to backend
      const response = await fetch('http://localhost:8000/pipelines/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      // 3. Parse response
      const data = await response.json();
      setResult(data);  // { num_nodes, num_edges, is_dag }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? '⏳ Analyzing...' : '🚀 Submit Pipeline'}
      </button>
      
      {/* Result Modal */}
      {result && (
        <Modal>
          <p>Nodes: {result.num_nodes}</p>
          <p>Edges: {result.num_edges}</p>
          <p>Is DAG: {result.is_dag ? 'Yes ✓' : 'No ✗'}</p>
        </Modal>
      )}
    </>
  );
};
```

---

## 6. Backend Pipeline Parsing

```python
# main.py - FastAPI backend

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

# Request/Response Models
class Node(BaseModel):
    id: str
    type: Optional[str] = None
    position: Optional[Dict[str, float]] = None
    data: Optional[Dict[str, Any]] = None

class Edge(BaseModel):
    source: str
    target: str

class PipelineRequest(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

class PipelineResponse(BaseModel):
    num_nodes: int
    num_edges: int
    is_dag: bool


# DAG Detection
def is_dag(nodes, edges):
    if not nodes:
        return True
    
    # Build adjacency list
    adj = {node.id: [] for node in nodes}
    for edge in edges:
        if edge.source in adj:
            adj[edge.source].append(edge.target)
    
    # Three-color DFS
    WHITE, GRAY, BLACK = 0, 1, 2
    color = {node.id: WHITE for node in nodes}
    
    def dfs(node):
        color[node] = GRAY
        for neighbor in adj.get(node, []):
            if neighbor not in color:
                continue
            if color[neighbor] == GRAY:  # Back edge!
                return False
            if color[neighbor] == WHITE:
                if not dfs(neighbor):
                    return False
        color[node] = BLACK
        return True
    
    for node_id in color:
        if color[node_id] == WHITE:
            if not dfs(node_id):
                return False
    return True


# API Endpoint
@app.post('/pipelines/parse')
def parse_pipeline(pipeline: PipelineRequest):
    return PipelineResponse(
        num_nodes=len(pipeline.nodes),
        num_edges=len(pipeline.edges),
        is_dag=is_dag(pipeline.nodes, pipeline.edges)
    )
```

---

## 7. Eraser Mode Implementation

```javascript
// ui.js - Eraser toggle for deleting nodes/edges

const [eraserMode, setEraserMode] = useState(false);

// Delete node when clicked in eraser mode
const onNodeClick = useCallback((event, node) => {
  if (eraserMode) {
    // Remove node
    setNodes((nds) => nds.filter((n) => n.id !== node.id));
    // Remove connected edges
    setEdges((eds) => eds.filter(
      (e) => e.source !== node.id && e.target !== node.id
    ));
  }
}, [eraserMode, setNodes, setEdges]);

// Delete edge when clicked in eraser mode
const onEdgeClick = useCallback((event, edge) => {
  if (eraserMode) {
    setEdges((eds) => eds.filter((e) => e.id !== edge.id));
  }
}, [eraserMode, setEdges]);

// Toggle button
<button
  className={`eraser-button ${eraserMode ? 'active' : ''}`}
  onClick={() => setEraserMode(!eraserMode)}
>
  🗑️
</button>
```

---

## 8. Connection Styling

```javascript
// When nodes are connected
const onConnect = useCallback((connection) => 
  setEdges((eds) => addEdge({
    ...connection,
    type: 'smoothstep',           // Smooth curved line
    animated: true,                // Moving dashes
    markerEnd: {
      type: MarkerType.Arrow,      // Arrow at end
      height: '20px',
      width: '20px'
    }
  }, eds)),
[setEdges]);
```

**Edge Types Available:**
- `default` - Straight line
- `straight` - Straight line
- `step` - Right-angle turns
- `smoothstep` - Smooth curves at turns
- `bezier` - Curved bezier path
