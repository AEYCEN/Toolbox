// ══════════════════════════════════
//  1. Energy Cost Calculator
// ══════════════════════════════════
function calcEnergy() {
    const W = parseFloat(document.getElementById('energyWatt').value)
    const H = parseFloat(document.getElementById('energyHours').value)
    const price = parseFloat(document.getElementById('energyPrice').value)
    const days = parseFloat(document.getElementById('energyDays').value) || 1

    if (isNaN(W) || isNaN(H) || W <= 0 || H <= 0) {
        document.getElementById('energyEmptyState').style.display = 'block'
        document.getElementById('energyResultWrap').style.display = 'none'
        return
    }

    const kWh_day = (W / 1000) * H
    const kWh_year = kWh_day * days
    const cost_day = kWh_day * (price || 0)
    const cost_month = cost_day * 30
    const cost_year = kWh_year * (price || 0)
    const amps = W / 230

    document.getElementById('energyEmptyState').style.display = 'none'
    document.getElementById('energyResultWrap').style.display = 'block'
    document.getElementById('energyGrid').innerHTML = `
        <div class="stat-card"><div class="stat-value">${kWh_day.toFixed(2)}</div><div class="stat-label">kWh / ${t('sparkLab.energy_per_day')}</div></div>
        <div class="stat-card pink"><div class="stat-value">${kWh_year.toFixed(1)}</div><div class="stat-label">kWh / ${t('sparkLab.energy_per_year')}</div></div>
        <div class="stat-card green"><div class="stat-value">${cost_day.toFixed(2)} €</div><div class="stat-label">${t('sparkLab.energy_cost_day')}</div></div>
        <div class="stat-card yellow"><div class="stat-value">${cost_month.toFixed(2)} €</div><div class="stat-label">${t('sparkLab.energy_cost_month')}</div></div>
        <div class="stat-card purple"><div class="stat-value">${cost_year.toFixed(2)} €</div><div class="stat-label">${t('sparkLab.energy_cost_year')}</div></div>
        <div class="stat-card"><div class="stat-value">${amps.toFixed(2)} A</div><div class="stat-label">${t('sparkLab.energy_amps')}</div></div>
    `
}


// ══════════════════════════════════
//  2. Ohm's Law / Power Wheel
//  Enter any 2, get the other 2
// ══════════════════════════════════
let _ohmLock = false

function calcOhm() {
    if (_ohmLock) return
    _ohmLock = true

    const vEl = document.getElementById('ohmV')
    const aEl = document.getElementById('ohmA')
    const rEl = document.getElementById('ohmR')
    const pEl = document.getElementById('ohmP')

    const V = vEl.value !== '' ? parseFloat(vEl.value) : null
    const I = aEl.value !== '' ? parseFloat(aEl.value) : null
    const R = rEl.value !== '' ? parseFloat(rEl.value) : null
    const P = pEl.value !== '' ? parseFloat(pEl.value) : null

    const filled = [V, I, R, P].filter(x => x !== null && !isNaN(x)).length
    let formula = ''
    let results = {}

    if (filled >= 2) {
        // All valid combinations
        if (V !== null && I !== null) {
            results = { R: V / I, P: V * I }
            formula = 'R = V / I, P = V × I'
        } else if (V !== null && R !== null) {
            results = { I: V / R, P: (V * V) / R }
            formula = 'I = V / R, P = V² / R'
        } else if (V !== null && P !== null) {
            results = { I: P / V, R: (V * V) / P }
            formula = 'I = P / V, R = V² / P'
        } else if (I !== null && R !== null) {
            results = { V: I * R, P: I * I * R }
            formula = 'V = I × R, P = I² × R'
        } else if (I !== null && P !== null) {
            results = { V: P / I, R: P / (I * I) }
            formula = 'V = P / I, R = P / I²'
        } else if (R !== null && P !== null) {
            results = { V: Math.sqrt(P * R), I: Math.sqrt(P / R) }
            formula = 'V = √(P × R), I = √(P / R)'
        }

        if (results.V !== undefined && V === null) vEl.value = fmt(results.V)
        if (results.I !== undefined && I === null) aEl.value = fmt(results.I)
        if (results.R !== undefined && R === null) rEl.value = fmt(results.R)
        if (results.P !== undefined && P === null) pEl.value = fmt(results.P)

        document.getElementById('ohmEmptyState').style.display = 'none'
        document.getElementById('ohmResultWrap').style.display = 'block'
        document.getElementById('ohmFormula').textContent = formula

        const allV = parseFloat(vEl.value) || 0
        const allI = parseFloat(aEl.value) || 0
        const allR = parseFloat(rEl.value) || 0
        const allP = parseFloat(pEl.value) || 0
        document.getElementById('ohmMeta').innerHTML =
            `<span class="meta-badge">⚡ <span class="val">${fmtUnit(allV, 'V')}</span></span>` +
            `<span class="meta-badge">🔌 <span class="val">${fmtUnit(allI, 'A')}</span></span>` +
            `<span class="meta-badge">Ω <span class="val">${fmtUnit(allR, 'Ω')}</span></span>` +
            `<span class="meta-badge">💡 <span class="val">${fmtUnit(allP, 'W')}</span></span>`
    }

    _ohmLock = false
}

