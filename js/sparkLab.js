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
//  Tracks last 2 user-edited fields
// ══════════════════════════════════
let _ohmLock = false
let _ohmUserFields = []   // ordered history of user-edited field keys: 'U','I','R','P'

function calcOhm(editedKey) {
    if (_ohmLock) return
    _ohmLock = true

    // Track which fields the user actively touches
    if (editedKey) {
        // Remove previous occurrence so latest is always last
        _ohmUserFields = _ohmUserFields.filter(k => k !== editedKey)
        _ohmUserFields.push(editedKey)
        // Keep only last 2
        if (_ohmUserFields.length > 2) _ohmUserFields = _ohmUserFields.slice(-2)
    }

    const els = {
        U: document.getElementById('ohmV'),
        I: document.getElementById('ohmA'),
        R: document.getElementById('ohmR'),
        P: document.getElementById('ohmP'),
    }

    const vals = {}
    for (const k in els) vals[k] = els[k].value !== '' ? parseFloat(els[k].value) : null

    // Determine the input pair: prefer the 2 user-tracked fields if both have values
    let pair = null
    if (_ohmUserFields.length === 2) {
        const [a, b] = _ohmUserFields
        if (vals[a] !== null && !isNaN(vals[a]) && vals[b] !== null && !isNaN(vals[b])) {
            pair = new Set([a, b])
        }
    }
    // Fallback: first 2 non-empty fields (initial entry)
    if (!pair) {
        const filled = Object.keys(vals).filter(k => vals[k] !== null && !isNaN(vals[k]))
        if (filled.length >= 2) {
            pair = new Set(filled.slice(0, 2))
        }
    }

    if (!pair) { _ohmLock = false; return }

    const has = (a, b) => pair.has(a) && pair.has(b)

    let formula = '', results = {}

    if (has('U', 'I')) {
        results = { R: vals.U / vals.I, P: vals.U * vals.I }
        formula = 'R = U / I, P = U × I'
    } else if (has('U', 'R')) {
        results = { I: vals.U / vals.R, P: (vals.U * vals.U) / vals.R }
        formula = 'I = U / R, P = U² / R'
    } else if (has('U', 'P')) {
        results = { I: vals.P / vals.U, R: (vals.U * vals.U) / vals.P }
        formula = 'I = P / U, R = U² / P'
    } else if (has('I', 'R')) {
        results = { U: vals.I * vals.R, P: vals.I * vals.I * vals.R }
        formula = 'U = I × R, P = I² × R'
    } else if (has('I', 'P')) {
        results = { U: vals.P / vals.I, R: vals.P / (vals.I * vals.I) }
        formula = 'U = P / I, R = P / I²'
    } else if (has('R', 'P')) {
        results = { U: Math.sqrt(vals.P * vals.R), I: Math.sqrt(vals.P / vals.R) }
        formula = 'U = √(P × R), I = √(P / R)'
    }

    // Fill only the calculated (non-input) fields
    for (const k in results) {
        if (!pair.has(k)) els[k].value = fmt(results[k])
    }

    document.getElementById('ohmEmptyState').style.display = 'none'
    document.getElementById('ohmResultWrap').style.display = 'block'
    document.getElementById('ohmFormula').textContent = formula

    const allV = parseFloat(els.U.value) || 0
    const allI = parseFloat(els.I.value) || 0
    const allR = parseFloat(els.R.value) || 0
    const allP = parseFloat(els.P.value) || 0
    document.getElementById('ohmMeta').innerHTML =
        `<span class="meta-badge">U <span class="val">${fmtUnit(allV, 'V')}</span></span>` +
        `<span class="meta-badge">I <span class="val">${fmtUnit(allI, 'A')}</span></span>` +
        `<span class="meta-badge">R <span class="val">${fmtUnit(allR, 'Ω')}</span></span>` +
        `<span class="meta-badge">P <span class="val">${fmtUnit(allP, 'W')}</span></span>`

    _ohmLock = false
}

function clearOhm() {
    ;['ohmV', 'ohmA', 'ohmR', 'ohmP'].forEach(id => document.getElementById(id).value = '')
    _ohmUserFields = []
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
//     (VDE 0298-4 compliant)
// ══════════════════════════════════

// Standard cross-sections in mm²
const WIRE_STANDARDS = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120]

