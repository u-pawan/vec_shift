# 🔧 Backend Guide - VectorShift Pipeline API

This guide explains how the backend works in this project. The backend is the "server" part that runs separately from what you see in the browser.

---

## Table of Contents
1. [What is the Backend?](#what-is-the-backend)
2. [Files Overview](#files-overview)
3. [main.py Explained](#mainpy-explained)
4. [The DAG Algorithm](#the-dag-algorithm)
5. [test_main.py Explained](#test_mainpy-explained)
6. [How to Run](#how-to-run)
7. [Testing with cURL](#testing-with-curl)

---

## What is the Backend?

### Frontend vs Backend
```
┌─────────────────┐         ┌─────────────────┐
│    FRONTEND     │  HTTP   │    BACKEND      │
│   (Browser)     │ ──────► │    (Server)     │
│                 │ ◄────── │                 │
│  - React        │         │  - Python       │
│  - What you see │         │  - FastAPI      │
│  - Port 3000    │         │  - Port 8000    │
└─────────────────┘         └─────────────────┘
```

**Frontend**: What users see and interact with (the canvas, nodes, buttons)
**Backend**: Processes data, runs calculations, stores information

### Why Do We Need a Backend?
1. **Complex calculations** - DAG detection is done on the server
2. **Security** - Some logic shouldn't run in the browser
3. **Data persistence** - Could save pipelines to a database
4. **Scalability** - Can handle many users

---

## Files Overview

```
backend/
├── main.py          # The main server code
└── test_main.py     # Unit tests for the server
```

---

## main.py Explained

Let's go through the entire file section by section:

### 1. Imports
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
```

| Import | What it does |
|--------|-------------|
| `FastAPI` | The web framework we use |
| `CORSMiddleware` | Allows frontend to talk to backend |
| `BaseModel` | Creates data validation schemas |
| `List, Dict, Any, Optional` | Type hints for Python |

### 2. Create the App
```python
app = FastAPI(
    title="VectorShift Pipeline API",
    description="Backend API for parsing and analyzing pipeline graphs",
    version="1.0.0"
)
```

This creates our web server with a name and description.

### 3. CORS Middleware
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**What is CORS?**
CORS = Cross-Origin Resource Sharing

By default, a website at `localhost:3000` cannot talk to a server at `localhost:8000`. They're different "origins". CORS allows this communication.

Without CORS:
```
Frontend (3000) → Backend (8000) ❌ BLOCKED!
```

With CORS:
```
Frontend (3000) → Backend (8000) ✅ ALLOWED
```

### 4. Data Models (Pydantic)
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

**What are these?**
These are "schemas" - they define what data looks like.

When data comes in:
1. Pydantic checks if it matches the schema
2. If not, it returns an error automatically
3. If yes, it converts it to Python objects

Example:
```python
# Incoming JSON
{"id": "node-1", "type": "input"}

# Becomes Python object
node = Node(id="node-1", type="input")
print(node.id)  # "node-1"
```

### 5. The DAG Detection Function
```python
def is_dag(nodes: List[Node], edges: List[Edge]) -> bool:
    """Check if the graph is a DAG (no cycles)"""
    # ... (explained in detail below)
```

This is the main algorithm - see next section!

### 6. API Endpoints

#### Health Check (GET /)
```python
@app.get('/')
def read_root():
    return {'status': 'ok', 'message': 'VectorShift Pipeline API is running'}
```

A simple endpoint to check if the server is running.
- **URL**: `http://localhost:8000/`
- **Method**: GET
- **Response**: `{"status": "ok", "message": "..."}`

#### Parse Pipeline (POST /pipelines/parse)
```python
@app.post('/pipelines/parse', response_model=PipelineResponse)
def parse_pipeline(pipeline: PipelineRequest):
    num_nodes = len(pipeline.nodes)
    num_edges = len(pipeline.edges)
    dag_status = is_dag(pipeline.nodes, pipeline.edges)
    
    return PipelineResponse(
        num_nodes=num_nodes,
        num_edges=num_edges,
        is_dag=dag_status
    )
```

This is the main endpoint the frontend calls:
- **URL**: `http://localhost:8000/pipelines/parse`
- **Method**: POST
- **Body**: `{"nodes": [...], "edges": [...]}`
- **Response**: `{"num_nodes": 3, "num_edges": 2, "is_dag": true}`

---

## The DAG Algorithm

### What is a DAG?
DAG = Directed Acyclic Graph

**Directed**: Edges have direction (A → B, not A ↔ B)
**Acyclic**: No cycles (you can't go in circles)

```
VALID DAG:                 INVALID (has cycle):
A → B → C                  A → B
    ↓                      ↑   ↓
    D                      C ← D
```

### Why Check for DAG?
In a pipeline, data flows from inputs to outputs. If there's a cycle, data would loop forever!

```
Bad: Input → Process → Output → Input → Process → ...
     (infinite loop!)
```

### The Algorithm: DFS with 3 Colors

We use **Depth-First Search (DFS)** with a coloring system:

```python
WHITE = 0  # Not visited yet
GRAY = 1   # Currently being processed (in the current path)
BLACK = 2  # Completely done processing
```

**The Logic:**
1. Start with all nodes WHITE
2. Visit each unvisited node
3. When visiting: mark GRAY
4. Visit all neighbors (nodes it connects to)
5. If we hit a GRAY node → CYCLE FOUND! (not a DAG)
6. When done with all neighbors: mark BLACK

**Visual Example:**
```
Graph: A → B → C
       ↓
       D

Step 1: Visit A (mark GRAY)
        WHITE: [B, C, D]
        GRAY:  [A]

Step 2: Visit B (mark GRAY)
        WHITE: [C, D]
        GRAY:  [A, B]

Step 3: Visit C (mark GRAY, no neighbors)
        WHITE: [D]
        GRAY:  [A, B, C]
        
Step 4: C done (mark BLACK)
        GRAY:  [A, B]
        BLACK: [C]

Step 5: B done (mark BLACK)
        GRAY:  [A]
        BLACK: [B, C]

Step 6: Visit D (mark GRAY, no neighbors)
        GRAY:  [A, D]
        BLACK: [B, C]

Step 7: D done (mark BLACK)
        GRAY:  [A]
        BLACK: [B, C, D]

Step 8: A done (mark BLACK)
        BLACK: [A, B, C, D]

Result: No GRAY nodes hit twice → Valid DAG! ✅
```

### The Code
```python
def is_dag(nodes: List[Node], edges: List[Edge]) -> bool:
    if not nodes:
        return True  # Empty graph is a DAG
    
    # Build adjacency list (who connects to who)
    node_ids = {node.id for node in nodes}
    adj: Dict[str, List[str]] = {node_id: [] for node_id in node_ids}
    
    for edge in edges:
        if edge.source in adj:
            adj[edge.source].append(edge.target)
    
    # Color states
    WHITE, GRAY, BLACK = 0, 1, 2
    color: Dict[str, int] = {node_id: WHITE for node_id in node_ids}
    
    def dfs(node: str) -> bool:
        color[node] = GRAY  # Mark as processing
        
        for neighbor in adj.get(node, []):
            if neighbor not in color:
                continue
                
            if color[neighbor] == GRAY:
                # Back edge found - cycle detected!
                return False
            
            if color[neighbor] == WHITE:
                if not dfs(neighbor):
                    return False
        
        color[node] = BLACK  # Mark as done
        return True
    
    # Check all nodes
    for node_id in node_ids:
        if color[node_id] == WHITE:
            if not dfs(node_id):
                return False
    
    return True
```

---

## test_main.py Explained

### What are Tests?
Tests are code that checks if your other code works correctly.

```python
def test_addition():
    assert 1 + 1 == 2  # This should be True
    assert 2 + 2 == 5  # This would FAIL!
```

### Test Structure
```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)  # Create a fake client

def test_something():
    response = client.post("/endpoint", json={...})
    assert response.status_code == 200
    assert response.json()["key"] == expected_value
```

### Our Tests

#### 1. Empty Pipeline
```python
def test_empty_pipeline():
    response = client.post("/pipelines/parse", json={"nodes": [], "edges": []})
    assert response.json()["num_nodes"] == 0
    assert response.json()["is_dag"] == True  # Empty is valid DAG
```

#### 2. Linear Pipeline (Valid DAG)
```python
def test_linear_pipeline():
    # A → B → C
    response = client.post("/pipelines/parse", json={
        "nodes": [{"id": "A"}, {"id": "B"}, {"id": "C"}],
        "edges": [
            {"source": "A", "target": "B"},
            {"source": "B", "target": "C"}
        ]
    })
    assert response.json()["is_dag"] == True
```

#### 3. Simple Cycle (Invalid DAG)
```python
def test_simple_cycle():
    # A → B → A (cycle!)
    response = client.post("/pipelines/parse", json={
        "nodes": [{"id": "A"}, {"id": "B"}],
        "edges": [
            {"source": "A", "target": "B"},
            {"source": "B", "target": "A"}
        ]
    })
    assert response.json()["is_dag"] == False
```

#### 4. Self Loop (Invalid DAG)
```python
def test_self_loop():
    # A → A (points to itself!)
    response = client.post("/pipelines/parse", json={
        "nodes": [{"id": "A"}],
        "edges": [{"source": "A", "target": "A"}]
    })
    assert response.json()["is_dag"] == False
```

### Running Tests
```bash
cd backend
pip install pytest httpx  # Install test dependencies
python -m pytest test_main.py -v
```

---

## How to Run

### Start the Server
```bash
cd backend
pip install fastapi uvicorn pydantic  # Install dependencies
python -m uvicorn main:app --reload --port 8000
```

- `main` = the file (main.py)
- `app` = the FastAPI instance
- `--reload` = auto-restart on file changes
- `--port 8000` = use port 8000

### Check if Running
Open browser: `http://localhost:8000`

You should see:
```json
{"status": "ok", "message": "VectorShift Pipeline API is running"}
```

### API Documentation
FastAPI auto-generates docs!
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## Testing with cURL

cURL is a command-line tool for making HTTP requests.

### Test Health Check
```bash
curl http://localhost:8000/
```

### Test Valid DAG
```bash
curl -X POST http://localhost:8000/pipelines/parse \
  -H "Content-Type: application/json" \
  -d '{"nodes": [{"id": "1"}, {"id": "2"}], "edges": [{"source": "1", "target": "2"}]}'
```
**Expected**: `{"num_nodes":2,"num_edges":1,"is_dag":true}`

### Test Invalid DAG (Cycle)
```bash
curl -X POST http://localhost:8000/pipelines/parse \
  -H "Content-Type: application/json" \
  -d '{"nodes": [{"id": "1"}, {"id": "2"}], "edges": [{"source": "1", "target": "2"}, {"source": "2", "target": "1"}]}'
```
**Expected**: `{"num_nodes":2,"num_edges":2,"is_dag":false}`

### Test Empty Pipeline
```bash
curl -X POST http://localhost:8000/pipelines/parse \
  -H "Content-Type: application/json" \
  -d '{"nodes": [], "edges": []}'
```
**Expected**: `{"num_nodes":0,"num_edges":0,"is_dag":true}`

---

## Summary

| Concept | Explanation |
|---------|-------------|
| FastAPI | Python web framework for building APIs |
| Pydantic | Data validation library |
| CORS | Allows cross-origin requests |
| Endpoint | URL path that accepts requests |
| DAG | Directed Acyclic Graph (no cycles) |
| DFS | Depth-First Search algorithm |

The backend's job is simple:
1. Receive nodes and edges from frontend
2. Count them
3. Check if they form a valid DAG
4. Return the results

Happy learning! 🚀
