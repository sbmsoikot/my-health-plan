#!/usr/bin/env node
/* Encrypts your plaintext plan (data.js) into plan.enc.json so it can be
   safely deployed to a public URL. The data is decrypted in the browser
   only when the correct passphrase is entered.

   Crypto: PBKDF2(SHA-256) key derivation + AES-256-GCM. These match the
   WebCrypto routine in app.js exactly.

   Usage:
     node encrypt.js                          (prompts for a passphrase, hidden)
     HDP_PASS='your phrase' node encrypt.js    (non-interactive, for scripts)

   Re-run this whenever you edit data.js or want to change the passphrase. */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ITER = 200000;          // PBKDF2 iterations (must match app.js)
const DIR = __dirname;

function loadPlan() {
  const code = fs.readFileSync(path.join(DIR, 'data.js'), 'utf8');
  const win = {};
  // data.js only assigns to `window.*`, so run it with a shim.
  new Function('window', code)(win);
  const need = ['PROFILE', 'TARGETS', 'PLAN', 'ACTIVITIES', 'HABITS', 'MARKERS', 'LIFESTYLE'];
  for (const k of need) if (!win[k]) throw new Error('data.js is missing window.' + k);
  return {
    profile: win.PROFILE, targets: win.TARGETS, plan: win.PLAN,
    activities: win.ACTIVITIES, habits: win.HABITS, markers: win.MARKERS, lifestyle: win.LIFESTYLE
  };
}

function hiddenPrompt(question) {
  return new Promise(resolve => {
    process.stdout.write(question);
    const stdin = process.stdin;
    if (stdin.isTTY) stdin.setRawMode(true);
    stdin.resume();
    let buf = '';
    const onData = chunk => {
      for (const ch of chunk.toString('utf8')) {
        const code = ch.charCodeAt(0);
        if (code === 10 || code === 13 || code === 4) {        // Enter / EOT -> done
          if (stdin.isTTY) stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener('data', onData);
          process.stdout.write('\n');
          return resolve(buf);
        } else if (code === 3) {                               // Ctrl-C
          process.exit(1);
        } else if (code === 127 || code === 8) {               // backspace
          buf = buf.slice(0, -1);
        } else {
          buf += ch;
        }
      }
    };
    stdin.on('data', onData);
  });
}

async function getPassphrase() {
  if (process.env.HDP_PASS) return process.env.HDP_PASS;
  const p1 = await hiddenPrompt('Choose a passphrase: ');
  if (p1.length < 6) { console.error('\nPassphrase must be at least 6 characters.'); process.exit(1); }
  const p2 = await hiddenPrompt('Confirm passphrase:  ');
  if (p1 !== p2) { console.error('\nPassphrases do not match.'); process.exit(1); }
  return p1;
}

(async () => {
  const data = loadPlan();
  const pass = await getPassphrase();
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = crypto.pbkdf2Sync(pass, salt, ITER, 32, 'sha256');
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(JSON.stringify(data), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  const blob = {
    v: 1, iter: ITER,
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    ct: Buffer.concat([enc, tag]).toString('base64')   // WebCrypto expects ciphertext||tag
  };
  fs.writeFileSync(path.join(DIR, 'plan.enc.json'), JSON.stringify(blob));
  console.log('✓ Wrote plan.enc.json (' + blob.ct.length + ' base64 chars). Safe to deploy.');
})();
