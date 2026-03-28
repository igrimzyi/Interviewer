import { syncDatabase, User, Question, TestCase } from './index.js';

async function run() {
  try {
    await syncDatabase();

    const interviewer = await User.findOne({
      order: [['createdAt', 'ASC']],
    });

    if (!interviewer) {
      console.error('No users found. Create an interviewer account before seeding questions.');
      process.exit(1);
    }

    const [question] = await Question.findOrCreate({
      where: {
        title: 'Two Sum Problem',
        createdById: interviewer.id,
      },
      defaults: {
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
        createdById: interviewer.id,
        organizationId: interviewer.organizationId ?? null,
      },
    });

    await TestCase.findOrCreate({
      where: {
        questionId: question.id,
        input: JSON.stringify({ nums: [2, 7, 11, 15], target: 9 }),
      },
      defaults: {
        expectedOutput: JSON.stringify([0, 1]),
      },
    });

    await TestCase.findOrCreate({
      where: {
        questionId: question.id,
        input: JSON.stringify({ nums: [3, 2, 4], target: 6 }),
      },
      defaults: {
        expectedOutput: JSON.stringify([1, 2]),
      },
    });

    console.log(`Seeded question "${question.title}" for ${interviewer.email}`);
    process.exit(0);
  } catch (error) {
    console.error('Question seed failed:', error);
    process.exit(1);
  }
}

run();
