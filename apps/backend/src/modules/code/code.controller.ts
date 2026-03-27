import { Response } from 'express';
import vm from 'node:vm';
import { AuthRequest } from '../../middlewares/auth.js';
import { Question, Session, TestCase } from '../../database/index.js';

const EXECUTION_TIMEOUT_MS = 2000;
const MAX_LOG_LINES = 100;

function stringifyLogValue(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function parseStructuredValue(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function extractFunctionName(code: string) {
  const patterns = [
    /function\s+([A-Za-z_$][\w$]*)\s*\(/,
    /const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(/,
    /let\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(/,
    /var\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(/,
    /const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?[A-Za-z_$][\w$]*\s*=>/,
    /let\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?[A-Za-z_$][\w$]*\s*=>/,
    /var\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?[A-Za-z_$][\w$]*\s*=>/,
  ];

  for (const pattern of patterns) {
    const match = code.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

function serializeComparableValue(value: unknown) {
  if (typeof value === 'undefined') {
    return 'undefined';
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export async function runJavaScript(req: AuthRequest, res: Response) {
  const { code, sessionCode } = req.body as { code?: unknown; sessionCode?: unknown };

  if (typeof code !== 'string' || code.trim().length === 0) {
    return res.status(400).json({ message: 'JavaScript code is required.' });
  }

  if (typeof sessionCode !== 'string' || sessionCode.trim().length === 0) {
    return res.status(400).json({ message: 'Session code is required to run tests.' });
  }

  const output: string[] = [];

  const appendOutput = (...values: unknown[]) => {
    if (output.length >= MAX_LOG_LINES) {
      return;
    }

    output.push(values.map((value) => stringifyLogValue(value)).join(' '));
  };

  try {
    const session = await (Session as any).findOne({
      where: { sessionCode },
      include: [
        {
          model: Question,
          as: 'question',
          include: [
            {
              model: TestCase,
              as: 'testCases',
              attributes: ['id', 'input', 'expectedOutput'],
              required: false,
            },
          ],
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

    if (!session.question) {
      return res.status(400).json({ message: 'This session is not linked to a question.' });
    }

    const testCases = session.question.testCases ?? [];

    if (testCases.length === 0) {
      return res.status(400).json({ message: 'No test cases are configured for this question.' });
    }

    const functionName = extractFunctionName(code);

    if (!functionName) {
      return res.status(400).json({
        message:
          'Unable to find a callable JavaScript function. Define a named function like `function twoSum(...) {}`.',
      });
    }

    const context = vm.createContext({
      console: {
        log: (...values: unknown[]) => appendOutput(...values),
        error: (...values: unknown[]) => appendOutput(...values),
        warn: (...values: unknown[]) => appendOutput(...values),
        info: (...values: unknown[]) => appendOutput(...values),
      },
      globalThis: {},
    });

    const bootstrap = new vm.Script(
      `${code}\n;globalThis.__submittedFn = typeof ${functionName} !== 'undefined' ? ${functionName} : undefined;`,
    );

    bootstrap.runInContext(context, {
      timeout: EXECUTION_TIMEOUT_MS,
    });

    const submittedFn = (context as any).globalThis.__submittedFn;

    if (typeof submittedFn !== 'function') {
      return res.status(400).json({
        message: `Function "${functionName}" was not available after execution.`,
      });
    }

    let passedCount = 0;

    for (const [index, testCase] of testCases.entries()) {
      const parsedInput = parseStructuredValue(testCase.input);
      const expectedOutput = parseStructuredValue(testCase.expectedOutput);

      const args = Array.isArray(parsedInput)
        ? parsedInput
        : parsedInput !== null && typeof parsedInput === 'object'
          ? Object.values(parsedInput as Record<string, unknown>)
          : [parsedInput];

      let actualOutput: unknown;

      try {
        actualOutput = submittedFn(...args);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown execution error';
        appendOutput(`Test ${index + 1}: FAIL`);
        appendOutput(`  Error: ${message}`);
        continue;
      }

      if (actualOutput instanceof Promise) {
        return res.status(400).json({
          output,
          error: 'Async solutions are not supported by the current runner.',
        });
      }

      const passed =
        serializeComparableValue(actualOutput) === serializeComparableValue(expectedOutput);

      if (passed) {
        passedCount += 1;
        appendOutput(`Test ${index + 1}: PASS`);
      } else {
        appendOutput(`Test ${index + 1}: FAIL`);
        appendOutput(`  Expected: ${serializeComparableValue(expectedOutput)}`);
        appendOutput(`  Received: ${serializeComparableValue(actualOutput)}`);
      }
    }

    output.unshift(`Passed ${passedCount}/${testCases.length} test cases`);

    return res.json({
      output,
      didTimeout: false,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Code execution failed.';

    return res.status(400).json({
      output,
      didTimeout: false,
      error: message,
    });
  }
}
