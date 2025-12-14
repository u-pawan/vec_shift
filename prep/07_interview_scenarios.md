# Common Interview Scenarios & How to Handle Them

## 🎤 Scenario 1: "Walk me through the project"

### The 2-Minute Version

> "This is a visual pipeline builder I built as a technical assessment for VectorShift. It allows users to design data processing workflows by dragging nodes onto a canvas and connecting them.
>
> The **frontend** uses React with React Flow for the drag-and-drop interface. I have 9 different node types, each serving a specific purpose - like Input nodes for data entry, Text nodes that can detect variables, and Transform nodes for data processing.
>
> The **backend** is FastAPI, and its main job is to validate whether the pipeline is a valid DAG - meaning no cycles exist. I implemented a DFS algorithm with three-color marking to detect cycles.
>
> The most interesting part was the Text Node, which parses user input for `{{ variable }}` patterns and dynamically creates connection handles for each valid variable."

---

## 🎤 Scenario 2: "What was the hardest bug you encountered?"

### Example Answer

> "The hardest issue was infinite re-renders when I first integrated React Flow.
>
> **Problem**: Every time the canvas rendered, it would render again, causing the browser to freeze.
>
> **Root Cause**: I was defining the `nodeTypes` object inside the component, which caused React Flow to see a 'new' object every render and re-initialize.
>
> **Solution**: I moved `nodeTypes` outside the component to make it a stable reference.
>
> **Lesson Learned**: Objects and arrays passed to React Flow should be defined outside components or memoized with `useMemo`."

```javascript
// ❌ Bug - causes infinite re-renders
const MyComponent = () => {
  const nodeTypes = { text: TextNode };  // New object every render!
  return <ReactFlow nodeTypes={nodeTypes} />;
};

// ✅ Fix - stable reference
const nodeTypes = { text: TextNode };  // Defined once
const MyComponent = () => {
  return <ReactFlow nodeTypes={nodeTypes} />;
};
```

---

## 🎤 Scenario 3: "Why this tech stack?"

### Answer Framework

| Technology | Why I Chose It |
|------------|----------------|
| **React** | Industry standard, excellent component model, huge ecosystem |
| **React Flow** | Purpose-built for node editors, well-documented, active community |
| **Zustand** | Lightweight, minimal boilerplate, React Flow team recommends it |
| **FastAPI** | Type hints, auto validation, auto docs, high performance |
| **Pydantic** | Declarative validation, works seamlessly with FastAPI |

> "I chose this stack because each technology excels at its specific purpose. React Flow was a clear choice for the node editor - it handles all the complex interactions like drag-and-drop, zooming, and connection management. FastAPI with Pydantic gives me automatic request validation and API documentation, which saved development time."

---

## 🎤 Scenario 4: "How would you improve this?"

### Priority Improvements

1. **TypeScript** - Add type safety to catch bugs earlier
2. **Testing** - Add React Testing Library tests for frontend
3. **Persistence** - Save/load pipelines to localStorage or database
4. **Error Boundaries** - Graceful failure handling in React
5. **Accessibility** - ARIA labels, keyboard navigation
6. **Pipeline Execution** - Actually run the pipeline, not just validate it

### Scalability Improvements

1. **Virtual Rendering** - Handle 100+ nodes efficiently
2. **Web Workers** - Offload heavy computations
3. **Real-time Collaboration** - WebSocket + CRDT
4. **Authentication** - JWT-based auth system
5. **Cloud Deployment** - Docker + Kubernetes

---

## 🎤 Scenario 5: "Explain the DAG algorithm"

### Simple Explanation First

> "A DAG is a directed graph with no cycles. To detect if a graph is a DAG, I need to find if any cycles exist.
>
> I use a DFS traversal where I mark each node with one of three colors:
> - **White** means I haven't visited it yet
> - **Gray** means I'm currently exploring paths from it
> - **Black** means I've finished exploring all paths from it
>
> The key insight is: if I'm exploring from a gray node and I reach another gray node, I've found a cycle! That's because gray means 'I'm still on this path' - so reaching a gray node means I've circled back."

### Follow-up: Time Complexity

> "Time complexity is O(V + E) where V is vertices (nodes) and E is edges. I visit each node once and traverse each edge once. Space complexity is O(V) for the color dictionary."

---

## 🎤 Scenario 6: "Show me a code example"

### Be Ready to Write

```javascript
// Variable extraction from text
function extractVariables(text) {
  const regex = /\{\{\s*([^{}]+?)\s*\}\}/g;
  const variables = [];
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const name = match[1].trim();
    const isValid = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name);
    variables.push({ name, isValid });
  }
  
  return variables;
}
```

### Explain Your Thinking

> "The regex matches anything between double curly braces. Then I validate each variable name against JavaScript identifier rules. I return an array with both the name and validity status so the UI can show warnings for invalid names."

---

## 🎤 Scenario 7: "What would you do with an error here?"

### Error Handling Strategy

**Frontend Errors:**
```javascript
try {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  setResult(data);
} catch (error) {
  setError(error.message);  // Show in UI
  console.error('API Error:', error);  // Log for debugging
}
```

**Backend Errors:**
```python
from fastapi import HTTPException

@app.post('/pipelines/parse')
def parse_pipeline(pipeline: PipelineRequest):
    try:
        result = is_dag(pipeline.nodes, pipeline.edges)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return result
```

---

## 🎤 Scenario 8: "How do you approach a new feature?"

### My Process

1. **Understand Requirements**
   - What problem are we solving?
   - Who is the user?
   - What are the constraints?

2. **Research**
   - Look at existing implementations
   - Check documentation
   - Consider edge cases

3. **Design**
   - Sketch the data flow
   - Identify components needed
   - Plan the API

4. **Implement**
   - Start with the simplest version
   - Add complexity incrementally
   - Write tests as I go

5. **Review**
   - Test edge cases
   - Refactor for clarity
   - Document decisions

---

## 🎤 Scenario 9: "Tell me about a time you disagreed with a design decision"

### STAR Format

**Situation**: "In a previous project, the team wanted to use Redux for state management in a small app."

**Task**: "I needed to advocate for a simpler solution without being dismissive."

**Action**: "I created a small prototype using both Redux and Zustand, showing the code complexity difference. I presented the comparison objectively, focusing on bundle size and development speed."

**Result**: "The team agreed to use Zustand for this project, which saved us significant development time. We kept Redux as an option for future larger projects."

---

## 🎤 Scenario 10: "Any questions for us?"

### Good Questions to Ask

1. "What does the day-to-day look like for someone in this role?"
2. "What's the biggest technical challenge the team is facing right now?"
3. "How does the team approach code reviews?"
4. "What does the development workflow look like - CI/CD, testing, deployments?"
5. "What opportunities are there for learning and growth?"
6. "What made you excited to join this team?"

---

## 💡 General Interview Tips

### Before the Interview
- [ ] Run the project successfully
- [ ] Review all code files
- [ ] Practice explaining the DAG algorithm
- [ ] Prepare 2-3 stories about challenges

### During the Interview
- Think out loud when problem-solving
- Ask clarifying questions
- Admit when you don't know something
- Relate answers to your actual experience

### After a Question
- "Did that answer your question, or would you like me to go deeper on any part?"
