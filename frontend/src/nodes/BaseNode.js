
import { Handle } from 'reactflow';
import './BaseNode.css';

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
      <div className="node-header">
        {icon && <span className="node-icon">{icon}</span>}
        <span className="node-title">{title}</span>
      </div>

      <div className="node-body">
        {children}
      </div>

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
