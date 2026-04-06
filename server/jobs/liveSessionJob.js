const LiveClass = require('../models/LiveClass');
const RecordedClass = require('../models/RecordedClass');
const bbb = require('../utils/bbb');
const Faculty = require('../models/Faculty');
const Notification = require('../models/Notification');

const syncLiveSessions = async () => {
    try {
        const ongoingSessions = await LiveClass.find({ status: 'ongoing' }).populate('faculty', 'name email');
        if (ongoingSessions.length > 0) {
            console.log(`[JOB-DEBUG] Checking status for ${ongoingSessions.length} ongoing sessions...`);
        }
        
        for (const session of ongoingSessions) {
            try {
                const isRunning = await bbb.isMeetingRunning(session._id.toString());
                
                if (!isRunning) {
                    console.log(`[JOB-DEBUG] Session "${session.title}" (${session._id}) ended in BBB. Closing platform status...`);
                    
                    // 1. Attempt to fetch detailed meeting info for attendance
                    let info = null;
                    try {
                        info = await bbb.getMeetingInfo(session._id.toString());
                    } catch (e) {
                        console.warn(`[JOB-DEBUG] Could not fetch meeting info for ${session._id} (Meeting likely purged from BBB cache).`);
                    }

                    if (info && info.attendees) {
                        const bbbAttendees = Array.isArray(info.attendees.attendee) 
                            ? info.attendees.attendee 
                            : (info.attendees.attendee ? [info.attendees.attendee] : []);

                        let updatedAttendance = [...session.attendance];

                        for (const att of bbbAttendees) {
                            const studentId = att.userID; 
                            const studentIndex = updatedAttendance.findIndex(a => a.studentId.toString() === studentId);
                            
                            if (studentIndex > -1) {
                                updatedAttendance[studentIndex].attended = true;
                                updatedAttendance[studentIndex].leaveTime = new Date(); // Approximate leave time if meeting just ended
                                
                                const sessionDurationSeconds = (session.duration || 60) * 60;
                                const attendedSeconds = parseInt(att.totalTime) || sessionDurationSeconds;
                                
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

                    // 2. Mark session as completed (ESSENTIAL: Do this even if info fetch fails)
                    session.status = 'completed';
                    await session.save();
                    console.log(`[JOB-DEBUG] Session "${session.title}" marked as COMPLETED.`);

                    // 3. Process recording
                    await processRecording(session);
                }
            } catch (sessionError) {
                console.error(`[JOB-DEBUG] Error processing session ${session._id}:`, sessionError.message);
            }
        }

        // Process pending completed sessions for recordings
        const pendingProcessing = await LiveClass.find({ status: 'completed', processed: false });
        for (const session of pendingProcessing) {
            try {
                await processRecording(session);
            } catch (e) {
                console.error(`[JOB-DEBUG] Error processing recording for ${session._id}:`, e.message);
            }
        }

    } catch (error) {
        console.error('[JOB-CRITICAL] Sync Live Sessions Loop Error:', error.message);
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
    setInterval(syncLiveSessions, 30000); // Check every 30 seconds for faster synchronization
};

module.exports = { startJob };
