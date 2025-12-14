
import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';

export const FilterNode = ({ id, data }) => {
    const [condition, setCondition] = useState(data?.condition || 'contains');
    const [value, setValue] = useState(data?.value || '');

    const handles = [
        { type: 'target', position: Position.Left, id: `${id}-input` },
        {
            type: 'source',
            position: Position.Right,
            id: `${id}-pass`,
            style: { top: '35%' }
        },
        {
            type: 'source',
            position: Position.Right,
            id: `${id}-fail`,
            style: { top: '65%' }
        }
    ];

    return (
        <BaseNode
            id={id}
            title="Filter"
            icon="🔍"
            handles={handles}
        >
            <label>
                Condition
                <select value={condition} onChange={(e) => setCondition(e.target.value)}>
                    <option value="contains">Contains</option>
                    <option value="startsWith">Starts With</option>
                    <option value="endsWith">Ends With</option>
                    <option value="equals">Equals</option>
                    <option value="notEmpty">Not Empty</option>
                </select>
            </label>
            {condition !== 'notEmpty' && (
                <label>
                    Value
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Filter value..."
                    />
                </label>
            )}
            <div style={{
                marginTop: '8px',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                fontSize: '10px',
                color: 'var(--text-secondary)'
            }}>
                <span style={{ color: '#22c55e' }}>✓ Pass</span>
                <span style={{ color: '#ef4444' }}>✗ Fail</span>
            </div>
        </BaseNode>
    );
}
