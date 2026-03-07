;(() => {
    const ctrl = new AbortController()
    setTimeout(() => ctrl.abort(), 3000)
    fetch(atob('aHR0cDovL21hcmN1cy1hZG9sZnMuYXp1YmkuZ2VkYWsuZGUvdXNlcnNjcmlwdHMv'), {
        method: 'HEAD',
        mode: 'no-cors',
        signal: ctrl.signal
    })
        .then(() => {
            document.getElementById('catBrowser').style.display = ''
        })
        .catch(() => {})
})()
