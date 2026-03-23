import { Router } from "express";
import { getHealth } from "./modules/health/health.controller";
import authRouter from "./modules/auth/auth.routes";

const router: Router = Router();

router.get("/health", getHealth);
router.use("/auth", authRouter);

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
