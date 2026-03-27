import bcrypt from 'bcryptjs';
import {
  syncDatabase,
  Organization,
  Question,
  Role,
  Session,
  TestCase,
  User,
} from './index.js';

const DEV_PASSWORD = 'Password123!';

const questionFixtures = [
  {
    title: 'Two Sum Problem',
    difficulty: 'easy',
    category: 'Data Structures & Algorithms',
    description:
      'Given an array of integers nums and an integer target, return the indices of the two numbers that add up to the target.',
    constraints:
      '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\nOnly one valid answer exists.',
    suggestedTimeLimitMinutes: 30,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'nums[0] + nums[1] equals the target.',
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
      },
    ],
    starterCode: [
      {
        language: 'javascript',
        code: 'function twoSum(nums, target) {\n  // return the matching indexes\n}\n',
      },
    ],
    testCases: [
      {
        input: JSON.stringify({ nums: [2, 7, 11, 15], target: 9 }),
        expectedOutput: JSON.stringify([0, 1]),
      },
      {
        input: JSON.stringify({ nums: [3, 2, 4], target: 6 }),
        expectedOutput: JSON.stringify([1, 2]),
      },
    ],
  },
  {
    title: 'Merge Overlapping Intervals',
    difficulty: 'medium',
    category: 'Algorithms',
    description:
      'Given an array of intervals where intervals[i] = [start, end], merge all overlapping intervals and return the result.',
    constraints: '1 <= intervals.length <= 10^4\n0 <= start <= end <= 10^4',
    suggestedTimeLimitMinutes: 45,
    examples: [
      {
        input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]',
        output: '[[1,6],[8,10],[15,18]]',
      },
    ],
    starterCode: [
      {
        language: 'javascript',
        code: 'function merge(intervals) {\n  // return merged intervals\n}\n',
      },
    ],
    testCases: [
      {
        input: JSON.stringify({ intervals: [[1, 3], [2, 6], [8, 10], [15, 18]] }),
        expectedOutput: JSON.stringify([[1, 6], [8, 10], [15, 18]]),
      },
      {
        input: JSON.stringify({ intervals: [[1, 4], [4, 5]] }),
        expectedOutput: JSON.stringify([[1, 5]]),
      },
    ],
  },
  {
    title: 'Build an LRU Cache',
    difficulty: 'hard',
    category: 'Systems Design',
    description:
      'Design and implement a data structure for a Least Recently Used (LRU) cache with O(1) get and put operations.',
    constraints:
      '1 <= capacity <= 3000\nAt most 2 * 10^5 calls will be made to get and put.',
    suggestedTimeLimitMinutes: 60,
    examples: [
      {
        input: 'LRUCache cache = new LRUCache(2); cache.put(1,1); cache.put(2,2); cache.get(1);',
        output: '1',
      },
    ],
    starterCode: [
      {
        language: 'javascript',
        code:
          'class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n  }\n\n  get(key) {}\n\n  put(key, value) {}\n}\n',
      },
    ],
    testCases: [
      {
        input: JSON.stringify({
          capacity: 2,
          operations: ['put', 'put', 'get', 'put', 'get', 'put', 'get', 'get', 'get'],
          values: [[1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]],
        }),
        expectedOutput: JSON.stringify([null, null, 1, null, -1, null, -1, 3, 4]),
      },
    ],
  },
];

async function createQuestions(createdById, organizationId) {
  const createdQuestions = [];

  for (const fixture of questionFixtures) {
    const { testCases, ...questionValues } = fixture;
    const question = await Question.create({
      ...questionValues,
      createdById,
      organizationId,
    });

    await TestCase.bulkCreate(
      testCases.map((testCase) => ({
        ...testCase,
        questionId: question.id,
      }))
    );

    createdQuestions.push(question);
  }

  return createdQuestions;
}

async function run() {
  try {
    await syncDatabase({ force: true });

    const [interviewerRole, intervieweeRole] = await Promise.all([
      Role.create({ role: 'interviewer' }),
      Role.create({ role: 'interviewee' }),
    ]);

    const organization = await Organization.create({
      name: 'Acme Interview Labs',
      size: '11-50',
      industry: 'Software',
    });

    const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);

    const interviewer = await User.create({
      firstName: 'Iris',
      lastName: 'Interviewer',
      email: 'interviewer@acme.dev',
      passwordHash,
      roleId: interviewerRole.id,
      organizationId: organization.id,
    });

    const interviewee = await User.create({
      firstName: 'Casey',
      lastName: 'Candidate',
      email: 'candidate@acme.dev',
      passwordHash,
      roleId: intervieweeRole.id,
      organizationId: organization.id,
    });

    const extraInterviewee = await User.create({
      firstName: 'Jordan',
      lastName: 'Applicant',
      email: 'applicant@acme.dev',
      passwordHash,
      roleId: intervieweeRole.id,
      organizationId: organization.id,
    });

    const questions = await createQuestions(interviewer.id, organization.id);

    await Session.bulkCreate([
      {
        sessionCode: 'DEV12345',
        title: 'Frontend Engineer Screen',
        status: 'scheduled',
        questionId: questions[0].id,
        interviewerId: interviewer.id,
        intervieweeId: interviewee.id,
        organizationId: organization.id,
        scheduledAt: new Date('2026-04-02T17:00:00.000Z'),
        selectedLanguage: 'JavaScript',
        currentCode: '// Candidate warm-up notes',
      },
      {
        sessionCode: 'PAIR6789',
        title: 'Algorithms Deep Dive',
        status: 'active',
        questionId: questions[1].id,
        interviewerId: interviewer.id,
        intervieweeId: extraInterviewee.id,
        organizationId: organization.id,
        scheduledAt: new Date('2026-04-03T19:00:00.000Z'),
        startedAt: new Date('2026-04-03T19:05:00.000Z'),
        selectedLanguage: 'TypeScript',
        currentCode: 'function merge(intervals) {\n  return intervals;\n}\n',
      },
      {
        sessionCode: 'HIRED001',
        title: 'Senior Platform Interview',
        status: 'completed',
        questionId: questions[2].id,
        interviewerId: interviewer.id,
        intervieweeId: interviewee.id,
        organizationId: organization.id,
        scheduledAt: new Date('2026-03-20T18:00:00.000Z'),
        startedAt: new Date('2026-03-20T18:03:00.000Z'),
        endedAt: new Date('2026-03-20T18:58:00.000Z'),
        selectedLanguage: 'JavaScript',
        currentCode: 'class LRUCache {\n  constructor(capacity) {}\n}\n',
        submittedCode:
          'class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n  }\n}\n',
      },
    ]);

    console.log('Dev database ready.');
    console.log(`Interviewer login: interviewer@acme.dev / ${DEV_PASSWORD}`);
    console.log(`Interviewee login: candidate@acme.dev / ${DEV_PASSWORD}`);
    console.log('Sample join codes: DEV12345, PAIR6789, HIRED001');
    process.exit(0);
  } catch (error) {
    console.error('Dev seed failed:', error);
    process.exit(1);
  }
}

run();
