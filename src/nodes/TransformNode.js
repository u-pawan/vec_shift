// TransformNode.js
// Transforms input data with various operations - demonstrates input/output node with selector

import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';

export const TransformNode = ({ id, data }) => {
    const [transform, setTransform] = useState(data?.transform || 'uppercase');

    const handles = [
        { type: 'target', position: Position.Left, id: `${id}-input` },
        { type: 'source', position: Position.Right, id: `${id}-output` }
    ];

    // Get description for the selected transform
    const getDescription = () => {
        switch (transform) {
            case 'uppercase':
                return 'Converts all characters to uppercase';
            case 'lowercase':
                return 'Converts all characters to lowercase';
            case 'trim':
                return 'Removes leading and trailing whitespace';
            case 'reverse':
                return 'Reverses the character order';
            case 'length':
                return 'Returns the character count';
            default:
                return '';
        }
    };

    return (
        <BaseNode
            id={id}
            title="Transform"
            icon="🔄"
            handles={handles}
        >
            <label>
                Operation
                <select value={transform} onChange={(e) => setTransform(e.target.value)}>
                    <option value="uppercase">Uppercase</option>
                    <option value="lowercase">Lowercase</option>
                    <option value="trim">Trim</option>
                    <option value="reverse">Reverse</option>
                    <option value="length">Length</option>
                </select>
            </label>
            <p className="node-description" style={{ marginTop: '8px' }}>
                {getDescription()}
            </p>
        </BaseNode>
    );
}
