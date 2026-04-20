const LiveClass = require('../models/LiveClass');
const RecordedClass = require('../models/RecordedClass');
const bbb = require('../utils/bbb');
const Faculty = require('../models/Faculty');
const Notification = require('../models/Notification');

// ── Notify all assigned instructors for a faculty ─────────────────────────
const notifyInstructors = async (facultyId, title, message, link) => {
    try {
        const faculty = await Faculty.findById(facultyId).select('assignedInstructors');
        if (!faculty) return;

        const instructors = Array.isArray(faculty.assignedInstructors) 
            ? faculty.assignedInstructors 
            : faculty.assignedInstructor ? [faculty.assignedInstructor] : [];

        for (const instructorId of instructors) {
            await Notification.create({
                recipient: instructorId,
                recipientModel: 'Instructor',
                title,
                message,
                type: 'content_approval',
                link
            });
        }
    } catch (err) {
        console.error('[Notify Instructors Error]:', err.message);
    }
};

// ── Sync ongoing sessions → mark completed if BBB ended ──────────────────
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
                    // Grace period: if the session JUST became 'ongoing' (within last 5 minutes),
                    // don't mark it completed yet — faculty may have just created the BBB room
                    // but hasn't clicked the join URL in their browser tab yet
                    const ongoingFor = Date.now() - new Date(session.updatedAt).getTime();
                    const GRACE_PERIOD_MS = 5 * 60 * 1000; // 5 minutes
                    
                    if (ongoingFor < GRACE_PERIOD_MS) {
                        console.log(`[JOB-DEBUG] Session "${session.title}" BBB room is empty but just started ${Math.round(ongoingFor/1000)}s ago. Skipping (grace period).`);
                        continue;
                    }

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
                                updatedAttendance[studentIndex].leaveTime = new Date();
                                
                                const sessionDurationSeconds = (session.duration || 60) * 60;
                                const attendedSeconds = parseInt(att.totalTime) || sessionDurationSeconds;
                                const attendancePercentage = (attendedSeconds / sessionDurationSeconds) * 100;
                                
                                updatedAttendance[studentIndex].status = attendancePercentage >= 80 ? 'present' : 'late';
                                updatedAttendance[studentIndex].totalDurationSeconds = attendedSeconds;
                            }
                        }
                        session.attendance = updatedAttendance;
                    }

                    // 2. Mark session as completed
                    session.status = 'completed';
                    await session.save();
                    console.log(`[JOB-DEBUG] Session "${session.title}" marked as COMPLETED.`);

                    // 3. Process recording (creates draft RecordedClass for instructor review)
                    await processRecordingDraft(session);
                }
            } catch (sessionError) {
                console.error(`[JOB-DEBUG] Error processing session ${session._id}:`, sessionError.message);
            }
        }

        // Also retry processing for any completed sessions not yet processed
        const pendingProcessing = await LiveClass.find({ status: 'completed', processed: false });
        for (const session of pendingProcessing) {
            // ── Retry cutoff: if session has been completed for > 2 hours with no recording,
            //    stop retrying and mark it processed to halt the infinite loop.
            //    Faculty can manually add the recording URL later via the instructor portal.
            const completedFor = Date.now() - new Date(session.updatedAt).getTime();
            const MAX_RETRY_MS = 2 * 60 * 60 * 1000; // 2 hours

            if (completedFor > MAX_RETRY_MS) {
                console.warn(`[JOB-DEBUG] Session "${session.title}" has been completed for ${Math.round(completedFor/60000)} min with no BBB recording. Giving up — marking processed. Faculty can add recording URL manually.`);
                session.processed = true;
                await session.save();
                continue;
            }

            try {
                await processRecordingDraft(session);
            } catch (e) {
                console.error(`[JOB-DEBUG] Error processing recording for ${session._id}:`, e.message);
            }
        }

    } catch (error) {
        console.error('[JOB-CRITICAL] Sync Live Sessions Loop Error:', error.message);
    }
};

