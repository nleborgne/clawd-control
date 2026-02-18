import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { ok } from "@/lib/api";

const execFileAsync = promisify(execFile);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getGitValue(repoPath: string, args: string[]) {
  try {
    const { stdout } = await execFileAsync("git", args, { cwd: repoPath });
    return stdout.trim();
  } catch {
    return "";
  }
}

export async function GET() {
  const root = process.env.OPENCLAW_PROJECTS_ROOT ?? path.join(os.homedir(), "Desktop", "Projects");
  let repos: Array<{ name: string; path: string }> = [];
  try {
    const entries = await fs.readdir(root, { withFileTypes: true });
    repos = entries.filter((entry) => entry.isDirectory()).map((entry) => ({ name: entry.name, path: path.join(root, entry.name) }));
  } catch {
    repos = [];
  }

  const detailed = await Promise.all(
    repos.map(async (repo) => {
      const gitPath = path.join(repo.path, ".git");
      const exists = await fs
        .stat(gitPath)
        .then(() => true)
        .catch(() => false);
      if (!exists) {
        return null;
      }

      const branch = await getGitValue(repo.path, ["rev-parse", "--abbrev-ref", "HEAD"]);
      const lastCommit = await getGitValue(repo.path, ["log", "-1", "--pretty=format:%h %s"]);
      const dirty = await getGitValue(repo.path, ["status", "--porcelain"]);

      return {
        name: repo.name,
        branch: branch || "unknown",
        lastCommit: lastCommit || "No commits",
        dirtyFiles: dirty ? dirty.split("\n").filter(Boolean).length : 0,
        languages: ["TypeScript"],
      };
    }),
  );

  return ok({ repos: detailed.filter((value): value is NonNullable<typeof value> => value !== null) });
}
