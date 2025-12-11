// BaseNode.js
// Reusable node abstraction component that captures shared logic and rendering
// between all node types. Provides consistent layout, styling, and handle rendering.

import { Handle } from 'reactflow';
import './BaseNode.css';

/**
 * BaseNode - A reusable wrapper component for all pipeline nodes
 * 
 * @param {Object} props
 * @param {string} props.id - Unique node identifier
 * @param {string} props.title - Header title text
 * @param {string|React.ReactNode} [props.icon] - Optional icon (emoji or component)
 * @param {React.ReactNode} props.children - Body content of the node
 * @param {Array} [props.handles] - Array of handle definitions
 *   Each handle: { type: 'source'|'target', position, id, style?, label? }
 * @param {Object} [props.style] - Custom container styles
 * @param {string} [props.className] - Additional CSS class names
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
