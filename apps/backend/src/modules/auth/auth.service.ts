import bcrypt from "bcryptjs";
import { decode, sign } from "jsonwebtoken";
import { createPool, type Pool } from "mysql2/promise";
import { config } from "../../config";
import { Organization } from "../organization/organization.model";
import { User } from "./user.model";
import type {
  SignUpBody,
  SignUpResponse,
  LoginBody,
  LoginResponse,
} from "./auth.types";

let sessionsPool: Pool | null = null;

function getSessionsPool(): Pool {
  if (sessionsPool) return sessionsPool;

  // The user request explicitly wants the token stored in the MySQL
  // database named `sessions` (same host/user/password).
  sessionsPool = createPool({
    host: config.db.host,
    port: config.db.port,
    user: config.db.username,
    password: config.db.password,
    database: "sessions",
    connectionLimit: 5,
  });

  return sessionsPool;
}

export class AuthService {
  async signUp(payload: SignUpBody): Promise<SignUpResponse> {
    const normalizedEmail = payload.email.trim().toLowerCase();

    const existingUser = await User.findOne({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new Error("Email already in use");
    }

    let organizationId: number | null = null;
    let organizationName: string | null = null;

    if (payload.role === "interviewer") {
      const normalizedOrganizationName = payload.organizationName?.trim();

      if (!normalizedOrganizationName) {
        throw new Error("Organization name is required for interviewer signup");
      }

      const [organization] = await Organization.findOrCreate({
        where: { name: normalizedOrganizationName },
        defaults: { name: normalizedOrganizationName },
      });

      organizationId = organization.id;
      organizationName = organization.name;
    }

    const passwordHash = await bcrypt.hash(
      payload.password,
      config.auth.saltRounds,
    );

    const user = await User.create({
      name: payload.name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: payload.role,
      organizationId,
      organizationName,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId,
      organizationName,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async login(payload: LoginBody): Promise<LoginResponse> {
    const normalizedEmail = payload.email.trim().toLowerCase();

    const user = await User.findOne({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(
      payload.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    const responseBody = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      organizationName: user.organizationName,
      createdAt: user.createdAt.toISOString(),
    };

    let token: string;
    let expiresAt: Date;
    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error("Missing required env var: JWT_SECRET");
      }

      token = sign(responseBody, jwtSecret, {
        // This ensures the `exp` claim exists so we can store it in MySQL.
        expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
      });

      const decoded = decode(token) as
        | { exp?: number }
        | string
        | null
        | undefined;

      const exp = typeof decoded === "object" ? decoded.exp : undefined;
      expiresAt = exp
        ? new Date(exp * 1000)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("JWT generation failed in login:", error);
      throw error;
    }

    // Persist the token so we can invalidate/track sessions later.
    // Keep login resilient: if session storage fails, still return token.
    try {
      const pool = getSessionsPool();
      await pool.query(
        `
        CREATE TABLE IF NOT EXISTS sessions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          token VARCHAR(1024) NOT NULL UNIQUE,
          userId INT NOT NULL,
          createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          expiresAt DATETIME NOT NULL
        )
      `,
      );
      await pool.query(
        "INSERT INTO sessions (token, userId, expiresAt) VALUES (?, ?, ?)",
        [token, responseBody.id, expiresAt],
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to persist login session token:", error);
    }

    return {
      ...responseBody,
      token,
    };
  }
}