function clearOhm() {
    ;['ohmV', 'ohmA', 'ohmR', 'ohmP'].forEach(id => document.getElementById(id).value = '')
    document.getElementById('ohmEmptyState').style.display = 'block'
    document.getElementById('ohmResultWrap').style.display = 'none'
}


// ══════════════════════════════════
//  3. Resistor Color Code
// ══════════════════════════════════
const BAND_COLORS = [
    { name: 'Schwarz',  name_en: 'Black',   val: 0, mul: 1,        hex: '#1a1a1a' },
    { name: 'Braun',    name_en: 'Brown',   val: 1, mul: 10,       hex: '#8B4513' },
    { name: 'Rot',      name_en: 'Red',     val: 2, mul: 100,      hex: '#ef4444' },
    { name: 'Orange',   name_en: 'Orange',  val: 3, mul: 1000,     hex: '#f97316' },
    { name: 'Gelb',     name_en: 'Yellow',  val: 4, mul: 10000,    hex: '#eab308' },
    { name: 'Grün',     name_en: 'Green',   val: 5, mul: 100000,   hex: '#22c55e' },
    { name: 'Blau',     name_en: 'Blue',    val: 6, mul: 1000000,  hex: '#3b82f6' },
    { name: 'Violett',  name_en: 'Violet',  val: 7, mul: 10000000, hex: '#a855f7' },
    { name: 'Grau',     name_en: 'Grey',    val: 8, mul: null,     hex: '#6b7280' },
    { name: 'Weiß',     name_en: 'White',   val: 9, mul: null,     hex: '#f5f5f5' },
]

const MULTIPLIERS = [
    { name: 'Schwarz/fehlt (×1)',  mul: 1, hex: '#1a1a1a' },
    { name: 'Braun (×10)',         mul: 10, hex: '#8B4513' },
    { name: 'Rot (×100)',          mul: 100, hex: '#ef4444' },
    { name: 'Orange (×1k)',        mul: 1000, hex: '#f97316' },
    { name: 'Gelb (×10k)',         mul: 10000, hex: '#eab308' },
    { name: 'Grün (×100k)',        mul: 100000, hex: '#22c55e' },
    { name: 'Blau (×1M)',          mul: 1000000, hex: '#3b82f6' },
    { name: 'Violett (×10M)',      mul: 10000000, hex: '#a855f7' },
    { name: 'Gold (×0.1)',         mul: 0.1, hex: '#d4a843' },
    { name: 'Silber (×0.01)',      mul: 0.01, hex: '#c0c0c0' },
]

const TOLERANCES = [
    { name: 'Braun ±1%',  val: 1, hex: '#8B4513' },
    { name: 'Rot ±2%',    val: 2, hex: '#ef4444' },
    { name: 'Gold ±5%',   val: 5, hex: '#d4a843' },
    { name: 'Silber ±10%', val: 10, hex: '#c0c0c0' },
]

