// MARK: Adapter Exports
export type { FrameworkAdapter, HierarchyTarget } from "./types";
export { expressAdapter } from "./express";
export { fastifyAdapter } from "./fastify";
export { nestjsAdapter } from "./nestjs";
export { nextjsAdapter } from "./nextjs";
export { workerAdapter } from "./worker";
export { fastapiAdapter } from "./fastapi";
export { flaskAdapter } from "./flask";
export { djangoAdapter } from "./django";
export { ginAdapter } from "./gin";
export { echoAdapter } from "./echo";
export { chiAdapter } from "./chi";
export { nethttpAdapter } from "./nethttp";
export { pythonAdapter } from "./python";
export { goAdapter } from "./go";
export { rustAdapter } from "./rust";
export { cAdapter } from "./c";
export { javaAdapter } from "./java";
export { csharpAdapter } from "./csharp";
export { phpAdapter } from "./php";
export { swiftAdapter } from "./swift";
export { dartAdapter } from "./dart";

import { cAdapter } from "./c";
import { chiAdapter } from "./chi";
import { csharpAdapter } from "./csharp";
import { dartAdapter } from "./dart";
import { djangoAdapter } from "./django";
import { echoAdapter } from "./echo";
import { expressAdapter } from "./express";
import { fastapiAdapter } from "./fastapi";
import { fastifyAdapter } from "./fastify";
import { flaskAdapter } from "./flask";
import { ginAdapter } from "./gin";
import { goAdapter } from "./go";
import { javaAdapter } from "./java";
import { nestjsAdapter } from "./nestjs";
import { nextjsAdapter } from "./nextjs";
import { nethttpAdapter } from "./nethttp";
import { phpAdapter } from "./php";
import { pythonAdapter } from "./python";
import { rustAdapter } from "./rust";
import { swiftAdapter } from "./swift";
import type { FrameworkAdapter } from "./types";
import { workerAdapter } from "./worker";

export const ALL_ADAPTERS: readonly FrameworkAdapter[] = [
  expressAdapter,
  fastifyAdapter,
  nestjsAdapter,
  nextjsAdapter,
  workerAdapter,
  fastapiAdapter,
  flaskAdapter,
  djangoAdapter,
  ginAdapter,
  echoAdapter,
  chiAdapter,
  nethttpAdapter,
  pythonAdapter,
  goAdapter,
  rustAdapter,
  cAdapter,
  javaAdapter,
  csharpAdapter,
  phpAdapter,
  swiftAdapter,
  dartAdapter,
] as const;
