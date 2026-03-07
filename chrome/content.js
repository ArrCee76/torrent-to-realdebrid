// Torrent to Real-Debrid — AudioBookBay content script

(function () {
  'use strict';

  if (document.getElementById('abb-magnet-banner')) return;

  function findInfoHash() {
    const match = document.body.innerText.match(/Info Hash:\s*([a-fA-F0-9]{40})/i);
    return match ? match[1].toLowerCase() : null;
  }

  function findTrackers() {
    const trackers = [];
    (document.body.innerText.match(/(?:udp|http|https):\/\/[^\s]+/g) || []).forEach(t => {
      const clean = t.replace(/[,;]$/, '');
      if (clean.includes('announce') || clean.includes('tracker')) trackers.push(clean);
    });
    return [...new Set(trackers)];
  }

  function findTitle() {
    const h1 = document.querySelector('h1');
    if (h1) return h1.textContent.trim();
    return document.title.replace(/ - AudioBookBay.*$/i, '').trim() || 'Unknown Audiobook';
  }

  const hash = findInfoHash();
  if (!hash) return;

  const title = findTitle();
  const trackers = findTrackers();
  let magnet = 'magnet:?xt=urn:btih:' + hash + '&dn=' + encodeURIComponent(title);
  trackers.forEach(t => { magnet += '&tr=' + encodeURIComponent(t); });

  const banner = document.createElement('div');
  banner.id = 'abb-magnet-banner';

  const titleEl = document.createElement('span');
  titleEl.className = 'abb-title';
  titleEl.textContent = '🎧 ' + title;

  const statusEl = document.createElement('div');
  statusEl.className = 'abb-status';

  const btnRow = document.createElement('div');
  btnRow.className = 'abb-btn-row';

  const magnetBtn = document.createElement('button');
  magnetBtn.className = 'abb-btn abb-btn-magnet';
  magnetBtn.textContent = 'Get Magnet';
  magnetBtn.addEventListener('click', () => { window.location.href = magnet; });

  const copyBtn = document.createElement('button');
  copyBtn.className = 'abb-btn abb-btn-copy';
  copyBtn.textContent = 'Copy';
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(magnet).then(() => {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
    });
  });

  const rdBtn = document.createElement('button');
  rdBtn.className = 'abb-btn abb-btn-rd';
  rdBtn.textContent = '📚 Send to Real-Debrid';
  rdBtn.addEventListener('click', () => {
    rdBtn.disabled = true;
    statusEl.textContent = '⏳ Sending to Real-Debrid...';
    statusEl.style.color = '#ffd93d';
    chrome.runtime.sendMessage(
      { action: 'sendToRD', magnet: magnet, title: title, category: 'audiobooks' },
      (response) => {
        if (chrome.runtime.lastError) {
          statusEl.textContent = '❌ ' + chrome.runtime.lastError.message;
          statusEl.style.color = '#ff6b6b';
        } else if (response && response.ok) {
          statusEl.textContent = '✅ "' + response.title + '" added to Real-Debrid!';
          statusEl.style.color = '#7bed9f';
        } else {
          statusEl.textContent = '❌ ' + (response ? response.error : 'No response — set up your API key in extension settings');
          statusEl.style.color = '#ff6b6b';
        }
        rdBtn.disabled = false;
      }
    );
  });

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'abb-btn abb-btn-cancel';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', () => { banner.remove(); });

  btnRow.appendChild(magnetBtn);
  btnRow.appendChild(copyBtn);
  btnRow.appendChild(rdBtn);
  btnRow.appendChild(cancelBtn);

  banner.appendChild(titleEl);
  banner.appendChild(btnRow);
  banner.appendChild(statusEl);
  document.body.prepend(banner);
})();
