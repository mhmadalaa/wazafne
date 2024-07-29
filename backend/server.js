require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app');

//to handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.log('✗ unhandledRejection', error.message);
});

mongoose
  .connect(process.env.DATABASE)
  .then(() => {
    console.log('Connected to database successfully ✔');
  })
  .catch((err) => console.log('✗ ', err));

app.get('/', (req, res) => {
  // This code will be executed when a GET request is made to the base URL
  res.send('<center><h1>welcome to Wazafne backend API.</h1></center>');
});

// START SERVER
app.listen(process.env.PORT | 3000, () => {
  console.log(`Server is running on port ${process.env.PORT | 3000} 🚀`);
});
