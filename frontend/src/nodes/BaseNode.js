// A reusable component that handles the common look and feel for all our nodes.
// It ensures everything looks consistent and handles connection points properly.

import { Handle } from 'reactflow';
import './BaseNode.css';

/**
 * BaseNode: The wrapper that every node uses.
 * 
 * Props:
 * @param {string} id - The unique ID of the node.
 * @param {string} title - The text to show in the header.
 * @param {string|React.ReactNode} [icon] - An optional emoji or icon component.
 * @param {React.ReactNode} children - The actual controls (inputs, selects, etc.) inside the node.
 * @param {Array} [handles] - A list of connection points (sources/targets) to render.
 * @param {Object} [style] - Custom styles if needed.
 * @param {string} [className] - Extra CSS classes.
 */
export const BaseNode = ({
  id,
  title,
  icon,
  children,
  handles = [],
  style = {},
  className = ''
}) => {
  return (
    <div className={`node-base ${className}`} style={style}>
      {/* Node Header */}
      <div className="node-header">
        {icon && <span className="node-icon">{icon}</span>}
        <span className="node-title">{title}</span>
      </div>

      {/* Node Body Content */}
      <div className="node-body">
        {children}
      </div>

      {/* Render all handles */}
      {handles.map((handle, index) => (
        <Handle
          key={handle.id || `${id}-handle-${index}`}
          type={handle.type}
          position={handle.position}
          id={handle.id}
          className="node-handle"
          style={handle.style}
        />
      ))}
    </div>
  );
};

export default BaseNode;
