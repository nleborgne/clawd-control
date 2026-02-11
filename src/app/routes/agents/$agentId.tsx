import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/agents/$agentId')({
  component: AgentSettingsPage,
})

const MD_FILES = [
  { key: 'IDENTITY.md', label: 'Identity', icon: '🪪' },
  { key: 'SOUL.md', label: 'Soul', icon: '✨' },
  { key: 'AGENTS.md', label: 'Agents', icon: '📋' },
  { key: 'USER.md', label: 'User', icon: '👤' },
  { key: 'TOOLS.md', label: 'Tools', icon: '🔧' },
  { key: 'HEARTBEAT.md', label: 'Heartbeat', icon: '💓' },
] as const

interface AgentData {
  id: string
  name: string
  model: string
  files: Record<string, string>
  workspace: string
}

function AgentSettingsPage() {
  const { agentId } = Route.useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('IDENTITY.md')

  const [name, setName] = useState('')
  const [model, setModel] = useState('')
  const [files, setFiles] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch(`/api/agent/${agentId}`)
      .then(res => {
        if (!res.ok) throw new Error('Agent not found')
        return res.json()
      })
      .then((data: AgentData) => {
        setName(data.name)
        setModel(data.model)
        setFiles(data.files)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [agentId])

  const updateFile = (key: string, value: string) => {
    setFiles(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      const res = await fetch(`/api/agent/${agentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, model, files }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-6 sm:p-8">
        <div className="max-w-4xl mx-auto animate-pulse text-zinc-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-6 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={() => navigate({ to: '/' })}
            className="text-zinc-400 hover:text-zinc-100 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Agent Settings</h1>
            <p className="text-zinc-500 font-mono text-xs sm:text-sm">{agentId}</p>
          </div>
        </div>

        {/* Config fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5 sm:mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 sm:px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-zinc-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5 sm:mb-2">Model</label>
            <input
              type="text"
              value={model}
              onChange={e => setModel(e.target.value)}
              placeholder="anthropic/claude-opus-4-6"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 sm:px-4 py-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors font-mono text-sm"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-zinc-800 mb-4 sm:mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-0.5 sm:gap-1 -mb-px overflow-x-auto scrollbar-none">
            {MD_FILES.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <span className="mr-1 sm:mr-1.5">{icon}</span>
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.slice(0, 4)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active file editor */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-zinc-500">{activeTab}</span>
            {!files[activeTab] && (
              <span className="text-[10px] sm:text-xs text-zinc-600 italic">Will be created on save</span>
            )}
          </div>
          <textarea
            value={files[activeTab] || ''}
            onChange={e => updateFile(activeTab, e.target.value)}
            rows={14}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-zinc-100 focus:outline-none focus:border-zinc-500 transition-colors font-mono text-xs sm:text-sm leading-relaxed resize-y"
            placeholder={`# ${activeTab}\n\nWrite your content here...`}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 sm:gap-4 pb-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 sm:px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:text-blue-400 text-white font-medium rounded-lg transition-colors text-sm"
          >
            {saving ? 'Saving...' : 'Save all'}
          </button>

          {saved && (
            <span className="text-emerald-400 text-sm flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved
            </span>
          )}

          {error && <span className="text-red-400 text-sm">{error}</span>}
        </div>
      </div>
    </div>
  )
}
