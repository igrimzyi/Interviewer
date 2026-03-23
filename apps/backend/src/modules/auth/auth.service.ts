import bcrypt from "bcryptjs";
import { config } from "../../config";
import { Organization } from "../organization/organization.model";
import { User } from "./user.model";
import type {
  SignUpBody,
  SignUpResponse,
  LoginBody,
  LoginResponse,
} from "./auth.types";

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

      const existingOrganization = await Organization.findOne({
        where: { name: normalizedOrganizationName },
      });

      if (existingOrganization) {
        throw new Error("Organization name already in use");
      }

      const organization = await Organization.create({
        name: normalizedOrganizationName,
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

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      createdAt: user.createdAt.toISOString(),
    };
  }
}