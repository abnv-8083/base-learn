const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('./models/Student');
const Batch = require('./models/Batch');
const Subject = require('./models/Subject');
const Chapter = require('./models/Chapter');
const RecordedClass = require('./models/RecordedClass');

dotenv.config();

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const student = await Student.findOne({ name: /Anshad/i }).lean();
        if(!student) { console.log('Student not found'); process.exit(0); }
        
        const studentId = student._id;
        console.log('Student ID:', studentId);

        const studentBatch = await Batch.findOne({ students: studentId });
        if(!studentBatch) { console.log('No Batch found'); process.exit(0); }
        
        console.log('Batch found:', studentBatch.name, studentBatch._id);

        const batchId = new mongoose.Types.ObjectId(studentBatch._id);
        const classId = studentBatch.studyClass ? new mongoose.Types.ObjectId(studentBatch.studyClass._id || studentBatch.studyClass) : null;
        console.log('Batch ID:', batchId, 'Class ID:', classId);

        const assignedVideos = await RecordedClass.find({
            status: 'published',
            assignedTo: { $in: [batchId] }
        }).populate('chapter subject').lean();
        console.log('Assigned Videos found:', assignedVideos.length);

        const implicitSubjectIds = [...new Set(assignedVideos.map(v => v.subject?._id || v.subject))].filter(Boolean);
        const implicitChapterIds = [...new Set(assignedVideos.map(v => v.chapter?._id || v.chapter))].filter(Boolean);

        const subjects = await Subject.find({ 
            $or: [
                { assignedTo: { $in: [batchId, classId] } },
                { _id: { $in: implicitSubjectIds } }
            ]
        }).lean();
        console.log('Subjects found:', subjects.length);
        subjects.forEach(s => console.log(' - Subject:', s.name, s._id, 'AssignedTo:', s.assignedTo));

        const subjectIds = subjects.map(s => s._id);
        const chapters = await Chapter.find({
            $or: [
                { assignedTo: { $in: [batchId, classId] } },
                { _id: { $in: implicitChapterIds } },
                { subject: { $in: subjectIds } }
            ]
        }).lean();
        console.log('Chapters found:', chapters.length);

        const hierarchy = subjects.map((sub, index) => {
            const subChapters = chapters.filter(c => c.subject?.toString() === sub._id.toString());
            console.log(`Checking Hierarchy for Subject: ${sub.name}, subChapters count: ${subChapters.length}`);
            
            const mappedChapters = subChapters.map(chap => {
               const chapVideos = assignedVideos.filter(v => {
                  const videoChapterId = v.chapter?._id || v.chapter;
                  return videoChapterId && videoChapterId.toString() === chap._id.toString();
               });
               
               const hasAssignedResources = 
                 (chap.notes || []).some(n => n.status === 'published' && n.assignedTo?.some(bid => bid.toString() === batchId.toString())) ||
                 (chap.liveNotes || []).some(n => n.status === 'published' && n.assignedTo?.some(bid => bid.toString() === batchId.toString())) ||
                 (chap.dpps || []).some(n => n.status === 'published' && n.assignedTo?.some(bid => bid.toString() === batchId.toString())) ||
                 (chap.pyqs || []).some(n => n.status === 'published' && n.assignedTo?.some(bid => bid.toString() === batchId.toString()));

               const isExplicitlyAssigned = (chap.assignedTo || []).some(id => 
                 id.toString() === batchId.toString() || (classId && id.toString() === classId.toString())
               );
               
               console.log(`  Chapter: ${chap.name}, videos: ${chapVideos.length}, isExplicitlyAssigned: ${isExplicitlyAssigned}, hasAssignedResources: ${hasAssignedResources}`);
               
               if (chapVideos.length === 0 && !isExplicitlyAssigned && !hasAssignedResources) {
                 return null;
               }
               return { id: chap._id, title: chap.name };
            });

            return {
              id: sub._id,
              title: sub.name,
              chapters: mappedChapters.filter(Boolean)
            };
        });

        const finalData = hierarchy.filter(s => {
            const subObj = subjects.find(sub => sub._id.toString() === s.id.toString());
            const isExplicitlyAssigned = subObj?.assignedTo?.some(id => 
               id.toString() === batchId.toString() || (classId && id.toString() === classId.toString())
            );
            console.log(`Final filter for ${s.title}: chapters length: ${s.chapters.length}, isSubExplicitlyAssigned: ${isExplicitlyAssigned}`);
            return s.chapters.length > 0 || isExplicitlyAssigned;
        });

        console.log('Final Data Length:', finalData.length);
        console.log('Final Data titles:', finalData.map(s => s.title));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debug();
