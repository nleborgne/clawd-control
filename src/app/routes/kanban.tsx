import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useState, useRef } from 'react'
import type { Id } from '../../../convex/_generated/dataModel'

export const Route = createFileRoute('/kanban')({
  component: KanbanPage,
})

const COLUMNS = [
  { status: 'inbox' as const, label: 'Inbox', icon: '📥', color: 'zinc' },
  { status: 'assigned' as const, label: 'Assigned', icon: '👤', color: 'blue' },
  { status: 'in_progress' as const, label: 'In Progress', icon: '🔨', color: 'amber' },
  { status: 'review' as const, label: 'Review', icon: '👀', color: 'purple' },
  { status: 'done' as const, label: 'Done', icon: '✅', color: 'emerald' },
] as const

type TaskStatus = typeof COLUMNS[number]['status']

const colorMap: Record<string, { header: string; count: string; dropzone: string }> = {
  zinc:    { header: 'text-zinc-300',   count: 'bg-zinc-700 text-zinc-300',     dropzone: 'border-zinc-600' },
  blue:    { header: 'text-blue-300',   count: 'bg-blue-900/50 text-blue-300',  dropzone: 'border-blue-600' },
  amber:   { header: 'text-amber-300',  count: 'bg-amber-900/50 text-amber-300', dropzone: 'border-amber-600' },
  purple:  { header: 'text-purple-300', count: 'bg-purple-900/50 text-purple-300', dropzone: 'border-purple-600' },
  emerald: { header: 'text-emerald-300', count: 'bg-emerald-900/50 text-emerald-300', dropzone: 'border-emerald-600' },
}

function KanbanPage() {
  const tasks = useQuery(api.tasks.list)
  const agents = useQuery(api.agents.list)
  const moveStatus = useMutation(api.tasks.moveStatus)
  const createTask = useMutation(api.tasks.createFromUI)
  const removeTask = useMutation(api.tasks.remove)
  const [draggedId, setDraggedId] = useState<Id<'tasks'> | null>(null)
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const tasksByStatus = (status: TaskStatus) =>
    tasks?.filter(t => t.status === status) ?? []

  const getAgentName = (id: Id<'agents'>) =>
    agents?.find(a => a._id === id)?.name ?? '?'

  const handleDragStart = (id: Id<'tasks'>) => {
    setDraggedId(id)
  }

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault()
    setDragOverCol(status)
  }

  const handleDrop = async (status: TaskStatus) => {
    if (draggedId) {
      const task = tasks?.find(t => t._id === draggedId)
      if (task && task.status !== status) {
        await moveStatus({ id: draggedId, status })
      }
    }
    setDraggedId(null)
    setDragOverCol(null)
  }

  const handleDelete = async (id: Id<'tasks'>) => {
    await removeTask({ id })
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-zinc-400 hover:text-zinc-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Kanban</h1>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Task
        </button>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-3 sm:gap-4 p-4 sm:p-6 h-full min-w-max">
          {COLUMNS.map(col => {
            const colTasks = tasksByStatus(col.status)
            const colors = colorMap[col.color]
            const isOver = dragOverCol === col.status

            return (
              <div
                key={col.status}
                className="w-64 sm:w-72 flex flex-col shrink-0"
                onDragOver={e => handleDragOver(e, col.status)}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={() => handleDrop(col.status)}
              >
                {/* Column header */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span>{col.icon}</span>
                  <span className={`text-sm font-semibold ${colors.header}`}>{col.label}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${colors.count}`}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Cards area */}
                <div
                  className={`flex-1 rounded-xl border-2 border-dashed p-2 space-y-2 overflow-y-auto transition-colors ${
                    isOver
                      ? `${colors.dropzone} bg-zinc-900/50`
                      : 'border-transparent'
                  }`}
                >
                  {colTasks.map(task => (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={() => handleDragStart(task._id)}
                      onDragEnd={() => { setDraggedId(null); setDragOverCol(null) }}
                      className={`group bg-zinc-900 border border-zinc-800 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-zinc-700 transition-all ${
                        draggedId === task._id ? 'opacity-40 scale-95' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-zinc-100 leading-snug">{task.title}</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(task._id) }}
                          className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all shrink-0 p-0.5"
                          title="Delete"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      {task.description && (
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{task.description}</p>
                      )}
                      {task.assigneeIds.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {task.assigneeIds.map(id => (
                            <span key={id} className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">
                              {getAgentName(id)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {colTasks.length === 0 && !isOver && (
                    <div className="text-xs text-zinc-700 text-center py-8">
                      Drop tasks here
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Create task modal */}
      {showCreate && (
        <CreateTaskModal
          agents={agents ?? []}
          onCreate={async (title, description, assigneeIds) => {
            await createTask({ title, description: description || undefined, assigneeIds: assigneeIds.length > 0 ? assigneeIds : undefined })
            setShowCreate(false)
          }}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  )
}

function CreateTaskModal({
  agents,
  onCreate,
  onClose,
}: {
  agents: Array<{ _id: Id<'agents'>; name: string; role: string }>
  onCreate: (title: string, description: string, assigneeIds: Id<'agents'>[]) => Promise<void>
  onClose: () => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedAgents, setSelectedAgents] = useState<Id<'agents'>[]>([])
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const toggleAgent = (id: Id<'agents'>) => {
    setSelectedAgents(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  const handleCreate = async () => {
    if (!title.trim()) return
    setSaving(true)
    await onCreate(title.trim(), description.trim(), selectedAgents)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        ref={el => { if (el) setTimeout(() => inputRef.current?.focus(), 50) }}
      >
        <h2 className="text-lg font-bold mb-4">New Task</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Title</label>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleCreate()}
              placeholder="Task title..."
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What needs to be done..."
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors text-sm resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Assign to <span className="text-zinc-500 font-normal">(optional)</span>
            </label>
            {agents.length === 0 ? (
              <p className="text-xs text-zinc-600 italic">No agents registered in Convex yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {agents.map(agent => {
                  const selected = selectedAgents.includes(agent._id)
                  return (
                    <button
                      key={agent._id}
                      onClick={() => toggleAgent(agent._id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                        selected
                          ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      {agent.name}
                      <span className="text-xs text-zinc-500 ml-1.5">{agent.role}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-zinc-400 hover:text-zinc-200 text-sm">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={saving || !title.trim()}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:text-blue-400 text-white font-medium rounded-lg text-sm transition-colors"
          >
            {saving ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}
