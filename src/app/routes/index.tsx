import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState, useCallback } from 'react'

interface AgentBinding {
  agentId: string
  match: { channel: string; accountId: string }
}

interface Agent {
  id: string
  name: string
  workspace: string
  hasAgent: boolean
  identity: Record<string, string> | null
  bindings: AgentBinding[]
  model: string
}

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const loadAgents = useCallback(() => {
    fetch('/api/agents')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch agents')
        return res.json()
      })
      .then(setAgents)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadAgents() }, [loadAgents])

  const handleDelete = async (id: string) => {
    if (!confirm(`Delete agent "${id}"? This removes its workspace and config.`)) return
    try {
      const res = await fetch('/api/agents/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      loadAgents()
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-6 sm:p-8 overflow-x-hidden">
      <div className="max-w-4xl mx-auto w-full">
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-1">ClawdControl</h1>
        <p className="text-zinc-400 text-xs sm:text-base mb-6 sm:mb-8">OpenClaw Agent Management</p>

        <div className="flex gap-2 mb-6">
          <Link
            to="/kanban"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition-colors border border-zinc-700"
          >
            📋 Kanban
          </Link>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-semibold">Agents</h2>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">New Agent</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>

        {loading && (
          <div className="text-zinc-400 animate-pulse">Loading agents...</div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 sm:p-4 text-red-300 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && agents.length === 0 && (
          <div className="text-zinc-500">No agents found.</div>
        )}

        <div className="grid gap-3 sm:gap-4">
          {agents.map(agent => (
            <div
              key={agent.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6 hover:border-zinc-700 transition-colors overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <span className="text-xl sm:text-2xl shrink-0">
                    {agent.identity?.emoji || '🤖'}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold truncate">
                      {agent.identity?.name || agent.name}
                    </h3>
                    <span className="text-xs sm:text-sm text-zinc-500 font-mono">{agent.id}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <span
                    className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                      agent.hasAgent
                        ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800'
                        : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                    }`}
                  >
                    {agent.hasAgent ? 'Active' : 'Inactive'}
                  </span>
                  <Link
                    to="/agents/$agentId"
                    params={{ agentId: agent.id }}
                    className="p-1.5 sm:p-2 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Settings"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </Link>
                  {agent.id !== 'main' && (
                    <button
                      onClick={() => handleDelete(agent.id)}
                      className="p-1.5 sm:p-2 text-zinc-600 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                      title="Delete agent"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {agent.identity?.creature && (
                <p className="text-zinc-400 text-xs sm:text-sm mt-2">{agent.identity.creature}</p>
              )}

              <div className="mt-3 flex flex-col gap-1.5 text-sm text-zinc-400 overflow-hidden">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-zinc-600 shrink-0 text-xs">Model:</span>
                  <span className="font-mono text-[11px] bg-zinc-800 px-2 py-0.5 rounded truncate">
                    {agent.model}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-zinc-600 shrink-0 text-xs">Workspace:</span>
                  <span className="font-mono text-[11px] bg-zinc-800 px-2 py-0.5 rounded truncate">
                    {agent.workspace}
                  </span>
                </div>
              </div>

              {agent.bindings.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {agent.bindings.map((binding, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-xs bg-blue-900/30 text-blue-400 border border-blue-800/50 px-2 py-1 rounded-lg"
                    >
                      <ChannelIcon channel={binding.match.channel} />
                      {binding.match.channel}
                      {binding.match.accountId !== 'default' && (
                        <span className="text-blue-600">({binding.match.accountId})</span>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showCreate && (
        <CreateAgentModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadAgents() }}
        />
      )}
    </div>
  )
}

function CreateAgentModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [id, setId] = useState('')
  const [name, setName] = useState('')
  const [model, setModel] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!id.trim() || !name.trim()) {
      setError('ID and name are required')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/agents/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id.trim(), name: name.trim(), model: model.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create agent')
      onCreated()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-t-2xl sm:rounded-2xl p-6 sm:p-8 w-full sm:max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6">New Agent</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">ID</label>
            <input
              type="text"
              value={id}
              onChange={e => setId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              placeholder="my-agent"
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 sm:px-4 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors font-mono text-sm"
            />
            <p className="text-xs text-zinc-500 mt-1">Lowercase, hyphens only.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Alfred"
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 sm:px-4 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Model <span className="text-zinc-500 font-normal">(optional)</span></label>
            <input
              type="text"
              value={model}
              onChange={e => setModel(e.target.value)}
              placeholder="anthropic/claude-opus-4-6"
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 sm:px-4 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors font-mono text-sm"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 text-red-400 text-sm">{error}</div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-zinc-400 hover:text-zinc-200 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:text-blue-400 text-white font-medium rounded-lg transition-colors text-sm"
          >
            {saving ? 'Creating...' : 'Create Agent'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ChannelIcon({ channel }: { channel: string }) {
  switch (channel) {
    case 'telegram':
      return <span>✈️</span>
    case 'discord':
      return <span>💬</span>
    case 'whatsapp':
      return <span>📱</span>
    case 'signal':
      return <span>🔒</span>
    default:
      return <span>📡</span>
  }
}
