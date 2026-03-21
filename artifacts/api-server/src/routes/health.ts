import { createRequire } from "node:module";
import { Router, type IRouter, type Request, type Response } from "express";

// Use `require` to avoid TypeScript "cannot resolve workspace package types" issues on CI providers.
// Runtime still requires the package to exist (which pnpm workspace should provide).
const require = createRequire(import.meta.url);
const { HealthCheckResponse } = require("@workspace/api-zod") as {
  HealthCheckResponse: { parse: (input: unknown) => unknown };
};

const router: IRouter = Router();

router.get("/healthz", (_req: Request, res: Response) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

export default router;
