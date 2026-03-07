const apiKeyInput = document.getElementById('rdApiKey');
const saveBtn = document.getElementById('saveBtn');
const status = document.getElementById('status');

// Load saved key
chrome.storage.sync.get(['rdApiKey'], (result) => {
  if (result.rdApiKey) apiKeyInput.value = result.rdApiKey;
});

saveBtn.addEventListener('click', () => {
  const key = apiKeyInput.value.trim();

  if (!key) {
    status.textContent = '⚠️ Enter your API key.';
    status.style.color = '#ff6b6b';
    return;
  }

  status.textContent = '⏳ Verifying API key...';
  status.style.color = '#ffd93d';

  fetch('https://api.real-debrid.com/rest/1.0/user', {
    headers: { 'Authorization': 'Bearer ' + key }
  })
    .then(r => {
      if (r.status === 401) throw new Error('Invalid key');
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(data => {
      chrome.storage.sync.set({ rdApiKey: key }, () => {
        status.textContent = '✅ Connected as ' + data.username + ' — ' + data.type + ' (expires ' + data.expiration.split('T')[0] + ')';
        status.style.color = '#7bed9f';
      });
    })
    .catch(() => {
      status.textContent = '❌ Invalid API key — get yours from real-debrid.com/apitoken';
      status.style.color = '#ff6b6b';
    });
});
