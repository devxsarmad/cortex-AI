import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { env } from "../../config/env.js";

export class JsonFileStore<T> {
  private readonly filePath: string;

  constructor(filename: string) {
    this.filePath = resolve(process.cwd(), env.cortexDataDir, filename);
  }

  readMany(): T[] {
    if (!existsSync(this.filePath)) {
      return [];
    }

    const content = readFileSync(this.filePath, "utf8").trim();
    if (!content) {
      return [];
    }

    return JSON.parse(content) as T[];
  }

  writeMany(items: T[]) {
    mkdirSync(dirname(this.filePath), { recursive: true });
    const temporaryPath = `${this.filePath}.tmp`;
    writeFileSync(temporaryPath, `${JSON.stringify(items, null, 2)}\n`, "utf8");
    renameSync(temporaryPath, this.filePath);
  }
}
