# Technical Deep Dive

## 1. Frontend Architecture

### Component Hierarchy

```
App.js
├── PipelineToolbar (toolbar.js)
│   └── DraggableNode × 9 (draggableNode.js)
│       └── Each node type (Input, Output, Text, LLM, etc.)
├── PipelineUI (ui.js)
│   └── ReactFlow
│       ├── Background
│       ├── Controls
│       ├── MiniMap
│       └── Custom Nodes
│           ├── InputNode
│           ├── OutputNode
│           ├── TextNode (with dynamic handles)
│           ├── LLMNode
│           ├── TimestampNode
│           ├── TransformNode
│           ├── FilterNode
│           ├── PromptNode
│           └── JoinNode
└── SubmitButton (submit.js)
    └── Modal (result display)
```

---

### State Management Flow

```
User Action (drag, connect, edit)
         │
         ▼
┌─────────────────────┐
│   React useState    │  ← nodes, edges arrays
│   (in ui.js)        │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   applyNodeChanges  │  ← React Flow utility
│   applyEdgeChanges  │
│   addEdge           │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   setNodes()        │  ← State update
│   setEdges()        │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   React Flow        │  ← Re-render canvas
│   Re-renders        │
└─────────────────────┘
```

---

### Drag-and-Drop Implementation

```javascript
// 1. Start Drag (draggableNode.js)
const onDragStart = (event) => {
  event.dataTransfer.setData(
    'application/reactflow',
    JSON.stringify({ nodeType: type })
  );
  event.dataTransfer.effectAllowed = 'move';
};

// 2. Handle Drop (ui.js)
const onDrop = (event) => {
  const appData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
  const type = appData?.nodeType;
  
  // Convert screen coordinates to canvas coordinates
  const position = reactFlowInstance.project({
    x: event.clientX - reactFlowBounds.left,
    y: event.clientY - reactFlowBounds.top,
  });
  
  // Create new node
  const newNode = {
    id: getNodeID(type),
    type,
    position,
    data: getInitNodeData(nodeID, type),
  };
  
  setNodes((nds) => [...nds, newNode]);
};
```

---

## 2. Backend Architecture

### API Endpoint Structure

```
FastAPI App
│
├── Middleware
│   └── CORSMiddleware (allow localhost:3000)
│
├── GET /
│   └── Health check → {"status": "ok"}
│
└── POST /pipelines/parse
    ├── Input: PipelineRequest (nodes[], edges[])
    ├── Process: is_dag(nodes, edges)
    └── Output: PipelineResponse (num_nodes, num_edges, is_dag)
```

---

### Pydantic Models

```python
class Node(BaseModel):
    id: str
    type: Optional[str] = None
    position: Optional[Dict[str, float]] = None
    data: Optional[Dict[str, Any]] = None

class Edge(BaseModel):
    id: Optional[str] = None
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None

class PipelineRequest(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

class PipelineResponse(BaseModel):
    num_nodes: int
    num_edges: int
    is_dag: bool
```

---

### DAG Detection Algorithm (Detailed)

```python
def is_dag(nodes: List[Node], edges: List[Edge]) -> bool:
    """
    Time: O(V + E)
    Space: O(V)
    
    Three-color DFS:
    - WHITE: Not visited
    - GRAY: In current DFS path
    - BLACK: Fully processed
    """
    if not nodes:
        return True
    
    # Step 1: Build adjacency list
    node_ids = {node.id for node in nodes}
    adj = {node_id: [] for node_id in node_ids}
    
    for edge in edges:
        if edge.source in adj:
            adj[edge.source].append(edge.target)
    
    # Step 2: Initialize colors
    WHITE, GRAY, BLACK = 0, 1, 2
    color = {node_id: WHITE for node_id in node_ids}
    
    # Step 3: DFS with cycle detection
    def dfs(node):
        color[node] = GRAY  # Currently processing
        
        for neighbor in adj.get(node, []):
            if neighbor not in color:
                continue  # Skip invalid edges
            
            if color[neighbor] == GRAY:
                return False  # Back edge = cycle!
            
            if color[neighbor] == WHITE:
                if not dfs(neighbor):
                    return False
        
        color[node] = BLACK  # Done processing
        return True
    
    # Step 4: Check all components
    for node_id in node_ids:
        if color[node_id] == WHITE:
            if not dfs(node_id):
                return False
    
    return True
```

**Why three colors work:**
- GRAY means "I'm still exploring this path"
- If you reach a GRAY node, you've come back to your own path = cycle
- BLACK means "all paths from here are safe"

---

## 3. Text Node Variable Detection

### Parsing Pipeline

