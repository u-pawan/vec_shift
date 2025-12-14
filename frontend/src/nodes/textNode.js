
import { useState, useRef, useLayoutEffect, useMemo, memo } from 'react';
import { Handle, Position } from 'reactflow';
import './TextNode.css';

const VALID_IDENTIFIER_REGEX = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

const extractVariables = (text) => {
  const variables = [];
  const seen = new Set();

  const regex = /\{\{\s*([^{}]+?)\s*\}\}/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const varName = match[1].trim();

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

export const TextNode = memo(({ id, data }) => {
  const [currText, setCurrText] = useState(data?.text || '{{input}}');
  const textareaRef = useRef(null);

  const variables = useMemo(() => extractVariables(currText), [currText]);
  const validVariables = useMemo(() => variables.filter(v => v.isValid), [variables]);
  const invalidVariables = useMemo(() => variables.filter(v => !v.isValid), [variables]);

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
      <div className="node-header">
        <span className="node-icon">📝</span>
        <span className="node-title">Text</span>
      </div>

      <div className="node-body">
        <div className="text-node-content">
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

      <Handle
        type="source"
        position={Position.Right}
        id={`${id}-output`}
        className="node-handle"
      />

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

TextNode.displayName = 'TextNode';
