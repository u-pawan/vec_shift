# main.py
# FastAPI backend for VectorShift Pipeline Builder
# Provides endpoint to parse pipeline and detect DAG structure

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

app = FastAPI(
    title="VectorShift Pipeline API",
    description="Backend API for parsing and analyzing pipeline graphs",
    version="1.0.0"
)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models for request/response validation
class Node(BaseModel):
    """Represents a node in the pipeline graph"""
    id: str
    type: Optional[str] = None
    position: Optional[Dict[str, float]] = None
    data: Optional[Dict[str, Any]] = None


class Edge(BaseModel):
    """Represents an edge (connection) between nodes"""
    id: Optional[str] = None
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None


class PipelineRequest(BaseModel):
    """Request body for pipeline parsing"""
    nodes: List[Node]
    edges: List[Edge]


class PipelineResponse(BaseModel):
    """Response body with pipeline analysis"""
    num_nodes: int
    num_edges: int
    is_dag: bool


def is_dag(nodes: List[Node], edges: List[Edge]) -> bool:
    """
    Determines if the directed graph defined by edges is acyclic (DAG).
    
    Uses Depth-First Search (DFS) with three-color marking:
    - WHITE (0): Node not yet visited
    - GRAY (1): Node is being processed (in current DFS path)
    - BLACK (2): Node processing complete
    
    A back edge (edge to a GRAY node) indicates a cycle.
    
    Args:
        nodes: List of nodes in the graph
        edges: List of directed edges (source -> target)
    
    Returns:
        True if the graph is a DAG (no cycles), False otherwise
    """
    if not nodes:
        return True  # Empty graph is a DAG
    
    # Build adjacency list from edges
    node_ids = {node.id for node in nodes}
    adj: Dict[str, List[str]] = {node_id: [] for node_id in node_ids}
    
    for edge in edges:
        # Only add edge if both source and target exist in nodes
        if edge.source in adj:
            adj[edge.source].append(edge.target)
    
    # Color states for DFS
    WHITE, GRAY, BLACK = 0, 1, 2
    color: Dict[str, int] = {node_id: WHITE for node_id in node_ids}
    
    def dfs(node: str) -> bool:
        """
        DFS traversal that returns False if a cycle is detected.
        """
        color[node] = GRAY  # Mark as being processed
        
        for neighbor in adj.get(node, []):
            # Skip edges to nodes not in our node set
            if neighbor not in color:
                continue
                
            if color[neighbor] == GRAY:
                # Back edge found - cycle detected!
                return False
            
            if color[neighbor] == WHITE:
                if not dfs(neighbor):
                    return False
        
        color[node] = BLACK  # Mark as fully processed
        return True
    
    # Check all nodes (handles disconnected components)
    for node_id in node_ids:
        if color[node_id] == WHITE:
            if not dfs(node_id):
                return False
    
    return True


@app.get('/')
def read_root():
    """Health check endpoint"""
    return {'status': 'ok', 'message': 'VectorShift Pipeline API is running'}


@app.post('/pipelines/parse', response_model=PipelineResponse)
def parse_pipeline(pipeline: PipelineRequest):
    """
    Parses a pipeline and returns analysis results.
    
    Accepts:
        - nodes: List of node objects with id, type, position, data
        - edges: List of edge objects with source and target node ids
    
    Returns:
        - num_nodes: Count of nodes in the pipeline
        - num_edges: Count of edges (connections) in the pipeline
        - is_dag: Whether the pipeline forms a Directed Acyclic Graph
    """
    num_nodes = len(pipeline.nodes)
    num_edges = len(pipeline.edges)
    dag_status = is_dag(pipeline.nodes, pipeline.edges)
    
    return PipelineResponse(
        num_nodes=num_nodes,
        num_edges=num_edges,
        is_dag=dag_status
    )
