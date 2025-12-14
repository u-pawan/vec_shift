# VectorShift Pipeline Builder - Project Overview

## What is this project?

A **visual pipeline builder** application that allows users to design and validate data processing pipelines using a drag-and-drop interface. Think of it as a simplified version of tools like Apache Airflow's DAG editor or Node-RED.

---

## Why was this project built?

This was built as a **technical assessment** for VectorShift to demonstrate:
1. Frontend skills with React and React Flow
2. Backend API design with FastAPI
3. Understanding of graph theory (DAG detection)
4. State management patterns
5. Component abstraction and reusability

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 | UI Framework |
| **Flow Library** | React Flow 11.8 | Drag-and-drop node editor |
| **State Management** | Zustand 5.x | Lightweight state management |
| **Backend** | FastAPI | REST API framework |
| **Validation** | Pydantic | Request/response validation |
| **Styling** | Vanilla CSS | Custom dark theme with glassmorphism |

---

## Key Features

### 1. Node Abstraction
- **BaseNode Component**: Reusable wrapper that provides consistent header, body, handles, and styling
- **9 Node Types**: Input, Output, Text, LLM, Timestamp, Transform, Filter, Prompt, Join

### 2. Dynamic Variable Detection (Text Node)
- Auto-detects `{{ variableName }}` patterns in text
- Creates dynamic input handles for valid variables
- Validates JavaScript identifier syntax

### 3. DAG Validation
- Backend algorithm detects cycles in the pipeline
- Uses DFS with three-color marking (WHITE, GRAY, BLACK)
- Returns analysis: node count, edge count, is_dag boolean

### 4. Modern UI/UX
- Dark theme with CSS custom properties
- Glassmorphism effects on nodes
- Smooth hover transitions
- Eraser mode for deleting nodes/edges

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   Toolbar   │  │  PipelineUI │  │   Submit    │      │
│  │   (nodes)   │  │ (ReactFlow) │  │   Button    │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
│         │                │                │              │
│         └────────────────┼────────────────┘              │
│                          │                               │
│              ┌───────────┴───────────┐                   │
│              │    Zustand Store      │                   │
│              │  (nodes, edges, IDs)  │                   │
│              └───────────────────────┘                   │
└─────────────────────────────────────────────────────────┘
                           │
                           │ POST /pipelines/parse
                           │ { nodes, edges }
                           ▼
┌─────────────────────────────────────────────────────────┐
│                      BACKEND                             │
│  ┌─────────────────────────────────────────────────┐    │
│  │              FastAPI Application                 │    │
│  │  ┌─────────────┐  ┌─────────────────────────┐   │    │
│  │  │   CORS      │  │   /pipelines/parse      │   │    │
│  │  │ Middleware  │  │   - is_dag() algorithm  │   │    │
│  │  └─────────────┘  └─────────────────────────┘   │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                           │
                           │ Response
                           │ { num_nodes, num_edges, is_dag }
                           ▼
                    Displayed in Modal
```

---

## How to Run the Project

### Backend
```bash
cd backend
pip install fastapi uvicorn pydantic
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm start
# Opens at http://localhost:3000
```

---

## Project Statistics

- **Frontend Files**: ~15 source files
- **Backend Files**: 2 files (main.py, test_main.py)
- **Node Types**: 9 custom nodes
- **Lines of Code**: ~1000 (frontend) + 150 (backend)
- **Test Cases**: 12 unit tests for DAG detection
