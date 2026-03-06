// ── Tab switching ──
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'))
        tab.classList.add('active')
        document.getElementById('panel-' + tab.dataset.panel).classList.add('active')
    })
})

// ── Live stats ──
function updateLiveStats() {
    const text = document.getElementById('textInput').value
    const words = getWords(text)
    const sentences = getSentences(text)
    const readTime = Math.max(1, Math.ceil(words.length / 250))

    document.getElementById('liveWords').textContent = words.length
    document.getElementById('liveChars').textContent = text.length
    document.getElementById('liveSentences').textContent = sentences
    document.getElementById('liveReadTime').textContent = readTime
}

function getWords(text) {
    return text.trim().split(/\s+/).filter(w => w.length > 0)
}

function getSentences(text) {
    const m = text.match(/[.!?]+/g)
    return m ? m.length : (text.trim().length > 0 ? 1 : 0)
}

function getParagraphs(text) {
    return text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length || (text.trim().length > 0 ? 1 : 0)
}

// ══════════════════════════════════
//  Full Analysis
// ══════════════════════════════════
function fullAnalysis() {
    const text = document.getElementById('textInput').value
    if (!text.trim()) { showToast('Bitte einen Text eingeben'); return; }

    document.getElementById('analyzeEmptyState').style.display = 'none'
    document.getElementById('analyzeResult').style.display = 'block'

    const words = getWords(text)
    const sentences = getSentences(text)
    const paragraphs = getParagraphs(text)
    const chars = text.length
    const charsNoSpace = text.replace(/\s/g, '').length
    const avgWordLen = words.length > 0 ? (words.reduce((s, w) => s + w.length, 0) / words.length) : 0
    const avgSentLen = sentences > 0 ? words.length / sentences : 0
    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size
    const readTimeSec = Math.ceil(words.length / 250 * 60)
    const readTimeMin = Math.ceil(readTimeSec / 60)
    const speakTime = Math.ceil(words.length / 150)
    const lines = text.split('\n').length

    // Flesch for German (approximation)
    const syllables = words.reduce((s, w) => s + countSyllables(w), 0)
    const asl = avgSentLen
    const asw = words.length > 0 ? syllables / words.length : 0
    const flesch = Math.max(0, Math.min(100, 180 - asl - (58.5 * asw)))

    document.getElementById('statsGrid').innerHTML = `
            <div class="stat-card"><div class="stat-value">${words.length}</div><div class="stat-label">Wörter</div></div>
            <div class="stat-card pink"><div class="stat-value">${chars}</div><div class="stat-label">Zeichen</div></div>
            <div class="stat-card purple"><div class="stat-value">${charsNoSpace}</div><div class="stat-label">Ohne Leerzeichen</div></div>
            <div class="stat-card green"><div class="stat-value">${sentences}</div><div class="stat-label">Sätze</div></div>
            <div class="stat-card yellow"><div class="stat-value">${paragraphs}</div><div class="stat-label">Absätze</div></div>
            <div class="stat-card"><div class="stat-value">${lines}</div><div class="stat-label">Zeilen</div></div>
            <div class="stat-card pink"><div class="stat-value">${uniqueWords}</div><div class="stat-label">Einzigartige Wörter</div></div>
            <div class="stat-card purple"><div class="stat-value">${avgWordLen.toFixed(1)}</div><div class="stat-label">⌀ Wortlänge</div></div>
            <div class="stat-card green"><div class="stat-value">${avgSentLen.toFixed(1)}</div><div class="stat-label">⌀ Satzlänge</div></div>
            <div class="stat-card yellow"><div class="stat-value">~${readTimeMin}</div><div class="stat-label">Min. Lesezeit</div></div>
            <div class="stat-card"><div class="stat-value">~${speakTime}</div><div class="stat-label">Min. Sprechzeit</div></div>
            <div class="stat-card pink"><div class="stat-value">${syllables}</div><div class="stat-label">Silben</div></div>
        `

    // Readability gauge
    let gColor, gLabel, gDesc
    if (flesch >= 80) { gColor = '#22c55e'; gLabel = 'Sehr leicht'; gDesc = 'Leicht verständlich für jeden Leser.'; }
    else if (flesch >= 60) { gColor = '#00e5ff'; gLabel = 'Leicht'; gDesc = 'Gut verständlich, normales Sprachniveau.'; }
    else if (flesch >= 40) { gColor = '#f59e0b'; gLabel = 'Mittel'; gDesc = 'Durchschnittlich komplex, erfordert Aufmerksamkeit.'; }
    else if (flesch >= 20) { gColor = '#ff2d75'; gLabel = 'Schwer'; gDesc = 'Komplexer Text, akademisches Niveau.'; }
    else { gColor = '#ef4444'; gLabel = 'Sehr schwer'; gDesc = 'Sehr komplex, wissenschaftliches/juristisches Niveau.'; }

    const circ = 2 * Math.PI * 34
    const offset = circ - (flesch / 100) * circ

    document.getElementById('readabilityGauge').innerHTML = `
            <div class="gauge-wrap">
                <div class="gauge-circle" style="color: ${gColor};">
                    <svg width="80" height="80" viewBox="0 0 80 80">
                        <circle class="gauge-track" cx="40" cy="40" r="34"/>
                        <circle class="gauge-fill" cx="40" cy="40" r="34"
                            stroke="${gColor}"
                            stroke-dasharray="${circ}"
                            stroke-dashoffset="${offset}"/>
                    </svg>
                    ${Math.round(flesch)}
                </div>
                <div class="gauge-info">
                    <div class="gauge-title" style="color: ${gColor};">${gLabel}</div>
                    <div class="gauge-desc">${gDesc} (Flesch-Index, angepasst für Deutsch)</div>
                </div>
            </div>
        `
}

