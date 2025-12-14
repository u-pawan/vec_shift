
import { useState } from 'react';
import { DraggableNode } from './draggableNode';
import './toolbar.css';

export const PipelineToolbar = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleMenu = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className={`pipeline-toolbar ${isExpanded ? 'expanded' : ''}`}>
            <button
                className="mobile-menu-toggle"
                onClick={toggleMenu}
                title={isExpanded ? 'Close Nodes' : 'Show Nodes'}
            >
                <span className={`hamburger-icon ${isExpanded ? 'open' : ''}`}>
                    <span></span>
                    <span></span>
                    <span></span>
                </span>
                <div className="menu-text">
                    <span className="menu-title">🔀 Pipeline Builder</span>
                    <span className="menu-subtitle">Drag nodes onto the canvas to build your pipeline</span>
                </div>
            </button>

            <div className="toolbar-content">
                <div className="toolbar-header">
                    <h1 className="toolbar-title">🔀 Pipeline Builder</h1>
                    <p className="toolbar-subtitle">Drag nodes onto the canvas to build your pipeline</p>
                </div>

                <div className="node-groups">
                    <div className="node-group">
                        <span className="group-label">Data</span>
                        <div className="node-list">
                            <DraggableNode type='customInput' label='Input' icon='📥' />
                            <DraggableNode type='customOutput' label='Output' icon='📤' />
                            <DraggableNode type='text' label='Text' icon='📝' />
                        </div>
                    </div>

                    <div className="node-group">
                        <span className="group-label">Processing</span>
                        <div className="node-list">
                            <DraggableNode type='llm' label='LLM' icon='🤖' />
                            <DraggableNode type='transform' label='Transform' icon='🔄' />
                            <DraggableNode type='filter' label='Filter' icon='🔍' />
                        </div>
                    </div>

                    <div className="node-group">
                        <span className="group-label">Utilities</span>
                        <div className="node-list">
                            <DraggableNode type='prompt' label='Prompt' icon='💬' />
                            <DraggableNode type='join' label='Join' icon='🔗' />
                            <DraggableNode type='timestamp' label='Timestamp' icon='⏰' />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