function initColorCode() {
    const b1 = document.getElementById('band1')
    const b2 = document.getElementById('band2')
    const b3 = document.getElementById('band3')
    const bm = document.getElementById('bandMul')
    const bt = document.getElementById('bandTol')

    BAND_COLORS.forEach((c, i) => {
        b1.innerHTML += `<option value="${i}" style="background:${c.hex};color:${c.val > 5 ? '#fff' : '#1a1a1a'}">${c.name} (${c.val})</option>`
        b2.innerHTML += `<option value="${i}" style="background:${c.hex};color:${c.val > 5 ? '#fff' : '#1a1a1a'}">${c.name} (${c.val})</option>`
        b3.innerHTML += `<option value="${i}" style="background:${c.hex};color:${c.val > 5 ? '#fff' : '#1a1a1a'}">${c.name} (${c.val})</option>`
    })

    MULTIPLIERS.forEach((c, i) => {
        bm.innerHTML += `<option value="${i}" style="background:${c.hex};color:#fff">${c.name}</option>`
    })

    TOLERANCES.forEach((c, i) => {
        bt.innerHTML += `<option value="${i}" style="background:${c.hex};color:#fff">${c.name}</option>`
    })

    // Set defaults: 4.7kΩ ±5%
    b1.value = 4; b2.value = 7; b3.value = 0; bm.value = 2; bt.value = 2
    calcColorCode()
}

function calcColorCode() {
    const d1 = BAND_COLORS[document.getElementById('band1').value].val
    const d2 = BAND_COLORS[document.getElementById('band2').value].val
    const d3 = BAND_COLORS[document.getElementById('band3').value].val
    const mul = MULTIPLIERS[document.getElementById('bandMul').value].mul
    const tol = TOLERANCES[document.getElementById('bandTol').value].val

    const val = (d1 * 100 + d2 * 10 + d3) * mul
    const display = fmtResistorValue(val)

    document.getElementById('colorResult').innerHTML =
        `<div class="res-total">${display} ±${tol}%</div>` +
        `<div class="res-formula-text">(${d1}${d2}${d3} × ${fmtMul(mul)}) = ${val.toLocaleString('de-DE')} Ω</div>`

    // Visual
    const colors = [
        BAND_COLORS[document.getElementById('band1').value].hex,
        BAND_COLORS[document.getElementById('band2').value].hex,
        BAND_COLORS[document.getElementById('band3').value].hex,
        MULTIPLIERS[document.getElementById('bandMul').value].hex,
        TOLERANCES[document.getElementById('bandTol').value].hex,
    ]
    document.getElementById('resistorVisual').innerHTML =
        `<div class="resistor-body">` +
        colors.map((c, i) => `<div class="resistor-band${i === 4 ? ' tol' : ''}" style="background:${c}"></div>`).join('') +
        `</div>`
}

function fmtResistorValue(val) {
    if (val >= 1e6) return (val / 1e6).toFixed(val % 1e6 === 0 ? 0 : 1) + ' MΩ'
    if (val >= 1e3) return (val / 1e3).toFixed(val % 1e3 === 0 ? 0 : 1) + ' kΩ'
    return val.toFixed(val < 1 ? 2 : 0) + ' Ω'
}

function fmtMul(m) {
    if (m >= 1e6) return (m / 1e6) + 'M'
    if (m >= 1e3) return (m / 1e3) + 'k'
    if (m < 1) return m
    return m
}


// ══════════════════════════════════
//  4. Total Resistance
// ══════════════════════════════════
let _resMode = 'parallel'
let _resCount = 2

function setResMode(mode) {
    _resMode = mode
    document.getElementById('resModeParallel').classList.toggle('active', mode === 'parallel')
    document.getElementById('resModeSerial').classList.toggle('active', mode === 'series')
    calcResistors()
}

function addResistor() {
    _resCount++
    const container = document.getElementById('resInputs')
    const row = document.createElement('div')
    row.className = 'res-row'
    row.innerHTML = `<span class="res-label">R${_resCount}</span><input class="field-input" type="number" step="any" placeholder="Ω" oninput="calcResistors()">`
    container.appendChild(row)
}

