import { Router } from "express";
import { getHealth } from "./modules/health/health.controller";

const router: Router = Router();

router.get("/health", getHealth);

export default router;
