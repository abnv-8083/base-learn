const fs = require('fs');
const path = 'd:/Base-Learn/server/controllers/adminController.js';
let content = fs.readFileSync(path, 'utf8');

// Update createClass
const createClassOld = `exports.createClass = asyncHandler(async (req, res) => {
    const { name, targetGrade, instructorId } = req.body;
    
    // Find a valid instructor fallback if not provided
    let instructor = instructorId;
    if (!instructor) {
        const foundInstructor = await Instructor.findOne({});
        instructor = foundInstructor?._id || req.user.userId;
    }
    
    const studyClass = await StudyClass.create({
        name,
        targetGrade: targetGrade || null,
        instructor: instructor
    });

    await logAction(req, 'Created Class', \`Class: \${name}\`, { targetId: studyClass._id, targetModel: 'StudyClass' });
    res.status(201).json({ success: true, data: studyClass });
});`;

const createClassNew = `exports.createClass = asyncHandler(async (req, res) => {
    const { name, targetGrade, instructorId, description } = req.body;
    
    // Find a valid instructor fallback if not provided
    let instructor = instructorId;
    if (!instructor) {
        const foundInstructor = await Instructor.findOne({});
        instructor = foundInstructor?._id || req.user.userId;
    }
    
    const studyClass = await StudyClass.create({
        name,
        targetGrade: targetGrade || null,
        description: description || '',
        instructor: instructor
    });

    await logAction(req, 'Created Class', \`Class: \${name}\`, { targetId: studyClass._id, targetModel: 'StudyClass' });
    res.status(201).json({ success: true, data: studyClass });
});`;

// Normalize line endings for replacement
const normalize = (s) => s.replace(/\r\n/g, '\n').trim();

if (normalize(content).includes(normalize(createClassOld))) {
    content = content.replace(createClassOld.trim(), createClassNew.trim());
    fs.writeFileSync(path, content);
    console.log('Successfully updated createClass in adminController.js');
} else {
    console.log('Could not find createClassOld in adminController.js');
    // Try a more relaxed match
    const regex = /exports\.createClass\s*=\s*asyncHandler\(async\s*\(req,\s*res\)\s*=>\s*\{[\s\S]*?\}\);/;
    if (regex.test(content)) {
        content = content.replace(regex, createClassNew);
        fs.writeFileSync(path, content);
        console.log('Successfully updated createClass using regex');
    } else {
        console.log('Regex match also failed');
    }
}
