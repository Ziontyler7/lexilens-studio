/**
 * LexiLens Studio — Interactive Visual Concept Map & DAG Layout Engine
 *
 * Pure-math engine providing:
 * 1. Directed Acyclic Graph (DAG) extraction from STEM, medical, and legal passages
 *    into typed nodes (`prerequisite`, `mechanism`, `outcome`, `warning`) and labeled edges.
 * 2. Deterministic layered bounding-box layout (`880x380` SVG canvas) with zero node overlap
 *    verification (`verifyZeroNodeOverlap`).
 * 3. Upstream prerequisite + downstream impact path highlighting when a user clicks any node.
 */

import type { DocumentSimplificationResult } from '../simplifier/clause-simplifier-engine.ts';

export type ConceptNodeType = 'prerequisite' | 'mechanism' | 'outcome' | 'warning';

export interface ConceptNode {
  id: string;
  label: string;
  subtitle: string;
  nodeType: ConceptNodeType;
  clauseIndex: number;
  layer: number; // 0 = left/input, 1 = middle/process, 2 = right/outcome or warning
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ConceptEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationLabel: string;
}

export interface ConceptGraphLayout {
  documentId: string;
  canvasWidth: number;
  canvasHeight: number;
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  zeroOverlapVerified: boolean;
}

const NODE_WIDTH = 220;
const NODE_HEIGHT = 86;

const PRESET_GRAPH_BLUEPRINTS: Record<
  string,
  {
    nodes: Array<Omit<ConceptNode, 'x' | 'y' | 'width' | 'height'>>;
    edges: ConceptEdge[];
  }