function calcResistors() {
    const inputs = document.querySelectorAll('#resInputs input')
    const vals = Array.from(inputs).map(i => parseFloat(i.value)).filter(v => !isNaN(v) && v > 0)

    if (vals.length < 2) {
        document.getElementById('resEmptyState').style.display = 'block'
        document.getElementById('resResultWrap').style.display = 'none'
        return
    }

    let total, formula
    if (_resMode === 'series') {
        total = vals.reduce((a, b) => a + b, 0)
        formula = vals.map(v => fmtUnit(v, 'Ω')).join(' + ') + ' = ' + fmtUnit(total, 'Ω')
    } else {
        const inv = vals.reduce((a, b) => a + (1 / b), 0)
        total = 1 / inv
        formula = '1 / (' + vals.map(v => '1/' + fmtUnit(v, 'Ω')).join(' + ') + ') = ' + fmtUnit(total, 'Ω')
    }

    document.getElementById('resEmptyState').style.display = 'none'
    document.getElementById('resResultWrap').style.display = 'block'
    document.getElementById('resFormula').innerHTML =
        `<div class="res-total">${fmtUnit(total, 'Ω')}</div>` +
        `<div class="res-formula-text">${formula}</div>`
}


// ══════════════════════════════════
//  5. Wire Cross-Section Calculator
// ══════════════════════════════════
function calcWire() {
    const I = parseFloat(document.getElementById('wireCurrent').value)
    const L = parseFloat(document.getElementById('wireLength').value)
    const U = parseFloat(document.getElementById('wireVoltage').value)
    const dropPct = parseFloat(document.getElementById('wireDrop').value)
    const rho = parseFloat(document.getElementById('wireMaterial').value)
    const phaseFactor = parseFloat(document.getElementById('wirePhases').value)

    if (isNaN(I) || isNaN(L) || I <= 0 || L <= 0) {
        showToast(t('sparkLab.toast_fill_fields'))
        return
    }

    const isThreePhase = phaseFactor < 2 // √3 ≈ 1.732

    // Max allowed voltage drop
    const UdropMax = U * (dropPct / 100)

    // Required cross-section to stay within limit
    const Acalc = (phaseFactor * rho * L * I) / UdropMax

    // Standard cross-sections (VDE: min 1.5 mm² for fixed installation)
    const standards = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240]
    const recommended = standards.find(s => s >= Acalc) || standards[standards.length - 1]

    // Actual voltage drop with the recommended (rounded up) cross-section
    const UdropActual = (phaseFactor * rho * L * I) / recommended
    const dropPctActual = (UdropActual / U) * 100

    // Power: P = U × I for single-phase, P = √3 × U × I for three-phase
    const power = isThreePhase ? (Math.sqrt(3) * U * I) : (U * I)

    // Total cable length: 2 × L for single-phase (L + N), 3 × L for three-phase (3 conductors)
    const totalLength = isThreePhase ? (3 * L) : (2 * L)

    document.getElementById('wireEmptyState').style.display = 'none'
    document.getElementById('wireResultWrap').style.display = 'block'
    document.getElementById('wireGrid').innerHTML = `
        <div class="stat-card"><div class="stat-value">${Acalc.toFixed(2)} mm²</div><div class="stat-label">${t('sparkLab.wire_calc_cross')}</div></div>
        <div class="stat-card pink"><div class="stat-value">${recommended} mm²</div><div class="stat-label">${t('sparkLab.wire_recommended')}</div></div>
        <div class="stat-card green"><div class="stat-value">${UdropActual.toFixed(2)} V</div><div class="stat-label">${t('sparkLab.wire_drop_v')}</div></div>
        <div class="stat-card yellow"><div class="stat-value">${dropPctActual.toFixed(2)} %</div><div class="stat-label">${t('sparkLab.wire_drop_pct')}</div></div>
        <div class="stat-card purple"><div class="stat-value">${(power / 1000).toFixed(2)} kW</div><div class="stat-label">${t('sparkLab.power')}</div></div>
        <div class="stat-card"><div class="stat-value">${totalLength.toFixed(1)} m</div><div class="stat-label">${t('sparkLab.wire_total_length')}</div></div>
    `
}


