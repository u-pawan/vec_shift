// This store manages the state of our React Flow diagram.
// It is set up to work smoothly with React Flow and prevent unnecessary re-renders.

import { create } from "zustand";
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from 'reactflow';

// We start with an empty object to track node IDs.
const initialNodeIDs = {};

export const useStore = create((set, get) => ({
  nodes: [],
  edges: [],
  nodeIDs: initialNodeIDs,

  // Helper to generate a unique ID for a new node.
  getNodeID: (type) => {
    const currentIDs = get().nodeIDs;
    const currentCount = currentIDs[type] || 0;
    const newCount = currentCount + 1;

    // We update the ID counter quietly to keep things efficient.
    set((state) => ({
      nodeIDs: {
        ...state.nodeIDs,
        [type]: newCount
      }
    }));

    return `${type}-${newCount}`;
  },

  // Adds a new node to our list.
  addNode: (node) => {
    set((state) => ({
      nodes: [...state.nodes, node]
    }));
  },

  // Updates the nodes when React Flow detects a change.
  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
  },

  // Updates the edges when React Flow detects a change.
  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
  },

  // Called when the user connects two nodes.
  onConnect: (connection) => {
    set((state) => ({
      edges: addEdge({
        ...connection,
        type: 'smoothstep',
        animated: true,
        markerEnd: { type: MarkerType.Arrow, height: '20px', width: '20px' }
      }, state.edges),
    }));
  },

  // Updates a single piece of data within a node.
  updateNodeField: (nodeId, fieldName, fieldValue) => {
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, [fieldName]: fieldValue }
          };
        }
        return node;
      }),
    }));
  },
}));
