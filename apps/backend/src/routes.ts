import { Router } from "express";
import { getHealth } from "./modules/health/health.controller";

const router: Router = Router();

router.get("/health", getHealth);

// TEMP register endpoint
router.post("/api/register", async (req, res) => {
  // For now: just echo back what the frontend sent
  // Later: create user in DB, hash password, etc.
  return res.status(201).json({
    message: "Registered (stub)",
    received: req.body,
  });
});

export default router;