// ── Current carrying capacity tables (DIN VDE 0298-4, at 30 °C reference) ──
// Keys: "METHOD_CONDUCTORS_MATERIAL"  e.g. "B1_2_cu" = B1, 2 loaded conductors, copper
// Values: I_r in A for cross-sections [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120]

const VDE_Ir = {
    // ── Copper ──
    // A1: Single/multi-core in insulated wall / conduit in insulated wall
    A1_2_cu: [15.5, 19.5, 26, 34, 46, 61, 80, 99, 119, 151, 182, 210],
    A1_3_cu: [13.5, 18,   24, 31, 42, 56, 73, 89, 108, 136, 164, 188],
    // A2: Multi-core cable in conduit in insulated wall
    A2_2_cu: [13,   17.5, 23, 29, 39, 52, 68, 83, 99,  125, 150, 172],
    A2_3_cu: [13,   17.5, 23, 29, 39, 52, 68, 83, 99,  125, 150, 172],
    // B1: Single/multi-core in conduit on wall / in conduit in floor channel
    B1_2_cu: [17.5, 24,   32, 41, 57, 76, 101, 125, 151, 192, 232, 269],
    B1_3_cu: [15.5, 21,   28, 36, 50, 68, 89,  110, 134, 171, 207, 239],
    // B2: Multi-core cable directly on wall or in cable duct
    B2_2_cu: [16.5, 23,   30, 38, 52, 69, 90,  111, 133, 168, 201, 232],
    B2_3_cu: [15,   20,   27, 34, 46, 62, 80,   99, 118, 149, 179, 206],
    // C: Single/multi-core on wall (open), on non-perforated cable tray
    C_2_cu:  [19.5, 27,   36, 46, 63, 85, 112, 138, 168, 213, 258, 299],
    C_3_cu:  [17.5, 24,   32, 40, 57, 76, 96,  119, 144, 184, 223, 259],
    // E: Multi-core in free air, on perforated tray / cable ladder
    E_2_cu:  [22,   30,   40, 51, 70, 94, 119, 148, 180, 232, 282, 328],
    E_3_cu:  [18.5, 25,   34, 43, 60, 80, 101, 126, 153, 196, 238, 276],

    // ── Aluminium (available from 25 mm² upwards for most methods) ──
    // Index offset: Al values map to cross-sections starting at 25 mm² = index 6
    // So we pad the first 6 entries with 0 (not available)
    A1_2_al: [0, 0, 0, 0, 0, 0, 63, 77, 93,  118, 142, 164],
    A1_3_al: [0, 0, 0, 0, 0, 0, 57, 70, 84,  107, 129, 149],
    A2_2_al: [0, 0, 0, 0, 0, 0, 53, 65, 78,   98, 118, 135],
    A2_3_al: [0, 0, 0, 0, 0, 0, 53, 65, 78,   98, 118, 135],
    B1_2_al: [0, 0, 0, 0, 0, 0, 79, 97, 118, 150, 181, 210],
    B1_3_al: [0, 0, 0, 0, 0, 0, 70, 86, 104, 133, 161, 186],
    B2_2_al: [0, 0, 0, 0, 0, 0, 71, 86, 104, 131, 157, 181],
    B2_3_al: [0, 0, 0, 0, 0, 0, 63, 77, 92,  116, 139, 160],
    C_2_al:  [0, 0, 0, 0, 0, 0, 77, 93, 118, 150, 181, 210],
    C_3_al:  [0, 0, 0, 0, 0, 0, 63, 80, 100, 125, 150, 173],
    E_2_al:  [0, 0, 0, 0, 0, 0, 84, 103, 125, 159, 191, 222],
    E_3_al:  [0, 0, 0, 0, 0, 0, 65, 80,  96, 124, 150, 174],
}

// ── Correction factor f1: Ambient temperature ──
// Reference: 30 °C, max conductor temperature 70 °C (PVC insulation)
const VDE_F1 = {
    10: 1.22, 15: 1.17, 20: 1.12, 25: 1.06,
    30: 1.00, 35: 0.94, 40: 0.87, 45: 0.79,
    50: 0.71, 55: 0.61, 60: 0.50, 65: 0.35
}

