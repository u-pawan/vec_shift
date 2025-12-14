// This node combines multiple text inputs into a single output string.

import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';

export const JoinNode = ({ id, data }) => {
    const [separator, setSeparator] = useState(data?.separator || 'newline');
    const [inputCount, setInputCount] = useState(data?.inputCount || 3);

    // We create a handle for each input based on the selected count.
    const handles = [];

    for (let i = 0; i < inputCount; i++) {
        const topPercent = ((i + 1) / (inputCount + 1)) * 100;
        handles.push({
            type: 'target',
            position: Position.Left,
            id: `${id}-input-${i}`,
            style: { top: `${topPercent}%` }
        });
    }

    // We only have one output handle where the joined text comes out.
    handles.push({
        type: 'source',
        position: Position.Right,
        id: `${id}-output`
    });

    // Helper to show a nice label for the chosen separator.
    const getSeparatorDisplay = () => {
        switch (separator) {
            case 'newline': return '\\n (newline)';
            case 'space': return '" " (space)';
            case 'comma': return '", " (comma)';
            case 'pipe': return '" | " (pipe)';
            case 'none': return '(no separator)';
            default: return separator;
        }
    };

    return (
        <BaseNode
            id={id}
            title="Join"
            icon="🔗"
            handles={handles}
        >
            <label>
                Inputs
                <select
                    value={inputCount}
                    onChange={(e) => setInputCount(parseInt(e.target.value))}
                >
                    <option value={2}>2 inputs</option>
                    <option value={3}>3 inputs</option>
                    <option value={4}>4 inputs</option>
                    <option value={5}>5 inputs</option>
                </select>
            </label>
            <label>
                Separator
                <select value={separator} onChange={(e) => setSeparator(e.target.value)}>
                    <option value="newline">Newline</option>
                    <option value="space">Space</option>
                    <option value="comma">Comma</option>
                    <option value="pipe">Pipe</option>
                    <option value="none">None</option>
                </select>
            </label>
            <div style={{
                marginTop: '8px',
                padding: '6px 8px',
                background: 'rgba(99, 102, 241, 0.1)',
                borderRadius: '4px',
                fontSize: '11px',
                color: 'var(--text-secondary)'
            }}>
                Joins {inputCount} inputs with {getSeparatorDisplay()}
            </div>
        </BaseNode>
    );
}
