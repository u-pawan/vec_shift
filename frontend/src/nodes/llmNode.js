// llmNode.js
// LLM (Large Language Model) node for AI processing
// Refactored to use BaseNode abstraction

import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';

export const LLMNode = ({ id, data }) => {
  // Define handles: two inputs on left (system, prompt), one output on right (response)
  const handles = [
    {
      type: 'target',
      position: Position.Left,
      id: `${id}-system`,
      style: { top: '33%' }
    },
    {
      type: 'target',
      position: Position.Left,
      id: `${id}-prompt`,
      style: { top: '66%' }
    },
    {
      type: 'source',
      position: Position.Right,
      id: `${id}-response`
    }
  ];

  return (
    <BaseNode
      id={id}
      title="LLM"
      icon="🤖"
      handles={handles}
    >
      <p className="node-description">
        Large Language Model node. Connect system prompt and user prompt inputs to generate AI responses.
      </p>
    </BaseNode>
  );
}
