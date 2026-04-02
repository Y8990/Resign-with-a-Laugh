/**
 * File Header:
 * This file contains the SystemDiagram component, which visually explains how the different AI agents
 * work together to create the resignation letter. It uses an SVG (Scalable Vector Graphics) to draw
 * boxes and arrows representing the flow of information.
 */

import React from 'react';

/**
 * SystemDiagram Component
 * 
 * This component renders a flowchart diagram showing the user's request flowing through the
 * Project Manager, Researcher, Writer, Editor, Graphics Designer, and Ethics Reviewer.
 * 
 * @returns {JSX.Element} The rendered SVG diagram.
 */
export function SystemDiagram() {
  /**
   * Node Component
   * 
   * A helper component to draw a single box (node) in the diagram.
   * 
   * @param {Object} props - The properties for the node.
   * @param {number} props.x - The horizontal position of the node.
   * @param {number} props.y - The vertical position of the node.
   * @param {string} props.title - The main text to display in the box.
   * @param {string} [props.subtitle] - Optional smaller text to display below the title.
   * @param {boolean} [props.isUser] - If true, styles the box differently to represent the user.
   * @returns {JSX.Element} The rendered SVG group for the node.
   */
  const Node = ({ x, y, title, subtitle, isUser = false }: any) => (
    <g transform={`translate(${x}, ${y})`}>
      <rect 
        x="-56" y="-21" width="120" height="50" rx="8" 
        fill="#333333"
      />
      <rect 
        x="-60" y="-25" width="120" height="50" rx="8" 
        fill={isUser ? "#333333" : "#ffffff"} 
        stroke="#333333" 
        strokeWidth="3"
      />
      <text x="0" y={subtitle ? "-2" : "5"} textAnchor="middle" fill={isUser ? "#ffffff" : "#333333"} fontSize="16" fontFamily="'Nunito', sans-serif" fontWeight="bold">
        {title}
      </text>
      {subtitle && (
        <text x="0" y="14" textAnchor="middle" fill={isUser ? "#ffffff" : "#333333"} opacity="0.8" fontSize="12" fontFamily="'Nunito', sans-serif">
          {subtitle}
        </text>
      )}
    </g>
  );

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#F4EFE6] border-[3px] border-[#333333] shadow-[6px_6px_0px_#333333] p-4 overflow-auto min-h-[400px] rounded-xl">
      <svg viewBox="0 0 1000 500" className="w-full max-w-5xl h-auto">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#333333" opacity="0.4" />
          </marker>
          <marker id="arrowhead-dashed" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#333333" opacity="0.4" />
          </marker>
        </defs>

        {/* Edges */}
        <g stroke="#333333" strokeWidth="2" strokeOpacity="0.4" fill="none" markerEnd="url(#arrowhead)">
          {/* User to PM */}
          <path d="M 160 250 L 215 250" />
          
          {/* PM to Researcher */}
          <path d="M 340 250 C 370 250, 370 150, 395 150" />
          
          {/* PM to Writer */}
          <path d="M 340 250 L 395 250" />
          
          {/* Writer to Editor */}
          <path d="M 520 250 L 575 250" />
          
          {/* Editor to Graphics */}
          <path d="M 700 250 C 730 250, 730 180, 755 180" />
          
          {/* Editor to Ethics */}
          <path d="M 700 250 C 730 250, 730 320, 755 320" />
          
          {/* Graphics to PM (Back edge) */}
          <path d="M 820 155 C 820 50, 280 50, 280 220" />
          
          {/* Ethics to PM (Back edge) */}
          <path d="M 820 345 C 820 450, 280 450, 280 280" />
          
          {/* PM to User (Back edge) */}
          <path d="M 260 275 C 260 330, 120 330, 120 280" />
        </g>
        
        {/* Data flow edges (dashed) */}
        <g stroke="#333333" strokeWidth="2" strokeOpacity="0.4" strokeDasharray="5,5" fill="none" markerEnd="url(#arrowhead-dashed)">
          {/* Researcher to Writer */}
          <path d="M 460 175 L 460 220" />
        </g>

        {/* Nodes */}
        <Node x="100" y="250" title="User" isUser={true} />
        <Node x="280" y="250" title="Project Manager" subtitle="Orchestrator" />
        <Node x="460" y="150" title="Researcher" subtitle="Context Gatherer" />
        <Node x="460" y="250" title="Writer" subtitle="Content Drafter" />
        <Node x="640" y="250" title="Editor" subtitle="Content Refiner" />
        <Node x="820" y="180" title="Graphics/UX" subtitle="Formatter" />
        <Node x="820" y="320" title="Ethics Reviewer" subtitle="Safety Checker" />
        
        {/* Labels for edges */}
        <g fill="#333333" fontSize="14" fontFamily="'Nunito', sans-serif" textAnchor="middle" fontWeight="bold">
          <text x="190" y="240">Request</text>
          <text x="370" y="180">Tasks</text>
          <text x="370" y="240">Tasks</text>
          <text x="485" y="205">Facts</text>
          <text x="550" y="240">Draft</text>
          <text x="730" y="200">Copy</text>
          <text x="730" y="300">Copy</text>
          <text x="550" y="45">Formatted Letter</text>
          <text x="550" y="445">Safety Flag</text>
          <text x="190" y="325">Response</text>
        </g>
      </svg>
    </div>
  );
}
