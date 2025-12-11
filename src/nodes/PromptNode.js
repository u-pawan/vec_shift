// PromptNode.js
// Template node for prompt engineering - demonstrates multi-line template editing

import { useState, useRef, useEffect } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';

export const PromptNode = ({ id, data }) => {
    const [template, setTemplate] = useState(
        data?.template || 'You are a helpful assistant.\n\nUser Query: {input}\n\nRespond in a {tone} tone.'
    );
    const [tone, setTone] = useState(data?.tone || 'professional');
    const textareaRef = useRef(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [template]);

    const handles = [
        { type: 'target', position: Position.Left, id: `${id}-input` },
        { type: 'source', position: Position.Right, id: `${id}-output` }
    ];

    return (
        <BaseNode
            id={id}
            title="Prompt Template"
            icon="💬"
            handles={handles}
        >
            <label>
                Tone
                <select value={tone} onChange={(e) => setTone(e.target.value)}>
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                    <option value="friendly">Friendly</option>
                    <option value="concise">Concise</option>
                </select>
            </label>
            <label>
                Template
                <textarea
                    ref={textareaRef}
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    style={{
                        minHeight: '80px',
                        resize: 'vertical',
                        lineHeight: '1.5'
                    }}
                    placeholder="Enter your prompt template..."
                />
            </label>
            <div style={{
                marginTop: '4px',
                fontSize: '10px',
                color: 'var(--text-secondary)'
            }}>
                Use {'{placeholder}'} for dynamic values
            </div>
        </BaseNode>
    );
}
