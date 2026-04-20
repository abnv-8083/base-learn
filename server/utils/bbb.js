const crypto = require('crypto');
const axios = require('axios');
const xml2js = require('xml2js');

class BigBlueButton {
  constructor() {
    this.url = process.env.BBB_URL || 'https://test-install.blindsidenetworks.com/bigbluebutton/api';
    this.secret = process.env.BBB_SECRET || '8cd8ef52e8e101574e400365b55e11a6';
    this.parser = new xml2js.Parser({ explicitArray: false });
    const usingFallback = !process.env.BBB_URL;
    console.log(`[BBB] Configured → ${this.url} ${usingFallback ? '(⚠ FALLBACK — set BBB_URL in .env)' : '✓'}`);
  }


  generateChecksum(apiMethod, query) {
    return crypto
      .createHash('sha1')
      .update(apiMethod + query + this.secret)
      .digest('hex');
  }

  async createMeeting(meetingId, name, attendeePW, moderatorPW) {
    const privacyParams = [
      'lockSettingsHideUserList=true',
      'webcamsOnlyForModerator=true',
      'lockSettingsDisableCam=false',
      'lockSettingsDisablePublicChat=false',
      'lockSettingsDisablePrivateChat=false'
    ].join('&');

    const query = `name=${encodeURIComponent(name)}&meetingID=${meetingId}&attendeePW=${attendeePW}&moderatorPW=${moderatorPW}&record=true&${privacyParams}`;
    const checksum = this.generateChecksum('create', query);
    const fullUrl = `${this.url}/create?${query}&checksum=${checksum}`;

    try {
      const response = await axios.get(fullUrl, { timeout: 10000 });
      const result = await this.parser.parseStringPromise(response.data);
      return result.response;
    } catch (error) {
      const detail = error.response
        ? `HTTP ${error.response.status}: ${String(error.response.data).slice(0, 200)}`
        : `${error.code || error.name}: ${error.message}`;
      console.error(`[BBB] createMeeting FAILED → ${detail} | URL: ${this.url}`);
      throw new Error(`BBB unreachable: ${detail}`);
    }
  }

  getJoinUrl(meetingId, fullName, password, userId) {
    let query = `meetingID=${meetingId}&fullName=${encodeURIComponent(fullName)}&password=${password}`;
    if (userId) query += `&userID=${userId}`;
    const checksum = this.generateChecksum('join', query);
    return `${this.url}/join?${query}&checksum=${checksum}`;
  }

  async getMeetingInfo(meetingId) {
    const query = `meetingID=${meetingId}`;
    const checksum = this.generateChecksum('getMeetingInfo', query);
    const fullUrl = `${this.url}/getMeetingInfo?${query}&checksum=${checksum}`;

    try {
      const response = await axios.get(fullUrl);
      const result = await this.parser.parseStringPromise(response.data);
      if (result.response.returncode === 'FAILED') return null;
      return result.response;
    } catch (error) {
      console.error('BBB Meeting Info Error:', error.message);
      return null;
    }
  }

  async isMeetingRunning(meetingId) {
    const query = `meetingID=${meetingId}`;
    const checksum = this.generateChecksum('isMeetingRunning', query);
    const fullUrl = `${this.url}/isMeetingRunning?${query}&checksum=${checksum}`;

    try {
      const response = await axios.get(fullUrl);
      const result = await this.parser.parseStringPromise(response.data);
      const isRunning = result.response.running === 'true';
      if (!isRunning) {
        console.log(`[BBB-DEBUG] Meeting ${meetingId} is NOT running. Raw:`, result.response.running);
      }
      return isRunning;
    } catch (error) {
      console.error(`[BBB-DEBUG] Error checking isMeetingRunning for ${meetingId}:`, error.message);
      return false;
    }
  }

  async getRecordings(meetingId) {
    const query = `meetingID=${meetingId}`;
    const checksum = this.generateChecksum('getRecordings', query);
    const fullUrl = `${this.url}/getRecordings?${query}&checksum=${checksum}`;

    try {
      const response = await axios.get(fullUrl, { timeout: 10000 });
      const result = await this.parser.parseStringPromise(response.data);
      if (result.response.returncode === 'SUCCESS' && result.response.recordings) {
          const recs = result.response.recordings.recording;
          return Array.isArray(recs) ? recs : [recs];
      }
      return [];
    } catch (error) {
      const detail = error.response
        ? `HTTP ${error.response.status}`
        : `${error.code || error.name}: ${error.message}`;
      console.error(`[BBB] getRecordings FAILED → ${detail}`);
      return []; // Return empty instead of throwing — caller handles gracefully
    }
  }
  
  async endMeeting(meetingId, moderatorPW) {
      const query = `meetingID=${meetingId}&password=${moderatorPW}`;
      const checksum = this.generateChecksum('end', query);
      const fullUrl = `${this.url}/end?${query}&checksum=${checksum}`;
      
      try {
          const response = await axios.get(fullUrl);
          const result = await this.parser.parseStringPromise(response.data);
          return result.response;
      } catch (error) {
          console.error('BBB End Meeting Error:', error.message);
          throw error;
      }
  }
}

module.exports = new BigBlueButton();
