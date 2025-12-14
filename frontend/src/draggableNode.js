// This component allows users to drag nodes from the toolbar.
import { useRef } from 'react';

export const DraggableNode = ({ type, label, icon }) => {
  const ghostRef = useRef(null);

  const onDragStart = (event, nodeType) => {
    const appData = { nodeType }
    event.target.style.cursor = 'grabbing';
    event.dataTransfer.setData('application/reactflow', JSON.stringify(appData));
    event.dataTransfer.effectAllowed = 'move';
  };

  // Helpers for touch devices (mobiles/tablets).
  const onTouchStart = (e) => {
    const touch = e.touches[0];

    // Create a ghost element to follow the finger.
    const ghost = document.createElement('div');
    ghost.textContent = `${icon} ${label}`;
    ghost.style.position = 'fixed';
    ghost.style.left = `${touch.clientX}px`;
    ghost.style.top = `${touch.clientY}px`;
    ghost.style.background = '#1e293b';
    ghost.style.color = 'white';
    ghost.style.padding = '8px 12px';
    ghost.style.borderRadius = '8px';
    ghost.style.border = '1px solid #6366f1';
    ghost.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    ghost.style.pointerEvents = 'none'; // Essential so we can detect what's underneath.
    ghost.style.zIndex = '10000';
    ghost.style.fontSize = '12px';
    ghost.style.transform = 'translate(-50%, -50%)'; // Center it right under the finger.

    document.body.appendChild(ghost);
    ghostRef.current = ghost;

    // We attach listeners to the window to ensure we don't lose track if the finger moves fast.
  };

  const onTouchMove = (e) => {
    if (!ghostRef.current) return;
    const touch = e.touches[0];
    e.preventDefault(); // Stop the screen from scrolling while we drag.

    ghostRef.current.style.left = `${touch.clientX}px`;
    ghostRef.current.style.top = `${touch.clientY}px`;
  };

  const onTouchEnd = (e) => {
    if (!ghostRef.current) return;
    const touch = e.changedTouches[0];

    // clean up the ghost element.
    document.body.removeChild(ghostRef.current);
    ghostRef.current = null;

    // See where we dropped it.
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const canvas = target?.closest('.pipeline-canvas');

    if (canvas) {
      // Let the UI know something was dropped.
      const event = new CustomEvent('node-dropped', {
        detail: { nodeType: type, x: touch.clientX, y: touch.clientY }
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <div
      className="draggable-node"
      onDragStart={(event) => onDragStart(event, type)}
      onDragEnd={(event) => (event.target.style.cursor = 'grab')}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      draggable
    >
      {icon && <span className="draggable-icon">{icon}</span>}
      <span className="draggable-label">{label}</span>
    </div>
  );
};