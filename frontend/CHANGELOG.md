# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2024-12-11

### Added

#### Part 1: Node Abstraction
- **BaseNode.js** - Reusable node abstraction component (`frontend/src/nodes/BaseNode.js`)
- **BaseNode.css** - Unified node styling (`frontend/src/nodes/BaseNode.css`)
- Refactored all existing nodes (input, output, text, LLM) to use BaseNode
- Created 5 new demonstration nodes:
  - `TimestampNode.js` - Outputs current timestamp
  - `TransformNode.js` - Data transformation operations
  - `FilterNode.js` - Conditional filtering with dual outputs
  - `PromptNode.js` - Prompt template editing
  - `JoinNode.js` - Multi-input combining

#### Part 2: Styling
- Modern dark theme with CSS variables
- Glassmorphism effects on nodes
- Hover/focus animations
- Organized toolbar with node groups
- Updated `index.css`, `toolbar.css`

#### Part 3: Text Node Logic
- Auto-resize textarea
- Variable detection with regex `/\{\{\s*([^{}]+?)\s*\}\}/g`
- Dynamic left-side handles for valid variables
- Red highlighting for invalid variable names
- Added `TextNode.css`

#### Part 4: Backend Integration
- Updated `submit.js` with fetch POST to backend
- Updated `main.py` with:
  - CORS middleware
  - Pydantic models for request/response
  - POST `/pipelines/parse` endpoint
  - DFS-based DAG detection algorithm
- User-friendly alert with num_nodes, num_edges, is_dag

### Files Changed
- `frontend/src/nodes/*` - All node files
- `frontend/src/ui.js` - Node type registration
- `frontend/src/toolbar.js` - Node palette
- `frontend/src/submit.js` - Backend integration
- `frontend/src/index.css` - Global styles
- `backend/main.py` - API endpoint
