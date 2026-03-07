// ── Tab switching with persistence ──
function showPanel(name) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'))
    const tab = document.querySelector(`.tab[data-panel="${name}"]`)
    if (tab) tab.classList.add('active')
    const panel = document.getElementById('panel-' + name)
    if (panel) panel.classList.add('active')
    localStorage.setItem('tab_linkLoom', name)
}

document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => showPanel(tab.dataset.panel))
})

// Restore last active tab
;(() => {
    const saved = localStorage.getItem('tab_linkLoom')
    if (saved && document.querySelector(`.tab[data-panel="${saved}"]`)) {
        showPanel(saved)
    }
})()

// ── Char count ──
function updateCharCount() {
    const len = document.getElementById('urlInput').value.length
    document.getElementById('charCount').textContent = len + ' Zeichen'
}

// ── Encode / Decode ──
function encodeURL() {
    const val = document.getElementById('urlInput').value
    document.getElementById('encodeResult').value = encodeURIComponent(val)
}

function decodeURL() {
    const val = document.getElementById('urlInput').value
    try {
        document.getElementById('encodeResult').value = decodeURIComponent(val)
    } catch (e) {
        document.getElementById('encodeResult').value = t('linkLoom.decode_error')
    }
}

function encodeAll() {
    const val = document.getElementById('urlInput').value
    document.getElementById('encodeResult').value = encodeURIComponent(val).replace(/%20/g, '+')
}

// ── URL Parser ──
function parseURL() {
    const val = document.getElementById('urlInput').value.trim()
    if (!val) { showToast(t('linkLoom.toast_no_url')); return; }

    let url
    try {
        url = new URL(val.startsWith('http') ? val : 'https://' + val)
    } catch (e) {
        document.getElementById('parseOutput').innerHTML = '<p style="color: var(--accent2);">' + t('linkLoom.parse_invalid') + '</p>'
        return
    }

    const parts = [
        [t('linkLoom.parse_protocol'), url.protocol.replace(':', '')],
        [t('linkLoom.parse_host'), url.hostname],
        [t('linkLoom.parse_port'), url.port || '—'],
        [t('linkLoom.parse_path'), url.pathname],
        [t('linkLoom.parse_query'), url.search || '—'],
        [t('linkLoom.parse_fragment'), url.hash || '—'],
        [t('linkLoom.parse_origin'), url.origin],
    ]

    let html = '<table class="parse-table">'
    parts.forEach(([k, v]) => {
        const cls = v === '—' ? ' class="parse-empty"' : ''
        html += `<tr><td>${k}</td><td${cls}>${escapeHtml(v)}</td></tr>`
    })
    html += '</table>'

    // Query params
    if (url.searchParams && [...url.searchParams].length > 0) {
        html += '<label class="input-label" style="margin-top:20px; display:block;">' + t('linkLoom.label_query_params') + '</label>'
        html += '<div class="param-grid">'
        url.searchParams.forEach((v, k) => {
            html += `<div class="param-row"><span class="param-key">${escapeHtml(k)}</span><span class="param-eq">=</span><span class="param-val">${escapeHtml(v)}</span></div>`
        })
        html += '</div>'
    }

    document.getElementById('parseOutput').innerHTML = html
}

function copyParseResult(btn) {
    const el = document.getElementById('parseOutput')
    copyText(el.innerText, btn)
}

// ── Base64 ──
function base64Encode() {
    const val = document.getElementById('urlInput').value
    try {
        document.getElementById('base64Result').value = btoa(unescape(encodeURIComponent(val)))
    } catch (e) {
        document.getElementById('base64Result').value = t('linkLoom.b64_error_encode')
    }
}

function base64Decode() {
    const val = document.getElementById('urlInput').value
    try {
        document.getElementById('base64Result').value = decodeURIComponent(escape(atob(val)))
    } catch (e) {
        document.getElementById('base64Result').value = t('linkLoom.b64_error_decode')
    }
}

// ── UTM Builder ──
function buildUTM() {
    const base = document.getElementById('utmUrl').value.trim()
    const source = document.getElementById('utmSource').value.trim()
    const medium = document.getElementById('utmMedium').value.trim()
    const campaign = document.getElementById('utmCampaign').value.trim()
    const term = document.getElementById('utmTerm').value.trim()
    const content = document.getElementById('utmContent').value.trim()

    if (!base) {
        document.getElementById('utmPreview').textContent = t('linkLoom.utm_empty')
        return
    }

    const params = []
    if (source) params.push('utm_source=' + encodeURIComponent(source))
    if (medium) params.push('utm_medium=' + encodeURIComponent(medium))
    if (campaign) params.push('utm_campaign=' + encodeURIComponent(campaign))
    if (term) params.push('utm_term=' + encodeURIComponent(term))
    if (content) params.push('utm_content=' + encodeURIComponent(content))

    const sep = base.includes('?') ? '&' : '?'
    const result = params.length ? base + sep + params.join('&') : base
    document.getElementById('utmPreview').textContent = result
}

// ── Bulk Mode ──
function updateBulkStats() {
    const lines = document.getElementById('bulkInput').value.split('\n').filter(l => l.trim())
    document.getElementById('bulkStats').innerHTML = `<span class="stat-badge"><span class="num">${lines.length}</span> URLs</span>`
}

function bulkEncode() {
    const lines = document.getElementById('bulkInput').value.split('\n')
    document.getElementById('bulkResult').value = lines.map(l => l.trim() ? encodeURI(l.trim()) : '').join('\n')
}

function bulkDecode() {
    const lines = document.getElementById('bulkInput').value.split('\n')
    document.getElementById('bulkResult').value = lines.map(l => {
        try { return l.trim() ? decodeURI(l.trim()) : '' }
        catch (e) { return '⚠ ' + l.trim() }
    }).join('\n')
}

// ── Helpers ──
function escapeHtml(str) {
    const d = document.createElement('div')
    d.textContent = str
    return d.innerHTML
}

function copyResult(id, btn) {
    copyText(document.getElementById(id).value, btn)
}

function copyText(text, btn) {
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {
        if (btn) {
            btn.classList.add('copied')
            btn.innerHTML = t('common.copied')
            setTimeout(() => {
                btn.classList.remove('copied')
                btn.innerHTML = t('common.copy')
            }, 1800)
        }
        showToast(t('common.clipboard'))
    })
}

function showToast(msg) {
    const t = document.getElementById('toast')
    t.textContent = msg
    t.classList.add('show')
    setTimeout(() => t.classList.remove('show'), 2200)
}

// ── Keyboard shortcut ──
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const active = document.querySelector('.tab.active')
        if (active.dataset.panel === 'encode') encodeURL()
        else if (active.dataset.panel === 'parse') parseURL()
        else if (active.dataset.panel === 'base64') base64Encode()
    }
})
