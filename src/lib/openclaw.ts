const OPENCLAW_CONFIG_PATH = '/root/.openclaw/openclaw.json';

export interface OpenClawAgent {
  id: string;
  name?: string;
  workspace?: string;
  agentDir?: string;
}

export interface OpenClawConfig {
  agents: {
    defaults: {
      model: { primary: string };
      workspace: string;
    };
    list: OpenClawAgent[];
  };
  bindings: Array<{
    agentId: string;
    match: { channel: string; accountId: string };
  }>;
}

export async function fetchOpenClawConfig(): Promise<OpenClawConfig> {
  // Read config file directly via a simple API endpoint
  const res = await fetch('/api/config');
  if (!res.ok) throw new Error('Failed to fetch config');
  return res.json();
}
