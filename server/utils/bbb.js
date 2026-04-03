const crypto = require('crypto');
const axios = require('axios');
const xml2js = require('xml2js');

class BigBlueButton {
  constructor() {
    this.url = process.env.BBB_URL || 'https://test-install.blindsidenetworks.com/bigbluebutton/api';
    this.secret = process.env.BBB_SECRET || '8cd8ef52e8e101574e400365b55e11a6';
    this.parser = new xml2js.Parser({ explicitArray: false });
  }

  generateChecksum(apiMethod, query) {
    return crypto
      .createHash('sha1')
      .update(apiMethod + query + this.secret)
      .digest('hex');
  }

  async createMeeting(meetingId, name, attendeePW, moderatorPW) {
    const query = `name=${encodeURIComponent(name)}&meetingID=${meetingId}&attendeePW=${attendeePW}&moderatorPW=${moderatorPW}&record=true`;
    const checksum = this.generateChecksum('create', query);
    const fullUrl = `${this.url}/create?${query}&checksum=${checksum}`;

    try {
      const response = await axios.get(fullUrl);
      const result = await this.parser.parseStringPromise(response.data);
      return result.response;
    } catch (error) {
      console.error('BBB Create Meeting Error:', error.message);
      throw error;
    }
  }

  getJoinUrl(meetingId, fullName, password) {
    const query = `meetingID=${meetingId}&fullName=${encodeURIComponent(fullName)}&password=${password}`;
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
      return result.response;
    } catch (error) {
      console.error('BBB Meeting Info Error:', error.message);
      throw error;
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