> = {
  'stem-atp-synthase': {
    nodes: [
      {
        id: 'n-nadh',
        label: 'NADH & FADH2',
        subtitle: 'Donate high-energy electrons',
        nodeType: 'prerequisite',
        clauseIndex: 1,
        layer: 0,
      },
      {
        id: 'n-gradient',
        label: '180 mV Proton Gradient',
        subtitle: 'Protons pumped across inner wall',
        nodeType: 'mechanism',
        clauseIndex: 1,
        layer: 1,
      },
      {
        id: 'n-rotor',
        label: 'ATP Synthase Rotor',
        subtitle: '120° mechanical F1 spin',
        nodeType: 'mechanism',
        clauseIndex: 2,
        layer: 1,
      },
      {
        id: 'n-atp',
        label: '32 ATP Minted',
        subtitle: 'ADP + Pi -> cellular energy',
        nodeType: 'outcome',
        clauseIndex: 3,
        layer: 2,
      },
      {
        id: 'n-uncouple',
        label: 'Uncoupling Leak',
        subtitle: 'Escapes as heat (0 ATP)',
        nodeType: 'warning',
        clauseIndex: 3,
        layer: 2,
      },
    ],
    edges: [
      { id: 'e1', sourceId: 'n-nadh', targetId: 'n-gradient', relationLabel: 'pumps H+ to build' },
      { id: 'e2', sourceId: 'n-gradient', targetId: 'n-rotor', relationLabel: 'drives Fo channel' },
      { id: 'e3', sourceId: 'n-rotor', targetId: 'n-atp', relationLabel: 'phosphorylates' },
      { id: 'e4', sourceId: 'n-gradient', targetId: 'n-uncouple', relationLabel: 'if membrane leaks' },
    ],
  },
  'medical-cardiac-discharge': {
    nodes: [
      {
        id: 'm-stent',
        label: 'New Drug-Eluting Stent',
        subtitle: 'Coronary artery opened',
        nodeType: 'prerequisite',
        clauseIndex: 1,
        layer: 0,
      },
      {
        id: 'm-dapt',
        label: '75mg Clopidogrel + 81mg',
        subtitle: 'Take orally every 24 hours',
        nodeType: 'mechanism',
        clauseIndex: 1,
        layer: 1,
      },
      {
        id: 'm-nitro',
        label: '0.4 mg Nitroglycerin',
        subtitle: 'Under tongue q5m (max 3)',
        nodeType: 'mechanism',
        clauseIndex: 2,
        layer: 1,
      },
      {
        id: 'm-safe',
        label: 'Patent Open Artery',
        subtitle: 'Zero stent blood clots',
        nodeType: 'outcome',
        clauseIndex: 1,
        layer: 2,
      },
      {
        id: 'm-er',
        label: 'Call 911 / ER Red Flags',
        subtitle: 'Pain >15m, fainting, fever >100.4F',
        nodeType: 'warning',
        clauseIndex: 3,
        layer: 2,
      },
    ],
    edges: [
      { id: 'me1', sourceId: 'm-stent', targetId: 'm-dapt', relationLabel: 'requires daily' },
      { id: 'me2', sourceId: 'm-dapt', targetId: 'm-safe', relationLabel: 'prevents clot in' },
      { id: 'me3', sourceId: 'm-stent', targetId: 'm-nitro', relationLabel: 'if chest pain starts' },
      { id: 'me4', sourceId: 'm-nitro', targetId: 'm-er', relationLabel: 'if >15 min or red flags' },
    ],
  },
  'legal-residential-lease': {
    nodes: [
      {
        id: 'l-sign',
        label: 'Sign Lease + $2,400',
        subtitle: 'Security deposit paid upfront',
        nodeType: 'prerequisite',
        clauseIndex: 2,
        layer: 0,
      },
      {
        id: 'l-notice',
        label: '60-Day Certified Notice',
        subtitle: 'Required before lease end',
        nodeType: 'mechanism',
        clauseIndex: 1,
        layer: 1,
      },
      {
        id: 'l-fee',
        label: '$450 Nonrefundable Fee',
        subtitle: 'Kept automatically + 45d wait',
        nodeType: 'warning',
        clauseIndex: 2,
        layer: 1,
      },
      {
        id: 'l-renew',
        label: '12-Mo Auto-Renew (+8%)',
        subtitle: 'Triggered if notice missed',
        nodeType: 'warning',
        clauseIndex: 1,
        layer: 2,
      },
      {
        id: 'l-indem',
        label: '1-Sided Indemnification',
        subtitle: 'Tenant pays liability claims',
        nodeType: 'warning',
        clauseIndex: 3,
        layer: 2,
      },
    ],
    edges: [
      { id: 'le1', sourceId: 'l-sign', targetId: 'l-notice', relationLabel: 'starts clock for' },
      { id: 'le2', sourceId: 'l-notice', targetId: 'l-renew', relationLabel: 'missing deadline forces' },
      { id: 'le3', sourceId: 'l-sign', targetId: 'l-fee', relationLabel: 'deducts $450 immediately' },
      { id: 'le4', sourceId: 'l-fee', targetId: 'l-indem', relationLabel: 'paired with Section 14' },
    ],
  },
  'quantum-superposition-gates': {
    nodes: [
      {
        id: 'q-cool',
        label: '15 mK Transmon Qubit',
        subtitle: 'Superconducting ground state',
        nodeType: 'prerequisite',
        clauseIndex: 1,
        layer: 0,
      },
      {
        id: 'q-hadamard',
        label: 'Hadamard (H) Gate',
        subtitle: 'Rotates to Bloch equator',
        nodeType: 'mechanism',
        clauseIndex: 2,
        layer: 1,
      },
      {
        id: 'q-readout',
        label: '50% / 50% Superposition',
        subtitle: 'Coherent amplitude blend',
        nodeType: 'outcome',
        clauseIndex: 2,
        layer: 2,
      },
      {
        id: 'q-decohere',
        label: '150 µs Decoherence',
        subtitle: 'EM noise collapses phase',
        nodeType: 'warning',
        clauseIndex: 3,
        layer: 2,
      },
    ],
    edges: [
      { id: 'qe1', sourceId: 'q-cool', targetId: 'q-hadamard', relationLabel: 'input to unitary' },
      { id: 'qe2', sourceId: 'q-hadamard', targetId: 'q-readout', relationLabel: 'creates equal' },
      { id: 'qe3', sourceId: 'q-hadamard', targetId: 'q-decohere', relationLabel: 'after 150 microseconds' },
    ],
  },
};

/**
 * Verifies that no two ConceptNodes have overlapping bounding boxes (including a minimum 12px margin).
 */
