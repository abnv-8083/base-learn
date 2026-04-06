const LiveClass = require('../models/LiveClass');
const RecordedClass = require('../models/RecordedClass');
const bbb = require('../utils/bbb');
const Faculty = require('../models/Faculty');
const Notification = require('../models/Notification');

const syncLiveSessions = async () => {
    try {
        // Find all sessions marked as ongoing
        const ongoingSessions = await LiveClass.find({ status: 'ongoing' }).populate('faculty', 'name email');
        
        for (const session of ongoingSessions) {
            const isRunning = await bbb.isMeetingRunning(session._id.toString());
            
            if (!isRunning) {
                console.log(`Live Session ${session.title} (${session._id}) has ended. Processing analytics...`);
                
                // 1. Fetch detailed meeting info for attendance
                const info = await bbb.getMeetingInfo(session._id.toString());
                if (info && info.attendees) {
                    const bbbAttendees = Array.isArray(info.attendees.attendee) 
                        ? info.attendees.attendee 
                        : (info.attendees.attendee ? [info.attendees.attendee] : []);

                    let updatedAttendance = [...session.attendance];

                    // Map BBB attendees back to our students
                    // NOTE: This assumes the student join name or metadata matches studentId or email
                    // In a production app, we usually pass studentId as 'userID' in the join URL.
                    for (const att of bbbAttendees) {
                        // BBB userID is usually set to the student ID string in our join logic
                        const studentId = att.userID; 
                        const studentIndex = updatedAttendance.findIndex(a => a.studentId.toString() === studentId);
                        
                        if (studentIndex > -1) {
                            updatedAttendance[studentIndex].attended = true;
                            // Check if timestamps are available (depends on BBB version/config)
                            // Basic tracking: if they are in the final report, they attended.
                            
                            // 80% Attendance Logic:
                            // We compare the meeting duration from BBB with their participation
                            // For simplicity if BBB doesn't provide precise per-user total seconds here,
                            // we use the session duration.
                            const sessionDurationSeconds = (session.duration || 60) * 60;
                            const attendedSeconds = parseInt(att.totalTime) || sessionDurationSeconds; // totalTime in seconds
                            
                            const attendancePercentage = (attendedSeconds / sessionDurationSeconds) * 100;
                            
                            if (attendancePercentage >= 80) {
                                updatedAttendance[studentIndex].status = 'present';
                            } else {
                                updatedAttendance[studentIndex].status = 'late';
                            }
                            updatedAttendance[studentIndex].totalDurationSeconds = attendedSeconds;
                        }
                    }
                    session.attendance = updatedAttendance;
                }

                // 2. Mark session as completed
                session.status = 'completed';
                await session.save();

                // 3. Start checking for recording (will re-process in next iterations if not ready)
                await processRecording(session);
            }
        }

        // Also check sessions that are completed but not yet "processed" into RecordedClass
        const pendingProcessing = await LiveClass.find({ status: 'completed', processed: false });
        for (const session of pendingProcessing) {
            await processRecording(session);
        }

    } catch (error) {
        console.error('Sync Live Sessions Error:', error.message);
    }
};

const processRecording = async (session) => {
    try {
        const recordings = await bbb.getRecordings(session._id.toString());
        if (recordings && recordings.length > 0) {
            const recording = recordings[0]; // Take the first recording
            const playbackUrl = recording.playback?.format?.url || recording.playback?.recordings?.recording?.url;

            if (playbackUrl) {
                console.log(`Recording found for ${session.title}. Creating RecordedClass draft...`);
                
                // Create RecordedClass draft for Instructor review
                const recordedEntry = await RecordedClass.create({
                    title: `[LIVE] ${session.title}`,
                    description: session.description || `Automated recording from live session on ${session.scheduledAt.toLocaleDateString()}`,
                    subject: session.subject,
                    chapter: session.chapter,
                    videoUrl: playbackUrl,
                    faculty: session.faculty,
                    liveClass: session._id,
                    contentType: 'liveRecording',
                    status: 'draft',
                    assignedTo: session.batches // Copy original batches
                });

                // Mark LiveClass as processed
                session.processed = true;
                session.recordingUrl = playbackUrl;
                await session.save();

                // Notify Instructor (find assigned instructor for this faculty)
                const faculty = await Faculty.findById(session.faculty);
                if (faculty && faculty.assignedInstructor) {
                    await Notification.create({
                        recipient: faculty.assignedInstructor,
                        recipientModel: 'Instructor',
                        title: 'New Live Recording Ready',
                        message: `The live session "${session.title}" has ended and a recording is ready for review.`,
                        type: 'content_approval',
                        link: `/instructor/verification?id=${recordedEntry._id}`
                    });
                }
            }
        }
    } catch (error) {
        console.error(`Process Recording Error for ${session._id}:`, error.message);
    }
};

// Start the job
const startJob = () => {
    console.log('Live Session Lifecycle Job Started.');
    setInterval(syncLiveSessions, 60000); // Check every minute
};

module.exports = { startJob };
