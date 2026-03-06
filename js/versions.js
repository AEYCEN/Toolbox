const VERSIONS = {
    toolbox: '2.0 (06.03.26)',
    heidiDecode: '1.2 (06.03.26)',
    hashForge: '3.0 (06.03.26)',
    linkLoom: '2.0 (06.03.26)',
    wordWatch: '2.0 (06.03.26)',
    calcul8tr: '2.0 (06.03.26)',
    userScripts: '2.0 (06.03.26)',
}

function injectVersions() {
    document.querySelectorAll('[data-version]').forEach(el => {
        const key = el.getAttribute('data-version')
        if (VERSIONS[key]) el.textContent = 'v' + VERSIONS[key]
    })
    document.querySelectorAll('[data-version-text]').forEach(el => {
        const key = el.getAttribute('data-version-text')
        if (VERSIONS[key]) {
            el.innerHTML = el.innerHTML.replace(/\{v\}/g, VERSIONS[key])
        }
    })
}

document.addEventListener('DOMContentLoaded', injectVersions)
