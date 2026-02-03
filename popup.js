document.addEventListener('DOMContentLoaded', () => {
  const statusEl = document.getElementById('status');
  const btn = document.getElementById('scanBtn');

  function setStatus(msg, isError = false) {
    if (statusEl) {
      statusEl.textContent = msg;
      statusEl.style.color = isError ? '#A11A1A' : 'rgba(0, 66, 175, 0.6)';
    }
  }

  setStatus('Ready');

  try {
    if (!btn) throw new Error('Scan button not found');

    btn.addEventListener('click', async () => {
      try {
        setStatus('Requesting active tab...');
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const tab = tabs && tabs[0];
        if (!tab) {
          setStatus('No active tab found.', true);
          return;
        }

        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
          setStatus('Collecting data...');

          async function fetchSkeletonData(attempts = 5, delay = 200) {
            for (let i = 0; i < attempts; i++) {
              try {
                const res = await chrome.scripting.executeScript({
                  target: { tabId: tab.id },
                  func: () => { return window.__skeletonizerData || null; }
                });
                const data = res && res[0] && res[0].result;
                if (data) return data;
              } catch (e) { }
              await new Promise(r => setTimeout(r, delay));
            }
            return null;
          }

          const pageData = await fetchSkeletonData();
          if (!pageData) {
            setStatus('No data found — page blocked?', true);
            return;
          }

          setStatus('Analysis complete');
        } catch (e) {
          setStatus('Injection failed: ' + (e.message || e), true);
          return;
        }

        const originalText = btn.innerText;
        btn.innerText = 'ANALYZING...';
        btn.style.backgroundColor = 'rgb(0, 66, 175)';
        btn.style.color = 'rgb(255, 252, 245)';

        setTimeout(() => {
          btn.innerText = 'DONE';
          setTimeout(() => {
            btn.innerText = originalText;
            btn.style.backgroundColor = 'transparent';
            btn.style.color = 'rgb(0, 66, 175)';
            setStatus('Download successful');
          }, 3000);
        }, 1000);
      } catch (err) {
        setStatus('Error: ' + (err.message || err), true);
      }
    });
  } catch (err) {
    setStatus('Initialization failed: ' + (err.message || err), true);
  }
});