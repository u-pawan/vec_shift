// store.js
// Zustand store for React Flow state management
// Uses proper integration with React Flow to avoid infinite re-renders

import { create } from "zustand";
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from 'reactflow';

// Initialize nodeIDs object
const initialNodeIDs = {};

export const useStore = create((set, get) => ({
  nodes: [],
  edges: [],
  nodeIDs: initialNodeIDs,

  // Get a unique node ID for a given type
  getNodeID: (type) => {
    const currentIDs = get().nodeIDs;
    const currentCount = currentIDs[type] || 0;
    const newCount = currentCount + 1;

    // Update nodeIDs without triggering unnecessary re-renders
    set((state) => ({
      nodeIDs: {
        ...state.nodeIDs,
        [type]: newCount
      }
    }));

    return `${type}-${newCount}`;
  },

  // Add a new node to the canvas
  addNode: (node) => {
    set((state) => ({
      nodes: [...state.nodes, node]
    }));
  },

  // Handle node changes from React Flow
  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
  },

  // Handle edge changes from React Flow  
  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
  },

  // Handle new connections between nodes
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

  // Update a specific field in a node's data
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
