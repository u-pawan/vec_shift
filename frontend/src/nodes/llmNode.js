// This node represents a Large Language Model for AI processing.
// It allows users to connect prompts to an AI model.

import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';

export const LLMNode = ({ id, data }) => {
  // We set up inputs for system and user prompts, and an output for the AI's response.
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
