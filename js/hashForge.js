// ══════════════════════════════════
//  PHP password_hash() Ersatz (clientseitig via bcryptjs)
// ══════════════════════════════════
async function phpHash() {
    const password = document.getElementById('phpPassword').value
    const algorithm = document.getElementById('phpAlgo').value

    if (!password) { showToast('Bitte einen Text eingeben'); return; }

    // Clientseitig steht nur bcrypt zur Verfügung
    // Argon2 ist ohne Server nicht nativ möglich - wir verwenden bcrypt als Fallback
    let algoNote = algorithm
    if (algorithm === 'PASSWORD_ARGON2I' || algorithm === 'PASSWORD_ARGON2ID') {
        algoNote = algorithm + ' (Fallback: bcrypt, da clientseitig)'
    }

    try {
        const salt = dcodeIO.bcrypt.genSaltSync(10)
        const hash = dcodeIO.bcrypt.hashSync(password, salt)

        document.getElementById('phpEmptyState').style.display = 'none'
        document.getElementById('phpResultWrap').style.display = 'block'
        document.getElementById('phpResult').value = hash
        document.getElementById('phpMeta').innerHTML =
            '<span class="meta-badge">Algorithmus <span class="val">' + esc(algoNote) + '</span></span>' +
            '<span class="meta-badge">Länge <span class="val">' + hash.length + ' Zeichen</span></span>'
    } catch (e) {
        showToast('Fehler beim Hashing: ' + e.message)
    }
}

// ── Load PHP result on page load ──
const phpResultData = null
if (phpResultData) {
    showPanel('phash')
    document.getElementById('phpEmptyState').style.display = 'none'
    document.getElementById('phpResultWrap').style.display = 'block'
    document.getElementById('phpResult').value = phpResultData.hash
    document.getElementById('phpPassword').value = phpResultData.input
    document.getElementById('phpAlgo').value = phpResultData.algo
    document.getElementById('phpMeta').innerHTML =
        `<span class="meta-badge">Algorithmus <span class="val">${esc(phpResultData.algo)}</span></span>` +
        `<span class="meta-badge">Länge <span class="val">${phpResultData.hash.length} Zeichen</span></span>`
}

// Tab switching with persistence
function showPanel(name) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'))
    const tab = document.querySelector(`.tab[data-panel="${name}"]`)
    if (tab) tab.classList.add('active')
    const panel = document.getElementById('panel-' + name)
    if (panel) panel.classList.add('active')
    localStorage.setItem('tab_hashForge', name)
}

document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => showPanel(tab.dataset.panel))
})

// Restore last active tab
;(() => {
    const saved = localStorage.getItem('tab_hashForge')
    if (saved && document.querySelector(`.tab[data-panel="${saved}"]`)) {
        showPanel(saved)
    }
})()

// ══════════════════════════════════
//  SHA Hashing (Web Crypto API)
// ══════════════════════════════════
async function computeSHA() {
    const text = document.getElementById('shaInput').value
    if (!text) { showToast('Bitte einen Text eingeben'); return; }
    const algo = document.getElementById('shaAlgo').value
    const data = new TextEncoder().encode(text)
    const hashBuffer = await crypto.subtle.digest(algo, data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    document.getElementById('shaEmptyState').style.display = 'none'
    document.getElementById('shaResultWrap').style.display = 'block'
    document.getElementById('shaResult').value = hashHex
    document.getElementById('shaMeta').innerHTML =
        `<span class="meta-badge">Algorithmus <span class="val">${algo}</span></span>` +
        `<span class="meta-badge">Länge <span class="val">${hashHex.length} Zeichen</span></span>` +
        `<span class="meta-badge">Bits <span class="val">${hashArray.length * 8}</span></span>`
}

document.getElementById('shaInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); computeSHA(); }
})

