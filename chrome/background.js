// background.js — sends magnets directly to Real-Debrid API

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'sendToRD') {
    handleSend(msg.magnet, msg.title).then(sendResponse).catch(err => {
      sendResponse({ ok: false, error: err.message });
    });
    return true;
  }
});

async function handleSend(magnet, title) {
  const result = await chrome.storage.sync.get(['rdApiKey']);

  if (!result.rdApiKey) {
    return { ok: false, error: 'No API key — right-click extension → Options' };
  }

  const headers = {
    'Authorization': 'Bearer ' + result.rdApiKey
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
