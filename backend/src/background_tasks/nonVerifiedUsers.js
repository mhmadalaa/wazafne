const User = require('../models/User');
const cron = require('node-cron');

async function cleanupUnverifiedUsers() {
  try {
    // threshold to Guarantee that not deleting users stayed  in the database less than half hour
    const threshold = Date.now() - 30 * 60 * 1000;
    const deletedUsers = await User.deleteMany({
      authenticated: false,
      createdAt: { $lt: new Date(threshold) },
    });
    console.log(`Cleanup task completed successfully at ${new Date()}`);
    console.log(`${deletedUsers.deletedCount}  unverified users are deleted`);
  } catch (error) {
    console.log(Date.now());
    console.error('Error occurred during cleanup', error);
  }
}

//const scheduleTime = '*/5 * * * *';   //run every 5 mints

const scheduleTime = '0 2 * * *'; //run at 2 am

cron.schedule(scheduleTime, () => {
  cleanupUnverifiedUsers();
});
