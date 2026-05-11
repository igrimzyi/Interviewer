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
    suggestedTimeLimitMinutes: 180,
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
      firstName: 'Isaiah',
      lastName: 'Tamayo',
      email: 'interviewer@acme.dev',
      passwordHash,
      roleId: interviewerRole.id,
      organizationId: organization.id,
    });

    const viswa = await User.create({
      firstName: 'Viswamithra',
      lastName: 'Lakkamraju',
      email: 'viswa@acme.dev',
      passwordHash,
      roleId: intervieweeRole.id,
      organizationId: organization.id,
    });

    const anthony = await User.create({
      firstName: 'Anthony',
      lastName: 'Velasquez',
      email: 'anthony@acme.dev',
      passwordHash,
      roleId: intervieweeRole.id,
      organizationId: organization.id,
    });

    const antonio = await User.create({
      firstName: 'Antonio',
      lastName: 'Padilla',
      email: 'antonio@acme.dev',
      passwordHash,
      roleId: intervieweeRole.id,
      organizationId: organization.id,
    });

    const shane = await User.create({
      firstName: 'Shane',
      lastName: 'Shackleford',
      email: 'shane@acme.dev',
      passwordHash,
      roleId: intervieweeRole.id,
      organizationId: organization.id,
    });

    const ben = await User.create({
      firstName: 'Benjamin',
      lastName: 'Harrity',
      email: 'ben@acme.dev',
      passwordHash,
      roleId: intervieweeRole.id,
      organizationId: organization.id,
    });

    const david = await User.create({
      firstName: 'David',
      lastName: 'Solis Gallo',
      email: 'david@acme.dev',
      passwordHash,
      roleId: intervieweeRole.id,
      organizationId: organization.id,
    });

    const abhinay = await User.create({
      firstName: 'Abhinay',
      lastName: 'Goud Adhire',
      email: 'abhinay@acme.dev',
      passwordHash,
      roleId: intervieweeRole.id,
      organizationId: organization.id,
    });

    const questions = await createQuestions(interviewer.id, organization.id);
    const [twoSum, mergeIntervals, lruCache] = questions;

    // Timing-demo anchors — relative to seed time so the scenario is always valid
    const now = new Date();
    const activeStart   = new Date(now.getTime() - 15 * 60 * 1000);  // started 15 min ago (mergeIntervals = 180 min → window open until +165 min)
    const futureStart   = new Date(now.getTime() + 60 * 60 * 1000);  // starts in 1 hour → not yet
    const expiredStart  = new Date(now.getTime() - 90 * 60 * 1000);  // started 90 min ago (twoSum = 30 min → ended 60 min ago)

    const twoSumCode = 'function twoSum(nums, target) {\n  const map = {};\n  for (let i = 0; i < nums.length; i++) {\n    const comp = target - nums[i];\n    if (map[comp] !== undefined) return [map[comp], i];\n    map[nums[i]] = i;\n  }\n}\n';
    const mergeCode = 'function merge(intervals) {\n  intervals.sort((a, b) => a[0] - b[0]);\n  const result = [intervals[0]];\n  for (const [s, e] of intervals.slice(1)) {\n    const last = result[result.length - 1];\n    if (s <= last[1]) last[1] = Math.max(last[1], e);\n    else result.push([s, e]);\n  }\n  return result;\n}\n';
    const lruCode = 'class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.map = new Map();\n  }\n  get(key) {\n    if (!this.map.has(key)) return -1;\n    const val = this.map.get(key);\n    this.map.delete(key);\n    this.map.set(key, val);\n    return val;\n  }\n  put(key, value) {\n    if (this.map.has(key)) this.map.delete(key);\n    else if (this.map.size >= this.capacity) this.map.delete(this.map.keys().next().value);\n    this.map.set(key, value);\n  }\n}\n';

    await Session.bulkCreate([
      // ── Timing-demo sessions (relative to seed time) ────────────────────
      {
        sessionCode: 'INTIME1',
        title: 'Active Window Demo',
        status: 'scheduled',
        questionId: mergeIntervals.id,
        interviewerId: interviewer.id,
        intervieweeId: viswa.id,
        organizationId: organization.id,
        scheduledAt: activeStart,   // 15 min ago, 45-min window → still open
        selectedLanguage: 'JavaScript',
        currentCode: null,
      },
      {
        sessionCode: 'NOTYET1',
        title: 'Future Session Demo',
        status: 'scheduled',
        questionId: twoSum.id,
        interviewerId: interviewer.id,
        intervieweeId: anthony.id,
        organizationId: organization.id,
        scheduledAt: futureStart,   // 1 hour from now → hasn't started
        selectedLanguage: 'JavaScript',
        currentCode: null,
      },
      {
        sessionCode: 'EXPIRD1',
        title: 'Expired Window Demo',
        status: 'scheduled',
        questionId: twoSum.id,
        interviewerId: interviewer.id,
        intervieweeId: antonio.id,
        organizationId: organization.id,
        scheduledAt: expiredStart,  // 90 min ago, 30-min window → ended 60 min ago
        selectedLanguage: 'JavaScript',
        currentCode: null,
      },

      // ── Upcoming / active ───────────────────────────────────────────────
      {
        sessionCode: 'DEV12345',
        title: 'Frontend Engineer Screen',
        status: 'scheduled',
        questionId: twoSum.id,
        interviewerId: interviewer.id,
        intervieweeId: viswa.id,
        organizationId: organization.id,
        scheduledAt: new Date('2026-05-10T17:00:00.000Z'),
        selectedLanguage: 'JavaScript',
        currentCode: '// Candidate warm-up notes',
      },
      {
        sessionCode: 'PAIR6789',
        title: 'Algorithms Deep Dive',
        status: 'active',
        questionId: mergeIntervals.id,
        interviewerId: interviewer.id,
        intervieweeId: anthony.id,
        organizationId: organization.id,
        scheduledAt: new Date('2026-05-11T19:00:00.000Z'),
        startedAt: new Date('2026-05-11T19:05:00.000Z'),
        selectedLanguage: 'TypeScript',
        currentCode: 'function merge(intervals) {\n  return intervals;\n}\n',
      },

      // ── Completed sessions ───────────────────────────────────────────────
      {
        sessionCode: 'HIRED001',
        title: 'Senior Platform Interview',
        status: 'completed',
        questionId: lruCache.id,
        interviewerId: interviewer.id,
        intervieweeId: viswa.id,
        organizationId: organization.id,
        scheduledAt: new Date('2026-03-20T18:00:00.000Z'),
        startedAt: new Date('2026-03-20T18:03:00.000Z'),
        endedAt: new Date('2026-03-20T19:01:00.000Z'),
        selectedLanguage: 'JavaScript',
        currentCode: lruCode,
        submittedCode: lruCode,
      },
      {
        sessionCode: 'EASY001',
        title: 'Junior Dev Screening',
        status: 'completed',
        questionId: twoSum.id,
        interviewerId: interviewer.id,
        intervieweeId: viswa.id,
        organizationId: organization.id,
        scheduledAt: new Date('2026-02-14T15:00:00.000Z'),
        startedAt: new Date('2026-02-14T15:02:00.000Z'),
        endedAt: new Date('2026-02-14T15:27:00.000Z'),
        selectedLanguage: 'JavaScript',
        currentCode: twoSumCode,
        submittedCode: twoSumCode,
      },
      {
        sessionCode: 'EASY002',
        title: 'Frontend Coding Challenge',
        status: 'completed',
        questionId: twoSum.id,
        interviewerId: interviewer.id,
        intervieweeId: anthony.id,
        organizationId: organization.id,
        scheduledAt: new Date('2026-02-21T14:00:00.000Z'),
        startedAt: new Date('2026-02-21T14:01:00.000Z'),
        endedAt: new Date('2026-02-21T14:38:00.000Z'),
        selectedLanguage: 'TypeScript',
        currentCode: twoSumCode,
        submittedCode: twoSumCode,
      },
      {
        sessionCode: 'EASY003',
        title: 'Software Engineer I Screen',
        status: 'completed',
        questionId: twoSum.id,
        interviewerId: interviewer.id,
        intervieweeId: antonio.id,
        organizationId: organization.id,
        scheduledAt: new Date('2026-03-05T10:00:00.000Z'),
        startedAt: new Date('2026-03-05T10:00:00.000Z'),
        endedAt: new Date('2026-03-05T10:20:00.000Z'),
        selectedLanguage: 'JavaScript',
        currentCode: twoSumCode,
        submittedCode: twoSumCode,
      },
      {
        sessionCode: 'EASY004',
        title: 'Backend Eng Take-Home Review',
        status: 'completed',
        questionId: twoSum.id,
        interviewerId: interviewer.id,
        intervieweeId: shane.id,
        organizationId: organization.id,
        scheduledAt: new Date('2026-03-12T16:00:00.000Z'),
        startedAt: new Date('2026-03-12T16:03:00.000Z'),
        endedAt: new Date('2026-03-12T16:26:00.000Z'),
        selectedLanguage: 'JavaScript',
        currentCode: twoSumCode,
        submittedCode: twoSumCode,
      },
      {
        sessionCode: 'EASY005',
        title: 'Full-Stack Engineer Screen',
        status: 'completed',
        questionId: twoSum.id,
        interviewerId: interviewer.id,
        intervieweeId: david.id,
        organizationId: organization.id,
        scheduledAt: new Date('2026-03-18T11:00:00.000Z'),
        startedAt: new Date('2026-03-18T11:01:00.000Z'),
        endedAt: new Date('2026-03-18T11:29:00.000Z'),
        selectedLanguage: 'JavaScript',
        currentCode: twoSumCode,
        submittedCode: twoSumCode,
      },
      {
        sessionCode: 'MED001',
        title: 'Mid-Level Eng Assessment',
        status: 'completed',
        questionId: mergeIntervals.id,
        interviewerId: interviewer.id,
        intervieweeId: shane.id,
        organizationId: organization.id,
        scheduledAt: new Date('2026-03-19T13:00:00.000Z'),
        startedAt: new Date('2026-03-19T13:02:00.000Z'),
        endedAt: new Date('2026-03-19T13:44:00.000Z'),
        selectedLanguage: 'JavaScript',
        currentCode: mergeCode,
        submittedCode: mergeCode,
      },
      {
        sessionCode: 'MED002',
        title: 'Algorithms & Problem Solving',
        status: 'completed',
        questionId: mergeIntervals.id,
        interviewerId: interviewer.id,
        intervieweeId: ben.id,
        organizationId: organization.id,
        scheduledAt: new Date('2026-03-26T11:00:00.000Z'),
        startedAt: new Date('2026-03-26T11:00:00.000Z'),
        endedAt: new Date('2026-03-26T11:57:00.000Z'),
        selectedLanguage: 'TypeScript',
        currentCode: mergeCode,
        submittedCode: mergeCode,
      },
      {
        sessionCode: 'MED003',
        title: 'Full-Stack Engineer Round 2',
        status: 'completed',
        questionId: mergeIntervals.id,
        interviewerId: interviewer.id,
        intervieweeId: antonio.id,
        organizationId: organization.id,
        scheduledAt: new Date('2026-04-02T14:00:00.000Z'),
        startedAt: new Date('2026-04-02T14:05:00.000Z'),
        endedAt: new Date('2026-04-02T14:44:00.000Z'),
        selectedLanguage: 'JavaScript',
        currentCode: mergeCode,
        submittedCode: mergeCode,
      },
      {
        sessionCode: 'MED004',
        title: 'Platform Engineer Assessment',
        status: 'completed',
        questionId: mergeIntervals.id,
        interviewerId: interviewer.id,
        intervieweeId: abhinay.id,
        organizationId: organization.id,
        scheduledAt: new Date('2026-04-08T15:00:00.000Z'),
        startedAt: new Date('2026-04-08T15:03:00.000Z'),
        endedAt: new Date('2026-04-08T15:51:00.000Z'),
        selectedLanguage: 'TypeScript',
        currentCode: mergeCode,
        submittedCode: mergeCode,
      },
      {
        sessionCode: 'HARD001',
        title: 'Staff Engineer Technical Screen',
        status: 'completed',
        questionId: lruCache.id,
        interviewerId: interviewer.id,
        intervieweeId: anthony.id,
        organizationId: organization.id,
        scheduledAt: new Date('2026-04-09T15:00:00.000Z'),
        startedAt: new Date('2026-04-09T15:02:00.000Z'),
        endedAt: new Date('2026-04-09T16:13:00.000Z'),
        selectedLanguage: 'JavaScript',
        currentCode: lruCode,
        submittedCode: lruCode,
      },
      {
        sessionCode: 'HARD002',
        title: 'Principal Engineer Interview',
        status: 'completed',
        questionId: lruCache.id,
        interviewerId: interviewer.id,
        intervieweeId: ben.id,
        organizationId: organization.id,
        scheduledAt: new Date('2026-04-16T10:00:00.000Z'),
        startedAt: new Date('2026-04-16T10:01:00.000Z'),
        endedAt: new Date('2026-04-16T11:04:00.000Z'),
        selectedLanguage: 'TypeScript',
        currentCode: lruCode,
        submittedCode: lruCode,
      },
      {
        sessionCode: 'HARD003',
        title: 'Senior Engineer Final Round',
        status: 'completed',
        questionId: lruCache.id,
        interviewerId: interviewer.id,
        intervieweeId: abhinay.id,
        organizationId: organization.id,
        scheduledAt: new Date('2026-04-23T14:00:00.000Z'),
        startedAt: new Date('2026-04-23T14:02:00.000Z'),
        endedAt: new Date('2026-04-23T15:07:00.000Z'),
        selectedLanguage: 'JavaScript',
        currentCode: lruCode,
        submittedCode: lruCode,
      },
      {
        sessionCode: 'CANCEL1',
        title: 'Systems Design Screen',
        status: 'cancelled',
        questionId: lruCache.id,
        interviewerId: interviewer.id,
        intervieweeId: david.id,
        organizationId: organization.id,
        scheduledAt: new Date('2026-04-30T09:00:00.000Z'),
        selectedLanguage: 'JavaScript',
        currentCode: null,
      },
    ]);

    console.log('Dev database ready.');
    console.log(`Interviewer login: interviewer@acme.dev / ${DEV_PASSWORD}`);
    console.log(`Interviewee logins (all use ${DEV_PASSWORD}):`);
    console.log('  viswa@acme.dev    (Viswamithra Lakkamraju)');
    console.log('  anthony@acme.dev  (Anthony Velasquez)');
    console.log('  antonio@acme.dev  (Antonio Padilla)');
    console.log('  shane@acme.dev    (Shane Shackleford)');
    console.log('  ben@acme.dev      (Benjamin Harrity)');
    console.log('  david@acme.dev    (David Solis Gallo)');
    console.log('  abhinay@acme.dev  (Abhinay Goud Adhire)');
    console.log('Timing demo codes:');
    console.log('  INTIME1 — in window (started 15 min ago, 180-min limit)');
    console.log('  NOTYET1 — not started (starts in 1 hour)');
    console.log('  EXPIRD1 — expired (started 90 min ago, 30-min limit)');
    console.log('Sample join codes: DEV12345, PAIR6789, HIRED001');
    process.exit(0);
  } catch (error) {
    console.error('Dev seed failed:', error);
    process.exit(1);
  }
}

run();
