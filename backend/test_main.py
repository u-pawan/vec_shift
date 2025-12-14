import pytest
from fastapi.testclient import TestClient
from main import app, is_dag, Node, Edge

client = TestClient(app)

class TestHealthCheck:
    def test_root_endpoint(self):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"

class TestPipelineParse:
    def test_empty_pipeline(self):
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
