'use client'

import { useCallback, useRef } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  type ReactFlowInstance,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { useWorkflowStore } from '@/store/workflow'
import { nodeTypes } from '@/components/nodes'
import type { NodeType } from '@/types/nodes'

export function WorkflowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null)

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNodeId,
    isTemplate,
  } = useWorkflowStore()

  const { screenToFlowPosition } = useReactFlow()

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (isTemplate) return
      event.preventDefault()

      const type = event.dataTransfer.getData('application/reactflow') as NodeType
      if (!type) return

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      addNode(type, position)
    },
    [screenToFlowPosition, addNode, isTemplate]
  )

  return (
    <div ref={reactFlowWrapper} className="flex-1">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={isTemplate ? undefined : onNodesChange}
        onEdgesChange={isTemplate ? undefined : onEdgesChange}
        onConnect={isTemplate ? undefined : onConnect}
        onInit={(instance) => { reactFlowInstance.current = instance }}
        onDragOver={isTemplate ? undefined : onDragOver}
        onDrop={isTemplate ? undefined : onDrop}
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        onPaneClick={() => setSelectedNodeId(null)}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        defaultEdgeOptions={{ animated: true }}
        deleteKeyCode={isTemplate ? null : 'Delete'}
        nodesDraggable={!isTemplate}
        nodesConnectable={!isTemplate}
        elementsSelectable={!isTemplate}
      >
        <Background gap={16} size={1} />
        <Controls />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
      </ReactFlow>
    </div>
  )
}