// ══════════════════════════════════
//  Passwort-Stärketest
// ══════════════════════════════════
function analyzeStrength() {
    const pw = document.getElementById('strengthInput').value
    const wrap = document.getElementById('strengthResultWrap')
    const empty = document.getElementById('strengthEmptyState')

    if (!pw) { wrap.style.display = 'none'; empty.style.display = 'block'; return; }
    wrap.style.display = 'block'
    empty.style.display = 'none'

    // Criteria checks
    const criteria = [
        { label: 'Mindestens 8 Zeichen',          pass: pw.length >= 8 },
        { label: 'Mindestens 12 Zeichen',          pass: pw.length >= 12 },
        { label: 'Mindestens 16 Zeichen',          pass: pw.length >= 16 },
        { label: 'Großbuchstaben (A–Z)',           pass: /[A-Z]/.test(pw) },
        { label: 'Kleinbuchstaben (a–z)',           pass: /[a-z]/.test(pw) },
        { label: 'Ziffern (0–9)',                   pass: /[0-9]/.test(pw) },
        { label: 'Sonderzeichen (!@#$…)',           pass: /[^A-Za-z0-9]/.test(pw) },
        { label: 'Keine 3+ gleichen Zeichen in Folge', pass: !/(.)\1{2,}/.test(pw) },
        { label: 'Keine einfache Sequenz (abc, 123)', pass: !hasSequence(pw) },
        { label: 'Kein häufiges Passwort',           pass: !isCommonPassword(pw) },
    ]

    const grid = document.getElementById('criteriaGrid')
    grid.innerHTML = criteria.map(c =>
        `<div class="criteria-row ${c.pass ? 'pass' : 'fail'}">
                <div class="criteria-icon">${c.pass ? '✓' : '✗'}</div>
                <span class="criteria-text">${c.label}</span>
            </div>`
    ).join('')

    // Score
    const passed = criteria.filter(c => c.pass).length
    const score = Math.round((passed / criteria.length) * 100)

    // Entropy
    let poolSize = 0
    if (/[a-z]/.test(pw)) poolSize += 26
    if (/[A-Z]/.test(pw)) poolSize += 26
    if (/[0-9]/.test(pw)) poolSize += 10
    if (/[^A-Za-z0-9]/.test(pw)) poolSize += 33
    const entropy = poolSize > 0 ? Math.log2(poolSize) * pw.length : 0

    // Strength level
    let pct, color, label
    if (score < 30)      { pct = 15;  color = '#ef4444'; label = 'Sehr schwach'; }
    else if (score < 50) { pct = 35;  color = '#ff2d75'; label = 'Schwach'; }
    else if (score < 70) { pct = 55;  color = '#f59e0b'; label = 'Mittel'; }
    else if (score < 90) { pct = 78;  color = '#22c55e'; label = 'Stark'; }
    else                 { pct = 100; color = '#00e5ff'; label = 'Sehr stark'; }

    document.getElementById('sTestFill').style.width = pct + '%'
    document.getElementById('sTestFill').style.background = color
    document.getElementById('sTestLabel').innerHTML = `<span style="color:${color}">${label}</span>`
    document.getElementById('sTestScore').innerHTML = `<span style="color:${color}">${score}%</span>`

    // Crack time estimate
    const guessesPerSec = 10e9 // 10 billion (modern GPU)
    const combinations = Math.pow(poolSize || 1, pw.length)
    const seconds = combinations / guessesPerSec / 2
    document.getElementById('sTestTime').innerHTML = `<span style="color:${color}">${formatCrackTime(seconds)}</span>`

    document.getElementById('strengthMeta').innerHTML =
        `<span class="meta-badge">Länge <span class="val">${pw.length}</span></span>` +
        `<span class="meta-badge">Entropie <span class="val">${Math.round(entropy)} Bit</span></span>` +
        `<span class="meta-badge">Pool <span class="val">${poolSize} Zeichen</span></span>` +
        `<span class="meta-badge">Kriterien <span class="val">${passed}/${criteria.length}</span></span>`
}