function countSyllables(word) {
    word = word.toLowerCase().replace(/[^a-zäöüß]/g, '')
    if (word.length <= 2) return 1
    const vowels = word.match(/[aeiouyäöü]+/g)
    return vowels ? Math.max(1, vowels.length) : 1
}

// ══════════════════════════════════
//  Keywords
// ══════════════════════════════════
const STOP_WORDS = new Set([
    'der','die','das','ein','eine','einer','eines','einem','einen',
    'und','oder','aber','doch','dass','wenn','weil','als','wie',
    'ist','sind','war','wird','hat','haben','hatte','werden','kann',
    'von','zu','für','mit','auf','in','an','aus','bei','nach','über',
    'um','am','im','vom','zum','zur','des','dem','den',
    'er','sie','es','wir','ihr','ich','du','man','sich',
    'nicht','auch','noch','nur','schon','so','sehr','mehr',
    'dann','da','hier','dort','nun','denn','also','ja','nein',
    'was','wer','wo','wie','wann','warum','welche','welcher','welches',
    'the','and','or','is','are','was','were','be','been','have','has',
    'a','an','of','to','in','for','on','with','at','by','from','this','that'
])

function extractKeywords() {
    const text = document.getElementById('textInput').value
    if (!text.trim()) { showToast('Bitte einen Text eingeben'); return; }

    const words = text.toLowerCase().match(/\b[\wäöüß]+\b/g) || []
    const freq = {}
    words.forEach(w => {
        if (w.length < 2 || STOP_WORDS.has(w) || /^\d+$/.test(w)) return
        freq[w] = (freq[w] || 0) + 1
    })

    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 15)
    if (!sorted.length) { showToast('Keine Schlüsselwörter gefunden'); return; }

    const maxCount = sorted[0][1]

    document.getElementById('kwEmptyState').style.display = 'none'
    document.getElementById('kwResult').style.display = 'block'
    document.getElementById('kwList').innerHTML = sorted.map(([word, count], i) => `
            <div class="keyword-row">
                <span class="keyword-rank">${i + 1}</span>
                <span class="keyword-word">${esc(word)}</span>
                <div class="keyword-bar-bg"><div class="keyword-bar-fill" style="width: ${(count / maxCount * 100)}%"></div></div>
                <span class="keyword-count">${count}×</span>
            </div>
        `).join('')
}

