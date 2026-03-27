import { Response } from 'express';
import { Question, TestCase, User } from '../../database/index.js';
import { AuthRequest } from '../../middlewares/auth.js';

export async function createQuestion(req: AuthRequest, res: Response) {
  const {
    title,
    difficulty,
    category,
    description,
    constraints,
    timeLimit,
    examples,
    starterCode,
  } = req.body as {
    title?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    category?: string;
    description?: string;
    constraints?: string;
    timeLimit?: number;
    examples?: Array<{ input: string; output: string; explanation?: string }>;
    starterCode?: Array<{ language: string; code: string }>;
  };

  if (!title?.trim() || !difficulty || !category?.trim() || !description?.trim()) {
    return res.status(400).json({ message: 'Title, difficulty, category, and description are required.' });
  }

  try {
    const user = await (User as any).findByPk(req.user!.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const question = await (Question as any).create({
      title: title.trim(),
      difficulty,
      category: category.trim(),
      description: description.trim(),
      constraints: constraints?.trim() || null,
      suggestedTimeLimitMinutes: Number.isFinite(timeLimit) ? timeLimit : 60,
      examples: Array.isArray(examples) ? examples.filter((example) => example.input && example.output) : [],
      starterCode: Array.isArray(starterCode) ? starterCode : [],
      createdById: req.user!.userId,
      organizationId: user.organizationId ?? null,
    });

    const filteredExamples = Array.isArray(examples)
      ? examples.filter((example) => example.input?.trim() && example.output?.trim())
      : [];

    if (filteredExamples.length > 0) {
      await Promise.all(
        filteredExamples.map((example) =>
          (TestCase as any).create({
            questionId: question.id,
            input: example.input,
            expectedOutput: example.output,
          }),
        ),
      );
    }

    return res.status(201).json(question);
  } catch (err) {
    console.error('createQuestion error:', err);
    return res.status(500).json({ message: 'Failed to create question.' });
  }
}

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
