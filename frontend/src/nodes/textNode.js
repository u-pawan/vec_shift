// A smart text node that detects {{variables}} and creates input handles for them.
// It parses the text as you type and updates connections automatically.

import { useState, useRef, useLayoutEffect, useMemo, memo } from 'react';
import { Handle, Position } from 'reactflow';
import './TextNode.css';

// We use this regex to make sure variable names are valid JavaScript identifiers.
// Must start with letter/$/_ and contain only alphanumerics/$/_.
const VALID_IDENTIFIER_REGEX = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/**
 * Scans the provided text for {{variable}} patterns.
 * Returns a list of all variables found, referencing whether they are valid or not.
 */
const extractVariables = (text) => {
  const variables = [];
  const seen = new Set();

  // Create a new regex for each call to avoid lastIndex issues
  const regex = /\{\{\s*([^{}]+?)\s*\}\}/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const varName = match[1].trim();

    // Only add unique variable names
    if (!seen.has(varName)) {
      seen.add(varName);
      variables.push({
        name: varName,
        isValid: VALID_IDENTIFIER_REGEX.test(varName)
      });
    }
  }

  return variables;
};

// We wrap this in memo to keep performance snappy, avoiding re-renders unless necessary.
export const TextNode = memo(({ id, data }) => {
  const [currText, setCurrText] = useState(data?.text || '{{input}}');
  const textareaRef = useRef(null);

  // We calculate variables only when the text actually changes.
  const variables = useMemo(() => extractVariables(currText), [currText]);
  const validVariables = useMemo(() => variables.filter(v => v.isValid), [variables]);
  const invalidVariables = useMemo(() => variables.filter(v => !v.isValid), [variables]);

  // Logic to make the textarea grow or shrink as the user types.
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(textarea.scrollHeight, 60)}px`;
    }
  }, [currText]);

  const handleTextChange = (e) => {
    setCurrText(e.target.value);
  };

  return (
    <div className="node-base text-node">
      {/* Node Header */}
      <div className="node-header">
        <span className="node-icon">📝</span>
        <span className="node-title">Text</span>
      </div>

      {/* Node Body */}
      <div className="node-body">
        <div className="text-node-content">
          {/* Variable labels on left side */}
          {validVariables.length > 0 && (
            <div className="variable-labels">
              {validVariables.map((v, i) => {
                const topPercent = ((i + 1) / (validVariables.length + 1)) * 100;
                return (
                  <span
                    key={v.name}
                    className="variable-label"
                    style={{ top: `${topPercent}%` }}
                  >
                    {v.name}
                  </span>
                );
              })}
            </div>
          )}

          <label>
            Text
            <textarea
              ref={textareaRef}
              value={currText}
              onChange={handleTextChange}
              className="auto-resize-textarea"
              placeholder="Enter text with {{ variables }}"
            />
          </label>

          {/* Show invalid variable warnings */}
          {invalidVariables.length > 0 && (
            <div className="variable-warnings">
              {invalidVariables.map(v => (
                <span key={v.name} className="warning-text">
                  ⚠️ Invalid: {v.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Output handle on right */}
      <Handle
        type="source"
        position={Position.Right}
        id={`${id}-output`}
        className="node-handle"
      />

      {/* Dynamic variable handles on left */}
      {validVariables.map((variable, index) => {
        const topPercent = ((index + 1) / (validVariables.length + 1)) * 100;
        return (
          <Handle
            key={`${id}-var-${variable.name}`}
            type="target"
            position={Position.Left}
            id={`${id}-var-${variable.name}`}
            className="node-handle"
            style={{ top: `${topPercent}%` }}
          />
        );
      })}
    </div>
  );
});

// Display name for debugging
TextNode.displayName = 'TextNode';
