// toolbar.js
// Pipeline toolbar with draggable node palette
// Groups nodes by category for better organization

import { DraggableNode } from './draggableNode';
import './toolbar.css';

export const PipelineToolbar = () => {
    return (
        <div className="pipeline-toolbar">
            <div className="toolbar-header">
                <h1 className="toolbar-title">🔀 Pipeline Builder</h1>
                <p className="toolbar-subtitle">Drag nodes onto the canvas to build your pipeline</p>
            </div>

            <div className="node-groups">
                {/* Input/Output Nodes */}
                <div className="node-group">
                    <span className="group-label">Data</span>
                    <div className="node-list">
                        <DraggableNode type='customInput' label='Input' icon='📥' />
                        <DraggableNode type='customOutput' label='Output' icon='📤' />
                        <DraggableNode type='text' label='Text' icon='📝' />
                    </div>
                </div>

                {/* Processing Nodes */}
                <div className="node-group">
                    <span className="group-label">Processing</span>
                    <div className="node-list">
                        <DraggableNode type='llm' label='LLM' icon='🤖' />
                        <DraggableNode type='transform' label='Transform' icon='🔄' />
                        <DraggableNode type='filter' label='Filter' icon='🔍' />
                    </div>
                </div>

                {/* Utility Nodes */}
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
    );
};
