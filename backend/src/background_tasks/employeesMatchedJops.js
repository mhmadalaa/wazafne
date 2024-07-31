const cron = require('node-cron');

const Employee = require('../models/Employee');
const JopMatch = require('../models/JopMatch');
const sendEmail = require('../utils/email');

async function sendingMatchedJopsToEmployees() {
  try {
    const employees = await Employee.find({ open_to_work: true });

    for (let i = 0; i < employees.length; ++i) {
      const matched_jops = await JopMatch.find({
        employee_id: employees[i]._id,
      })
        .populate('jop_id')
        .limit(5);

      await sendEmail({
        email: employees[i].contact_email,
        subject: 'Matched Jops',
        message: `Hello ${employees[i].name}, \nTake a look to jops that match your profile ${JSON.stringify(matched_jops)} `,
      });

      setTimeout(() => {}, 60000); // waite 1 minute before send another email
    }

    console.log(`Daily matched jops sent to ${employees.length} employees!`);
  } catch (error) {
    console.log(Date.now());
    console.error(
      'Error occurred during sending daily matched-jops emails to employees',
      error,
    );
  }
}

// const scheduleTime = '*/1 * * * *'; //run every 1 minute

const scheduleTime = '0 1 * * *'; //run at 1 am

cron.schedule(scheduleTime, () => {
  sendingMatchedJopsToEmployees();
});
