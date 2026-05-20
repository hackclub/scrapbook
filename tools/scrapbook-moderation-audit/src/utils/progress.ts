type ProgressStats = {
  scanned: number;
  moderated: number;
  skippedTrusted: number;
  flaggedPosts: number;
  errors: number;
};

export class ProgressLogger {
  private lastRenderAt = 0;
  private finished = false;

  constructor(
    private readonly total: number,
    private readonly options: { enabled?: boolean } = {}
  ) {}

  start(message: string): void {
    console.error(message);
  }

  update(stats: ProgressStats, force = false): void {
    if (this.finished) return;
    const now = Date.now();
    if (!force && now - this.lastRenderAt < 250) return;
    this.lastRenderAt = now;

    const line = this.format(stats);
    if (this.options.enabled === false || !process.stderr.isTTY) {
      if (force) console.error(line);
      return;
    }

    process.stderr.write(`\r${line}`);
  }

  info(message: string): void {
    this.breakLine();
    console.error(message);
  }

  finish(stats: ProgressStats): void {
    this.update(stats, true);
    this.breakLine();
    this.finished = true;
  }

  private breakLine(): void {
    if (process.stderr.isTTY && !this.finished) {
      process.stderr.write("\n");
    }
  }

  private format(stats: ProgressStats): string {
    const total = Math.max(this.total, stats.scanned);
    const width = 28;
    const ratio = total > 0 ? Math.min(1, stats.scanned / total) : 1;
    const filled = Math.round(ratio * width);
    const bar = `${"#".repeat(filled)}${"-".repeat(width - filled)}`;
    const percent = total > 0 ? `${Math.round(ratio * 100).toString().padStart(3, " ")}%` : "100%";

    return `[${bar}] ${percent} ${stats.scanned}/${total} scanned | OpenAI ${stats.moderated} | trusted skips ${stats.skippedTrusted} | flagged ${stats.flaggedPosts} | errors ${stats.errors}`;
  }
}
