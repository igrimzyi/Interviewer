import { Router } from "express";
import { getHealth } from "./modules/health/health.controller";
import { register, login } from "./modules/auth/auth.controller.js";
import { requireAuth, AuthRequest } from "./middlewares/auth.js";
import { getMySessions, getMyActivity, createSession, getSessionByCode } from "./modules/sessions/sessions.controller.js";
import { Response } from "express";
import { runJavaScript } from "./modules/code/code.controller.js";
import { createQuestion, getQuestions } from "./modules/questions/questions.controller.js";

const router: Router = Router();

router.get("/health", getHealth);

router.post("/api/register", register);
router.post("/api/login", login);

router.get("/api/me", requireAuth, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

router.post("/api/sessions", requireAuth, createSession);
router.get("/api/sessions", requireAuth, getMySessions);
router.get("/api/sessions/:sessionCode", requireAuth, getSessionByCode);
router.get("/api/activity", requireAuth, getMyActivity);
router.post("/api/questions", requireAuth, createQuestion);
router.get("/api/questions", requireAuth, getQuestions);
router.post("/api/code/run", requireAuth, runJavaScript);

export default router;
