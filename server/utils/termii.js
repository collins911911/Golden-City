const axios = require('axios');

const toInternational = (phone) => {
  const cleaned = phone.toString().trim().replace(/\s+/g, '');
  if (cleaned.startsWith('234')) return cleaned;
  if (cleaned.startsWith('0'))   return '234' + cleaned.slice(1);
  return '234' + cleaned;
};

const sendSMS = async (phones, message) => {
  const results = [];

  // Detect if message contains emoji or non-GSM characters
  // GSM-7 charset — anything outside this needs unicode
  const gsmChars = /^[\x00-\x7F\u00C0-\u00FF£¥èéùìòÇØøÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ!"#$%&'()*+,\-./:;<=>?@[\\\]^_{|}~€]*$/;
  const needsUnicode = !gsmChars.test(message);
  const smsType = needsUnicode ? 'unicode' : 'plain';

  for (const phone of phones) {
    const internationalPhone = toInternational(phone);
    try {
      const res = await axios.post('https://api.ng.termii.com/api/sms/send', {
        to:      internationalPhone,
        from:    process.env.TERMII_SENDER_ID,
        sms:     message,
        type:    smsType,   // ✅ auto unicode for emojis, plain for regular text
        api_key: process.env.TERMII_API_KEY,
        channel: 'generic',
      });
      console.log(`✅ SMS sent to ${internationalPhone} [${smsType}]:`, res.data?.message || 'OK');
      results.push({ phone: internationalPhone, status: 'success', data: res.data });
    } catch (err) {
      console.error(`❌ SMS failed for ${internationalPhone}:`, err.response?.data || err.message);
      results.push({ phone: internationalPhone, status: 'failed', error: err.message });
    }
  }
  return results;
};

module.exports = { sendSMS };