```
User Types: "Hello {{ name }}, your order {{ order_id }} is ready"
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│ Regex: /\{\{\s*([^{}]+?)\s*\}\}/g                       │
│                                                          │
│ Matches:                                                 │
│   1. {{ name }} → "name"                                │
│   2. {{ order_id }} → "order_id"                        │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│ Validation: /^[A-Za-z_$][A-Za-z0-9_$]*$/                │
│                                                          │
│ Results:                                                 │
│   - "name" → ✅ Valid                                   │
│   - "order_id" → ✅ Valid                               │
│   - "123abc" → ❌ Invalid (starts with number)          │
│   - "my-var" → ❌ Invalid (contains hyphen)             │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│ Handle Generation:                                       │
│                                                          │
│ validVariables.map((v, index) => {                      │
│   const topPercent = ((index + 1) / (total + 1)) * 100; │
│   return <Handle position={topPercent} ... />           │
│ });                                                      │
└─────────────────────────────────────────────────────────┘
```

### Handle Positioning Math

```
For 2 variables:
┌─────────────────────┐
│       33.3%         │ ← Handle 1 at (1/3 * 100)
│                     │
│       66.6%         │ ← Handle 2 at (2/3 * 100)
└─────────────────────┘

Formula: position = ((index + 1) / (count + 1)) * 100%

This ensures equal spacing between:
- Top edge and first handle
- Each handle
- Last handle and bottom edge
```

---

## 4. CSS Architecture

### CSS Custom Properties (Dark Theme)

```css
:root {
  /* Background colors */
  --bg-primary: #0f172a;      /* Darkest */
  --bg-secondary: #1e293b;    /* Slightly lighter */
  --bg-tertiary: #334155;     /* For hover states */
  
  /* Text colors */
  --text-primary: #f1f5f9;    /* Main text */
  --text-secondary: #94a3b8;  /* Muted text */
  
  /* Accent colors */
  --accent-primary: #6366f1;  /* Indigo */
  --accent-secondary: #8b5cf6; /* Purple */
  --accent-success: #10b981;  /* Green */
  --accent-error: #ef4444;    /* Red */
  
  /* Effects */
  --glow-color: rgba(99, 102, 241, 0.5);
  --blur-amount: 12px;
}
```

### Glassmorphism Effect

```css
.node-base {
  background: rgba(30, 41, 59, 0.85);
  backdrop-filter: blur(var(--blur-amount));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.2),
    0 2px 4px -2px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}
```

---

## 5. React Flow Integration Details

### Node Type Registration

```javascript
// Must be defined OUTSIDE component to prevent recreation
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

// WRONG: Inside component causes infinite re-renders
const MyComponent = () => {
  const nodeTypes = { ... }; // ❌ Recreated every render
  return <ReactFlow nodeTypes={nodeTypes} />;
};

// CORRECT: Outside component
const nodeTypes = { ... }; // ✅ Created once
const MyComponent = () => {
  return <ReactFlow nodeTypes={nodeTypes} />;
};
```

### Handle Configuration

```javascript
// Handle types
type: 'source'   // Output handle (can connect FROM here)
type: 'target'   // Input handle (can connect TO here)

// Positions
Position.Left    // Left side of node
Position.Right   // Right side of node
Position.Top     // Top of node
Position.Bottom  // Bottom of node

// Example with styled handles
<Handle
  type="target"
  position={Position.Left}
  id="input"
  className="node-handle"
  style={{ top: '50%' }}
/>
```

---

## 6. Performance Optimizations

### 1. Memoization

```javascript
// Memoize node component
export const TextNode = memo(({ id, data }) => { ... });

// Memoize expensive calculations
const variables = useMemo(() => extractVariables(currText), [currText]);
const validVariables = useMemo(() => variables.filter(v => v.isValid), [variables]);
```

### 2. useLayoutEffect for DOM Measurements

```javascript
// useLayoutEffect runs BEFORE browser paint
// Good for measuring and synchronously updating DOM
useLayoutEffect(() => {
  const textarea = textareaRef.current;
  if (textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
}, [currText]);
```

### 3. Callback Memoization

```javascript
// Prevents function recreation on every render
const onNodesChange = useCallback(
  (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
  [setNodes]
);
```

---

## 7. Error Handling

### Frontend

```javascript
try {
  const response = await fetch(`${API_URL}/pipelines/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  setResult(data);
} catch (err) {
  setError(err.message);  // Show in modal
}
```

### Backend

```python
# Pydantic automatically validates request structure
# Invalid requests return 422 Unprocessable Entity

# Custom validation example
@app.post('/pipelines/parse')
def parse_pipeline(pipeline: PipelineRequest):
    try:
        dag_status = is_dag(pipeline.nodes, pipeline.edges)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```
