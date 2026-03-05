import type { Request, Response } from "express";
import { HealthService, type HealthStatus } from "./health.service";

const healthService = new HealthService();

export function getHealth(_req: Request, res: Response): Response<HealthStatus> {
  return res.status(200).json(healthService.getStatus());
}