function hasSequence(pw) {
    const lower = pw.toLowerCase()
    const seqs = ['abcdefghijklmnopqrstuvwxyz', '01234567890', 'qwertzuiop', 'asdfghjkl', 'yxcvbnm', 'qwertyuiop']
    for (const seq of seqs) {
        for (let i = 0; i <= seq.length - 3; i++) {
            if (lower.includes(seq.substring(i, i + 3))) return true
        }
    }
    return false
}

function isCommonPassword(pw) {
    const common = ['password','123456','12345678','qwerty','abc123','monkey','1234567','letmein',
        'trustno1','dragon','baseball','master','login','admin','passwort','hallo','willkommen',
        'test1234','password1','123456789','1234567890','000000','1q2w3e4r']
    return common.includes(pw.toLowerCase())
}

function formatCrackTime(sec) {
    if (!isFinite(sec) || sec > 1e18) return '∞ (unknackbar)'
    if (sec < 0.001) return 'Sofort'
    if (sec < 1) return '< 1 Sekunde'
    if (sec < 60) return Math.round(sec) + ' Sekunden'
    if (sec < 3600) return Math.round(sec / 60) + ' Minuten'
    if (sec < 86400) return Math.round(sec / 3600) + ' Stunden'
    if (sec < 86400 * 365) return Math.round(sec / 86400) + ' Tage'
    if (sec < 86400 * 365 * 1000) return Math.round(sec / (86400 * 365)) + ' Jahre'
    if (sec < 86400 * 365 * 1e6) return Math.round(sec / (86400 * 365 * 1000)) + ' Tsd. Jahre'
    if (sec < 86400 * 365 * 1e9) return Math.round(sec / (86400 * 365 * 1e6)) + ' Mio. Jahre'
    if (sec < 86400 * 365 * 1e12) return Math.round(sec / (86400 * 365 * 1e9)) + ' Mrd. Jahre'
    return '∞ (unknackbar)'
}

// ══════════════════════════════════
//  Passwort-Generator
// ══════════════════════════════════
function updateLengthDisplay() {
    document.getElementById('genLengthVal').textContent = document.getElementById('genLength').value
}

function toggleOpt(el) {
    el.classList.toggle('active')
    if (!document.querySelectorAll('.gen-option.active').length) {
        el.classList.add('active')
        showToast('Mindestens eine Option muss aktiv sein')
    }
}

function generatePassword() {
    const length = parseInt(document.getElementById('genLength').value)
    const opts = document.querySelectorAll('.gen-option.active')
    let charset = ''
    opts.forEach(o => {
        const t = o.dataset.opt
        if (t === 'upper') charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        if (t === 'lower') charset += 'abcdefghijklmnopqrstuvwxyz'
        if (t === 'digits') charset += '0123456789'
        if (t === 'special') charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'
    })
    if (!charset) { showToast('Keine Zeichensätze ausgewählt'); return; }

    const array = new Uint32Array(length)
    crypto.getRandomValues(array)
    let pw = ''
    for (let i = 0; i < length; i++) pw += charset[array[i] % charset.length];

    document.getElementById('genEmptyState').style.display = 'none'
    document.getElementById('genResultWrap').style.display = 'block'
    document.getElementById('genOutput').textContent = pw

    const poolSize = charset.length
    const entropy = Math.log2(poolSize) * length
    let pct, color, label
    if (entropy < 40)      { pct = 20;  color = '#ef4444'; label = 'Sehr schwach'; }
    else if (entropy < 60) { pct = 40;  color = '#ff2d75'; label = 'Schwach'; }
    else if (entropy < 80) { pct = 60;  color = '#f59e0b'; label = 'Mittel'; }
    else if (entropy < 100){ pct = 80;  color = '#22c55e'; label = 'Stark'; }
    else                   { pct = 100; color = '#00e5ff'; label = 'Sehr stark'; }

    document.getElementById('genStrengthFill').style.width = pct + '%'
    document.getElementById('genStrengthFill').style.background = color
    document.getElementById('genStrengthLabel').innerHTML = `<span style="color:${color}">${label}</span>`
    document.getElementById('genStrengthScore').innerHTML = `<span style="color:${color}">${Math.round(entropy)} Bit</span>`
    document.getElementById('genMeta').innerHTML =
        `<span class="meta-badge">Länge <span class="val">${length}</span></span>` +
        `<span class="meta-badge">Pool <span class="val">${poolSize} Zeichen</span></span>` +
        `<span class="meta-badge">Entropie <span class="val">${Math.round(entropy)} Bit</span></span>`
}

