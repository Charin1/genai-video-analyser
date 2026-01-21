import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Network, User, Building2, Hash, Calendar } from "lucide-react";

interface Entity {
  id: number | string;
  name: string;
  type: "person" | "company" | "topic" | "meeting";
}

interface ConversationGraphProps {
  entities?: Entity[];
  meetingTitle?: string;
}

interface GraphNode {
  id: string;
  label: string;
  type: "topic" | "person" | "company" | "meeting";
  x: number;
  y: number;
  vx: number;
  vy: number;
  connections: string[];
  size: number;
  color: string;
}

interface GraphLink {
  source: string;
  target: string;
  strength: number;
}

const getNodeIcon = (type: GraphNode["type"]) => {
  switch (type) {
    case "person": return User;
    case "company": return Building2;
    case "topic": return Hash;
    case "meeting": return Calendar;
  }
};

export function ConversationGraph({ entities = [], meetingTitle = "Meeting" }: ConversationGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const animationRef = useRef<number>();
  const [dimensions, setDimensions] = useState({ width: 400, height: 320 });

  // Generate nodes from props
  const { nodes: initialNodes, links: initialLinks } = useMemo(() => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    // Central meeting node
    const meetingId = "meeting-root";
    nodes.push({
      id: meetingId,
      label: meetingTitle,
      type: "meeting",
      x: 200,
      y: 150,
      vx: 0,
      vy: 0,
      connections: [],
      size: 32,
      color: "hsl(var(--primary))"
    });

    // Entity nodes
    entities.forEach((entity, index) => {
      const nodeId = `entity-${index}`;
      // Spread nodes out in a circle initially
      const angle = (index / entities.length) * 2 * Math.PI;
      const radius = 120;

      nodes.push({
        id: nodeId,
        label: entity.name,
        type: entity.type as any, // Cast assuming types match or are mapped
        x: 200 + Math.cos(angle) * radius,
        y: 150 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        connections: [meetingId],
        size: entity.type === 'company' ? 24 : 20,
        color: entity.type === 'company' ? "hsl(188, 100%, 50%)" : "hsl(var(--secondary))"
      });

      // Link to meeting
      links.push({
        source: meetingId,
        target: nodeId,
        strength: 0.8
      });

      // Add connection to meeting node
      nodes[0].connections.push(nodeId);
    });

    return { nodes, links };
  }, [entities, meetingTitle]);

  const [nodes, setNodes] = useState<GraphNode[]>(initialNodes);
  // Reset nodes when entities change
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes]);

  // Links are static derived from nodes for now
  const links = initialLinks;


  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Simple force simulation
  const simulate = useCallback(() => {
    setNodes(prevNodes => {
      const newNodes = prevNodes.map(node => ({ ...node }));
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;

      // Apply forces
      newNodes.forEach((node, i) => {
        if (node.id === draggedNode) return;

        let fx = 0, fy = 0;

        // Center gravity (weak)
        fx += (centerX - node.x) * 0.001;
        fy += (centerY - node.y) * 0.001;

        // Repulsion between all nodes
        newNodes.forEach((other, j) => {
          if (i === j) return;
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 500 / (dist * dist);
          fx += (dx / dist) * force;
          fy += (dy / dist) * force;
        });

        // Attraction along links
        links.forEach(link => {
          if (link.source === node.id || link.target === node.id) {
            const otherId = link.source === node.id ? link.target : link.source;
            const other = newNodes.find(n => n.id === otherId);
            if (other) {
              const dx = other.x - node.x;
              const dy = other.y - node.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              fx += dx * 0.01 * link.strength;
              fy += dy * 0.01 * link.strength;
            }
          }
        });

        // Apply velocity with damping
        node.vx = (node.vx + fx) * 0.8;
        node.vy = (node.vy + fy) * 0.8;

        // Update position with bounds
        node.x = Math.max(40, Math.min(dimensions.width - 40, node.x + node.vx));
        node.y = Math.max(40, Math.min(dimensions.height - 40, node.y + node.vy));
      });

      return newNodes;
    });

    animationRef.current = requestAnimationFrame(simulate);
  }, [dimensions, draggedNode, links]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(simulate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [simulate]);

  const handleMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setDraggedNode(nodeId);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedNode || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setNodes(prev => prev.map(node =>
      node.id === draggedNode
        ? { ...node, x: Math.max(40, Math.min(dimensions.width - 40, x)), y: Math.max(40, Math.min(dimensions.height - 40, y)), vx: 0, vy: 0 }
        : node
    ));
  }, [draggedNode, dimensions]);

  const handleMouseUp = () => setDraggedNode(null);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Network className="h-4 w-4 text-primary" />
          Conversation Graph
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div
          ref={containerRef}
          className="relative h-80 bg-gradient-to-br from-background to-muted/20 cursor-grab active:cursor-grabbing"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg
            width="100%"
            height="100%"
            className="absolute inset-0"
          >
            {/* Glow filter */}
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="linkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                <stop offset="50%" stopColor="hsl(var(--secondary))" stopOpacity="0.5" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            {/* Links */}
            {links.map((link, i) => {
              const source = nodes.find(n => n.id === link.source);
              const target = nodes.find(n => n.id === link.target);
              if (!source || !target) return null;

              const isHighlighted = hoveredNode && (
                hoveredNode.id === link.source ||
                hoveredNode.id === link.target ||
                hoveredNode.connections.includes(link.source) ||
                hoveredNode.connections.includes(link.target)
              );

              return (
                <line
                  key={i}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={isHighlighted ? "hsl(var(--primary))" : "url(#linkGradient)"}
                  strokeWidth={isHighlighted ? 2 : 1}
                  strokeOpacity={hoveredNode ? (isHighlighted ? 0.8 : 0.1) : 0.4}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Nodes */}
            {nodes.map(node => {
              const Icon = getNodeIcon(node.type);
              const isHovered = hoveredNode?.id === node.id;
              const isConnected = hoveredNode?.connections.includes(node.id);
              const dimmed = hoveredNode && !isHovered && !isConnected && hoveredNode.id !== node.id;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onMouseDown={(e) => handleMouseDown(node.id, e)}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="cursor-pointer"
                  style={{ opacity: dimmed ? 0.3 : 1, transition: "opacity 0.3s" }}
                >
                  {/* Outer glow ring */}
                  <circle
                    r={node.size + (isHovered ? 8 : 4)}
                    fill="none"
                    stroke={node.color}
                    strokeWidth={isHovered ? 2 : 1}
                    strokeOpacity={isHovered ? 0.6 : 0.2}
                    className="transition-all duration-300"
                    filter={isHovered ? "url(#glow)" : undefined}
                  />

                  {/* Node circle */}
                  <circle
                    r={node.size}
                    fill="hsl(var(--card))"
                    stroke={node.color}
                    strokeWidth={2}
                    className="transition-all duration-300"
                    filter={isHovered ? "url(#glow)" : undefined}
                  />

                  {/* Icon */}
                  <foreignObject
                    x={-node.size / 2}
                    y={-node.size / 2}
                    width={node.size}
                    height={node.size}
                    className="pointer-events-none"
                  >
                    <div className="h-full w-full flex items-center justify-center">
                      <Icon
                        className="transition-all duration-300"
                        style={{
                          width: node.size * 0.5,
                          height: node.size * 0.5,
                          color: node.color
                        }}
                      />
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </svg>

          {/* Tooltip */}
          {hoveredNode && (
            <div
              className="absolute z-10 px-3 py-2 rounded-lg glass-card border border-border shadow-lg pointer-events-none animate-in fade-in-0 zoom-in-95 duration-150"
              style={{
                left: Math.min(hoveredNode.x + 20, dimensions.width - 140),
                top: Math.min(hoveredNode.y - 10, dimensions.height - 60),
              }}
            >
              <p className="text-sm font-medium text-foreground">{hoveredNode.label}</p>
              <p className="text-xs text-muted-foreground capitalize">{hoveredNode.type}</p>
              <p className="text-xs text-primary">{hoveredNode.connections.length} connections</p>
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-2 left-2 flex gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary" /> People
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary" /> Topics
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: "hsl(188, 100%, 50%)" }} /> Companies
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
