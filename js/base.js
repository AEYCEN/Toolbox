const Base = {
    heidiDecode: '1.3 (07.03.26)',
    hashForge: '3.1 (07.03.26)',
    linkLoom: '2.1 (07.03.26)',
    wordWatch: '2.1 (07.03.26)',
    calcul8tr: '2.2 (08.03.26)',
    sparkLab: '1.1 (10.03.26)',
}

// ═══════════════════════════════════
//  Shared utilities
// ═══════════════════════════════════

function showToast(msg) {
    const el = document.getElementById('toast')
    if (!el) return
    el.textContent = msg
    el.classList.add('show')
    setTimeout(() => el.classList.remove('show'), 2200)
}

function esc(str) {
    const d = document.createElement('div')
    d.textContent = str
    return d.innerHTML
}

const escapeHtml = esc

function escapeAttr(str) {
    return str.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;')
}

function copyText(text, btn) {
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {
        showToast(t('common.clipboard'))
        if (btn) {
            const original = btn.innerHTML
            btn.innerHTML = t('common.copied')
            btn.classList.add('copied')
            setTimeout(() => { btn.innerHTML = original; btn.classList.remove('copied') }, 1600)
        }
    })
}

function copyResult(id, btn) {
    copyText(document.getElementById(id).value, btn)
}

// ═══════════════════════════════════
//  Tab system with persistence
// ═══════════════════════════════════

function showPanel(name) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'))
    const tab = document.querySelector(`.tab[data-panel="${name}"]`)
    if (tab) tab.classList.add('active')
    const panel = document.getElementById('panel-' + name)
    if (panel) panel.classList.add('active')
    const page = location.pathname.split('/').pop().replace('.html', '') || 'index'
    localStorage.setItem('tab_' + page, name)
}

// ═══════════════════════════════════
//  Version injection
// ═══════════════════════════════════

function injectVersions() {
    document.querySelectorAll('[data-version]').forEach(el => {
        const key = el.getAttribute('data-version')
        if (Base[key]) el.textContent = 'v' + Base[key]
    })
}

// ═══════════════════════════════════
//  Custom number input spinners
// ═══════════════════════════════════
function enhanceNumberInputs() {
    document.querySelectorAll('input[type="number"]').forEach(input => {
        if (input.closest('.number-wrap')) return
        const wrap = document.createElement('div')
        wrap.className = 'number-wrap'
        if (input.style.width) wrap.style.width = input.style.width
        else if (input.classList.contains('field-input')) wrap.style.width = '100%'
        input.parentNode.insertBefore(wrap, input)
        wrap.appendChild(input)
        const spin = document.createElement('div')
        spin.className = 'number-spin'
        spin.innerHTML = '<button type="button" tabindex="-1">▲</button><button type="button" tabindex="-1">▼</button>'
        wrap.appendChild(spin)
        const step = parseFloat(input.step) || 1
        const btns = spin.querySelectorAll('button')
        btns[0].addEventListener('mousedown', e => { e.preventDefault(); nudge(input, step) })
        btns[1].addEventListener('mousedown', e => { e.preventDefault(); nudge(input, -step) })
        let interval
        btns.forEach((btn, i) => {
            btn.addEventListener('mousedown', () => {
                interval = setTimeout(() => {
                    interval = setInterval(() => nudge(input, i === 0 ? step : -step), 60)
                }, 400)
            })
            btn.addEventListener('mouseup', () => { clearTimeout(interval); clearInterval(interval) })
            btn.addEventListener('mouseleave', () => { clearTimeout(interval); clearInterval(interval) })
        })
    })
}

function nudge(input, delta) {
    const min = input.min !== '' ? parseFloat(input.min) : -Infinity
    const max = input.max !== '' ? parseFloat(input.max) : Infinity
    const current = parseFloat(input.value) || 0
    const precision = (input.step && input.step !== 'any') ? (input.step.split('.')[1] || '').length : 2
    let next = Math.min(max, Math.max(min, current + delta))
    input.value = parseFloat(next.toFixed(precision))
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
}

// ═══════════════════════════════════
//  Language switcher injection
// ═══════════════════════════════════
function injectLangSwitcher() {
    // Find header or hero to attach switcher
    const anchor = document.querySelector('.header') || document.querySelector('.hero')
    if (!anchor) return

    const sw = document.createElement('div')
    sw.className = 'lang-switcher'
    sw.innerHTML = `
        <button class="lang-btn" data-lang="de" title="Deutsch">DE</button>
        <button class="lang-btn" data-lang="en" title="English">EN</button>
    `
    anchor.appendChild(sw)

    sw.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => I18n.load(btn.dataset.lang))
    })
}

// ═══════════════════════════════════
//  Boot sequence
// ═══════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    injectVersions()
    enhanceNumberInputs()
    injectLangSwitcher()

    // Tab initialization
    const tabs = document.querySelectorAll('.tab[data-panel]')
    if (tabs.length) {
        tabs.forEach(tab => tab.addEventListener('click', () => showPanel(tab.dataset.panel)))
        const page = location.pathname.split('/').pop().replace('.html', '') || 'index'
        const saved = localStorage.getItem('tab_' + page)
        if (saved && document.querySelector(`.tab[data-panel="${saved}"]`)) {
            showPanel(saved)
        }
    }

    I18n.init()
})
