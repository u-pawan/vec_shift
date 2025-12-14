# This file contains unit tests for our VectorShift Pipeline API.
# You can run them using: python -m pytest test_main.py -v

import pytest
from fastapi.testclient import TestClient
from main import app, is_dag, Node, Edge

client = TestClient(app)


class TestHealthCheck:
    """Tests ensuring the health check endpoint works."""
    
    def test_root_endpoint(self):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"


class TestPipelineParse:
    """Tests for the main /pipelines/parse endpoint."""
    
    def test_empty_pipeline(self):
        """Test that an empty pipeline is considered a valid DAG."""
        response = client.post(
            "/pipelines/parse",
            json={"nodes": [], "edges": []}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["num_nodes"] == 0
        assert data["num_edges"] == 0
        assert data["is_dag"] is True
    
    def test_single_node(self):
        """Test a single isolated node."""
        response = client.post(
            "/pipelines/parse",
            json={
                "nodes": [{"id": "node-1"}],
                "edges": []
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["num_nodes"] == 1
        assert data["num_edges"] == 0
        assert data["is_dag"] is True
    
    def test_linear_pipeline(self):
        """Test a simple linear pipeline (A -> B -> C)."""
        response = client.post(
            "/pipelines/parse",
            json={
                "nodes": [{"id": "A"}, {"id": "B"}, {"id": "C"}],
                "edges": [
                    {"source": "A", "target": "B"},
                    {"source": "B", "target": "C"}
                ]
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["num_nodes"] == 3
        assert data["num_edges"] == 2
        assert data["is_dag"] is True
    
    def test_simple_cycle(self):
        """Test that a simple cycle (A -> B -> A) is caught."""
        response = client.post(
            "/pipelines/parse",
            json={
                "nodes": [{"id": "A"}, {"id": "B"}],
                "edges": [
                    {"source": "A", "target": "B"},
                    {"source": "B", "target": "A"}
                ]
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["num_nodes"] == 2
        assert data["num_edges"] == 2
        assert data["is_dag"] is False
    
    def test_self_loop(self):
        """Test that a node connecting to itself is invalid."""
        response = client.post(
            "/pipelines/parse",
            json={
                "nodes": [{"id": "A"}],
                "edges": [{"source": "A", "target": "A"}]
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["is_dag"] is False
    
    def test_complex_dag(self):
        """Test a complex valid valid DAG (Diamond pattern)."""
        # Structure: A splits to B and C, which both merge into D.
        response = client.post(
            "/pipelines/parse",
            json={
                "nodes": [{"id": "A"}, {"id": "B"}, {"id": "C"}, {"id": "D"}],
                "edges": [
                    {"source": "A", "target": "B"},
                    {"source": "A", "target": "C"},
                    {"source": "B", "target": "D"},
                    {"source": "C", "target": "D"}
                ]
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["num_nodes"] == 4
        assert data["num_edges"] == 4
        assert data["is_dag"] is True
    
    def test_complex_cycle(self):
        """Test a larger cycle: A -> B -> C -> A."""
        response = client.post(
            "/pipelines/parse",
            json={
                "nodes": [{"id": "A"}, {"id": "B"}, {"id": "C"}],
                "edges": [
                    {"source": "A", "target": "B"},
                    {"source": "B", "target": "C"},
                    {"source": "C", "target": "A"}
                ]
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["is_dag"] is False
    
    def test_disconnected_components(self):
        """Test separate clusters of nodes that aren't connected to each other."""
        response = client.post(
            "/pipelines/parse",
            json={
                "nodes": [{"id": "A"}, {"id": "B"}, {"id": "C"}, {"id": "D"}],
                "edges": [
                    {"source": "A", "target": "B"},
                    {"source": "C", "target": "D"}
                ]
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["num_nodes"] == 4
        assert data["num_edges"] == 2
        assert data["is_dag"] is True


class TestDAGFunction:
    """Direct unit tests for the is_dag logic."""
    
    def test_empty_graph(self):
        assert is_dag([], []) is True
    
    def test_single_node_no_edges(self):
        nodes = [Node(id="1")]
        assert is_dag(nodes, []) is True
    
    def test_two_nodes_one_edge(self):
        nodes = [Node(id="1"), Node(id="2")]
        edges = [Edge(source="1", target="2")]
        assert is_dag(nodes, edges) is True
    
    def test_cycle_detection(self):
        nodes = [Node(id="1"), Node(id="2")]
        edges = [
            Edge(source="1", target="2"),
            Edge(source="2", target="1")
        ]
        assert is_dag(nodes, edges) is False


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
