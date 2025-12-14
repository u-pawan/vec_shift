from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

app = FastAPI(
    title="VectorShift Pipeline API",
    description="Backend API for parsing and analyzing pipeline graphs",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

def is_dag(nodes: List[Node], edges: List[Edge]) -> bool:
    if not nodes:
        return True

    node_ids = {node.id for node in nodes}
    adj: Dict[str, List[str]] = {node_id: [] for node_id in node_ids}

    for edge in edges:
        if edge.source in adj:
            adj[edge.source].append(edge.target)

    WHITE, GRAY, BLACK = 0, 1, 2
    color: Dict[str, int] = {node_id: WHITE for node_id in node_ids}

    def dfs(node: str) -> bool:
        color[node] = GRAY

        for neighbor in adj.get(node, []):
            if neighbor not in color:
                continue

            if color[neighbor] == GRAY:
                return False

            if color[neighbor] == WHITE:
                if not dfs(neighbor):
                    return False

        color[node] = BLACK
        return True

    for node_id in node_ids:
        if color[node_id] == WHITE:
            if not dfs(node_id):
                return False

    return True

@app.get('/')
def read_root():
    return {'status': 'ok', 'message': 'VectorShift Pipeline API is running'}

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
