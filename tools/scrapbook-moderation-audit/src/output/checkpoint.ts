import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Checkpoint } from "../types.js";

export function emptyCheckpoint(): Checkpoint {
  return {
    lastPostTime: null,
    lastUpdateId: null,
    postsScanned: 0,
    postsModerated: 0,
    postsSkippedTrusted: 0,
    errors: 0,
    updatedAt: new Date().toISOString()
  };
}

export async function loadCheckpoint(file: string, resume: boolean): Promise<Checkpoint | null> {
  if (!resume) return null;
  try {
    return JSON.parse(await readFile(file, "utf8")) as Checkpoint;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export async function saveCheckpoint(file: string, checkpoint: Checkpoint): Promise<void> {
  await mkdir(path.dirname(path.resolve(file)), { recursive: true });
  await writeFile(file, `${JSON.stringify(checkpoint, null, 2)}\n`, "utf8");
}

export function checkpointAfterBatch(
  previous: Checkpoint | null,
  lastPostTime: Date,
  lastUpdateId: string,
  counters: Pick<Checkpoint, "postsScanned" | "postsModerated" | "postsSkippedTrusted" | "errors">
): Checkpoint {
  return {
    ...(previous ?? emptyCheckpoint()),
    ...counters,
    lastPostTime: lastPostTime.toISOString(),
    lastUpdateId,
    updatedAt: new Date().toISOString()
  };
}
