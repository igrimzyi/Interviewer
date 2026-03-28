import { syncDatabase } from './index.js';

async function run() {
  try {
    await syncDatabase({ force: true });
    console.log('Database tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error syncing database:', error);
    process.exit(1);
  }
}

run();
