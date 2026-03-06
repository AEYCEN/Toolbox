
// ══════════════════════════════════════════════════
// Hier die verfügbaren UserScript-Dateinamen eintragen:
// Diese Liste muss manuell gepflegt werden, da ohne
// Server kein Verzeichnis-Scan möglich ist.
// ══════════════════════════════════════════════════
const scripts = [
    // Beispiel: 'mein-script.user.js',
]
const cacheBuster = Date.now()
const scriptStore = new Map()

// ── Guide toggle ──
function toggleGuide() {
    const content = document.getElementById('guideContent')
    const toggle = document.getElementById('guideToggle')
    content.classList.toggle('open')
    toggle.classList.toggle('open')
}

// ── Toast ──
function showToast(msg) {
    const t = document.getElementById('toast')
    t.textContent = msg
    t.classList.add('show')
    setTimeout(() => t.classList.remove('show'), 2200)
}

// ── Load & render scripts ──
async function loadScripts() {
    const container = document.getElementById('scriptsList')
    const skeleton = document.getElementById('loadingSkeleton')

    if (scripts.length === 0) {
        skeleton.remove()
        container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📭</div>
                    <div>Keine UserScripts gefunden</div>
                </div>`
        return
    }

    const cards = []

    for (let i = 0; i < scripts.length; i++) {
        const file = scripts[i]
        const name = file.replace('.user.js', '')

        let code = ''
        try {
            const res = await fetch(`http://marcus-adolfs.azubi.gedak.de/userscripts/${file}?v=${cacheBuster}`)
            code = await res.text()
        } catch {
            cards.push(createErrorCard(name, file))
            continue
        }

        scriptStore.set(name, code)

        const headerMatch = code.match(/\/\/ ==UserScript==([\s\S]*?)==\/UserScript==/)
        const header = headerMatch ? headerMatch[1] : ''
        const version = extractMeta(header, 'version')
        const author = extractMeta(header, 'author')
        const description = extractMeta(header, 'description')

        const examplePath = `http://marcus-adolfs.azubi.gedak.de/userscripts/example/${name}.png`
        let hasExample = false
        try {
            const head = await fetch(`${examplePath}?v=${cacheBuster}`, { method: 'HEAD' })
            hasExample = head.ok
        } catch {
            hasExample = false
        }

        const card = document.createElement('div')
        card.className = 'script-card'
        card.style.animationDelay = `${0.2 + i * 0.07}s`

        card.innerHTML = `
                <div class="script-top">
                    <span class="script-name">${escapeHtml(name)}</span>
                    <div class="script-actions">
                        <button class="btn-copy-script" data-name="${escapeAttr(name)}">⎘ Kopieren</button>
                        ${hasExample
            ? `<button class="btn-example" data-target="example-${i}">Beispiel</button>`
            : ''}
                    </div>
                </div>
                ${description ? `<div class="script-desc">${escapeHtml(description)}</div>` : ''}
                <div class="script-meta">
                    <span class="meta-tag"><span class="label">Version</span> <span class="value">${escapeHtml(version)}</span></span>
                    <span class="meta-tag"><span class="label">Autor</span> <span class="value">${escapeHtml(author)}</span></span>
                </div>
                ${hasExample
            ? `<div class="example-wrapper" id="example-${i}">
                         <img src="${examplePath}?v=${cacheBuster}" alt="Beispiel: ${escapeAttr(name)}" loading="lazy">
                       </div>`
            : ''}
            `

        cards.push(card)
    }

    skeleton.remove()
    cards.forEach(c => container.appendChild(c))

    // Copy buttons
    document.querySelectorAll('.btn-copy-script').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.dataset.name
            const text = scriptStore.get(name) || ''
            copyToClipboard(text, btn)
        })
    })

    // Example toggle
    document.querySelectorAll('.btn-example').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = document.getElementById(btn.dataset.target)
            if (target) {
                target.classList.toggle('open')
                btn.classList.toggle('open')
            }
        })
    })
}

function createErrorCard(name, file) {
    const card = document.createElement('div')
    card.className = 'script-card'
    card.innerHTML = `
            <div class="script-top">
                <span class="script-name" style="color: var(--accent2);">${escapeHtml(name)}</span>
            </div>
            <div class="script-desc" style="color: var(--accent2);">Fehler beim Laden: ${escapeHtml(file)}</div>
        `
    return card
}

function extractMeta(header, key) {
    const regex = new RegExp(`@${key}\\s+([^\\r\\n]+)`, 'i')
    const match = header.match(regex)
    return match ? match[1].trim() : '–'
}

function copyToClipboard(text, btn) {
    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(() => flash(btn))
    } else {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.position = 'fixed'
        ta.style.left = '-9999px'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        flash(btn)
    }
}

function flash(btn) {
    const original = btn.innerHTML
    btn.innerHTML = '✓ Kopiert'
    btn.classList.add('copied')
    showToast('In die Zwischenablage kopiert')
    setTimeout(() => {
        btn.innerHTML = original
        btn.classList.remove('copied')
    }, 1600)
}

function escapeHtml(str) {
    const d = document.createElement('div')
    d.textContent = str
    return d.innerHTML
}

function escapeAttr(str) {
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

loadScripts()
