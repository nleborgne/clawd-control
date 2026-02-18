"use client";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { useApi } from "@/hooks/use-api";

type Repo = {
  name: string;
  branch: string;
  lastCommit: string;
  dirtyFiles: number;
  languages: string[];
};

export function CodePipeline() {
  const repos = useApi<{ repos: Repo[] }>("/api/repos");

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {(repos.data?.repos ?? []).map((repo) => (
        <Card key={repo.name} className="space-y-1">
          <CardTitle>{repo.name}</CardTitle>
          <CardDescription>
            {repo.branch} · {repo.dirtyFiles} dirty · {repo.languages.join(", ")}
          </CardDescription>
          <div className="text-[10px] text-zinc-500">{repo.lastCommit}</div>
        </Card>
      ))}
      {!repos.data?.repos?.length ? <Card className="text-[11px] text-zinc-500">No repositories discovered.</Card> : null}
    </div>
  );
}
