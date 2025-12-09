// app.js - wired UI interactions, toasts, icons, validation, formatting

const $ = (id) => document.getElementById(id);

// main elements
const masterEl = $('master');
const siteEl = $('site');
const usernameEl = $('username');
const passwordEl = $('password');
const searchSiteEl = $('searchSite');

const addBtn = $('addBtn');
const retrieveBtn = $('retrieveBtn');
const listBtn = $('listBtn');
const clearBtn = $('clearBtn');
const exportBtn = $('exportBtn');
const importBtn = $('importBtn');
const importFile = $('importFile');
const outputEl = $('output');
const toastRoot = $('toast-root');
const copyAllBtn = $('copyAllBtn');

function showToast(msg, type = 'info', ms = 3200) {
    const el = document.createElement('div');
    el.className = `toast ${type === 'success' ? 'toast-success' : type === 'error' ? 'toast-error' : 'toast-info'}`;
    el.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px">
      ${type === 'success' ? successIcon() : type === 'error' ? errorIcon() : infoIcon()}
    </div>
    <div style="margin-left:6px">${escapeHtml(msg)}</div>
  `;
    toastRoot.appendChild(el);
    setTimeout(() => {
        el.style.transition = 'opacity .25s ease, transform .25s ease';
        el.style.opacity = '0';
        el.style.transform = 'translateY(-8px)';
        setTimeout(() => el.remove(), 260);
    }, ms);
}

function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

function infoIcon() { return `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"/></svg>` }
function successIcon() { return `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>` }
function errorIcon() { return `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1112 3a9 9 0 019 9z"/></svg>` }

// helper: set loading state on button
function setLoading(btn, on = true) {
    btn.disabled = on;
    if (on) {
        btn.dataset.prev = btn.innerHTML;
        btn.innerHTML = loadingIcon() + 'Working';
        btn.classList.add('opacity-80');
    } else {
        if (btn.dataset.prev) btn.innerHTML = btn.dataset.prev;
        btn.classList.remove('opacity-80');
        delete btn.dataset.prev;
    }
}

function loadingIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 animate-spin inline-block mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M12 4v4m0 8v4M4 12h4m8 0h4" /></svg>`;
}

// add password
addBtn.addEventListener('click', async () => {
    const master = masterEl.value.trim();
    const site = siteEl.value.trim();
    const username = usernameEl.value.trim();
    const password = passwordEl.value;

    if (!master) { showToast('Master password is required', 'error'); return; }
    if (!site) { showToast('Site is required', 'error'); siteEl.focus(); return; }
    if (!password) { showToast('Password to store is required', 'error'); passwordEl.focus(); return; }

    try {
        setLoading(addBtn, true);
        const res = await fetch('/api/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ site, username, password, masterPassword: master })
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ message: res.statusText }));
            showToast('Add failed: ' + (err.message || res.statusText), 'error');
            return;
        }
        const json = await res.json();
        showToast('Saved successfully', 'success');
        // clear password field for safety, keep master
        passwordEl.value = '';
        // refresh list in output
        await listAll(false);
    } catch (e) {
        showToast('Network error: ' + e.message, 'error');
    } finally { setLoading(addBtn, false); }
});

// retrieve
retrieveBtn.addEventListener('click', async () => {
    const master = masterEl.value.trim();
    const site = (searchSiteEl.value || siteEl.value || '').trim();
    if (!master) { showToast('Master password required', 'error'); return; }
    if (!site) { showToast('Site required to retrieve', 'error'); return; }

    try {
        setLoading(retrieveBtn, true);
        const res = await fetch('/api/retrieve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ site, masterPassword: master })
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
            const msg = (data && (data.message || data.error)) || res.statusText;
            showToast('Retrieve failed: ' + msg, 'error');
            return;
        }
        // show structured output with copy button
        renderRetrieved(data);
        showToast('Retrieved', 'success');
    } catch (e) {
        showToast('Network error: ' + e.message, 'error');
    } finally { setLoading(retrieveBtn, false); }
});