// ══════════════════════════════════
//  Text Transformations
// ══════════════════════════════════
function transformText(type) {
    const text = document.getElementById('textInput').value
    if (!text.trim()) { showToast('Bitte einen Text eingeben'); return; }
    let result = ''

    switch (type) {
        case 'upper': result = text.toUpperCase(); break
        case 'lower': result = text.toLowerCase(); break
        case 'title':
            result = text.replace(/\b\w/g, c => c.toUpperCase()); break
        case 'sentence':
            result = text.toLowerCase().replace(/(^\s*|[.!?]\s+)(\w)/g, (m, p, c) => p + c.toUpperCase()); break
        case 'reverse': result = text.split('').reverse().join(''); break
        case 'trim': result = text.split('\n').map(l => l.trim()).join('\n').replace(/\n{3,}/g, '\n\n'); break
        case 'dedupe-lines':
            const seen = new Set()
            result = text.split('\n').filter(l => { const t = l.trim(); if (seen.has(t)) return false; seen.add(t); return true; }).join('\n')
            break
        case 'sort-lines': result = text.split('\n').sort((a, b) => a.localeCompare(b, 'de')).join('\n'); break
        case 'number-lines': result = text.split('\n').map((l, i) => `${i + 1}. ${l}`).join('\n'); break
        case 'remove-empty': result = text.split('\n').filter(l => l.trim().length > 0).join('\n'); break
    }

    document.getElementById('transformEmptyState').style.display = 'none'
    const el = document.getElementById('transformResult')
    el.style.display = 'block'
    el.value = result
}

function applyToInput() {
    const result = document.getElementById('transformResult').value
    if (result) {
        document.getElementById('textInput').value = result
        updateLiveStats()
        showToast('Text übernommen')
    }
}

// ══════════════════════════════════
//  Search & Replace
// ══════════════════════════════════
function buildRegex() {
    const search = document.getElementById('srSearch').value
    if (!search) return null
    const caseSensitive = document.getElementById('srCaseSensitive').classList.contains('active')
    const useRegex = document.getElementById('srRegex').classList.contains('active')
    const flags = 'g' + (caseSensitive ? '' : 'i')
    try {
        return useRegex ? new RegExp(search, flags) : new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags)
    } catch (e) {
        showToast('Ungültiger RegEx: ' + e.message)
        return null
    }
}

function searchReplace() {
    const text = document.getElementById('textInput').value
    const replace = document.getElementById('srReplace').value
    const regex = buildRegex()
    if (!regex) return

    const matches = text.match(regex)
    const count = matches ? matches.length : 0
    const result = text.replace(regex, replace)

    document.getElementById('srEmptyState').style.display = 'none'
    document.getElementById('srInfo').style.display = 'block'
    document.getElementById('srInfo').innerHTML = `<span class="n">${count}</span> Treffer ersetzt`
    const el = document.getElementById('srResult')
    el.style.display = 'block'
    el.value = result
}

function highlightMatches() {
    const text = document.getElementById('textInput').value
    const regex = buildRegex()
    if (!regex) return
    const matches = text.match(regex)
    const count = matches ? matches.length : 0

    document.getElementById('srEmptyState').style.display = 'none'
    document.getElementById('srInfo').style.display = 'block'
    document.getElementById('srInfo').innerHTML = `<span class="n">${count}</span> Treffer gefunden`
    const el = document.getElementById('srResult')
    el.style.display = 'none'

    if (count === 0) showToast('Keine Treffer')
}

function applySrToInput() {
    const result = document.getElementById('srResult').value
    if (result) {
        document.getElementById('textInput').value = result
        updateLiveStats()
        showToast('Text übernommen')
    }
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
