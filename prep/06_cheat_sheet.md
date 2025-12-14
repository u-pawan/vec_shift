# Quick Reference Cheat Sheet

## 🚀 Project Commands

### Start Backend
```bash
cd backend
pip install fastapi uvicorn pydantic
uvicorn main:app --reload --port 8000
```

### Start Frontend
```bash
cd frontend
npm install
npm start
```

### Run Tests
```bash
cd backend
python -m pytest test_main.py -v
```

---

## 📁 File Structure Quick Reference

| File | Purpose |
|------|---------|
| `ui.js` | Main React Flow canvas |
| `toolbar.js` | Sidebar with draggable nodes |
| `submit.js` | Submit button + API call |
| `store.js` | Zustand state (reference only) |
| `BaseNode.js` | Reusable node component |
| `textNode.js` | Text node with variables |
| `main.py` | FastAPI backend |
| `test_main.py` | Unit tests |

---

## 🎨 9 Node Types

| Node | Icon | Purpose | Handles |
|------|------|---------|---------|
| Input | 📥 | Data entry point | 1 output |
| Output | 📤 | Data exit point | 1 input |
| Text | 📝 | Text with variables | Dynamic inputs + 1 output |
| LLM | 🤖 | Language model | 3 inputs + 1 output |
| Timestamp | ⏰ | Current time | 1 output |
| Transform | 🔄 | Data transformation | 1 input + 1 output |
| Filter | 🔍 | Conditional filter | 1 input + 2 outputs |
| Prompt | 💬 | Prompt template | 2 inputs + 1 output |
| Join | ➕ | Combine inputs | 3 inputs + 1 output |

---

## 🔧 Key Technologies

| Tech | Version | Used For |
|------|---------|----------|
| React | 18.2 | UI framework |
| React Flow | 11.8 | Node editor |
| Zustand | 5.x | State management |
| FastAPI | latest | Backend API |
| Pydantic | latest | Data validation |

---

## 📝 DAG Algorithm Summary

```
Three Colors:
- WHITE (0) = Not visited
- GRAY (1) = Currently processing
- BLACK (2) = Fully done

Cycle Detection:
- If you reach a GRAY node = CYCLE!
- Time: O(V + E)
- Space: O(V)
```

---

## 🎯 Variable Detection Rules

```
Pattern: {{ variableName }}

✅ Valid:
- {{ input }}
- {{ user_name }}
- {{ $data }}
- {{ _private }}

❌ Invalid:
- {{ 123abc }}  (starts with number)
- {{ my-var }}  (contains hyphen)
- {{ my var }}  (contains space)

Regex: /^[A-Za-z_$][A-Za-z0-9_$]*$/
```

---

## 🌐 API Reference

### Health Check
```bash
GET http://localhost:8000/
# Returns: {"status": "ok"}
```

### Parse Pipeline
```bash
POST http://localhost:8000/pipelines/parse
Content-Type: application/json

{
  "nodes": [{"id": "1"}, {"id": "2"}],
  "edges": [{"source": "1", "target": "2"}]
}

# Returns: {"num_nodes": 2, "num_edges": 1, "is_dag": true}
```

---

## 🎨 CSS Variables

```css
--bg-primary: #0f172a;
--bg-secondary: #1e293b;
--accent-primary: #6366f1;
--accent-success: #10b981;
--accent-error: #ef4444;
```

---

## 🔑 Key Code Patterns

### Add Node
```javascript
setNodes((nds) => [...nds, newNode]);
```

### Remove Node + Connected Edges
```javascript
setNodes((nds) => nds.filter((n) => n.id !== nodeId));
setEdges((eds) => eds.filter((e) => 
  e.source !== nodeId && e.target !== nodeId
));
```

### Connect Nodes
```javascript
setEdges((eds) => addEdge({
  ...connection,
  type: 'smoothstep',
  animated: true,
  markerEnd: { type: MarkerType.Arrow }
}, eds));
```

### Memoize Values
```javascript
const variables = useMemo(() => extract(text), [text]);
```

### Memoize Callbacks
```javascript
const handler = useCallback(() => {...}, [deps]);
```

---

## 📊 Test Cases Summary

| Test | Expected Result |
|------|-----------------|
| Empty pipeline | is_dag: true |
| Single node | is_dag: true |
| A → B → C | is_dag: true |
| A → B → A | is_dag: false |
| A → A (self-loop) | is_dag: false |
| Diamond pattern | is_dag: true |
| Disconnected nodes | is_dag: true |
