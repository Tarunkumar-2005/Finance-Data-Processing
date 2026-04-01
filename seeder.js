const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const FinancialRecord = require('./models/FinancialRecord');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await connectDB();
    
    // Clear out databases first (ignoring the soft-delete plugin since it's a raw wipe script)
    await User.collection.deleteMany({});
    await FinancialRecord.collection.deleteMany({});

    // Create an Admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'Admin',
    });

    console.log('Admin account created! login: admin@example.com | pass: password123');

    // Create an Analyst user
    await User.create({
      name: 'Analyst User',
      email: 'analyst@example.com',
      password: 'password123',
      role: 'Analyst',
    });

    // Create a Viewer user
    await User.create({
      name: 'Viewer User',
      email: 'viewer@example.com',
      password: 'password123',
      role: 'Viewer',
    });

    // Seed dummy records
    const records = [
      { amount: 6200, type: 'income', category: 'Salary', date: new Date('2026-03-01'), notes: 'March Salary', createdBy: adminUser._id },
      { amount: 1500, type: 'expense', category: 'Rent', date: new Date('2026-03-05'), notes: 'Apartment rent', createdBy: adminUser._id },
      { amount: 350, type: 'expense', category: 'Groceries', date: new Date('2026-03-10'), notes: 'Whole Foods', createdBy: adminUser._id },
      { amount: 120, type: 'expense', category: 'Utilities', date: new Date('2026-03-12'), notes: 'Electric Bill', createdBy: adminUser._id },
      { amount: 500, type: 'income', category: 'Freelance', date: new Date('2026-03-15'), notes: 'Web design gig', createdBy: adminUser._id },
    ];

    await FinancialRecord.insertMany(records);
    console.log('Data Imported Successfully');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
    try {
      await connectDB();
      await User.collection.deleteMany({});
      await FinancialRecord.collection.deleteMany({});
      console.log('Data Destroyed Successfully');
      process.exit();
    } catch (error) {
      console.error(`${error}`);
      process.exit(1);
    }
  };
  
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
