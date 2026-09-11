// MARK: Adapter Exports
export type { FrameworkAdapter, HierarchyTarget } from "./types";
export { expressAdapter } from "./express";
export { fastifyAdapter } from "./fastify";
export { nestjsAdapter } from "./nestjs";
export { nextjsAdapter } from "./nextjs";
export { workerAdapter } from "./worker";

import { expressAdapter } from "./express";
import { fastifyAdapter } from "./fastify";
import { nestjsAdapter } from "./nestjs";
import { nextjsAdapter } from "./nextjs";
import type { FrameworkAdapter } from "./types";
import { workerAdapter } from "./worker";

export const ALL_ADAPTERS: readonly FrameworkAdapter[] = [
  expressAdapter,
  fastifyAdapter,
  nestjsAdapter,
  nextjsAdapter,
  workerAdapter,
] as const;
