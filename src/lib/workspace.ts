import os from "node:os";
import path from "node:path";

export function resolveWorkspaceRoot() {
  const raw = process.env.OPENCLAW_WORKSPACE_ROOT;
  if (raw && raw.trim().length > 0) {
    return raw.replace(/^~(?=$|\/)/, os.homedir());
  }
  return path.join(os.homedir(), ".openclaw", "workspace");
}

export function safeJoinWorkspace(relativePath: string) {
  const root = resolveWorkspaceRoot();
  const normalized = path.normalize(relativePath).replace(/^([.]{2}[\\/])+/, "");
  const fullPath = path.join(root, normalized);

  const rootWithSep = root.endsWith(path.sep) ? root : `${root}${path.sep}`;
  if (fullPath !== root && !fullPath.startsWith(rootWithSep)) {
    throw new Error("Forbidden path");
  }

  return fullPath;
}
