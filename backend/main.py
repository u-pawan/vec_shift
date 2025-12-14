# This is the main backend file for the VectorShift Pipeline Builder.
# It provides endpoints for parsing pipelines and checking their DAG status.

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

app = FastAPI(
    title="VectorShift Pipeline API",
    description="Backend API for parsing and analyzing pipeline graphs",
    version="1.0.0"
)

# We need to enable CORS so that our frontend can talk to this backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# These Pydantic models ensure that the data we receive and send is valid.
class Node(BaseModel):
    """A single node within our pipeline graph."""
    id: str
    type: Optional[str] = None
    position: Optional[Dict[str, float]] = None
    data: Optional[Dict[str, Any]] = None


class Edge(BaseModel):
    """A connection (edge) between two nodes."""
    id: Optional[str] = None
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None


class PipelineRequest(BaseModel):
    """The expected structure of the request body for parsing."""
    nodes: List[Node]
    edges: List[Edge]


class PipelineResponse(BaseModel):
    """The result of our pipeline analysis."""
    num_nodes: int
    num_edges: int
    is_dag: bool


def is_dag(nodes: List[Node], edges: List[Edge]) -> bool:
    """
    Checks if the graph is a Directed Acyclic Graph (DAG) using Depth-First Search.
    
    We use three colors to mark nodes:
    - WHITE (0): Not yet visited.
    - GRAY (1): Currently being visited (in the current path).
    - BLACK (2): Completely finished.
    
    If we see a GRAY node while traversing, it means we found a cycle!
    
    Args:
        nodes: All the nodes in our graph.
        edges: All the connections between them.
    
    Returns:
        True if it's a valid DAG, False if there's a cycle.
    """
    if not nodes:
        return True  # An empty graph is technically a DAG, so we return True.
    
    # First, we build an adjacency list to represent the graph structure.
    node_ids = {node.id for node in nodes}
    adj: Dict[str, List[str]] = {node_id: [] for node_id in node_ids}
    
    for edge in edges:
        # We only include edges where both the start and end nodes actually exist.
        if edge.source in adj:
            adj[edge.source].append(edge.target)
    
    # We use colors to track the state of each node during DFS.
    WHITE, GRAY, BLACK = 0, 1, 2
    color: Dict[str, int] = {node_id: WHITE for node_id in node_ids}
    
    def dfs(node: str) -> bool:
        """
        DFS traversal that returns False if a cycle is detected.
        """
        color[node] = GRAY  # Mark this node as currently being visited.
        
        for neighbor in adj.get(node, []):
            # Skip edges that point to nodes we don't know about.
            if neighbor not in color:
                continue
                
            if color[neighbor] == GRAY:
                # If we see a node that is currently being visited, we found a cycle!
                return False
            
            if color[neighbor] == WHITE:
                if not dfs(neighbor):
                    return False
        
        color[node] = BLACK  # We are done with this node, so mark it as finished.
        return True
    
    # We iterate through all nodes to handle cases where the graph is disconnected.
    for node_id in node_ids:
        if color[node_id] == WHITE:
            if not dfs(node_id):
                return False
    
    return True


@app.get('/')
def read_root():
    """A simple health check endpoint."""
    return {'status': 'ok', 'message': 'VectorShift Pipeline API is running'}


@app.post('/pipelines/parse', response_model=PipelineResponse)
def parse_pipeline(pipeline: PipelineRequest):
    """
    Parses a pipeline and returns analysis results.
    
    Accepts:
        - nodes: List of nodes with their details.
        - edges: List of connections between nodes.
    
    Returns:
        - num_nodes: How many nodes we found.
        - num_edges: How many connections we found.
        - is_dag: True if the pipeline is a valid DAG.
    """
    num_nodes = len(pipeline.nodes)
    num_edges = len(pipeline.edges)
    dag_status = is_dag(pipeline.nodes, pipeline.edges)
    
    return PipelineResponse(
        num_nodes=num_nodes,
        num_edges=num_edges,
        is_dag=dag_status
    )