// ══════════════════════════════════
//  6. LED Resistor Calculator
// ══════════════════════════════════
function calcLed() {
    const Vs = parseFloat(document.getElementById('ledSourceV').value)
    const Vf = parseFloat(document.getElementById('ledForwardV').value)
    const mA = parseFloat(document.getElementById('ledCurrentMa').value)
    const n = parseInt(document.getElementById('ledCount').value) || 1

    if (isNaN(Vs) || isNaN(Vf) || isNaN(mA) || mA <= 0) {
        showToast(t('sparkLab.toast_fill_fields'))
        return
    }

    const Vdrop = Vs - (Vf * n)
    if (Vdrop <= 0) {
        showToast(t('sparkLab.led_error_voltage'))
        return
    }

    const I = mA / 1000
    const R = Vdrop / I
    const P = Vdrop * I

    // Standard E24 resistor
    const e24 = [1,1.1,1.2,1.3,1.5,1.6,1.8,2,2.2,2.4,2.7,3,3.3,3.6,3.9,4.3,4.7,5.1,5.6,6.2,6.8,7.5,8.2,9.1]
    let nearest = findNearestStandard(R, e24)

    document.getElementById('ledEmptyState').style.display = 'none'
    document.getElementById('ledResultWrap').style.display = 'block'
    document.getElementById('ledGrid').innerHTML = `
        <div class="stat-card"><div class="stat-value">${R.toFixed(1)} Ω</div><div class="stat-label">${t('sparkLab.led_calc_r')}</div></div>
        <div class="stat-card pink"><div class="stat-value">${nearest} Ω</div><div class="stat-label">${t('sparkLab.led_nearest_e24')}</div></div>
        <div class="stat-card green"><div class="stat-value">${(P * 1000).toFixed(1)} mW</div><div class="stat-label">${t('sparkLab.led_power_r')}</div></div>
        <div class="stat-card yellow"><div class="stat-value">${Vdrop.toFixed(2)} V</div><div class="stat-label">${t('sparkLab.led_drop')}</div></div>
        <div class="stat-card purple"><div class="stat-value">${n}</div><div class="stat-label">${t('sparkLab.led_series_count')}</div></div>
        <div class="stat-card"><div class="stat-value">${(Vs - Vdrop).toFixed(2)} V</div><div class="stat-label">${t('sparkLab.led_total_vf')}</div></div>
    `
}

function findNearestStandard(R, series) {
    // Find the decade
    let decade = 1
    while (R >= series[series.length - 1] * decade * 10) decade *= 10
    if (R < series[0]) return series[0]

    let best = null, bestDiff = Infinity
    for (let d = decade / 10; d <= decade * 100; d *= 10) {
        for (const val of series) {
            const sv = val * d
            const diff = Math.abs(sv - R)
            // Prefer higher (safer for LED)
            if (diff < bestDiff || (diff === bestDiff && sv > R)) {
                bestDiff = diff
                best = sv
            }
        }
    }
    return best
}


// ══════════════════════════════════
//  Helpers
// ══════════════════════════════════
function fmt(n) {
    if (n === Infinity || n === -Infinity || isNaN(n)) return ''
    return parseFloat(n.toPrecision(8))
}

function fmtUnit(val, unit) {
    if (val >= 1e6) return (val / 1e6).toFixed(2) + ' M' + unit
    if (val >= 1e3) return (val / 1e3).toFixed(2) + ' k' + unit
    if (val < 0.001 && val > 0) return (val * 1e6).toFixed(2) + ' µ' + unit
    if (val < 1 && val > 0) return (val * 1e3).toFixed(2) + ' m' + unit
    return parseFloat(val.toPrecision(6)) + ' ' + unit
}

// Init color code on load
document.addEventListener('DOMContentLoaded', initColorCode)