// ══════════════════════════════════
//  Hash Vergleich mit Diff
// ══════════════════════════════════
function compareHashes() {
    const h1 = document.getElementById('verifyHash1').value.trim()
    const h2 = document.getElementById('verifyHash2').value.trim()
    if (!h1 || !h2) { showToast('Bitte beide Hash-Felder ausfüllen'); return; }

    document.getElementById('verifyEmptyState').style.display = 'none'
    document.getElementById('verifyResultWrap').style.display = 'block'

    const maxLen = Math.max(h1.length, h2.length)
    let diffCount = 0

    // Build char-by-char diff for hash 1
    let diff1Html = ''
    for (let i = 0; i < h1.length; i++) {
        if (i < h2.length) {
            if (h1[i] === h2[i]) {
                diff1Html += `<span class="diff-char-match">${esc(h1[i])}</span>`
            } else {
                diff1Html += `<span class="diff-char-diff">${esc(h1[i])}</span>`
                diffCount++
            }
        } else {
            diff1Html += `<span class="diff-char-extra">${esc(h1[i])}</span>`
            diffCount++
        }
    }

    // Build char-by-char diff for hash 2
    let diff2Html = ''
    for (let i = 0; i < h2.length; i++) {
        if (i < h1.length) {
            if (h2[i] === h1[i]) {
                diff2Html += `<span class="diff-char-match">${esc(h2[i])}</span>`
            } else {
                diff2Html += `<span class="diff-char-diff">${esc(h2[i])}</span>`
            }
        } else {
            diff2Html += `<span class="diff-char-extra">${esc(h2[i])}</span>`
            diffCount++
        }
    }

    const isMatch = h1 === h2

    document.getElementById('verifySummary').innerHTML = isMatch
        ? `<div class="verify-summary match"><span class="verify-icon">✓</span> Die Hashes stimmen vollständig überein</div>`
        : `<div class="verify-summary no-match"><span class="verify-icon">✗</span> Keine Übereinstimmung — ${diffCount} abweichende Zeichen</div>`

    if (!isMatch) {
        document.getElementById('verifyDiff').innerHTML =
            `<div class="diff-display"><span class="diff-label">Hash 1</span>${diff1Html}</div>` +
            `<div class="diff-display"><span class="diff-label">Hash 2</span>${diff2Html}</div>`
    } else {
        document.getElementById('verifyDiff').innerHTML = ''
    }

    const matchPct = maxLen > 0 ? Math.round(((maxLen - diffCount) / maxLen) * 100) : 100
    document.getElementById('verifyMeta').innerHTML =
        `<span class="meta-badge">Hash 1 <span class="val">${h1.length} Zeichen</span></span>` +
        `<span class="meta-badge">Hash 2 <span class="val">${h2.length} Zeichen</span></span>` +
        `<span class="meta-badge">Übereinstimmung <span class="val">${matchPct}%</span></span>` +
        `<span class="meta-badge">Differenzen <span class="val">${diffCount}</span></span>`
}

// ── Helpers ──
function copyResult(id, btn) { copyText(document.getElementById(id).value, btn); }

function copyText(text, btn) {
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {
        const original = btn.innerHTML
        btn.innerHTML = '✓ Kopiert'
        btn.classList.add('copied')
        showToast('In die Zwischenablage kopiert')
        setTimeout(() => { btn.innerHTML = original; btn.classList.remove('copied'); }, 1600)
    })
}

function showToast(msg) {
    const t = document.getElementById('toast')
    t.textContent = msg
    t.classList.add('show')
    setTimeout(() => t.classList.remove('show'), 2200)
}

function esc(str) {
    const d = document.createElement('div')
    d.textContent = str
    return d.innerHTML
}
