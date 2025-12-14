# VectorShift Pipeline Builder

## Overview
VectorShift Pipeline Builder is a powerful visual tool for creating, configuring, and analyzing node-based workflows. It features a responsive drag-and-drop interface and a robust backend for validating pipeline structures.

## Features
- **Visual Interface**: Intuitive drag-and-drop canvas built with React Flow.
- **Diverse Node Types**:
  - **Data**: Input, Output, Text (with variable extraction)
  - **Processing**: LLM (Large Language Model), Transform, Filter
  - **Utilities**: Join, Timestamp, Prompt Template
- **Real-time Pipeline Analysis**: 
  - Validates if the pipeline is a Directed Acyclic Graph (DAG).
  - Calculates the total number of nodes and edges.
- **Modern Design**: Sleek dark mode UI with a responsive toolbar and styling.

## Tech Stack
### Frontend
- **Framework**: React.js
- **Flow Library**: React Flow
- **State Management**: Zustand
- **Styling**: Pure CSS (Variables & Flexbox/Grid)

### Backend
- **Framework**: FastAPI (Python)
- **Server**: Uvicorn
- **Validation**: Pydantic
- **Testing**: Pytest

## Project Structure

```
VectorShift/
├── backend/                 # Python FastAPI Backend
│   ├── main.py              # API Endpoints & Logic
│   └── test_main.py         # Unit Tests
│
├── frontend/                # React Frontend
│   ├── node_modules/        # Installed Dependencies (not tracked)
│   ├── public/              # Static Assets (HTML, Icons)
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── manifest.json
│   ├── src/                 # Source Code
│   │   ├── nodes/           # Custom Node Components
│   │   │   ├── BaseNode.js
│   │   │   ├── FilterNode.js
│   │   │   ├── LLMNode.js
│   │   │   ├── OutputNode.js
│   │   │   └── ... (other nodes)
│   │   ├── App.js           # Main App Component
│   │   ├── draggableNode.js # Sidebar Draggable Items
│   │   ├── index.css        # Global Styles
│   │   ├── index.js         # Entry Point
│   │   ├── store.js         # Zustand State Management
│   │   ├── submit.js        # Pipeline Submission Logic
│   │   ├── toolbar.css      # Toolbar specific styles
│   │   ├── toolbar.js       # Node Toolbar
│   │   └── ui.js            # Main Canvas UI (React Flow)
│   ├── package.json         # Project Metadata & Scripts
│   └── package-lock.json    # Dependency Lock File
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)

### Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository_url>
   cd VectorShift
   ```

2. **Backend Setup**
   Navigate to the backend directory and install dependencies.
   ```bash
   cd backend
   # It is recommended to use a virtual environment
   # python -m venv venv
   # ./venv/Scripts/activate (Windows) or source venv/bin/activate (Mac/Linux)
   
   pip install fastapi uvicorn pydantic
   
   # Run the server
   python -m uvicorn main:app --reload --port 8000 --host 0.0.0.0
   ```
   The backend will start at `http://localhost:8000`.

3. **Frontend Setup**
   Open a new terminal, navigate to the frontend directory, install dependencies, and start the app.
   ```bash
   cd frontend
   npm install
   npm start
   ```
   The application will open automatically at `http://localhost:3000`.

## Usage
1. **Add Nodes**: Open the toolbar (hamburger menu on mobile) and drag nodes onto the canvas.
2. **Connect Nodes**: Drag from a handle (dot) on one node to a handle on another to create dependencies.
3. **Configure Nodes**: Interact with the inputs inside the nodes to set values (e.g., text, transformation types).
4. **Submit**: Click the "Submit Pipeline" button to send the graph to the backend for analysis.
5. **View Results**: A modal will appear showing whether your pipeline is valid (DAG) and the count of nodes/edges.
