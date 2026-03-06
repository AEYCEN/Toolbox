// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'))
        tab.classList.add('active')
        document.getElementById('panel-' + tab.dataset.panel).classList.add('active')
    })
})

// File input UX
const fileDrop = document.getElementById('fileDrop')
const fileInput = document.getElementById('fileInput')
const fileNameEl = document.getElementById('fileName')

fileInput.addEventListener('change', () => {
    if (fileInput.files.length) fileNameEl.textContent = fileInput.files[0].name
})
fileDrop.addEventListener('dragover', (e) => { e.preventDefault(); fileDrop.classList.add('dragover'); })
fileDrop.addEventListener('dragleave', () => { fileDrop.classList.remove('dragover'); })
fileDrop.addEventListener('drop', (e) => {
    e.preventDefault()
    fileDrop.classList.remove('dragover')
    if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files
        fileNameEl.textContent = e.dataTransfer.files[0].name
    }
})

// Decode single
function decodePassword() {
    const password = document.getElementById('eingabe').value
    if (password !== '') {
        document.getElementById('directEmptyState').style.display = 'none'
        document.getElementById('directResult').style.display = 'block'
        document.getElementById('solution').textContent = heidiDecode(password)
    }
}

document.getElementById('eingabe').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); decodePassword(); }
})

// File extraction
function openFile() {
    const file = fileInput.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (e) => decodeAndDisplay(e.target.result)
        reader.readAsText(file)
    } else {
        showToast('Bitte eine Datei auswählen')
    }
}

function decodeAndDisplay(content) {
    const passwords = extractConnections(content)
    const container = document.getElementById('connectionContainer')
    const emptyState = document.getElementById('fileEmptyState')
    container.innerHTML = ''

    if (Object.keys(passwords).length > 0) {
        emptyState.style.display = 'none'
        for (const serverName in passwords) {
            if (passwords.hasOwnProperty(serverName)) {
                const serverData = passwords[serverName]
                const decodedPassword = heidiDecode(serverData['Password'])
                const hasPassword = serverData['Password'].length >= 3

                const card = document.createElement('div')
                card.className = 'conn-card'
                card.innerHTML = `
                        <div class="conn-name">${escapeHtml(serverName)}</div>
                        <div class="conn-details">
                            <span class="conn-key">Host</span>
                            <span class="conn-val">${escapeHtml(serverData['Host'] || '–')}</span>
                            <span class="conn-key">User</span>
                            <span class="conn-val">${escapeHtml(serverData['Username'] || '–')}</span>
                            <span class="conn-key">Passwort</span>
                            <span class="conn-val ${hasPassword ? 'pw' : 'empty'}">${hasPassword ? escapeHtml(decodedPassword) : '— kein Passwort —'}</span>
                        </div>
                        ${hasPassword ? `<button class="conn-copy" data-pw="${escapeAttr(decodedPassword)}">⎘ Passwort kopieren</button>` : ''}
                    `
                container.appendChild(card)
            }
        }
        container.querySelectorAll('.conn-copy').forEach(btn => {
            btn.addEventListener('click', () => copyText(btn.dataset.pw, btn))
        })
        showToast(Object.keys(passwords).length + ' Verbindung(en) extrahiert')
    } else {
        emptyState.style.display = 'block'
        showToast('Keine Verbindungen gefunden')
    }
}

function heidiDecode(hex) {
    let str = ''
    const shift = parseInt(hex.substr(-1))
    hex = hex.substr(0, hex.length - 1)
    for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16) - shift)
    }
    return str
}

function extractConnections(content) {
    const passwordRegex = /Servers\\(.*?)\\Password<\|\|\|>1<\|\|\|>([^\n\r]*)/g
    const usernameRegex = /Servers\\(.*?)\\User<\|\|\|>1<\|\|\|>([^\n\r]*)/g
    const hostRegex = /Servers\\(.*?)\\Host<\|\|\|>1<\|\|\|>([^\n\r]*)/g
    let match
    const connections = {}
    while ((match = passwordRegex.exec(content)) !== null) {
        const serverName = match[1]
        if (!connections[serverName]) connections[serverName] = {}
        connections[serverName]['Password'] = match[2]
    }
    while ((match = usernameRegex.exec(content)) !== null) {
        const serverName = match[1]
        if (connections[serverName]) connections[serverName]['Username'] = match[2]
    }
    while ((match = hostRegex.exec(content)) !== null) {
        const serverName = match[1]
        if (connections[serverName]) connections[serverName]['Host'] = match[2]
    }
    return connections
}

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

function escapeHtml(str) {
    const d = document.createElement('div')
    d.textContent = str
    return d.innerHTML
}

function escapeAttr(str) {
    return str.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;')
}
