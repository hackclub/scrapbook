import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";
import type { ErrorLogEntry } from "../types.js";

export class JsonlErrorLogger {
  constructor(private readonly file: string) {}

  async write(entry: Omit<ErrorLogEntry, "createdAt">): Promise<void> {
    await mkdir(path.dirname(path.resolve(this.file)), { recursive: true });
    const record: ErrorLogEntry = {
      ...entry,
      createdAt: new Date().toISOString()
    };
    await appendFile(this.file, `${JSON.stringify(record)}\n`, "utf8");
  }
}
