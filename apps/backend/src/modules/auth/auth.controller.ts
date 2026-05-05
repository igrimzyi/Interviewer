import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Transaction, UniqueConstraintError } from 'sequelize';
import { sequelize, User, Role, Organization } from '../../database/index.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me';
const JWT_EXPIRES_IN = '7d';

export async function register(req: Request, res: Response) {
  const { accountType, profile, organization } = req.body;

  if (!accountType || !profile) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  const { firstName, lastName, email, password } = profile;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'All profile fields are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  if (accountType === 'interviewer' && !organization) {
    return res.status(400).json({ message: 'Organization details are required for interviewers.' });
  }

  try {
    const existing = await (User as any).findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const payload = await sequelize.transaction(async (transaction) => {
      const [role] = await (Role as any).findOrCreate({
        where: { role: accountType },
        transaction,
      });

      let organizationId: string | null = null;

      if (accountType === 'interviewer') {
        const nameNorm = String(organization.name).trim().toLowerCase();
        if (!nameNorm) {
          const err: any = new Error('Organization name is required.');
          err.status = 400;
          throw err;
        }

        let org = await (Organization as any).findOne({
          where: { nameNormalized: nameNorm },
          transaction,
          lock: Transaction.LOCK.UPDATE,
        });

        if (!org) {
          org = await (Organization as any).create(
            {
              name: String(organization.name).trim(),
              size: organization.size ?? null,
              industry: organization.industry ?? null,
            },
            { transaction }
          );
        }

        const interviewerCount = await (User as any).count({
          where: { organizationId: org.id, roleId: role.id },
          transaction,
        });

        if (interviewerCount > 0) {
          const err: any = new Error(
            'An interviewer has already registered for this organization.'
          );
          err.status = 409;
          throw err;
        }

        organizationId = org.id;
      }

      const user = await (User as any).create(
        {
          firstName,
          lastName,
          email,
          passwordHash,
          roleId: role.id,
          organizationId,
        },
        { transaction }
      );

      return { user, organizationId };
    });

    const token = jwt.sign(
      { userId: payload.user.id, email: payload.user.email, roleId: payload.user.roleId },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      token,
      user: {
        id: payload.user.id,
        firstName: payload.user.firstName,
        lastName: payload.user.lastName,
        email: payload.user.email,
        role: accountType,
        organizationId: payload.organizationId,
      },
    });
  } catch (err: any) {
    if (err?.status === 409 || err?.status === 400) {
      return res.status(err.status).json({ message: err.message });
    }
    if (err instanceof UniqueConstraintError) {
      return res.status(409).json({
        message: 'An interviewer has already registered for this organization.',
      });
    }
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await (User as any).findOne({
      where: { email },
      include: [{ association: 'role' }],
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, roleId: user.roleId },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role?.role ?? null,
        organizationId: user.organizationId ?? null,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Login failed. Please try again.' });
  }
}
