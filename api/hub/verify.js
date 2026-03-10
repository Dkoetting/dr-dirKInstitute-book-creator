const crypto = require('crypto');

const EXPECTED_APP_ID = process.env.HUB_APP_ID || 'dr-dir-k-institute-book-creator';

function parsePermanentEmails() {
  return new Set(
    (process.env.HUB_PERMANENT_ACCESS_EMAILS || '')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter((value) => value.length > 0),
  );
}

function base64UrlDecode(input) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4 || 4)) % 4);
  return Buffer.from(padded, 'base64').toString('utf8');
}

function verifyHubToken(token) {
  const secret = process.env.HUB_SIGNING_SECRET;
  if (!secret) {
    throw new Error('Missing HUB_SIGNING_SECRET');
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  const [headerPart, payloadPart, signaturePart] = parts;
  const signedData = `${headerPart}.${payloadPart}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedData)
    .digest('base64url');

  const actualSig = signaturePart.replace(/=+$/g, '');
  const expectedSig = expectedSignature.replace(/=+$/g, '');
  const actualBuf = Buffer.from(actualSig, 'utf8');
  const expectedBuf = Buffer.from(expectedSig, 'utf8');

  if (actualBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(actualBuf, expectedBuf)) {
    throw new Error('Invalid token signature');
  }

  const payload = JSON.parse(base64UrlDecode(payloadPart));

  if (!payload.exp || typeof payload.exp !== 'number') {
    throw new Error('Missing token exp');
  }

  if (!payload.appId || payload.appId !== EXPECTED_APP_ID) {
    throw new Error('Token app mismatch');
  }

  const permanentEmails = parsePermanentEmails();
  const email = String(payload.email || '').toLowerCase();
  const isPermanent = permanentEmails.has(email);

  if (!isPermanent && Date.now() >= payload.exp * 1000) {
    throw new Error('Token expired');
  }

  return { ...payload, isPermanent };
}

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.body?.token;
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Invalid request payload' });
  }

  try {
    const payload = verifyHubToken(token);
    return res.status(200).json({
      ok: true,
      session: {
        registrationId: payload.registrationId,
        email: payload.email,
        appId: payload.appId,
        exp: payload.exp,
        iat: payload.iat,
        isPermanent: payload.isPermanent,
      },
    });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired hub token', detail: error.message });
  }
};