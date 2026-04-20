const mongoose = require('mongoose');
const uri = 'mongodb://baselearnofficial_db_user:z5jpoVuZbICPmMxH@ac-zfnkw1c-shard-00-00.ppty375.mongodb.net:27017,ac-zfnkw1c-shard-00-01.ppty375.mongodb.net:27017,ac-zfnkw1c-shard-00-02.ppty375.mongodb.net:27017/?ssl=true&replicaSet=atlas-oosmvv-shard-0&authSource=admin&appName=baselearn';

(async () => {
  await mongoose.connect(uri);
  
  // Mark ALL completed+unprocessed sessions as processed to stop infinite retries
  const result = await mongoose.connection.db.collection('liveclasses').updateMany(
    { status: 'completed', processed: false },
    { $set: { processed: true } }
  );
  console.log('Patched sessions (stopped retry loop):', result.modifiedCount);
  
  // List what was patched
  const patched = await mongoose.connection.db.collection('liveclasses').find({ status: 'completed', processed: true }, { projection: { title: 1, updatedAt: 1 } }).toArray();
  patched.forEach(s => console.log(' -', s.title, '| updated:', s.updatedAt));
  
  process.exit(0);
})();