function renderRetrieved(obj) {
    if (!obj) { outputEl.innerHTML = 'Empty response'; return; }
    const html = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
      <div>
        <div style="font-weight:600">${escapeHtml(obj.site)}</div>
        <div style="color:#9aa4b2;margin-top:4px">username: ${escapeHtml(obj.username || '')}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <div style="font-family:ui-monospace,monospace;background:#0f172a;color:#e6eef8;padding:8px;border-radius:8px">${escapeHtml(obj.password)}</div>
        <button id="copyBtn" class="text-black inline-flex items-center gap-2 px-3 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50">Copy</button>
      </div>
    </div>
  `;
    outputEl.innerHTML = html;
    const copyBtn = $('copyBtn');
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(obj.password);
            showToast('Password copied to clipboard', 'success');
            // clear clipboard after 10s
            setTimeout(async () => {
                try {
                    await navigator.clipboard.writeText('');
                } catch { }
            }, 10000);
        } catch (err) {
            showToast('Cannot copy: ' + err.message, 'error');
        }
    });
}

// list all entries
listBtn.addEventListener('click', () => listAll(true));

async function listAll(showToasts = true) {
    try {
        setLoading(listBtn, true);
        const res = await fetch('/api/list');
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            showToast('List failed: ' + (err.message || res.statusText), 'error');
            return;
        }
        const data = await res.json();
        renderList(data);
        if (showToasts) showToast('Loaded ' + (data.length || 0) + ' entries', 'info');
    } catch (e) {
        showToast('Network error: ' + e.message, 'error');
    } finally { setLoading(listBtn, false); }
}

function renderList(list) {
    if (!list || list.length === 0) {
        outputEl.innerHTML = '<div style="color:#9aa4b2">No entries found.</div>';
        return;
    }
    // build a table
    const rows = list.map(e => `
    <tr class="odd:bg-slate-950/10">
      <td style="padding:8px;font-weight:600">${escapeHtml(e.site)}</td>
      <td style="padding:8px;color:#9aa4b2">${escapeHtml(e.username || '')}</td>
      <td style="padding:8px;color:#9aa4b2">${new Date(e.createdAt).toLocaleString()}</td>
      <td style="padding:8px">
        <button data-site="${escapeHtml(e.site)}" class="decryptBtn inline-flex items-center gap-2 px-2 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-sm">Decrypt</button>
      </td>
    </tr>
  `).join('');

    outputEl.innerHTML = `
    <div style="overflow:auto">
      <table style="width:100%;border-collapse:collapse">
        <thead style="font-size:13px;color:#94a3b8">
          <tr><th style="text-align:left;padding:8px">Site</th><th style="text-align:left;padding:8px">Username</th><th style="text-align:left;padding:8px">Created</th><th style="text-align:left;padding:8px">Action</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;

    // attach decrypt handlers (client will call /api/retrieve with master)
    const decryptBtns = document.getElementsByClassName('decryptBtn');
    Array.from(decryptBtns).forEach(b => b.addEventListener('click', async (ev) => {
        const site = b.dataset.site;
        const master = masterEl.value.trim();
        if (!master) { showToast('Please enter master password before decrypting', 'error'); return; }
        try {
            setLoading(b, true);
            const res = await fetch('/api/retrieve', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ site, masterPassword: master })
            });
            const data = await res.json().catch(() => null);
            if (!res.ok) {
                const msg = (data && (data.message || data.error)) || res.statusText;
                showToast('Decrypt failed: ' + msg, 'error');
                return;
            }
            renderRetrieved(data);
            showToast('Decrypted', 'success');
        } catch (e) {
            showToast('Network error: ' + e.message, 'error');
        } finally { setLoading(b, false); }
    }));
}

// clear output
clearBtn.addEventListener('click', () => { outputEl.innerHTML = ''; });

// export
exportBtn.addEventListener('click', async () => {
    try {
        const res = await fetch('/api/list');
        if (!res.ok) { showToast('Export failed', 'error'); return; }
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'passwords.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        showToast('Exported JSON', 'success');
    } catch (e) { showToast('Export failed: ' + e.message, 'error'); }
});

// import (preview only)
importBtn.addEventListener('click', () => importFile.click());
importFile.addEventListener('change', async (ev) => {
    const f = ev.target.files[0];
    if (!f) return;
    try {
        const text = await f.text();
        outputEl.innerHTML = `<div style="white-space:pre-wrap">${escapeHtml(text)}</div>`;
        showToast('File loaded (preview only). Server import not implemented.', 'info');
    } catch (e) {
        showToast('Import failed: ' + e.message, 'error');
    } finally {
        importFile.value = '';
    }
});

// copy all list to clipboard (friendly text)
copyAllBtn.addEventListener('click', async () => {
    try {
        const res = await fetch('/api/list');
        if (!res.ok) { showToast('Fetch failed', 'error'); return; }
        const data = await res.json();
        const text = data.map(d => `${d.site}\t${d.username || ''}`).join('\n');
        await navigator.clipboard.writeText(text);
        showToast('List copied to clipboard', 'success');
    } catch (e) { showToast('Copy failed: ' + e.message, 'error'); }
});

// helper icons for toasts are already defined above

// initial load: show nothing - but we can load list automatically
// listAll(false); // uncomment to auto-load on page open
