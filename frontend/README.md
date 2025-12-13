# VectorShift Pipeline Builder

A visual pipeline builder application built with React Flow for the frontend and FastAPI for the backend. This project implements the VectorShift Frontend Technical Assessment.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- npm or yarn

### Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn pydantic

# Run the server
uvicorn main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Add zustand if not already installed
npm install zustand

# Run the development server
npm start
```

The frontend will be available at `http://localhost:3000`

## 📁 Project Structure

```
vectorshift/
├── frontend/
│   └── src/
│       ├── nodes/
│       │   ├── BaseNode.js      # Reusable node abstraction
│       │   ├── BaseNode.css     # Node styling
│       │   ├── inputNode.js     # Input data node
│       │   ├── outputNode.js    # Output data node
│       │   ├── textNode.js      # Text node with variable detection
│       │   ├── TextNode.css     # Text node specific styles
│       │   ├── llmNode.js       # LLM processing node
│       │   ├── TimestampNode.js # Timestamp output node
│       │   ├── TransformNode.js # Data transformation node
│       │   ├── FilterNode.js    # Conditional filter node
│       │   ├── PromptNode.js    # Prompt template node
│       │   └── JoinNode.js      # Multi-input join node
│       ├── App.js               # Main application
│       ├── ui.js                # React Flow canvas
│       ├── toolbar.js           # Node palette toolbar
│       ├── toolbar.css          # Toolbar styles
│       ├── submit.js            # Submit button with API call
│       ├── store.js             # Zustand state management
│       ├── draggableNode.js     # Draggable node component
│       └── index.css            # Global styles
└── backend/
    └── main.py                  # FastAPI server with DAG detection
```

## ✨ Features

### Part 1: Node Abstraction
All nodes use a shared `BaseNode` component that provides:
- Consistent header with icon and title
- Configurable handles (inputs/outputs)
- Unified styling with hover/focus states
- Easy extensibility for new node types

**New Nodes Added:**
- **TimestampNode** - Outputs current time in various formats
- **TransformNode** - Transforms data (uppercase, lowercase, trim, etc.)
- **FilterNode** - Filters data with pass/fail outputs
- **PromptNode** - Template editor for prompt engineering
- **JoinNode** - Combines multiple inputs with configurable separator

### Part 2: Styling
- Modern dark theme with CSS variables
- Glassmorphism effects on nodes
- Smooth hover/focus transitions
- Clear handle visuals with glow effects
- Organized toolbar with grouped nodes

### Part 3: Text Node Logic

The Text node features:
1. **Auto-resize textarea** - Grows/shrinks as you type
2. **Variable detection** - Recognizes `{{ variableName }}` patterns
3. **Dynamic handles** - Creates left-side handles for valid variables
4. **Validation UI** - Invalid variable names shown in red

**Variable Detection Rules:**
- Syntax: `{{ variableName }}`
- Valid identifiers: Must match `/^[A-Za-z_$][A-Za-z0-9_$]*$/`
- Examples:
  - ✅ `{{ input }}` - Valid
  - ✅ `{{ user_name }}` - Valid
  - ✅ `{{ $data }}` - Valid
  - ❌ `{{ 123abc }}` - Invalid (starts with number)
  - ❌ `{{ my-var }}` - Invalid (contains hyphen)

### Part 4: Backend Integration

**Frontend:**
- Submit button sends `{ nodes, edges }` to backend
- Displays alert with analysis results

**Backend:**
- POST `/pipelines/parse` endpoint
- Returns `{ num_nodes, num_edges, is_dag }`
- DAG detection using DFS with cycle detection

## 🧪 Testing

### Manual Test Steps

1. **Start both servers** (backend on 8000, frontend on 3000)

2. **Test Node Creation:**
   - Drag each node type onto the canvas
   - Verify all 9 node types work correctly

3. **Test Text Node Variables:**
   - Add a Text node
   - Type `{{ input }}` - verify left handle appears
   - Type `{{ output }}` - verify second handle
   - Type `{{ 123invalid }}` - verify red highlight, no handle

4. **Test Pipeline Submission:**
   - Create a simple pipeline (Input → Text → LLM → Output)
   - Connect the nodes
   - Click "Submit Pipeline"
   - Verify alert shows correct node/edge counts

### cURL Test Commands

```bash
# Test basic pipeline (should return is_dag: true)
curl -X POST http://localhost:8000/pipelines/parse \
  -H "Content-Type: application/json" \
  -d '{"nodes": [{"id": "1"}, {"id": "2"}, {"id": "3"}], "edges": [{"source": "1", "target": "2"}, {"source": "2", "target": "3"}]}'

# Expected: {"num_nodes":3,"num_edges":2,"is_dag":true}

# Test cycle detection (should return is_dag: false)
curl -X POST http://localhost:8000/pipelines/parse \
  -H "Content-Type: application/json" \
  -d '{"nodes": [{"id": "1"}, {"id": "2"}], "edges": [{"source": "1", "target": "2"}, {"source": "2", "target": "1"}]}'

# Expected: {"num_nodes":2,"num_edges":2,"is_dag":false}

# Test empty pipeline
curl -X POST http://localhost:8000/pipelines/parse \
  -H "Content-Type: application/json" \
  -d '{"nodes": [], "edges": []}'

# Expected: {"num_nodes":0,"num_edges":0,"is_dag":true}
```

## 🔧 DAG Detection Algorithm

The backend uses **Depth-First Search (DFS)** with three-color marking:

```python
# Colors represent node states during traversal
WHITE = 0  # Not yet visited
GRAY = 1   # Currently being processed (in DFS stack)
BLACK = 2  # Fully processed

def is_dag(nodes, edges):
    # Build adjacency list
    # For each unvisited node, run DFS
    # If we encounter a GRAY node, we found a back edge = cycle
    # Graph is DAG if no cycles found
```

**Why this works:**
- A GRAY node is on the current DFS path
- If we reach a GRAY node again, we've found a cycle
- After processing all descendants, node becomes BLACK
- BLACK nodes are safe - no cycles through them

## 📝 API Reference

### GET /
Health check endpoint.

**Response:**
```json
{"status": "ok", "message": "VectorShift Pipeline API is running"}
```

### POST /pipelines/parse
Analyzes a pipeline graph.

**Request Body:**
```json
{
  "nodes": [
    {"id": "node-1", "type": "customInput", "position": {"x": 0, "y": 0}, "data": {}}
  ],
  "edges": [
    {"source": "node-1", "target": "node-2"}
  ]
}
```

**Response:**
```json
{
  "num_nodes": 2,
  "num_edges": 1,
  "is_dag": true
}
```

## 📄 License

MIT License