// ── Correction factor f2: Grouped / bundled installation ──
// Row: "bundled in conduit / cable channel" (most conservative, default)
const VDE_F2_CONDUIT   = { 1: 1.0, 2: 0.80, 3: 0.70, 4: 0.65, 5: 0.60, 6: 0.57, 7: 0.54, 8: 0.52, 9: 0.50 }
// Row: "single layer on wall or floor"
const VDE_F2_WALL      = { 1: 1.0, 2: 0.85, 3: 0.79, 4: 0.75, 5: 0.73, 6: 0.72, 7: 0.71, 8: 0.70, 9: 0.70 }
// Row: "perforated cable tray"
const VDE_F2_TRAY_PERF = { 1: 1.0, 2: 0.88, 3: 0.82, 4: 0.79, 5: 0.78, 6: 0.76, 7: 0.75, 8: 0.74, 9: 0.73 }
// Row: "cable ladder / cable rack"
const VDE_F2_TRAY_LADD = { 1: 1.0, 2: 0.87, 3: 0.82, 4: 0.80, 5: 0.80, 6: 0.79, 7: 0.79, 8: 0.78, 9: 0.78 }

const VDE_F2_TABLES = {
    conduit:   VDE_F2_CONDUIT,
    wall:      VDE_F2_WALL,
    tray_perf: VDE_F2_TRAY_PERF,
    tray_ladd: VDE_F2_TRAY_LADD,
}

/**
 * Look up I_r for a given cross-section, installation method, conductors, and material
 */
function getIr(crossIdx, method, conductors, material) {
    const key = `${method}_${conductors}_${material}`
    const table = VDE_Ir[key]
    if (!table) return 0
    return table[crossIdx] || 0
}

/**
 * Find minimum cross-section index where derated current >= I_b
 */
function findMinCrossByCapacity(Ib, method, conductors, material, f1, f2) {
    for (let i = 0; i < WIRE_STANDARDS.length; i++) {
        const Ir = getIr(i, method, conductors, material)
        if (Ir <= 0) continue  // not available for this cross-section
        const Iz = Ir * f1 * f2
        if (Iz >= Ib) return { index: i, cross: WIRE_STANDARDS[i], Ir, Iz }
    }
    // No standard cross-section sufficient
    return { index: WIRE_STANDARDS.length - 1, cross: WIRE_STANDARDS[WIRE_STANDARDS.length - 1], Ir: getIr(WIRE_STANDARDS.length - 1, method, conductors, material), Iz: 0, exceeded: true }
}

