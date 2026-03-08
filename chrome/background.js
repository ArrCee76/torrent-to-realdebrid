// background.js — sends magnets directly to Real-Debrid API with cache check
// Cache check works by: add magnet → select files → check status → if not cached, delete it

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'checkCache') {
    handleCacheCheck(msg.magnet, msg.hash).then(sendResponse).catch(err => {
      sendResponse({ ok: false, error: err.message });
    });
    return true;
  }

  if (msg.action === 'sendToRD') {
    handleSend(msg.magnet, msg.title).then(sendResponse).catch(err => {
      sendResponse({ ok: false, error: err.message });
    });
    return true;
  }
});

async function getApiKey() {
  const result = await chrome.storage.sync.get(['rdApiKey']);
  if (!result.rdApiKey) throw new Error('No API key — right-click extension → Options');
  return result.rdApiKey;
}

async function handleCacheCheck(magnet, hash) {
  const apiKey = await getApiKey();
  const headers = { 'Authorization': 'Bearer ' + apiKey };

  // Step 1: Add magnet
  const addRes = await fetch('https://api.real-debrid.com/rest/1.0/torrents/addMagnet', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'magnet=' + encodeURIComponent(magnet)
  });

  if (addRes.status === 401) return { ok: false, error: 'Invalid API key' };
  if (!addRes.ok) return { ok: false, error: 'Cache check failed (HTTP ' + addRes.status + ')' };

  const addData = await addRes.json();
  const torrentId = addData.id;
  if (!torrentId) return { ok: false, error: 'No torrent ID returned' };

  // Step 2: Select all files
  const selectRes = await fetch('https://api.real-debrid.com/rest/1.0/torrents/selectFiles/' + torrentId, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'files=all'
  });

  if (!selectRes.ok) {
    // Clean up — delete the torrent we just added
    await fetch('https://api.real-debrid.com/rest/1.0/torrents/delete/' + torrentId, {
      method: 'DELETE', headers
    });
    return { ok: false, error: 'Failed to select files' };
  }

  // Step 3: Wait a moment then check status
  await new Promise(r => setTimeout(r, 1500));

  const infoRes = await fetch('https://api.real-debrid.com/rest/1.0/torrents/info/' + torrentId, {
    headers
  });

  if (!infoRes.ok) {
    await fetch('https://api.real-debrid.com/rest/1.0/torrents/delete/' + torrentId, {
      method: 'DELETE', headers
    });
    return { ok: false, error: 'Could not check torrent status' };
  }

  const info = await infoRes.json();

  // If status is "downloaded" it was cached and instantly available
  if (info.status === 'downloaded') {
    // Delete it — we were only checking, user hasn't clicked Send yet
    await fetch('https://api.real-debrid.com/rest/1.0/torrents/delete/' + torrentId, {
      method: 'DELETE', headers
    });
    return { ok: true, cached: true };
  }

  // Not cached — delete it so it doesn't sit in their RD queue
  await fetch('https://api.real-debrid.com/rest/1.0/torrents/delete/' + torrentId, {
    method: 'DELETE', headers
  });
  return { ok: true, cached: false };
}

async function handleSend(magnet, title) {
  const apiKey = await getApiKey();

  const headers = {
    'Authorization': 'Bearer ' + apiKey
  };

  // Step 1: Add magnet to Real-Debrid
  const addRes = await fetch('https://api.real-debrid.com/rest/1.0/torrents/addMagnet', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'magnet=' + encodeURIComponent(magnet)
  });

  if (addRes.status === 401) return { ok: false, error: 'Invalid API key' };
  if (!addRes.ok) return { ok: false, error: 'Failed to add magnet (HTTP ' + addRes.status + ')' };

  const addData = await addRes.json();
  const torrentId = addData.id;

  if (!torrentId) return { ok: false, error: 'No torrent ID returned' };

  // Step 2: Select all files for download
  const selectRes = await fetch('https://api.real-debrid.com/rest/1.0/torrents/selectFiles/' + torrentId, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'files=all'
  });

  if (!selectRes.ok) return { ok: false, error: 'Failed to select files (HTTP ' + selectRes.status + ')' };

  return { ok: true, title: title };
}
