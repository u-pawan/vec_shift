# 📚 Learn: VectorShift Pipeline Builder - Complete Guide

Welcome! This guide explains **everything** about this project from scratch. Even if you only know basic HTML and CSS, you'll understand how it all works by the end.

---

## Table of Contents
1. [What is This Project?](#what-is-this-project)
2. [Key Concepts](#key-concepts)
3. [Technologies Used](#technologies-used)
4. [Project Structure](#project-structure)
5. [How Each File Works](#how-each-file-works)
6. [Understanding the Code](#understanding-the-code)
7. [How Data Flows](#how-data-flows)
8. [The Backend Explained](#the-backend-explained)
9. [Common Terms Glossary](#common-terms-glossary)

---

## What is This Project?

### The Simple Explanation
Imagine you're building with LEGO blocks. Each block does something specific, and you connect them together to build something bigger. That's exactly what a **Pipeline Builder** does, but with software!

### Real-World Example
Let's say you want to:
1. Take some text input from a user
2. Transform it (like making it uppercase)
3. Send it to an AI (like ChatGPT)
4. Output the result

Instead of writing code, you **visually drag boxes** (nodes) and **connect them with lines** (edges). That's a pipeline!

```
[Input Box] → [Transform Box] → [AI Box] → [Output Box]
```

### What Does Our App Do?
- Shows a **canvas** (drawing area) where you build pipelines
- Provides **draggable nodes** (building blocks) in a toolbar
- Lets you **connect nodes** by drawing lines between them
- Has a **Submit button** that analyzes your pipeline

---

## Key Concepts

### 1. Nodes (The Building Blocks)
A **node** is a box on the canvas that represents an action or data. Think of it like a function or step in your pipeline.

```
┌─────────────────┐
│  📥 Input       │  ← Header with icon and title
├─────────────────┤
│  Name: [____]   │  ← Body with controls
│  Type: [Text▼]  │
└─────────────────┘
        ●            ← Handle (connection point)
```

**Types of nodes in our project:**
| Node | What it does |
|------|-------------|
| Input | Receives data into the pipeline |
| Output | Sends data out of the pipeline |
| Text | Holds text content with variables |
| LLM | Represents an AI language model |
| Timestamp | Outputs current time |
| Transform | Changes data (uppercase, lowercase, etc.) |
| Filter | Passes or blocks data based on conditions |
| Prompt | Template for AI prompts |
| Join | Combines multiple inputs |

### 2. Edges (The Connections)
An **edge** is a line connecting two nodes. It shows how data flows from one node to another.

```
[Node A] ───────→ [Node B]
         edge
```

### 3. Handles (Connection Points)
Handles are the small circles on nodes where edges connect.

- **Source handle** (right side): Data goes OUT from here
- **Target handle** (left side): Data comes IN here

```
              Target    Source
                 ●───┐ ┌───●
                     │ │
              ┌──────┘ └──────┐
              │    Node       │
              └───────────────┘
```

### 4. Pipeline
A pipeline is the complete set of connected nodes. Like a flowchart showing how data moves.

### 5. DAG (Directed Acyclic Graph)
A fancy term that means:
- **Directed**: Connections have a direction (A → B, not A ↔ B)
- **Acyclic**: No loops (you can't go A → B → C → A)

Why does this matter? Loops cause infinite processing! Our backend checks if your pipeline is a valid DAG.

---

## Technologies Used

### Frontend (What users see)

#### React
React is a JavaScript library for building user interfaces. Instead of writing HTML directly, you write **components** (reusable pieces).

```jsx
// HTML way
<div>
  <h1>Hello</h1>
</div>

// React way
function Greeting() {
  return <h1>Hello</h1>;
}
```

#### React Flow
A library specifically for building node-based interfaces. It handles:
- Dragging nodes
- Drawing edges
- Zooming and panning
- Node selection

#### JavaScript
The programming language that makes websites interactive. If HTML is the skeleton and CSS is the skin, JavaScript is the muscles.

### Backend (The server)

#### Python
A programming language known for being easy to read. Used for our server.

#### FastAPI
A modern Python framework for building APIs (ways for programs to talk to each other).

```python
@app.post('/pipelines/parse')
def parse_pipeline(data):
    # Process the data
    return result
```

---

## Project Structure

```
vectorshift/
├── frontend/                 # Everything the user sees
│   ├── src/                  # Source code
│   │   ├── nodes/           # All the node components
│   │   │   ├── BaseNode.js  # Shared node template
│   │   │   ├── inputNode.js # Input node
│   │   │   ├── textNode.js  # Text node (with variables!)
│   │   │   └── ...          # Other nodes
│   │   ├── App.js           # Main application
│   │   ├── ui.js            # The canvas with React Flow
│   │   ├── toolbar.js       # The sidebar with draggable nodes
│   │   ├── submit.js        # The submit button
│   │   └── index.css        # All the styles
│   └── package.json         # Project dependencies
│
└── backend/                  # Server code
    ├── main.py              # API endpoints
    └── test_main.py         # Tests
```

---

## How Each File Works

### App.js - The Container
Think of this as the "main page" that holds everything together.

```jsx
function App() {
  return (
    <div className="app-container">
      <PipelineToolbar />    {/* Top: draggable nodes */}
      <PipelineUI />          {/* Middle: canvas */}
      <SubmitButton />        {/* Bottom: submit button */}
    </div>
  );
}
```

### toolbar.js - The Palette
Contains all the draggable nodes you can add to the canvas.

```jsx
<DraggableNode type='customInput' label='Input' icon='📥' />
<DraggableNode type='text' label='Text' icon='📝' />
// etc.
```

### ui.js - The Canvas
The main workspace where you build pipelines. Uses React Flow.

Key parts:
- `nodes` - Array of all nodes on canvas
- `edges` - Array of all connections
- `onDrop` - What happens when you drop a node
- `onConnect` - What happens when you connect nodes

### BaseNode.js - The Node Template
A reusable component that all nodes share. Provides:
- Header with icon and title
- Body area for content
- Handle rendering

```jsx
<BaseNode
  title="Input"
  icon="📥"
  handles={[{ type: 'source', position: 'right' }]}
>
  <input value={name} onChange={...} />
</BaseNode>
```

### textNode.js - Text Node with Variables
Special node that:
1. Has an auto-resizing textarea
2. Detects `{{ variableName }}` patterns
3. Creates connection handles for each variable

```
Type: "Hello {{ name }}, your order {{ orderId }} is ready"

Creates handles for:
- name
- orderId
```

### submit.js - The Submit Button
When clicked:
1. Collects all nodes and edges
2. Sends them to the backend
3. Shows an alert with the results

```javascript
const handleSubmit = async () => {
  const response = await fetch('http://localhost:8000/pipelines/parse', {
    method: 'POST',
    body: JSON.stringify({ nodes, edges }),
  });
  const data = await response.json();
  alert(`Nodes: ${data.num_nodes}, Edges: ${data.num_edges}, DAG: ${data.is_dag}`);
};
```

### main.py - The Backend
Receives data from the frontend and processes it.

```python
@app.post('/pipelines/parse')
def parse_pipeline(pipeline):
    num_nodes = len(pipeline.nodes)
    num_edges = len(pipeline.edges)
    dag = is_dag(pipeline.nodes, pipeline.edges)
    return {"num_nodes": num_nodes, "num_edges": num_edges, "is_dag": dag}
```

### index.css - The Styles
All the visual styling using CSS variables:

```css
:root {
  --color-bg-primary: #0f172a;    /* Dark blue background */
  --color-accent: #6366f1;         /* Purple accent */
  --node-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.node-base {
  background: linear-gradient(...);
  border-radius: 12px;
  box-shadow: var(--node-shadow);
}
```

---

## Understanding the Code

### React Concepts

#### Components
Self-contained pieces of UI. Like custom HTML tags.

```jsx
// Define a component
function MyButton() {
  return <button>Click me</button>;
}

// Use it anywhere
<MyButton />
```

#### State
Data that can change and causes the UI to update.

```jsx
const [count, setCount] = useState(0);
// count = current value
// setCount = function to update it

<button onClick={() => setCount(count + 1)}>
  Clicked {count} times
</button>
```

#### Props
Data passed to a component from its parent.

```jsx
// Parent passes data
<Node title="Input" icon="📥" />

// Child receives it
function Node({ title, icon }) {
  return <h1>{icon} {title}</h1>;
}
```

#### useCallback
Memorizes a function so it doesn't get recreated.

```jsx
const handleClick = useCallback(() => {
  console.log('clicked');
}, []); // Empty array = never recreate
```

#### useMemo
Memorizes a value so it doesn't get recalculated.

```jsx
const expensiveResult = useMemo(() => {
  return heavyCalculation(data);
}, [data]); // Only recalculate when data changes
```

### JavaScript Concepts

#### Arrow Functions
Shorter way to write functions.

```javascript
// Traditional
function add(a, b) {
  return a + b;
}

// Arrow function
const add = (a, b) => a + b;
```

#### Async/Await
Way to handle operations that take time (like API calls).

```javascript
const fetchData = async () => {
  const response = await fetch('/api/data');  // Wait for response
  const data = await response.json();          // Wait for parsing
  return data;
};
```

#### Destructuring
Extracting values from objects/arrays.

```javascript
const person = { name: 'John', age: 30 };

// Instead of
const name = person.name;
const age = person.age;

// Destructure
const { name, age } = person;
```

#### Spread Operator (...)
Copy or merge objects/arrays.

```javascript
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5]; // [1, 2, 3, 4, 5]

const obj1 = { a: 1 };
const obj2 = { ...obj1, b: 2 }; // { a: 1, b: 2 }
```

### Regular Expressions (Regex)
Pattern matching for text. Used in our variable detection.

```javascript
// Pattern to find {{ variableName }}
const regex = /\{\{\s*([^{}]+?)\s*\}\}/g;

// Breaking it down:
// \{\{     - matches {{
// \s*      - matches any whitespace
// ([^{}]+?) - captures the variable name (anything except { or })
// \s*      - matches any whitespace
// \}\}     - matches }}
// g        - global flag (find all matches)
```

---

## How Data Flows

### 1. User Drags a Node
```
Toolbar → onDragStart → dataTransfer.setData → Canvas → onDrop → addNode
```

### 2. User Connects Nodes
```
Click handle → Drag to another handle → onConnect → addEdge
```

### 3. User Clicks Submit
```
Submit Button → collect nodes/edges → fetch POST → Backend processes → Response → Alert
```

### 4. Backend DAG Check
```
Receive nodes/edges → Build graph → DFS traversal → Check for cycles → Return result
```

---

## The Backend Explained

### What is an API?
An API (Application Programming Interface) is a way for programs to talk to each other.

Think of it like a restaurant:
- You (frontend) = Customer
- API = Waiter
- Kitchen (backend) = Chef

You don't go to the kitchen directly. You tell the waiter what you want, and they bring back your food.

### HTTP Methods
- **GET** - Request data (like reading)
- **POST** - Send data (like submitting a form)
- **PUT** - Update data
- **DELETE** - Remove data

### Our API Endpoint
```
POST /pipelines/parse
```

**Request body:**
```json
{
  "nodes": [
    {"id": "input-1", "type": "customInput"},
    {"id": "output-1", "type": "customOutput"}
  ],
  "edges": [
    {"source": "input-1", "target": "output-1"}
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

### DAG Detection Algorithm
Uses **Depth-First Search (DFS)** with three colors:

```
WHITE = Not visited
GRAY  = Currently processing
BLACK = Done processing
```

1. Start at each unvisited node
2. Mark it GRAY (processing)
3. Visit all neighbors
4. If we hit a GRAY node = CYCLE FOUND (not a DAG)
5. Mark node BLACK when done

```python
def is_dag(nodes, edges):
    for node in nodes:
        if not dfs(node):
            return False  # Cycle found!
    return True  # No cycles = valid DAG
```

---

## Common Terms Glossary

| Term | Meaning |
|------|---------|
| **Component** | Reusable piece of UI in React |
| **State** | Data that can change and updates the UI |
| **Props** | Data passed from parent to child component |
| **Hook** | Special React function (useState, useEffect, etc.) |
| **API** | Way for programs to communicate |
| **Endpoint** | Specific URL path for an API |
| **JSON** | Data format: `{"key": "value"}` |
| **Node** | A box/block in the pipeline |
| **Edge** | A connection line between nodes |
| **Handle** | Connection point on a node |
| **Pipeline** | Complete flow of connected nodes |
| **DAG** | Directed Acyclic Graph (no loops) |
| **Frontend** | What users see (browser) |
| **Backend** | Server that processes data |
| **CORS** | Security rule for cross-origin requests |
| **Regex** | Pattern matching for text |

---

## Try It Yourself!

1. **Add a new node type:**
   - Create `MyNode.js` in `/src/nodes/`
   - Copy structure from existing node
   - Register in `ui.js` and `toolbar.js`

2. **Change styling:**
   - Edit CSS variables in `index.css`
   - Try different colors!

3. **Test the variable detection:**
   - Create a Text node
   - Type `{{ myVar }}` and watch a handle appear!

4. **Test the backend:**
   ```bash
   curl -X POST http://localhost:8000/pipelines/parse \
     -H "Content-Type: application/json" \
     -d '{"nodes": [{"id": "1"}], "edges": []}'
   ```

---

## Need More Help?

- **React Docs**: https://react.dev
- **React Flow Docs**: https://reactflow.dev
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **JavaScript MDN**: https://developer.mozilla.org

Happy coding! 🚀
