const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Admin = require('./models/Admin');

dotenv.config();
connectDB();

const admins = [
  { name: 'Head Pastor',             username: 'headpastor',    password: 'Pastor@GC1',    title: 'Head Pastor' },
  { name: 'Men Leader',              username: 'menleader',     password: 'MenGC@2024',    title: 'Men Leader' },
  { name: 'Women Leader',            username: 'womenleader',   password: 'WomenGC@2024',  title: 'Women Leader' },
  { name: 'Youth Leader',            username: 'youthleader',   password: 'YouthGC@2024',  title: 'Youth Leader' },
  { name: 'FFCC Chairman',           username: 'ffccchairman',  password: 'FFCC@GC2024',   title: 'FFCC Chairman' },
  { name: 'Committee Chairman',      username: 'committeechairman', password: 'Comm@GC2024', title: 'Church Committee Chairman' },
  { name: 'Collins',          username: 'collinsxc',  password: 'collinsxc@1', title: 'Developer Admin' },
];

const seedAdmins = async () => {
  try {
    await Admin.deleteMany({});
    for (let admin of admins) {
      const hashed = await bcrypt.hash(admin.password, 10);
      await Admin.create({ ...admin, password: hashed });
    }
    console.log('✅ 7 Admins seeded successfully!');
    process.exit();
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedAdmins();