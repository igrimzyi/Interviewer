import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import type { SignUpBody, LoginBody } from "./auth.types";

const authService = new AuthService();

function validateSignUpBody(body: Partial<SignUpBody>): string | null {
  if (!body.name || body.name.trim().length < 2) {
    return "Name must be at least 2 characters long";
  }

  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return "A valid email is required";
  }

  if (!body.password || body.password.length < 8) {
    return "Password must be at least 8 characters long";
  }

  if (!body.role || !["interviewer", "interviewee"].includes(body.role)) {
    return "Role must be either interviewer or interviewee";
  }

  if (
    body.role === "interviewer" &&
    (!body.organizationName || body.organizationName.trim().length < 2)
  ) {
    return "Organization name is required for interviewer signup";
  }

  return null;
}

function validateLoginBody(body: Partial<LoginBody>): string | null {
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return "A valid email is required";
  }

  if (!body.password) {
    return "Password is required";
  }

  return null;
}

export async function signUp(
  req: Request<unknown, unknown, Partial<SignUpBody>>,
  res: Response,
): Promise<Response> {
  const validationError = validateSignUpBody(req.body);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const data = await authService.signUp(req.body as SignUpBody);
    return res.status(201).json(data);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "Email already in use" ||
        error.message === "Organization name already in use")
    ) {
      return res.status(409).json({ message: error.message });
    }

    if (
      error instanceof Error &&
      error.message === "Organization name is required for interviewer signup"
    ) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "Failed to create user" });
  }
}

export async function login(
  req: Request<unknown, unknown, Partial<LoginBody>>,
  res: Response,
): Promise<Response> {
  const validationError = validateLoginBody(req.body);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const data = await authService.login(req.body as LoginBody);
    return res.status(200).json(data);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Invalid email or password"
    ) {
      return res.status(401).json({ message: error.message });
    }

    return res.status(500).json({ message: "Failed to login" });
  }
}