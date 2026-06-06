import { Router, type Router as ExpressRouter } from "express";

export function createPlaceholderRouter(resource: string): ExpressRouter {
  const router = Router();

  router.all("/", (_req, res) => {
    res.status(501).json({
      success: false,
      error: `${resource} routes are not implemented yet`,
    });
  });

  return router;
}