function calcWire() {
    const Ib = parseFloat(document.getElementById('wireCurrent').value)
    const L  = parseFloat(document.getElementById('wireLength').value)
    const U  = parseFloat(document.getElementById('wireVoltage').value)
    const dropPct     = parseFloat(document.getElementById('wireDrop').value)
    const rho         = parseFloat(document.getElementById('wireMaterial').value)
    const materialKey = document.getElementById('wireMaterial').selectedOptions[0].dataset.mat
    const phaseFactor = parseFloat(document.getElementById('wirePhases').value)
    const method      = document.getElementById('wireMethod').value
    const ambientTemp = parseInt(document.getElementById('wireTemp').value)
    const groupCount  = parseInt(document.getElementById('wireGroupCount').value)
    const groupType   = document.getElementById('wireGroupType').value

    if (isNaN(Ib) || isNaN(L) || Ib <= 0 || L <= 0) {
        showToast(t('sparkLab.toast_fill_fields'))
        return
    }

    const isThreePhase = phaseFactor < 2  // √3 ≈ 1.732
    const conductors = isThreePhase ? 3 : 2

    // ── Correction factors ──
    const f1 = VDE_F1[ambientTemp] || 1.0
    const f2Table = VDE_F2_TABLES[groupType] || VDE_F2_CONDUIT
    const f2 = f2Table[groupCount] || (groupCount > 9 ? f2Table[9] : 1.0)

    // ── 1) Cross-section from voltage drop ──
    const UdropMax = U * (dropPct / 100)
    const AcalcDrop = (phaseFactor * rho * L * Ib) / UdropMax
    const crossDrop = WIRE_STANDARDS.find(s => s >= AcalcDrop) || WIRE_STANDARDS[WIRE_STANDARDS.length - 1]

    // ── 2) Cross-section from current carrying capacity (VDE table) ──
    const capResult = findMinCrossByCapacity(Ib, method, conductors, materialKey, f1, f2)
    const crossCap = capResult.cross

    // ── 3) Take the larger of both ──
    const recommended = Math.max(crossDrop, crossCap)
    const finalCross = WIRE_STANDARDS.find(s => s >= recommended) || WIRE_STANDARDS[WIRE_STANDARDS.length - 1]
    const decisive = crossCap > crossDrop ? 'capacity' : (crossDrop > crossCap ? 'drop' : 'both')

    // ── Actual voltage drop with final cross-section ──
    const UdropActual = (phaseFactor * rho * L * Ib) / finalCross
    const dropPctActual = (UdropActual / U) * 100

    // ── Power ──
    const power = isThreePhase ? (Math.sqrt(3) * U * Ib) : (U * Ib)

    // ── Total cable length ──
    const totalLength = isThreePhase ? L : (2 * L)

    // ── I_r and I_z for the final cross-section ──
    const finalIdx = WIRE_STANDARDS.indexOf(finalCross)
    const finalIr = getIr(finalIdx, method, conductors, materialKey)
    const finalIz = finalIr * f1 * f2

    // ── Build result ──
    document.getElementById('wireEmptyState').style.display = 'none'
    document.getElementById('wireResultWrap').style.display = 'block'

    // Decisive label
    if (decisive === 'capacity') decisiveLabel = t('sparkLab.wire_decisive_cap')
    else if (decisive === 'drop') decisiveLabel = t('sparkLab.wire_decisive_drop')
    else decisiveLabel = t('sparkLab.wire_decisive_both')

    // Warning if capacity exceeded
    const capWarning = capResult.exceeded ? `<div class="stat-card stat-card-error"><div class="stat-value stat-value-error">⚠</div><div class="stat-label">${t('sparkLab.wire_cap_exceeded')}</div></div>` : ''

    document.getElementById('wireGrid').innerHTML = `
        ${capWarning}
        <div class="stat-card pink"><div class="stat-value">${finalCross} mm²</div><div class="stat-label">${t('sparkLab.wire_recommended')}</div></div>
        <div class="stat-card"><div class="stat-value">${AcalcDrop.toFixed(2)} mm²</div><div class="stat-label">${t('sparkLab.wire_cross_drop')}</div></div>
        <div class="stat-card"><div class="stat-value">${crossCap} mm²</div><div class="stat-label">${t('sparkLab.wire_cross_cap')}</div></div>
        <div class="stat-card green"><div class="stat-value">${UdropActual.toFixed(2)} V</div><div class="stat-label">${t('sparkLab.wire_drop_v')} (${dropPctActual.toFixed(2)} %)</div></div>
        <div class="stat-card yellow"><div class="stat-value">${finalIz.toFixed(1)} A</div><div class="stat-label">${t('sparkLab.wire_iz')} (I<sub>z</sub>)</div></div>
        <div class="stat-card purple"><div class="stat-value">${finalIr.toFixed(1)} A</div><div class="stat-label">${t('sparkLab.wire_ir')} (I<sub>r</sub>)</div></div>
        <div class="stat-card"><div class="stat-value">${(power / 1000).toFixed(2)} kW</div><div class="stat-label">${t('sparkLab.power')}</div></div>
        <div class="stat-card"><div class="stat-value">${totalLength.toFixed(1)} m</div><div class="stat-label">${t('sparkLab.wire_total_length')}</div></div>
    `
    // Factors summary
    document.getElementById('wireFactors').style.display = 'flex'
    document.getElementById('wireFactors').innerHTML = `
        <span class="meta-badge">f₁ = ${f1.toFixed(2)} <span class="val">(${ambientTemp} °C)</span></span>
        <span class="meta-badge">f₂ = ${f2.toFixed(2)} <span class="val">(${groupCount}×)</span></span>
        <span class="meta-badge">📐 ${decisiveLabel}</span>
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
