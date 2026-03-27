import { Response } from 'express';
import { Op } from 'sequelize';
import { Question, Session, User } from '../../database/index.js';
import { AuthRequest } from '../../middlewares/auth.js';

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
  const { candidateEmail, position, date, time, notes, questionId } = req.body;

  if (!position || !date || !time || !questionId) {
    return res.status(400).json({ message: 'Position, date, time, and question are required.' });
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
      if (interviewee) intervieweeId = interviewee.id;
    }

    const scheduledAt = new Date(`${date}T${time}`);

    let sessionCode = generateSessionCode();
    // Ensure uniqueness
    let existing = await (Session as any).findOne({ where: { sessionCode } });
    while (existing) {
      sessionCode = generateSessionCode();
      existing = await (Session as any).findOne({ where: { sessionCode } });
    }

    const session = await (Session as any).create({
      sessionCode,
      title: position,
      status: 'scheduled',
      questionId,
      scheduledAt,
      interviewerId: req.user!.userId,
      intervieweeId,
      organizationId: interviewer.organizationId ?? null,
      currentCode: notes ?? null,
    });

    return res.status(201).json(session);
  } catch (err) {
    console.error('createSession error:', err);
    return res.status(500).json({ message: 'Failed to create session.' });
  }
}

// GET /api/sessions
// Returns sessions where the logged-in user is the interviewer
export async function getMySessions(req: AuthRequest, res: Response) {
  try {
    const sessions = await (Session as any).findAll({
      where: { interviewerId: req.user!.userId },
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

// GET /api/activity
// Returns recent sessions for the logged-in user as activity items
export async function getMyActivity(req: AuthRequest, res: Response) {
  try {
    const sessions = await (Session as any).findAll({
      where: {
        [Op.or]: [
          { interviewerId: req.user!.userId },
          { intervieweeId: req.user!.userId },
        ],
      },
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
