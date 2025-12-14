// This node sends data out of the pipeline.
// It serves as a final destination for data.

import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';

export const OutputNode = ({ id, data }) => {
  const [currName, setCurrName] = useState(data?.outputName || id.replace('customOutput-', 'output_'));
  const [outputType, setOutputType] = useState(data.outputType || 'Text');

  const handleNameChange = (e) => {
    setCurrName(e.target.value);
  };

  const handleTypeChange = (e) => {
    setOutputType(e.target.value);
  };

  // We set up a single input handle on the left.
  const handles = [
    { type: 'target', position: Position.Left, id: `${id}-value` }
  ];

  return (
    <BaseNode
      id={id}
      title="Output"
      icon="📤"
      handles={handles}
    >
      <label>
        Name
        <input
          type="text"
          value={currName}
          onChange={handleNameChange}
        />
      </label>
      <label>
        Type
        <select value={outputType} onChange={handleTypeChange}>
          <option value="Text">Text</option>
          <option value="Image">Image</option>
        </select>
      </label>
    </BaseNode>
  );
}
