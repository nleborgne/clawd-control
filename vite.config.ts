import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import fs from 'node:fs'
import path from 'node:path'

function openclawConfigPlugin(): Plugin {
  return {
    name: 'openclaw-config',
    configureServer(server) {
      server.middlewares.use('/api/config', (_req, res) => {
        try {
          const configPath = path.resolve('/root/.openclaw/openclaw.json')
          const raw = fs.readFileSync(configPath, 'utf-8')
          res.setHeader('Content-Type', 'application/json')
          res.end(raw)
        } catch {
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Failed to read config' }))
        }
      })
      // GET /api/agents/:id — single agent details with file contents
      server.middlewares.use('/api/agent/', (req, res, next) => {
        const configPath = '/root/.openclaw/openclaw.json'
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        const url = new URL(req.url!, `http://${req.headers.host}`)
        const segments = url.pathname.split('/').filter(Boolean) // after /api/agent/
        const agentId = segments[0]
        if (!agentId) return next()

        const agentConfig = config.agents?.list?.find((a: any) => a.id === agentId)
        const workspace = agentConfig?.workspace || config.agents?.defaults?.workspace || '/root/.openclaw/workspace'

        const MD_FILES = ['IDENTITY.md', 'SOUL.md', 'AGENTS.md', 'USER.md', 'TOOLS.md', 'HEARTBEAT.md'] as const

        if (req.method === 'GET') {
          const readFile = (name: string) => {
            const p = path.join(workspace, name)
            return fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : ''
          }
          const files: Record<string, string> = {}
          for (const f of MD_FILES) files[f] = readFile(f)
          const result = {
            id: agentId,
            name: agentConfig?.name || agentId,
            model: agentConfig?.model?.primary || config.agents?.defaults?.model?.primary || '',
            files,
            workspace,
          }
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(result))
          return
        }

        if (req.method === 'PUT') {
          let body = ''
          req.on('data', (chunk: Buffer) => { body += chunk.toString() })
          req.on('end', () => {
            try {
              const data = JSON.parse(body)

              // Write MD files
              if (data.files) {
                for (const f of MD_FILES) {
                  if (data.files[f] !== undefined) {
                    fs.writeFileSync(path.join(workspace, f), data.files[f])
                  }
                }
              }
              // Update config for name/model
              if (data.name !== undefined || data.model !== undefined) {
                const freshConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
                const idx = freshConfig.agents?.list?.findIndex((a: any) => a.id === agentId)
                if (idx !== undefined && idx >= 0) {
                  if (data.name !== undefined) freshConfig.agents.list[idx].name = data.name
                  if (data.model !== undefined) {
                    if (!freshConfig.agents.list[idx].model) freshConfig.agents.list[idx].model = {}
                    freshConfig.agents.list[idx].model.primary = data.model
                  }
                  fs.writeFileSync(configPath, JSON.stringify(freshConfig, null, 2))
                }
              }

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true }))
            } catch (err: any) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: err.message }))
            }
          })
          return
        }

        res.statusCode = 405
        res.end(JSON.stringify({ error: 'Method not allowed' }))
      })

      // DELETE /api/agents/delete — delete an agent
      server.middlewares.use('/api/agents/delete', (req, res, next) => {
        if (req.method !== 'POST') return next()
        let body = ''
        req.on('data', (chunk: Buffer) => { body += chunk.toString() })
        req.on('end', () => {
          try {
            const { id } = JSON.parse(body)
            if (!id) { res.statusCode = 400; res.end(JSON.stringify({ error: 'id required' })); return }
            if (id === 'main') { res.statusCode = 400; res.end(JSON.stringify({ error: 'Cannot delete main agent' })); return }

            const configPath = '/root/.openclaw/openclaw.json'
            const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

            // Remove from config
            config.agents.list = (config.agents.list || []).filter((a: any) => a.id !== id)
            config.bindings = (config.bindings || []).filter((b: any) => b.agentId !== id)
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2))

            // Remove workspace and agent dir (best effort)
            const workspace = `/root/.openclaw/workspace-${id}`
            const agentDir = `/root/.openclaw/agents/${id}`
            try { fs.rmSync(workspace, { recursive: true, force: true }) } catch {}
            try { fs.rmSync(agentDir, { recursive: true, force: true }) } catch {}

            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true }))
          } catch (err: any) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: err.message }))
          }
        })
      })

      // POST /api/agents/create — create a new agent
      server.middlewares.use('/api/agents/create', (req, res, next) => {
        if (req.method !== 'POST') return next()
        let body = ''
        req.on('data', (chunk: Buffer) => { body += chunk.toString() })
        req.on('end', () => {
          try {
            const { id, name, model } = JSON.parse(body)
            if (!id || !name) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'id and name are required' }))
              return
            }
            const configPath = '/root/.openclaw/openclaw.json'
            const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

            // Check if agent already exists
            if (config.agents?.list?.some((a: any) => a.id === id)) {
              res.statusCode = 409
              res.end(JSON.stringify({ error: `Agent "${id}" already exists` }))
              return
            }

            // Create workspace
            const workspace = `/root/.openclaw/workspace-${id}`
            fs.mkdirSync(workspace, { recursive: true })

            // Create agent dir
            const agentDir = `/root/.openclaw/agents/${id}/agent`
            fs.mkdirSync(agentDir, { recursive: true })

            // Write initial IDENTITY.md
            fs.writeFileSync(path.join(workspace, 'IDENTITY.md'),
              `# IDENTITY.md - Who Am I?\n\n- **Name:** ${name}\n- **Creature:** Agent\n- **Vibe:** (not yet defined)\n- **Emoji:** 🤖\n`)

            // Write initial SOUL.md
            fs.writeFileSync(path.join(workspace, 'SOUL.md'),
              `# SOUL.md - Who You Are\n\n*Define your personality here.*\n`)

            // Add to config
            const agentEntry: any = { id, name, workspace, agentDir: `/root/.openclaw/agents/${id}/agent` }
            if (model) agentEntry.model = { primary: model }
            if (!config.agents) config.agents = { defaults: {}, list: [] }
            if (!config.agents.list) config.agents.list = []
            config.agents.list.push(agentEntry)
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2))

            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true, id }))
          } catch (err: any) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: err.message }))
          }
        })
      })

      server.middlewares.use('/api/agents', (_req, res) => {
        try {
          const agentsDir = '/root/.openclaw/agents'
          const entries = fs.readdirSync(agentsDir, { withFileTypes: true })
          const agents = entries
            .filter(e => e.isDirectory())
            .map(e => {
              const agentPath = path.join(agentsDir, e.name, 'agent')
              const hasAgent = fs.existsSync(agentPath)
              // Try to read workspace files
              let identity: Record<string, string> | null = null
              const configPath = '/root/.openclaw/openclaw.json'
              const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
              const agentConfig = config.agents?.list?.find((a: any) => a.id === e.name)
              const workspace = agentConfig?.workspace || config.agents?.defaults?.workspace || '/root/.openclaw/workspace'

              // Read IDENTITY.md if exists
              const identityPath = path.join(workspace, 'IDENTITY.md')
              if (fs.existsSync(identityPath)) {
                const content = fs.readFileSync(identityPath, 'utf-8')
                identity = {}
                for (const line of content.split('\n')) {
                  const match = line.match(/^-\s+\*\*(.+?):\*\*\s*(.+)/) || line.match(/^-\s+\*\*(.+?)\*\*:\s*(.+)/)
                  if (match) identity[match[1].toLowerCase()] = match[2].trim()
                }
              }

              // Find bindings
              const bindings = (config.bindings || []).filter((b: any) => b.agentId === e.name)

              return {
                id: e.name,
                name: agentConfig?.name || e.name,
                workspace,
                hasAgent,
                identity,
                bindings,
                model: agentConfig?.model?.primary || config.agents?.defaults?.model?.primary || 'unknown',
              }
            })
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(agents))
        } catch (err) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Failed to list agents' }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    allowedHosts: ['doom.pegasus-diatonic.ts.net'],
  },
  plugins: [
    openclawConfigPlugin(),
    TanStackRouterVite({
      routesDirectory: './src/app/routes',
      generatedRouteTree: './src/app/routeTree.gen.ts',
    }),
    react(),
    tailwindcss(),
  ],
})
