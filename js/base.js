const Base = {
    heidiDecode: '1.3 (07.03.26)',
    hashForge: '3.1 (07.03.26)',
    linkLoom: '2.1 (07.03.26)',
    wordWatch: '2.1 (07.03.26)',
    calcul8tr: '2.2 (08.03.26)',
    sparkLab: '1.0 (08.03.26)',
}

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
    I18n.init()
})
