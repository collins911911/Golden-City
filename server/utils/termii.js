const axios = require('axios');

// 08012345678 / +2348012345678 / 2348012345678 → 2348012345678
const toInternational = (phone) => {
  const cleaned = phone.toString().trim().replace(/[\s+\-()]/g, '');
  if (cleaned.startsWith('234')) return cleaned;
  if (cleaned.startsWith('0'))   return '234' + cleaned.slice(1);
  return '234' + cleaned;
};

// GSM-7 characters; anything else (emoji etc.) must be sent as unicode
const GSM = /^[\x00-\x7FÀ-ÿ£¥èéùìòÇØøÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ€]*$/;

const sendSMS = async (phones, message) => {
  const smsType = GSM.test(message) ? 'plain' : 'unicode';

  // Without an API key (local tests), log instead of sending
  if (!process.env.TERMII_API_KEY) {
    console.log(`📵 [SMS not sent — no TERMII_API_KEY] to ${phones.length} number(s): ${message.slice(0, 60)}...`);
    return phones.map((p) => ({ phone: toInternational(p), status: 'skipped' }));
  }

  // Send in small parallel batches — much faster than one-by-one
  const results  = [];
  const BATCH    = 10;
  for (let i = 0; i < phones.length; i += BATCH) {
    const batch = phones.slice(i, i + BATCH);
    const out = await Promise.all(batch.map(async (phone) => {
      const to = toInternational(phone);
      try {
        const res = await axios.post('https://api.ng.termii.com/api/sms/send', {
          to,
          from:    process.env.TERMII_SENDER_ID,
          sms:     message,
          type:    smsType,
          api_key: process.env.TERMII_API_KEY,
          channel: 'generic',
        }, { timeout: 15000 });
        return { phone: to, status: 'success', data: res.data };
      } catch (err) {
        console.error(`❌ SMS failed for ${to}:`, err.response?.data || err.message);
        return { phone: to, status: 'failed', error: err.message };
      }
    }));
    results.push(...out);
  }
  console.log(`✉️  SMS: ${results.filter((r) => r.status === 'success').length}/${phones.length} sent [${smsType}]`);
  return results;
};

module.exports = { sendSMS, toInternational };
