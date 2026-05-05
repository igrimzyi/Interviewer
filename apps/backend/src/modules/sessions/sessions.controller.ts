import { Response } from 'express';
import { Op } from 'sequelize';
import { Question, Session, User } from '../../database/index.js';
import { AuthRequest } from '../../middlewares/auth.js';
import { hashPassword, comparePassword } from '../../lib/password.js';

function generateSessionCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// POST /api/sessions
export async function createSession(req: AuthRequest, res: Response) {
  const { candidateEmail, position, date, time, notes, questionId, password } = req.body;

  if (!position || !date || !time || !questionId || !password) {
    return res.status(400).json({
      message: 'Position, date, time, question, and session password are required.',
    });
  }

  if (typeof password !== 'string' || password.trim().length < 8) {
    return res.status(400).json({
      message: 'Session password must be at least 8 characters.',
    });
  }

  try {
    const interviewer = await (User as any).findByPk(req.user!.userId);
    if (!interviewer) {
      return res.status(404).json({ message: 'Interviewer not found.' });
    }

    const question = await (Question as any).findOne({
      where: {
        id: questionId,
        createdById: req.user!.userId,
      },
    });

    if (!question) {
      return res.status(404).json({ message: 'Selected question was not found.' });
    }

    let intervieweeId: string | null = null;
    if (candidateEmail) {
      const interviewee = await (User as any).findOne({ where: { email: candidateEmail } });
      if (interviewee) {
        intervieweeId = interviewee.id;
      }
    }

    const scheduledAt = new Date(`${date}T${time}`);

    let sessionCode = generateSessionCode();
    let existing = await (Session as any).findOne({ where: { sessionCode } });

    while (existing) {
      sessionCode = generateSessionCode();
      existing = await (Session as any).findOne({ where: { sessionCode } });
    }

    const passwordHash = await hashPassword(password.trim());

    const session = await (Session as any).create({
      sessionCode,
      title: position,
      passwordHash,
      status: 'scheduled',
      questionId,
      scheduledAt,
      interviewerId: req.user!.userId,
      intervieweeId,
      organizationId: interviewer.organizationId ?? null,
      currentCode: notes ?? null,
    });

    return res.status(201).json({
      id: session.id,
      sessionCode: session.sessionCode,
      title: session.title,
      status: session.status,
      scheduledAt: session.scheduledAt,
    });
  } catch (err) {
    console.error('createSession error:', err);
    return res.status(500).json({ message: 'Failed to create session.' });
  }
}

// GET /api/sessions
export async function getMySessions(req: AuthRequest, res: Response) {
  try {
    const sessions = await (Session as any).findAll({
      where: { interviewerId: req.user!.userId },
      attributes: { exclude: ['passwordHash'] },
      include: [
        {
          model: Question,
          as: 'question',
          attributes: ['id', 'title', 'difficulty', 'category'],
          required: false,
        },
        {
          model: User,
          as: 'interviewee',
          attributes: ['firstName', 'lastName', 'email'],
          required: false,
        },
      ],
      order: [['scheduledAt', 'ASC']],
    });

    return res.json(sessions);
  } catch (err) {
    console.error('getMySessions error:', err);
    return res.status(500).json({ message: 'Failed to fetch sessions.' });
  }
}

