import { Router } from "express";
import { getHealth } from "./modules/health/health.controller";
import { register, login } from "./modules/auth/auth.controller.js";
import { requireAuth, AuthRequest } from "./middlewares/auth.js";
import { getMySessions, getMyActivity } from "./modules/sessions/sessions.controller.js";
import { Response } from "express";

const router: Router = Router();

router.get("/health", getHealth);

router.post("/api/register", register);
router.post("/api/login", login);

router.get("/api/me", requireAuth, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

router.get("/api/sessions", requireAuth, getMySessions);
router.get("/api/activity", requireAuth, getMyActivity);

export default router;
