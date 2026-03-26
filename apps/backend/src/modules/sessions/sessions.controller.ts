import { Response } from 'express';
import { Op } from 'sequelize';
import { Session, User } from '../../database/index.js';
import { AuthRequest } from '../../middlewares/auth.js';

// GET /api/sessions
// Returns sessions where the logged-in user is the interviewer
export async function getMySessions(req: AuthRequest, res: Response) {
  try {
    const sessions = await (Session as any).findAll({
      where: { interviewerId: req.user!.userId },
      include: [
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