// GET /api/sessions/:sessionCode
export async function getSessionByCode(req: AuthRequest, res: Response) {
  try {
    const session = await (Session as any).findOne({
      where: { sessionCode: req.params.sessionCode },
      attributes: { exclude: ['passwordHash'] },
      include: [
        {
          model: Question,
          as: 'question',
          attributes: [
            'id',
            'title',
            'difficulty',
            'category',
            'description',
            'constraints',
            'examples',
            'starterCode',
            'suggestedTimeLimitMinutes',
          ],
          required: false,
        },
        {
          model: User,
          as: 'interviewee',
          attributes: ['firstName', 'lastName', 'email'],
          required: false,
        },
        {
          model: User,
          as: 'interviewer',
          attributes: ['firstName', 'lastName', 'email'],
          required: false,
        },
      ],
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    const canAccess =
      session.interviewerId === req.user!.userId || session.intervieweeId === req.user!.userId;

    if (!canAccess) {
      return res.status(403).json({ message: 'You do not have access to this session.' });
    }

    return res.json(session);
  } catch (err) {
    console.error('getSessionByCode error:', err);
    return res.status(500).json({ message: 'Failed to fetch session.' });
  }
}

// GET /api/sessions/join/:identifier
export async function getJoinSessionPreview(req: AuthRequest, res: Response) {
  try {
    const identifier = req.params.identifier;
    const session = await (Session as any).findOne({
      where: {
        [Op.or]: [{ id: identifier }, { sessionCode: identifier }],
      },
      include: [
        {
          model: Question,
          as: 'question',
          attributes: ['id', 'title', 'difficulty', 'suggestedTimeLimitMinutes'],
          required: false,
        },
        {
          model: User,
          as: 'interviewer',
          attributes: ['firstName', 'lastName', 'email'],
          required: false,
        },
        {
          association: 'organization',
          attributes: ['id', 'name'],
          required: false,
        },
      ],
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    return res.json({
      id: session.id,
      sessionCode: session.sessionCode,
      title: session.title,
      status: session.status,
      scheduledAt: session.scheduledAt,
      requiresPassword: true,
      interviewer: session.interviewer
        ? {
            firstName: session.interviewer.firstName,
            lastName: session.interviewer.lastName,
            email: session.interviewer.email,
          }
        : null,
      organization: session.organization
        ? {
            id: session.organization.id,
            name: session.organization.name,
          }
        : null,
      question: session.question
        ? {
            id: session.question.id,
            title: session.question.title,
            difficulty: session.question.difficulty,
            suggestedTimeLimitMinutes: session.question.suggestedTimeLimitMinutes,
          }
        : null,
    });
  } catch (err) {
    console.error('getJoinSessionPreview error:', err);
    return res.status(500).json({ message: 'Failed to fetch session preview.' });
  }
}

// POST /api/sessions/join/:identifier
export async function validateSessionPassword(req: AuthRequest, res: Response) {
  const { password } = req.body;

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ message: 'Session password is required.' });
  }

  try {
    const identifier = req.params.identifier;

    const session = await (Session as any).findOne({
      where: {
        [Op.or]: [{ id: identifier }, { sessionCode: identifier }],
      },
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    const valid = await comparePassword(password, session.passwordHash);

    if (!valid) {
      return res.status(401).json({ message: 'Invalid session password.' });
    }

    return res.status(200).json({
      message: 'Session password verified.',
      sessionCode: session.sessionCode,
    });
  } catch (err) {
    console.error('validateSessionPassword error:', err);
    return res.status(500).json({ message: 'Failed to validate session password.' });
  }
}

// GET /api/activity
export async function getMyActivity(req: AuthRequest, res: Response) {
  try {
    const sessions = await (Session as any).findAll({
      where: {
        [Op.or]: [
          { interviewerId: req.user!.userId },
          { intervieweeId: req.user!.userId },
        ],
      },
      attributes: { exclude: ['passwordHash'] },
      include: [
        {
          model: User,
          as: 'interviewee',
          attributes: ['firstName', 'lastName'],
          required: false,
        },
        {
          model: User,
          as: 'interviewer',
          attributes: ['firstName', 'lastName'],
          required: false,
        },
      ],
      order: [['updatedAt', 'DESC']],
      limit: 10,
    });

    const activity = sessions.map((s: any) => {
      const intervieweeName = s.interviewee
        ? `${s.interviewee.firstName} ${s.interviewee.lastName}`
        : 'a candidate';

      let text: string;
      let type: 'scheduled' | 'completed' | 'user';

      switch (s.status) {
        case 'scheduled':
          text = `Interview with ${intervieweeName} scheduled`;
          type = 'scheduled';
          break;
        case 'active':
          text = `Session with ${intervieweeName} is in progress`;
          type = 'scheduled';
          break;
        case 'completed':
          text = `Session completed with ${intervieweeName}`;
          type = 'completed';
          break;
        case 'cancelled':
          text = `Session with ${intervieweeName} was cancelled`;
          type = 'user';
          break;
        default:
          text = `Session updated: ${s.title}`;
          type = 'user';
      }

      return {
        type,
        text,
        time: s.updatedAt,
        sessionId: s.id,
      };
    });

    return res.json(activity);
  } catch (err) {
    console.error('getMyActivity error:', err);
    return res.status(500).json({ message: 'Failed to fetch activity.' });
  }
}