/**
 * urlRefreshJob.js
 * 
 * Runs every 6 days to refresh all pre-signed E2E EOS URLs across the platform
 * before they expire (7-day TTL). This ensures thumbnails, videos, and PDFs
 * remain accessible to students and faculty without any re-upload required.
 */

const cron = require('node-cron');
const RecordedClass = require('../models/RecordedClass');
const Assignment    = require('../models/Assignment');
const StudyClass    = require('../models/StudyClass');
const LiveClass     = require('../models/LiveClass');
const { refreshPresignedUrl } = require('./s3');

// ─── Helper: refresh a single doc field if it's an E2E URL ──────────────────
const maybeRefresh = async (url) => {
    if (!url || !url.includes('e2enetworks.net')) return url;
    return await refreshPresignedUrl(url);
};

// ─── Refresh RecordedClass URLs ──────────────────────────────────────────────
const refreshRecordedClasses = async () => {
    const docs = await RecordedClass.find({
        $or: [
            { videoUrl: /e2enetworks\.net/ },
            { thumbnail: /e2enetworks\.net/ },
            { assignmentUrl: /e2enetworks\.net/ }
        ]
    }).lean();

    let count = 0;
    for (const doc of docs) {
        const updates = {};
        const videoUrl     = await maybeRefresh(doc.videoUrl);
        const thumbnail    = await maybeRefresh(doc.thumbnail);
        const assignmentUrl = await maybeRefresh(doc.assignmentUrl);
        if (videoUrl     !== doc.videoUrl)     updates.videoUrl = videoUrl;
        if (thumbnail    !== doc.thumbnail)    updates.thumbnail = thumbnail;
        if (assignmentUrl !== doc.assignmentUrl) updates.assignmentUrl = assignmentUrl;

        if (Object.keys(updates).length > 0) {
            await RecordedClass.findByIdAndUpdate(doc._id, updates);
            count++;
        }
    }
    console.log(`[URLRefresh] Refreshed ${count} RecordedClass documents.`);
};

// ─── Refresh Assignment URLs ─────────────────────────────────────────────────
const refreshAssignments = async () => {
    const docs = await Assignment.find({
        fileUrl: /e2enetworks\.net/
    }).lean();

    let count = 0;
    for (const doc of docs) {
        const fileUrl = await maybeRefresh(doc.fileUrl);
        if (fileUrl !== doc.fileUrl) {
            await Assignment.findByIdAndUpdate(doc._id, { fileUrl });
            count++;
        }
    }
    console.log(`[URLRefresh] Refreshed ${count} Assignment documents.`);
};

// ─── Refresh StudyClass (DPP/PYQ) URLs ──────────────────────────────────────
const refreshStudyClasses = async () => {
    try {
        const docs = await StudyClass.find({
            fileUrl: /e2enetworks\.net/
        }).lean();

        let count = 0;
        for (const doc of docs) {
            const fileUrl = await maybeRefresh(doc.fileUrl);
            if (fileUrl !== doc.fileUrl) {
                await StudyClass.findByIdAndUpdate(doc._id, { fileUrl });
                count++;
            }
        }
        console.log(`[URLRefresh] Refreshed ${count} StudyClass documents.`);
    } catch {
        // Model may not exist in all environments
    }
};

// ─── Refresh LiveClass recording URLs ───────────────────────────────────────
const refreshLiveClasses = async () => {
    const docs = await LiveClass.find({
        $or: [
            { recordingUrl: /e2enetworks\.net/ },
            { presentationUrl: /e2enetworks\.net/ }
        ]
    }).lean();

    let count = 0;
    for (const doc of docs) {
        const updates = {};
        const recordingUrl     = await maybeRefresh(doc.recordingUrl);
        const presentationUrl  = await maybeRefresh(doc.presentationUrl);
        if (recordingUrl    !== doc.recordingUrl)    updates.recordingUrl = recordingUrl;
        if (presentationUrl !== doc.presentationUrl) updates.presentationUrl = presentationUrl;

        if (Object.keys(updates).length > 0) {
            await LiveClass.findByIdAndUpdate(doc._id, updates);
            count++;
        }
    }
    console.log(`[URLRefresh] Refreshed ${count} LiveClass documents.`);
};

// ─── Master refresh function ─────────────────────────────────────────────────
const runUrlRefreshJob = async () => {
    console.log('[URLRefresh] Starting scheduled pre-signed URL refresh job...');
    try {
        await Promise.all([
            refreshRecordedClasses(),
            refreshAssignments(),
            refreshStudyClasses(),
            refreshLiveClasses(),
        ]);
        console.log('[URLRefresh] ✅ All URL refresh tasks completed successfully.');
    } catch (err) {
        console.error('[URLRefresh] ❌ Job failed:', err.message);
    }
};

// ─── Schedule: every 6 days at 3:00 AM ──────────────────────────────────────
// Cron: "0 3 */6 * *" = At 03:00 AM, every 6th day
const startUrlRefreshJob = () => {
    cron.schedule('0 3 */6 * *', () => {
        console.log('[URLRefresh] Cron triggered — 6-day URL refresh running...');
        runUrlRefreshJob();
    });
    console.log('[URLRefresh] Scheduler started — pre-signed URLs will be refreshed every 6 days at 3 AM.');
};

module.exports = { startUrlRefreshJob, runUrlRefreshJob };
