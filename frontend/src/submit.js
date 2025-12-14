// The SubmitButton component handles sending the pipeline data to our backend.
// It grabs the current state of the graph and sends it off for analysis.

import { useState } from 'react';
import { getNodesAndEdges } from './ui';

// This is where we will send our requests.
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const SubmitButton = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    /**
     * When the user clicks submit, we:
     * 1. Grab the nodes and edges from the canvas.
     * 2. Package them up and send them to the backend to check if it's a valid DAG.
     * 3. Show the results in a nice modal.
     */
    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            // Grab the current nodes and connections from the UI helper.
            const { nodes, edges } = getNodesAndEdges();

            // Structure the data exactly how the backend expects it.
            const payload = {
                nodes: nodes,
                edges: edges
            };

            console.log('Submitting pipeline:', payload);

            // Send the POST request.
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

            // Store the result so we can display it to the user.
            setResult(data);

        } catch (err) {
            console.error('Submit error:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const closeModal = () => {
        setResult(null);
        setError(null);
    };

    return (
        <>
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

            {/* Result Modal */}
            {(result || error) && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        {result && (
                            <>
                                <h2 className="modal-title">✅ Pipeline Analysis Complete!</h2>
                                <div className="modal-body">
                                    <div className="result-row">
                                        <span className="result-icon">📊</span>
                                        <span className="result-label">Nodes:</span>
                                        <span className="result-value">{result.num_nodes}</span>
                                    </div>
                                    <div className="result-row">
                                        <span className="result-icon">🔗</span>
                                        <span className="result-label">Edges:</span>
                                        <span className="result-value">{result.num_edges}</span>
                                    </div>
                                    <div className="result-row">
                                        <span className="result-icon">🔄</span>
                                        <span className="result-label">DAG:</span>
                                        <span className={`result-value ${result.is_dag ? 'success' : 'error'}`}>
                                            {result.is_dag ? 'Yes ✓' : 'No ✗'}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                        {error && (
                            <>
                                <h2 className="modal-title error">❌ Submission Failed</h2>
                                <div className="modal-body">
                                    <p className="error-message">{error}</p>
                                    <p className="error-hint">Make sure the backend is running at {API_URL}</p>
                                </div>
                            </>
                        )}
                        <button className="modal-close-btn" onClick={closeModal}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