// ── Create draft RecordedClass entries for instructor approval ────────────
const processRecordingDraft = async (session) => {
    try {
        // Check if already processed (avoid duplicates)
        const existing = await RecordedClass.findOne({ liveClass: session._id });
        if (existing) {
            console.log(`[JOB-DEBUG] Draft already exists for "${session.title}", skipping.`);
            // Still mark processed if somehow missed
            if (!session.processed) {
                session.processed = true;
                await session.save();
            }
            return;
        }

        let recordingCreated = false;

        // ── 1. BBB Auto-Recording ─────────────────────────────────────────
        const recordings = await bbb.getRecordings(session._id.toString());
        if (recordings && recordings.length > 0) {
            const recording = recordings[0];
            const playbackUrl = recording.playback?.format?.url || recording.playback?.recordings?.recording?.url;

            if (playbackUrl) {
                console.log(`[JOB-DEBUG] BBB recording found for "${session.title}". Creating draft for instructor review...`);

                const recordedEntry = await RecordedClass.create({
                    title: `[LIVE] ${session.title}`,
                    description: session.description || `Live session recording from ${new Date(session.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`,
                    subject: session.subject,
                    chapter: session.chapter || null,
                    videoUrl: playbackUrl,
                    faculty: session.faculty?._id || session.faculty,
                    liveClass: session._id,
                    contentType: 'liveRecording',
                    status: 'draft',              // ← PENDING instructor approval
                    assignedTo: session.batches   // Pre-fill batch list from live class
                });

                // Store URL on LiveClass too (for instructor portal reference)
                session.recordingUrl = playbackUrl;
                recordingCreated = true;

                // Notify assigned instructors
                await notifyInstructors(
                    session.faculty?._id || session.faculty,
                    '🎬 Live Recording Ready for Review',
                    `The live session "${session.title}" has ended. A recording draft is waiting for your approval before students can access it.`,
                    `/instructor/content`
                );

                console.log(`[JOB-DEBUG] Draft RecordedClass created: ${recordedEntry._id}`);
            }
        }

        // ── 2. Manual Notes / Presentation URL ───────────────────────────
        // If faculty submitted notes when ending the class, create a notes draft too
        if (session.presentationUrl) {
            const notesAlreadyDrafted = await RecordedClass.findOne({ 
                liveClass: session._id, 
                contentType: 'liveNotes' 
            });

            if (!notesAlreadyDrafted) {
                await RecordedClass.create({
                    title: `[NOTES] ${session.title}`,
                    description: `Class notes/slides from live session on ${new Date(session.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`,
                    subject: session.subject,
                    chapter: session.chapter || null,
                    videoUrl: session.presentationUrl, // Reuse videoUrl field for PDF/slide URL
                    faculty: session.faculty?._id || session.faculty,
                    liveClass: session._id,
                    contentType: 'liveNotes',
                    status: 'draft',
                    assignedTo: session.batches
                });

                if (!recordingCreated) {
                    // Notify only if no recording notification was sent yet
                    await notifyInstructors(
                        session.faculty?._id || session.faculty,
                        '📄 Class Notes Ready for Review',
                        `Faculty submitted notes for "${session.title}". Please review and approve before students can access them.`,
                        `/instructor/content`
                    );
                }
            }
        }

        // ── 3. Mark session as fully processed ───────────────────────────
        if (recordingCreated || session.presentationUrl) {
            session.processed = true;
            await session.save();
        } else {
            // No recording available yet — will retry on next job cycle
            console.log(`[JOB-DEBUG] No BBB recording available yet for "${session.title}". Will retry.`);
        }

    } catch (error) {
        console.error(`[Process Recording Draft Error] for session ${session._id}:`, error.message);
    }
};

// ── Start the polling job ─────────────────────────────────────────────────
const startJob = () => {
    console.log('[LiveSessionJob] Live Session Lifecycle Job Started. Polling every 30s.');
    setInterval(syncLiveSessions, 30000);
};

module.exports = { startJob };
