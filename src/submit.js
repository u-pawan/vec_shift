// submit.js
// Submit button component that sends pipeline data to backend
// Collects nodes and edges from React Flow and POSTs to /pipelines/parse

import { useState } from 'react';
import { getNodesAndEdges } from './ui';

// Backend API URL - can be configured via environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const SubmitButton = () => {
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Handles the submit action:
     * 1. Collects current nodes and edges from the pipeline
     * 2. POSTs to backend /pipelines/parse endpoint
     * 3. Displays result in an alert
     */
    const handleSubmit = async () => {
        setIsLoading(true);

        try {
            // Get nodes and edges from the UI
            const { nodes, edges } = getNodesAndEdges();

            // Prepare the payload with nodes and edges
            const payload = {
                nodes: nodes,
                edges: edges
            };

            console.log('Submitting pipeline:', payload);

            // POST to backend
            const response = await fetch(`${API_URL}/pipelines/parse`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Backend response:', data);

            // Display user-friendly alert with results
            const dagStatus = data.is_dag ? 'Yes ✓' : 'No ✗';
            alert(
                `Pipeline Analysis Complete!\n\n` +
                `📊 Nodes: ${data.num_nodes}\n` +
                `🔗 Edges: ${data.num_edges}\n` +
                `🔄 DAG (Directed Acyclic Graph): ${dagStatus}`
            );

        } catch (error) {
            console.error('Submit error:', error);
            alert(
                `Failed to submit pipeline!\n\n` +
                `Error: ${error.message}\n\n` +
                `Make sure the backend is running at ${API_URL}`
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="submit-section">
            <button
                type="button"
                className="submit-button"
                onClick={handleSubmit}
                disabled={isLoading}
            >
                {isLoading ? (
                    <>⏳ Analyzing...</>
                ) : (
                    <>🚀 Submit Pipeline</>
                )}
            </button>
        </div>
    );
}
