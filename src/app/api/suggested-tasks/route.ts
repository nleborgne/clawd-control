import { ok, fail } from "@/lib/api";
import { readSuggestedTasks, writeSuggestedTasks } from "@/lib/fs-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await readSuggestedTasks();
    return ok(payload);
  } catch {
    return fail("Failed to load suggested tasks");
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { taskId?: string; status?: "approved" | "rejected" | "pending" };
    if (!body.taskId || !body.status) {
      return fail("taskId and status are required", 400);
    }

    const payload = await readSuggestedTasks();
    const nextStatus = body.status;
    const tasks = payload.tasks.map((task) => (task.id === body.taskId ? { ...task, status: nextStatus } : task));

    await writeSuggestedTasks({ tasks });
    return ok({ tasks });
  } catch {
    return fail("Failed to update suggested task");
  }
}
