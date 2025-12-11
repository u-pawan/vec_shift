// textNode.js
// Text node with auto-resizing textarea and dynamic variable handles
// Part 3 implementation: detects {{ variableName }} patterns and creates handles

import { useState, useRef, useLayoutEffect, useMemo, memo } from 'react';
import { Handle, Position } from 'reactflow';
import './TextNode.css';

/**
 * Regex to validate JavaScript identifiers
 * Must start with letter, underscore, or $ followed by alphanumeric, underscore, or $
 */
const VALID_IDENTIFIER_REGEX = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/**
 * Extracts all variable references from text and validates them
 * @param {string} text - The input text to parse
 * @returns {Array<{name: string, isValid: boolean}>} Array of variable info objects
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

// Memoized component to prevent unnecessary re-renders
export const TextNode = memo(({ id, data }) => {
  const [currText, setCurrText] = useState(data?.text || '{{input}}');
  const textareaRef = useRef(null);

  // Extract variables using useMemo
  const variables = useMemo(() => extractVariables(currText), [currText]);
  const validVariables = useMemo(() => variables.filter(v => v.isValid), [variables]);
  const invalidVariables = useMemo(() => variables.filter(v => !v.isValid), [variables]);

  // Auto-resize textarea when text changes using useLayoutEffect
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
