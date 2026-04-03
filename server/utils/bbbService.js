const crypto = require('crypto');

/**
 * BigBlueButton Boilerplate Integration
 * Maps Live Classes to BBB Meetings using API endpoints
 */

const BBB_SECRET = process.env.BBB_SECRET || 'your-bbb-secret';
const BBB_URL = process.env.BBB_URL || 'https://bbb.example.com/bigbluebutton/api';

const generateChecksum = (callName, queryString) => {
    const stringToHash = `${callName}${queryString}${BBB_SECRET}`;
    return crypto.createHash('sha1').update(stringToHash).digest('hex');
};

/**
 * Creates a meeting url that can be triggered when a live class starts
 */
const createMeetingUrl = (classId, className, attendeePassword, moderatorPassword) => {
    const params = new URLSearchParams({
        name: className,
        meetingID: classId,
        attendeePW: attendeePassword,
        moderatorPW: moderatorPassword,
        record: 'true',
        autoStartRecording: 'false',
        allowStartStopRecording: 'true'
    });

    const queryString = params.toString();
    const checksum = generateChecksum('create', queryString);
    
    return `${BBB_URL}/create?${queryString}&checksum=${checksum}`;
};

/**
 * Generates a join URL for a student or faculty
 */
const generateJoinUrl = (classId, userName, password) => {
    const params = new URLSearchParams({
        fullName: userName,
        meetingID: classId,
        password: password,
        redirect: 'true'
    });

    const queryString = params.toString();
    const checksum = generateChecksum('join', queryString);
    
    return `${BBB_URL}/join?${queryString}&checksum=${checksum}`;
};

module.exports = {
    createMeetingUrl,
    generateJoinUrl
};
