
import { create } from "zustand";
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from 'reactflow';

const initialNodeIDs = {};

export const useStore = create((set, get) => ({
  nodes: [],
  edges: [],
  nodeIDs: initialNodeIDs,

  getNodeID: (type) => {
    const currentIDs = get().nodeIDs;
    const currentCount = currentIDs[type] || 0;
    const newCount = currentCount + 1;

    set((state) => ({
      nodeIDs: {
        ...state.nodeIDs,
        [type]: newCount
      }
    }));

    return `${type}-${newCount}`;
  },

  addNode: (node) => {
    set((state) => ({
      nodes: [...state.nodes, node]
    }));
  },

  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
  },

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
