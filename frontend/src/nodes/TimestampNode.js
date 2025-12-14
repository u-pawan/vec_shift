// This node outputs the current date and time.

import { useState, useEffect } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';

export const TimestampNode = ({ id, data }) => {
    const [format, setFormat] = useState(data?.format || 'ISO');
    const [currentTime, setCurrentTime] = useState(new Date().toISOString());

    // We update the displayed time every second to keep it fresh.
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            switch (format) {
                case 'ISO':
                    setCurrentTime(now.toISOString());
                    break;
                case 'Unix':
                    setCurrentTime(Math.floor(now.getTime() / 1000).toString());
                    break;
                case 'Local':
                    setCurrentTime(now.toLocaleString());
                    break;
                default:
                    setCurrentTime(now.toISOString());
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [format]);

    const handles = [
        { type: 'source', position: Position.Right, id: `${id}-timestamp` }
    ];

    return (
        <BaseNode
            id={id}
            title="Timestamp"
            icon="⏰"
            handles={handles}
        >
            <label>
                Format
                <select value={format} onChange={(e) => setFormat(e.target.value)}>
                    <option value="ISO">ISO 8601</option>
                    <option value="Unix">Unix Epoch</option>
                    <option value="Local">Local String</option>
                </select>
            </label>
            <div style={{
                marginTop: '8px',
                padding: '6px 8px',
                background: 'rgba(99, 102, 241, 0.1)',
                borderRadius: '4px',
                fontSize: '11px',
                color: 'var(--text-secondary)',
                fontFamily: 'monospace',
                wordBreak: 'break-all'
            }}>
                {currentTime}
            </div>
        </BaseNode>
    );
}
