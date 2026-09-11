import * as vscode from "vscode";

const CACHE_FILE = ".mewra-pounce-cache.json";

export class EntryPointCache {
  private readonly _context: vscode.ExtensionContext;
  private _memoryCache: Record<string, unknown> = {};

  constructor(context: vscode.ExtensionContext) {
    this._context = context;
  }

  get<T>(key: string): T | undefined {
    return this._memoryCache[key] as T | undefined;
  }

  set<T>(key: string, value: T): void {
    this._memoryCache[key] = value;
  }

  has(key: string): boolean {
    return key in this._memoryCache;
  }

  async clear(): Promise<void> {
    this._memoryCache = {};
    await this._deleteCacheFile();
  }

  private async _deleteCacheFile(): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) return;

    const root = workspaceFolders[0]!.uri;
    const cacheUri = vscode.Uri.joinPath(root, ".vscode", CACHE_FILE);

    try {
      await vscode.workspace.fs.delete(cacheUri);
    } catch {}
  }
}
