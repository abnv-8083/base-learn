require('dotenv').config();
const mongoose = require('mongoose');
const Faculty = require('./models/Faculty');
const Student = require('./models/Student');
const Instructor = require('./models/Instructor');

const maleImages = [
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200&h=200'
];

const femaleImages = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200&h=200',
  'https://images.unsplash.com/photo-1598550874175-4d0ef436c909?auto=format&fit=crop&q=80&w=200&h=200',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200'
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  const faculties = await Faculty.find({});
  let m = 0;
  let f = 0;

  for (let i = 0; i < faculties.length; i++) {
    if (faculties[i].name.toLowerCase().includes('priya') || faculties[i].name.toLowerCase().includes('sneha') || faculties[i].name.toLowerCase().includes('kavya') || faculties[i].name.toLowerCase().includes('ananya')) {
        faculties[i].profilePhoto = femaleImages[f % femaleImages.length];
        f++;
    } else {
        faculties[i].profilePhoto = maleImages[m % maleImages.length];
        m++;
    }
    await faculties[i].save();
    console.log(`Updated faculty: ${faculties[i].name}`);
  }

  const instructors = await Instructor.find({});
  for (let i = 0; i < instructors.length; i++) {
    if (instructors[i].name.toLowerCase().includes('priya') || instructors[i].name.toLowerCase().includes('sneha') || instructors[i].name.toLowerCase().includes('kavya') || instructors[i].name.toLowerCase().includes('rita')) {
        instructors[i].profilePhoto = femaleImages[f % femaleImages.length];
        f++;
    } else {
        instructors[i].profilePhoto = maleImages[m % maleImages.length];
        m++;
    }
    await instructors[i].save();
    console.log(`Updated instructor: ${instructors[i].name}`);
  }
  
  console.log('Finished seeding images.');
  process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
