import { sha256 } from 'js-sha256';

export default function Network(self) {
  this.online = () => this.requestAPI({ action: 'online' });

  this.requestAPI = (params) => {
    const seed = Math.random().toString(36).slice(2);
    const secret = sha256.hmac(API_KEY, seed);
    return fetch(URI_PREFIX + "/api", {
      method: 'POST',
      body: JSON.stringify({ ...params, uid: UID, secret, seed }),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => res.json());
  }

  this.sendResults = (subject_id, results) => {
    this.requestAPI({ action: 'update-results', subject_id, results });
  }

  this.isPaid = (data) => this.requestAPI({ action: 'is-paid', ...data });

  this.getSkills = (subject_id) => this.requestAPI({ action: 'get-skills', subject_id });

  this.getStats = (subject_id) => this.requestAPI({ action: 'get-stats', subject_id });

  this.getFreqs = (subject_id) => this.requestAPI({ action: 'get-freqs', subject_id });
}