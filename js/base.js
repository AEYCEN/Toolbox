const Base = {
    toolbox: '2.0 (07.03.26)',
    heidiDecode: '1.2 (07.03.26)',
    hashForge: '3.0 (07.03.26)',
    linkLoom: '2.0 (07.03.26)',
    wordWatch: '2.0 (07.03.26)',
    calcul8tr: '2.1 (07.03.26)',
    userScripts: '2.0 (07.03.26)',
}

function injectVersions() {
    document.querySelectorAll('[data-version]').forEach(el => {
        const key = el.getAttribute('data-version')
        if (Base[key]) el.textContent = 'v' + Base[key]
    })
    document.querySelectorAll('[data-version-text]').forEach(el => {
        const key = el.getAttribute('data-version-text')
        if (Base[key]) {
            el.innerHTML = el.innerHTML.replace(/\{v\}/g, Base[key])
        }
    })
}

document.addEventListener('DOMContentLoaded', injectVersions)

// ═══════════════════════════════════
//  Custom number input spinners
// ═══════════════════════════════════
function enhanceNumberInputs() {
    document.querySelectorAll('input[type="number"]').forEach(input => {
        if (input.closest('.number-wrap')) return

        const wrap = document.createElement('div')
        wrap.className = 'number-wrap'

        // Inherit width behavior from original input
        if (input.style.width) {
            wrap.style.width = input.style.width
        } else if (input.classList.contains('field-input')) {
            wrap.style.width = '100%'
        }

        input.parentNode.insertBefore(wrap, input)
        wrap.appendChild(input)

        const spin = document.createElement('div')
        spin.className = 'number-spin'
        spin.innerHTML = '<button type="button" tabindex="-1">▲</button><button type="button" tabindex="-1">▼</button>'
        wrap.appendChild(spin)

        const step = parseFloat(input.step) || 1
        const btns = spin.querySelectorAll('button')

        btns[0].addEventListener('mousedown', (e) => {
            e.preventDefault()
            nudge(input, step)
        })
        btns[1].addEventListener('mousedown', (e) => {
            e.preventDefault()
            nudge(input, -step)
        })

        // Hold to repeat
        let interval
        btns.forEach((btn, i) => {
            btn.addEventListener('mousedown', () => {
                interval = setTimeout(() => {
                    interval = setInterval(() => nudge(input, i === 0 ? step : -step), 60)
                }, 400)
            })
            btn.addEventListener('mouseup', () => clearRepeat())
            btn.addEventListener('mouseleave', () => clearRepeat())
        })

        function clearRepeat() {
            clearTimeout(interval)
            clearInterval(interval)
        }
    })
}

function nudge(input, delta) {
    const min = input.min !== '' ? parseFloat(input.min) : -Infinity
    const max = input.max !== '' ? parseFloat(input.max) : Infinity
    const current = parseFloat(input.value) || 0
    const precision = (input.step && input.step !== 'any') ? (input.step.split('.')[1] || '').length : 2
    let next = current + delta
    next = Math.min(max, Math.max(min, next))
    input.value = parseFloat(next.toFixed(precision))
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
}

document.addEventListener('DOMContentLoaded', enhanceNumberInputs)