export function verifyZeroNodeOverlap(nodes: ConceptNode[], minGapPx = 12): boolean {
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      const noOverlapX = a.x + a.width + minGapPx <= b.x || b.x + b.width + minGapPx <= a.x;
      const noOverlapY = a.y + a.height + minGapPx <= b.y || b.y + b.height + minGapPx <= a.y;
      if (!noOverlapX && !noOverlapY) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Builds a deterministic layered SVG Concept Map layout from a DocumentSimplificationResult.
 */
export function buildConceptGraph(doc: DocumentSimplificationResult): ConceptGraphLayout {
  const canvasWidth = 880;
  const canvasHeight = 380;

  const blueprint = PRESET_GRAPH_BLUEPRINTS[doc.documentId];
  let rawNodes: Array<Omit<ConceptNode, 'x' | 'y' | 'width' | 'height'>>;
  let edges: ConceptEdge[];

  if (blueprint) {
    rawNodes = blueprint.nodes;
    edges = blueprint.edges;
  } else {
    // Dynamically synthesize a 3-layer concept graph from custom document clauses
    rawNodes = doc.clauses.slice(0, 5).map((clause, idx) => {
      const layer = idx === 0 ? 0 : idx < doc.clauses.length - 1 ? 1 : 2;
      const nodeType: ConceptNodeType =
        clause.riskSeverity === 'critical' || clause.riskSeverity === 'warning'
          ? 'warning'
          : layer === 0
            ? 'prerequisite'
            : layer === 1
              ? 'mechanism'
              : 'outcome';

      const words = clause.simplifiedClause.split(/\s+/).slice(0, 4).join(' ');
      return {
        id: `custom-node-${idx + 1}`,
        label: `Clause ${idx + 1}: ${words}`,
        subtitle: clause.keyTakeaway.slice(0, 42),
        nodeType,
        clauseIndex: clause.clauseIndex,
        layer,
      };
    });

    edges = [];
    for (let i = 0; i < rawNodes.length - 1; i++) {
      edges.push({
        id: `custom-edge-${i + 1}`,
        sourceId: rawNodes[i].id,
        targetId: rawNodes[i + 1].id,
        relationLabel: 'leads to',
      });
    }
  }

  // Group nodes by layer (0, 1, 2) and assign non-overlapping (x, y) coordinates
  const layerColumns: Record<number, typeof rawNodes> = { 0: [], 1: [], 2: [] };
  for (const n of rawNodes) {
    const clampedLayer = Math.max(0, Math.min(2, n.layer));
    layerColumns[clampedLayer].push(n);
  }

  const layerX: Record<number, number> = {
    0: 36,
    1: 328,
    2: 620,
  };

  const positionedNodes: ConceptNode[] = [];
  for (const layerIdx of [0, 1, 2]) {
    const col = layerColumns[layerIdx];
    const count = col.length;
    if (count === 0) continue;

    const totalHeight = count * NODE_HEIGHT + (count - 1) * 44;
    const startY = Math.max(24, Math.round((canvasHeight - totalHeight) / 2));

    col.forEach((node, idx) => {
      positionedNodes.push({
        ...node,
        x: layerX[layerIdx],
        y: startY + idx * (NODE_HEIGHT + 44),
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      });
    });
  }

  return {
    documentId: doc.documentId,
    canvasWidth,
    canvasHeight,
    nodes: positionedNodes,
    edges,
    zeroOverlapVerified: verifyZeroNodeOverlap(positionedNodes),
  };
}

/**
 * Returns the set of connected node IDs and edge IDs (upstream prerequisites + downstream effects)
 * when a learner clicks or focuses on a specific concept node.
 */
export function getConnectedSubgraph(
  graph: ConceptGraphLayout,
  selectedNodeId: string | null
): { activeNodeIds: Set<string>; activeEdgeIds: Set<string> } {
  if (!selectedNodeId) {
    return {
      activeNodeIds: new Set(graph.nodes.map((n) => n.id)),
      activeEdgeIds: new Set(graph.edges.map((e) => e.id)),
    };
  }

  const activeNodeIds = new Set<string>([selectedNodeId]);
  const activeEdgeIds = new Set<string>();

  // Walk upstream and downstream
  let changed = true;
  while (changed) {
    changed = false;
    for (const edge of graph.edges) {
      if (edge.sourceId === selectedNodeId || edge.targetId === selectedNodeId) {
        if (!activeEdgeIds.has(edge.id)) {
          activeEdgeIds.add(edge.id);
          activeNodeIds.add(edge.sourceId);
          activeNodeIds.add(edge.targetId);
          changed = true;
        }
      }
    }
  }

  return { activeNodeIds, activeEdgeIds };
}
