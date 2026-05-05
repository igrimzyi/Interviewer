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

// POST /api/sessions/:sessionCode/submit
export async function submitSessionCode(req: AuthRequest, res: Response) {
  const { submittedCode } = req.body;

  if(typeof submittedCode !== 'string' || submittedCode.trim() === '') {
    return res.status(400).json({ message: 'Submitted code is required.' });
  }

  try {
    const session = await (Session as any).findOne({
      where: { sessionCode: req.params.sessionCode },
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    const canAccess =
      session.interviewerId === req.user!.userId || session.intervieweeId === req.user!.userId;

    if (!canAccess) {
      return res.status(403).json({ message: 'You do not have access to this session.' });
    }

    if (session.submittedCode !== null) {
      return res.status(400).json({ message: 'Code has already been submitted.' });
    }

    session.submittedCode = submittedCode;
    session.currentCode = submittedCode;
    session.status = 'completed';
    await session.save();

    return res.json({
      message: 'Code submitted successfully.',
      submittedCode: session.submittedCode,
    });
  } catch (err) {
    console.error('submitSessionCode error:', err);
    return res.status(500).json({ message: 'Failed to submit code.' });
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

// GET /api/analytics
// Returns interview analytics for the logged-in interviewer
export async function getAnalytics(req: AuthRequest, res: Response) {
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
      order: [['scheduledAt', 'DESC']],
    });

    const completed = sessions.filter((s: any) => s.status === 'completed');
    const active = sessions.filter((s: any) => s.status === 'active');
    const scheduled = sessions.filter((s: any) => s.status === 'scheduled');
    const cancelled = sessions.filter((s: any) => s.status === 'cancelled');

    const durationsMinutes = completed
      .filter((s: any) => s.startedAt && s.endedAt)
      .map((s: any) => (new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / 60000);

    const avgDurationMinutes =
      durationsMinutes.length > 0
        ? Math.round(durationsMinutes.reduce((a: number, b: number) => a + b, 0) / durationsMinutes.length)
        : null;

    const byDifficulty: Record<string, { total: number; completed: number }> = {
      easy: { total: 0, completed: 0 },
      medium: { total: 0, completed: 0 },
      hard: { total: 0, completed: 0 },
    };

    const questionMap = new Map<string, {
      questionId: string;
      title: string;
      difficulty: string;
      category: string;
      sessionCount: number;
      completedCount: number;
      durations: number[];
    }>();

    for (const s of sessions) {
      const diff = s.question?.difficulty;
      if (diff && byDifficulty[diff]) {
        byDifficulty[diff].total++;
        if (s.status === 'completed') byDifficulty[diff].completed++;
      }

      if (s.question) {
        const qid = s.question.id;
        if (!questionMap.has(qid)) {
          questionMap.set(qid, {
            questionId: qid,
            title: s.question.title,
            difficulty: s.question.difficulty,
            category: s.question.category,
            sessionCount: 0,
            completedCount: 0,
            durations: [],
          });
        }
        const entry = questionMap.get(qid)!;
        entry.sessionCount++;
        if (s.status === 'completed') {
          entry.completedCount++;
          if (s.startedAt && s.endedAt) {
            entry.durations.push((new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / 60000);
          }
        }
      }
    }

    const byQuestion = Array.from(questionMap.values()).map((q) => ({
      questionId: q.questionId,
      title: q.title,
      difficulty: q.difficulty,
      category: q.category,
      sessionCount: q.sessionCount,
      completedCount: q.completedCount,
      avgDurationMinutes:
        q.durations.length > 0
          ? Math.round(q.durations.reduce((a, b) => a + b, 0) / q.durations.length)
          : null,
    }));

    const completedSessions = completed.map((s: any) => ({
      id: s.id,
      sessionCode: s.sessionCode,
      title: s.title,
      scheduledAt: s.scheduledAt,
      startedAt: s.startedAt,
      endedAt: s.endedAt,
      durationMinutes:
        s.startedAt && s.endedAt
          ? Math.round((new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / 60000)
          : null,
      selectedLanguage: s.selectedLanguage,
      submittedCode: s.submittedCode ?? null,
      question: s.question
        ? { id: s.question.id, title: s.question.title, difficulty: s.question.difficulty, category: s.question.category }
        : null,
      interviewee: s.interviewee
        ? { firstName: s.interviewee.firstName, lastName: s.interviewee.lastName, email: s.interviewee.email }
        : null,
    }));

    return res.json({
      overview: {
        total: sessions.length,
        completed: completed.length,
        active: active.length,
        scheduled: scheduled.length,
        cancelled: cancelled.length,
        completionRate:
          sessions.length > 0 ? Math.round((completed.length / sessions.length) * 100) : 0,
        avgDurationMinutes,
      },
      byDifficulty,
      byQuestion,
      completedSessions,
    });
  } catch (err) {
    console.error('getAnalytics error:', err);
    return res.status(500).json({ message: 'Failed to fetch analytics.' });
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
