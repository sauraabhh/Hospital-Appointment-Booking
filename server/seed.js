require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Doctor } = require('./models');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const exists = await User.findOne({ email: 'admin@hospital.com' });
  if (!exists) {
    await User.create({
      name: 'Admin',
      email: 'admin@hospital.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin'
    });
    console.log('Admin created');
  } else {
    console.log('Admin already exists');
  }

  if ((await Doctor.countDocuments()) === 0) {
    await Doctor.insertMany([
      { name: 'Dr. Sharma', department: 'Cardiology', fee: 500, workingDays: [1, 2, 3, 4, 5] },
      { name: 'Dr. Mehta', department: 'Dermatology', fee: 400, workingDays: [1, 3, 5] },
      { name: 'Dr. Rao', department: 'Pediatrics', fee: 300, workingDays: [1, 2, 3, 4, 5, 6] }
    ]);
    console.log('Doctors added');
  }

  process.exit();
})();