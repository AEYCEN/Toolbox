// ── Tab switching ──
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'))
        tab.classList.add('active')
        document.getElementById('panel-' + tab.dataset.panel).classList.add('active')
    })
})

// ══════════════════════════════════
//  Expression Calculator
// ══════════════════════════════════
const exprHistoryData = []

function insertFn(fn) {
    const el = document.getElementById('exprInput')
    const pos = el.selectionStart
    const val = el.value
    el.value = val.slice(0, pos) + fn + val.slice(pos)
    el.focus()
    el.selectionStart = el.selectionEnd = pos + fn.length
}

function evalExpr() {
    const raw = document.getElementById('exprInput').value.trim()
    if (!raw) return

    // Safe expression evaluation
    let expr = raw
        .replace(/π/g, 'Math.PI')
        .replace(/\bPI\b/gi, 'Math.PI')
        .replace(/\bE\b/g, 'Math.E')
        .replace(/\bsqrt\s*\(/g, 'Math.sqrt(')
        .replace(/\bcbrt\s*\(/g, 'Math.cbrt(')
        .replace(/\babs\s*\(/g, 'Math.abs(')
        .replace(/\blog2\s*\(/g, 'Math.log2(')
        .replace(/\blog10\s*\(/g, 'Math.log10(')
        .replace(/\blog\s*\(/g, 'Math.log10(')
        .replace(/\bln\s*\(/g, 'Math.log(')
        .replace(/\bsin\s*\(/g, 'Math.sin(')
        .replace(/\bcos\s*\(/g, 'Math.cos(')
        .replace(/\btan\s*\(/g, 'Math.tan(')
        .replace(/\basin\s*\(/g, 'Math.asin(')
        .replace(/\bacos\s*\(/g, 'Math.acos(')
        .replace(/\batan\s*\(/g, 'Math.atan(')
        .replace(/\bround\s*\(/g, 'Math.round(')
        .replace(/\bfloor\s*\(/g, 'Math.floor(')
        .replace(/\bceil\s*\(/g, 'Math.ceil(')
        .replace(/\bmin\s*\(/g, 'Math.min(')
        .replace(/\bmax\s*\(/g, 'Math.max(')
        .replace(/\bpow\s*\(/g, 'Math.pow(')
        .replace(/\brandom\s*\(\)/g, 'Math.random()')
        .replace(/\bfact\s*\(([^)]+)\)/g, '_fact($1)')
        .replace(/(\d)\s*\^/g, '$1**')

    // Validate: only allow safe characters
    if (/[^0-9+\-*/().,%\s\w]/.test(expr.replace(/Math\.\w+/g, '').replace(/_fact/g, ''))) {
        showToast('Ungültiger Ausdruck')
        return
    }

    try {
        const result = Function('"use strict"; function _fact(n){if(n<0)return NaN;if(n<=1)return 1;let r=1;for(let i=2;i<=n;i++)r*=i;return r;} return (' + expr + ')')()
        if (result === undefined || result === null) throw new Error('Kein Ergebnis')

        const formatted = typeof result === 'number' ?
            (Number.isInteger(result) ? result.toLocaleString('de-DE') : parseFloat(result.toPrecision(12)).toLocaleString('de-DE', {maximumFractionDigits: 10}))
            : String(result)

        document.getElementById('exprEmptyState').style.display = 'none'
        document.getElementById('exprResultWrap').style.display = 'block'
        document.getElementById('exprValue').textContent = formatted

        exprHistoryData.unshift({ expr: raw, val: formatted })
        if (exprHistoryData.length > 8) exprHistoryData.pop()
        renderHistory()
    } catch (e) {
        showToast('Fehler: ' + e.message)
    }
}

function renderHistory() {
    const el = document.getElementById('exprHistory')
    el.innerHTML = exprHistoryData.slice(1).map(h =>
        `<div class="expr-history-item" onclick="document.getElementById('exprInput').value='${h.expr.replace(/'/g,"\\'")}'; evalExpr();">
                <span class="expr">${esc(h.expr)}</span>
                <span class="val">= ${esc(h.val)}</span>
            </div>`
    ).join('')
}

document.getElementById('exprInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); evalExpr(); }
})

// ══════════════════════════════════
//  Number Base Converter
// ══════════════════════════════════
function convertBase() {
    const input = document.getElementById('baseInput').value.trim()
    const fromBase = parseInt(document.getElementById('baseFrom').value)
    const grid = document.getElementById('baseGrid')
    const empty = document.getElementById('baseEmptyState')

    if (!input) { grid.style.display = 'none'; empty.style.display = 'block'; return; }

    let num
    try { num = parseInt(input, fromBase); } catch(e) { return; }
    if (isNaN(num)) { grid.style.display = 'none'; empty.innerHTML = '<span style="color:var(--accent2)">Ungültige Zahl für Basis ' + fromBase + '</span>'; empty.style.display = 'block'; return; }

    const bases = [
        { label: 'DEZ', base: 10, cls: 'active', val: num.toString(10) },
        { label: 'BIN', base: 2, cls: 'bin', val: num.toString(2) },
        { label: 'OKT', base: 8, cls: 'oct', val: num.toString(8) },
        { label: 'HEX', base: 16, cls: 'hex', val: num.toString(16).toUpperCase() },
    ]

    empty.style.display = 'none'
    grid.style.display = 'flex'
    grid.innerHTML = bases.map(b => `
            <div class="base-row ${b.cls} ${b.base === fromBase ? 'active' : ''}">
                <span class="base-label">${b.label}</span>
                <span class="base-val">${b.base === 2 ? formatBin(b.val) : b.val}</span>
                <button class="copy-btn" onclick="copyText('${b.val}', this)">⎘</button>
            </div>
        `).join('')
}

function formatBin(bin) {
    return bin.replace(/(\d{4})(?=\d)/g, '$1 ')
}

// ══════════════════════════════════
//  Unit Converter
// ══════════════════════════════════
const UNITS = {
    length: {
        label: 'Länge',
        units: {
            mm: { name: 'Millimeter', factor: 0.001 },
            cm: { name: 'Zentimeter', factor: 0.01 },
            m:  { name: 'Meter', factor: 1 },
            km: { name: 'Kilometer', factor: 1000 },
            in: { name: 'Zoll (inch)', factor: 0.0254 },
            ft: { name: 'Fuß (feet)', factor: 0.3048 },
            yd: { name: 'Yard', factor: 0.9144 },
            mi: { name: 'Meile', factor: 1609.344 },
            nm: { name: 'Seemeile', factor: 1852 },
        }
    },
    weight: {
        label: 'Gewicht',
        units: {
            mg: { name: 'Milligramm', factor: 0.000001 },
            g:  { name: 'Gramm', factor: 0.001 },
            kg: { name: 'Kilogramm', factor: 1 },
            t:  { name: 'Tonne', factor: 1000 },
            oz: { name: 'Unze', factor: 0.0283495 },
            lb: { name: 'Pfund', factor: 0.453592 },
        }
    },
    temperature: {
        label: 'Temperatur',
        units: {
            c: { name: 'Celsius' },
            f: { name: 'Fahrenheit' },
            k: { name: 'Kelvin' },
        },
        custom: true
    },
    data: {
        label: 'Daten',
        units: {
            b:  { name: 'Byte', factor: 1 },
            kb: { name: 'Kilobyte', factor: 1024 },
            mb: { name: 'Megabyte', factor: 1048576 },
            gb: { name: 'Gigabyte', factor: 1073741824 },
            tb: { name: 'Terabyte', factor: 1099511627776 },
            pb: { name: 'Petabyte', factor: 1125899906842624 },
            bit:{ name: 'Bit', factor: 0.125 },
        }
    },
    time: {
        label: 'Zeit',
        units: {
            ms:  { name: 'Millisekunde', factor: 0.001 },
            s:   { name: 'Sekunde', factor: 1 },
            min: { name: 'Minute', factor: 60 },
            h:   { name: 'Stunde', factor: 3600 },
            d:   { name: 'Tag', factor: 86400 },
            w:   { name: 'Woche', factor: 604800 },
            mo:  { name: 'Monat (30d)', factor: 2592000 },
            y:   { name: 'Jahr (365d)', factor: 31536000 },
        }
    },
    area: {
        label: 'Fläche',
        units: {
            mm2: { name: 'mm²', factor: 0.000001 },
            cm2: { name: 'cm²', factor: 0.0001 },
            m2:  { name: 'm²', factor: 1 },
            ha:  { name: 'Hektar', factor: 10000 },
            km2: { name: 'km²', factor: 1000000 },
            sqft:{ name: 'sq ft', factor: 0.092903 },
            ac:  { name: 'Acre', factor: 4046.86 },
        }
    },
    speed: {
        label: 'Geschwindigkeit',
        units: {
            ms:  { name: 'm/s', factor: 1 },
            kmh: { name: 'km/h', factor: 0.277778 },
            mph: { name: 'mph', factor: 0.44704 },
            kn:  { name: 'Knoten', factor: 0.514444 },
        }
    }
}

function populateUnits() {
    const cat = document.getElementById('unitCategory').value
    const units = UNITS[cat].units
    const keys = Object.keys(units)
    const optHtml = keys.map(k => `<option value="${k}">${units[k].name}</option>`).join('')
    document.getElementById('unitFrom').innerHTML = optHtml
    document.getElementById('unitTo').innerHTML = optHtml
    if (keys.length > 1) document.getElementById('unitTo').selectedIndex = 1
    convertUnit()
}

function convertUnit() {
    const cat = document.getElementById('unitCategory').value
    const val = parseFloat(document.getElementById('unitValue').value)
    const from = document.getElementById('unitFrom').value
    const to = document.getElementById('unitTo').value
    const el = document.getElementById('unitResultField')

    if (isNaN(val)) { el.textContent = '—'; return; }

    let result
    if (UNITS[cat].custom && cat === 'temperature') {
        result = convertTemp(val, from, to)
    } else {
        const base = val * UNITS[cat].units[from].factor
        result = base / UNITS[cat].units[to].factor
    }

    el.textContent = formatNumber(result)
}

function convertTemp(val, from, to) {
    let celsius
    if (from === 'c') celsius = val
    else if (from === 'f') celsius = (val - 32) * 5/9
    else celsius = val - 273.15

    if (to === 'c') return celsius
    if (to === 'f') return celsius * 9/5 + 32
    return celsius + 273.15
}

function formatNumber(n) {
    if (Number.isInteger(n) && Math.abs(n) < 1e15) return n.toLocaleString('de-DE')
    if (Math.abs(n) < 0.0001 || Math.abs(n) > 1e12) return n.toExponential(6)
    return parseFloat(n.toPrecision(10)).toLocaleString('de-DE', { maximumFractionDigits: 8 })
}

populateUnits()

// ══════════════════════════════════
//  Percentage Calculator
// ══════════════════════════════════
function calcPct1() {
    const x = parseFloat(document.getElementById('pct1x').value)
    const y = parseFloat(document.getElementById('pct1y').value)
    document.getElementById('pct1r').textContent = (!isNaN(x) && !isNaN(y)) ? formatNumber(x / 100 * y) : '—'
}
function calcPct2() {
    const x = parseFloat(document.getElementById('pct2x').value)
    const y = parseFloat(document.getElementById('pct2y').value)
    document.getElementById('pct2r').textContent = (!isNaN(x) && !isNaN(y) && y !== 0) ? formatNumber(x / y * 100) + '%' : '—'
}
function calcPct3() {
    const from = parseFloat(document.getElementById('pct3from').value)
    const to = parseFloat(document.getElementById('pct3to').value)
    if (!isNaN(from) && !isNaN(to) && from !== 0) {
        const change = ((to - from) / Math.abs(from)) * 100
        const sign = change >= 0 ? '+' : ''
        document.getElementById('pct3r').textContent = sign + formatNumber(change) + '%'
        document.getElementById('pct3r').style.color = change >= 0 ? 'var(--success)' : 'var(--accent2)'
    } else {
        document.getElementById('pct3r').textContent = '—'
        document.getElementById('pct3r').style.color = ''
    }
}
function calcPct4() {
    const val = parseFloat(document.getElementById('pct4val').value)
    const pct = parseFloat(document.getElementById('pct4pct').value)
    document.getElementById('pct4r').textContent = (!isNaN(val) && !isNaN(pct)) ? formatNumber(val * (1 + pct / 100)) : '—'
}

// ══════════════════════════════════
//  Statistics
// ══════════════════════════════════
function calcStats() {
    const raw = document.getElementById('statsInput').value
    const nums = raw.replace(/[;\s]+/g, ',').split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n))
    if (nums.length === 0) { showToast('Keine gültigen Zahlen gefunden'); return; }

    const sorted = [...nums].sort((a, b) => a - b)
    const n = nums.length
    const sum = nums.reduce((a, b) => a + b, 0)
    const mean = sum / n
    const median = n % 2 === 0 ? (sorted[n/2 - 1] + sorted[n/2]) / 2 : sorted[Math.floor(n/2)]
    const variance = nums.reduce((s, x) => s + Math.pow(x - mean, 2), 0) / n
    const stddev = Math.sqrt(variance)
    const min = sorted[0]
    const max = sorted[n - 1]
    const range = max - min

    // Mode
    const freq = {}
    nums.forEach(x => freq[x] = (freq[x] || 0) + 1)
    const maxFreq = Math.max(...Object.values(freq))
    const modes = Object.keys(freq).filter(k => freq[k] === maxFreq)
    const modeStr = maxFreq === 1 ? 'keiner' : modes.join(', ')

    // Geometric mean (only for positive numbers)
    const allPos = nums.every(x => x > 0)
    const geoMean = allPos ? Math.pow(nums.reduce((a, b) => a * b, 1), 1/n) : null

    document.getElementById('statsEmptyState').style.display = 'none'
    document.getElementById('statsResultWrap').style.display = 'block'

    document.getElementById('statsGrid').innerHTML = `
            <div class="stat-card"><div class="stat-value">${n}</div><div class="stat-label">Anzahl</div></div>
            <div class="stat-card"><div class="stat-value">${formatNumber(sum)}</div><div class="stat-label">Summe</div></div>
            <div class="stat-card pink"><div class="stat-value">${formatNumber(mean)}</div><div class="stat-label">Mittelwert ⌀</div></div>
            <div class="stat-card purple"><div class="stat-value">${formatNumber(median)}</div><div class="stat-label">Median</div></div>
            <div class="stat-card yellow"><div class="stat-value">${modeStr}</div><div class="stat-label">Modus</div></div>
            <div class="stat-card green"><div class="stat-value">${formatNumber(min)}</div><div class="stat-label">Minimum</div></div>
            <div class="stat-card"><div class="stat-value">${formatNumber(max)}</div><div class="stat-label">Maximum</div></div>
            <div class="stat-card pink"><div class="stat-value">${formatNumber(range)}</div><div class="stat-label">Spannweite</div></div>
            <div class="stat-card purple"><div class="stat-value">${formatNumber(variance)}</div><div class="stat-label">Varianz</div></div>
            <div class="stat-card yellow"><div class="stat-value">${formatNumber(stddev)}</div><div class="stat-label">Std.-Abweichung</div></div>
            ${geoMean !== null ? `<div class="stat-card green"><div class="stat-value">${formatNumber(geoMean)}</div><div class="stat-label">Geo. Mittel</div></div>` : ''}
        `

    // Sorted values with highlights
    const medianIdx = n % 2 === 0 ? [n/2 - 1, n/2] : [Math.floor(n/2)]
    document.getElementById('statsSorted').innerHTML =
        '<span style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:2px;">Sortierte Werte</span><br>' +
        sorted.map((v, i) => {
            if (i === 0 || i === n - 1) return `<span class="highlight">${formatNumber(v)}</span>`
            if (medianIdx.includes(i)) return `<span class="median-hl">${formatNumber(v)}</span>`
            return formatNumber(v)
        }).join(', ')
}

document.getElementById('statsInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); calcStats(); }
})

// ══════════════════════════════════
//  Date Calculator
// ══════════════════════════════════
function setToday() {
    const today = new Date().toISOString().split('T')[0]
    if (!document.getElementById('dateFrom').value) document.getElementById('dateFrom').value = today
    else document.getElementById('dateTo').value = today
    calcDate()
}

function calcDate() {
    const from = document.getElementById('dateFrom').value
    const to = document.getElementById('dateTo').value
    if (!from || !to) return

    const d1 = new Date(from)
    const d2 = new Date(to)
    const diffMs = Math.abs(d2 - d1)
    const diffDays = Math.round(diffMs / 86400000)
    const diffWeeks = (diffDays / 7).toFixed(1)
    const diffMonths = monthDiff(d1, d2)
    const diffYears = (diffDays / 365.25).toFixed(2)
    const diffHours = Math.round(diffMs / 3600000)
    const diffMinutes = Math.round(diffMs / 60000)
    const diffSeconds = Math.round(diffMs / 1000)

    // Business days (Mon-Fri)
    let bizDays = 0
    const start = new Date(Math.min(d1, d2))
    const end = new Date(Math.max(d1, d2))
    const cur = new Date(start)
    while (cur <= end) {
        const dow = cur.getDay()
        if (dow !== 0 && dow !== 6) bizDays++
        cur.setDate(cur.getDate() + 1)
    }

    // Weekday names
    const dayName1 = d1.toLocaleDateString('de-DE', { weekday: 'long' })
    const dayName2 = d2.toLocaleDateString('de-DE', { weekday: 'long' })

    document.getElementById('dateEmptyState').style.display = 'none'
    document.getElementById('dateResultWrap').style.display = 'block'

    document.getElementById('dateGrid').innerHTML = `
            <div class="stat-card"><div class="stat-value">${diffDays}</div><div class="stat-label">Tage</div></div>
            <div class="stat-card pink"><div class="stat-value">${diffWeeks}</div><div class="stat-label">Wochen</div></div>
            <div class="stat-card purple"><div class="stat-value">${diffMonths}</div><div class="stat-label">Monate</div></div>
            <div class="stat-card green"><div class="stat-value">${diffYears}</div><div class="stat-label">Jahre</div></div>
            <div class="stat-card yellow"><div class="stat-value">${diffHours.toLocaleString('de-DE')}</div><div class="stat-label">Stunden</div></div>
            <div class="stat-card"><div class="stat-value">${diffMinutes.toLocaleString('de-DE')}</div><div class="stat-label">Minuten</div></div>
            <div class="stat-card pink"><div class="stat-value">${diffSeconds.toLocaleString('de-DE')}</div><div class="stat-label">Sekunden</div></div>
            <div class="stat-card purple"><div class="stat-value">${bizDays}</div><div class="stat-label">Arbeitstage</div></div>
            <div class="stat-card green"><div class="stat-value">${diffDays - bizDays}</div><div class="stat-label">Wochenendtage</div></div>
            <div class="stat-card yellow"><div class="stat-value">${esc(dayName1)}</div><div class="stat-label">Wochentag Von</div></div>
            <div class="stat-card"><div class="stat-value">${esc(dayName2)}</div><div class="stat-label">Wochentag Bis</div></div>
            <div class="stat-card pink"><div class="stat-value">KW ${getWeekNumber(d2)}</div><div class="stat-label">Kalenderwoche</div></div>
        `
}

function monthDiff(d1, d2) {
    const start = d1 < d2 ? d1 : d2
    const end = d1 < d2 ? d2 : d1
    return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
}

function getWeekNumber(d) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7))
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
    return Math.ceil((((date - yearStart) / 86400000) + 1) / 7)
}

// ── Helpers ──
function copyText(text, btn) {
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {
        const original = btn.innerHTML
        btn.innerHTML = '✓'
        btn.classList.add('copied')
        showToast('Kopiert')
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
