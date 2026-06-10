const express = require('express');
const crypto = require('crypto');
const app = express();

// Same secret
const SECRET = 'my-github-secret'; // must match what you set in GitHub

//Testing started...
// Raw body needed for signature verification
app.use(express.json({
  verify: (req, res, buf) => { req.rawBody = buf; }
}));

function verifySignature(req) {
  const sig = req.headers['x-hub-signature-256'];
  if (!sig) return false;
  const hmac = crypto.createHmac('sha256', SECRET);
  hmac.update(req.rawBody);
  const digest = 'sha256=' + hmac.digest('hex');
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(digest));
}

app.post('/webhook', (req, res) => {
  if (!verifySignature(req)) {
    console.log('❌ Invalid signature');
    return res.status(401).send('Unauthorized');
  }

  const event = req.headers['x-github-event'];
  console.log(`✅ Event received: ${event}`);
  console.log(JSON.stringify(req.body, null, 2));

  res.status(200).send('OK');
});

app.listen(3000, () => console.log('🚀 Server running on http://localhost:3000'));