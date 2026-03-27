import { Response } from 'express';
import { Question, TestCase } from '../../database/index.js';
import { AuthRequest } from '../../middlewares/auth.js';

export async function getQuestions(req: AuthRequest, res: Response) {
  try {
    const questions = await (Question as any).findAll({
      where: { createdById: req.user!.userId },
      include: [
        {
          model: TestCase,
          as: 'testCases',
          attributes: ['id'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.json(
      questions.map((question: any) => ({
        id: question.id,
        title: question.title,
        difficulty: question.difficulty,
        category: question.category,
        description: question.description,
        constraints: question.constraints,
        suggestedTimeLimitMinutes: question.suggestedTimeLimitMinutes,
        examples: question.examples ?? [],
        starterCode: question.starterCode ?? [],
        testCaseCount: question.testCases?.length ?? 0,
      })),
    );
  } catch (err) {
    console.error('getQuestions error:', err);
    return res.status(500).json({ message: 'Failed to fetch questions.' });
  }
}
