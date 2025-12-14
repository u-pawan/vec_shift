# Key Concepts to Explain

## 1. What is a DAG (Directed Acyclic Graph)?

### Simple Explanation
> A DAG is like a one-way street system with no loops. You can get from point A to point B, but you can never circle back to where you started.

### Technical Definition
- **Directed**: Edges have a direction (A → B is different from B → A)
- **Acyclic**: No cycles exist (you can't follow edges back to where you started)
- **Graph**: Collection of nodes/vertices connected by edges

### Visual Examples

```
✅ Valid DAG:              ❌ Not a DAG (has cycle):
    A                          A
    │                          │
    ▼                          ▼
    B ──────► D                B
    │         ▲                │
    ▼         │                ▼
    C ────────┘                C
                               │
                               └──► A (cycle!)
```

### Why DAGs Matter for Pipelines
- **Execution Order**: DAGs define a clear order of operations
- **No Infinite Loops**: Acyclic property prevents endless execution
- **Dependency Resolution**: Easy to determine what needs to run first
- **Used In**: Task schedulers (Airflow), build systems (Make), version control (Git)

---

## 2. What is React Flow?

### Purpose
React Flow is a library for building **node-based editors** and **interactive diagrams**.

### Core Concepts

| Concept | Description |
|---------|-------------|
| **Node** | A draggable box on the canvas |
| **Edge** | A connection line between nodes |
| **Handle** | Connection points on nodes (source/target) |
| **Canvas** | The interactive area where nodes live |

### Key Features
- Drag-and-drop node management
- Pan and zoom controls
- Customizable node types
- Edge routing (smoothstep, bezier)
- Mini-map for navigation
- Keyboard shortcuts

---

## 3. What is Zustand?

### Simple Explanation
> Zustand is like a global variable store for React, but smarter. It holds your app's data and updates components only when needed.

### Why Use It?
```javascript
// ❌ Context API: Re-renders ALL consumers
const MyContext = React.createContext();
// When context value changes, EVERY useContext() re-renders

// ✅ Zustand: Selective re-renders
const useStore = create((set) => ({
  nodes: [],
  edges: [],
}));
// Components only re-render if their selected state changes
```

### Basic Usage Pattern
```javascript
// Define store
const useStore = create((set, get) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  getDouble: () => get().count * 2,
}));

// Use in component
function Counter() {
  const count = useStore((state) => state.count);
  const increment = useStore((state) => state.increment);
  return <button onClick={increment}>{count}</button>;
}
```

---

## 4. What is FastAPI?

### Simple Explanation
> FastAPI is a modern Python web framework that makes building APIs fast and fun. It automatically validates data and generates documentation.

### Key Features

| Feature | Benefit |
|---------|---------|
| **Pydantic Models** | Automatic request validation |
| **Type Hints** | Better IDE support, fewer bugs |
| **Auto Docs** | OpenAPI docs at `/docs` |
| **Async Support** | High concurrency without threads |
| **Performance** | One of fastest Python frameworks |

### Example Endpoint
```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

@app.post("/items/")
def create_item(item: Item):
    return {"item_name": item.name, "price": item.price}
```

---

## 5. What is CORS?

### Simple Explanation
> CORS is a security feature that controls which websites can talk to your API. By default, browsers block requests from different origins.

### The Problem
```
Frontend: http://localhost:3000
Backend:  http://localhost:8000
           ↑ Different port = different origin!
```

Browser blocks the request by default.

### The Solution
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 6. Three-Color DFS Algorithm

### The Colors
| Color | Meaning | Analogy |
|-------|---------|---------|
| **WHITE** | Not visited | Unexplored territory |
| **GRAY** | Currently being processed | You're standing here |
| **BLACK** | Fully processed | Already explored |

### How It Detects Cycles

```
Step 1: Start at A (WHITE → GRAY)
        A(GRAY) → B → C
        
Step 2: Visit B (WHITE → GRAY)
        A(GRAY) → B(GRAY) → C
        
Step 3: Visit C (WHITE → GRAY)
        A(GRAY) → B(GRAY) → C(GRAY)
        
Step 4: C points back to A
        C → A(GRAY) ← GRAY means cycle!
        
If we reach a GRAY node, we've found a back edge = cycle!
```

### Why It Works
- GRAY = "I'm still exploring paths from here"
- If you reach a GRAY node, you've circled back to your own path
- BLACK = "I've finished exploring, no cycles through me"

---

## 7. JavaScript Variable Naming Rules

### Valid Identifiers
```javascript
// First character: letter, underscore, or $
// Subsequent: letter, digit, underscore, or $

✅ Valid:
- myVariable
- _private
- $dollar
- camelCase
- snake_case
- PascalCase
- a1, b2, c3

❌ Invalid:
- 123abc     // Starts with number
- my-var     // Contains hyphen
- my.var     // Contains dot
- my var     // Contains space
```

### Regex Pattern
```javascript
/^[A-Za-z_$][A-Za-z0-9_$]*$/

^           - Start of string
[A-Za-z_$]  - First char: letter, _, or $
[A-Za-z0-9_$]* - Rest: letters, digits, _, or $
$           - End of string
```

---

## 8. React Hooks Used

### useState
```javascript
const [count, setCount] = useState(0);
// count = current value
// setCount = function to update
```

### useRef
```javascript
const inputRef = useRef(null);
// .current = mutable value that persists across renders
// Doesn't cause re-render when changed
```

### useCallback
```javascript
const handleClick = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
// Memoizes function - only recreates if deps change
```

### useMemo
```javascript
const expensiveResult = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
// Memoizes value - only recomputes if deps change
```

### useLayoutEffect
```javascript
useLayoutEffect(() => {
  // Runs BEFORE browser paints
  measureElement();
}, [dep]);
// For DOM measurements and synchronous updates
```

---

## 9. CSS Glassmorphism

### What Is It?
A design trend featuring frosted glass-like backgrounds with transparency and blur.

### Key Properties
```css
.glass-effect {
  background: rgba(255, 255, 255, 0.1);  /* Transparent */
  backdrop-filter: blur(10px);           /* Blur behind */
  border: 1px solid rgba(255, 255, 255, 0.2);  /* Subtle edge */
  border-radius: 12px;
}
```

### Browser Support
- Chrome: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Edge: ✅ Full support
- IE: ❌ No support

---

## 10. Pydantic Models

### Purpose
Pydantic provides data validation using Python type hints.

### Key Features
```python
from pydantic import BaseModel
from typing import Optional, List

class User(BaseModel):
    id: int                    # Required integer
    name: str                  # Required string
    email: Optional[str]       # Optional string
    tags: List[str] = []       # List with default

# Valid
user = User(id=1, name="John")

# Invalid - raises ValidationError
user = User(id="abc", name=123)  # Wrong types!
```

### With FastAPI
FastAPI automatically:
1. Validates request body against model
2. Returns 422 error if validation fails
3. Generates OpenAPI schema from model
