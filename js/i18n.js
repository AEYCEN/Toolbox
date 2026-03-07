// ═══════════════════════════════════
//  i18n — Translation engine
//  Loads YAML translation files and
//  applies them via data-i18n attributes
// ═══════════════════════════════════

const I18n = (() => {
    let _lang = localStorage.getItem('lang') || 'de'
    let _strings = {}
    let _ready = false
    const _callbacks = []

    // Resolve nested key like "common.copy" from object
    function resolve(obj, key) {
        return key.split('.').reduce((o, k) => (o && o[k] !== undefined) ? o[k] : null, obj)
    }

    // Public: get translated string, with optional interpolation
    function t(key, vars) {
        let str = resolve(_strings, key)
        if (str === null || str === undefined) return key
        if (vars) {
            Object.keys(vars).forEach(k => {
                str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), vars[k])
            })
        }
        return str
    }

    // Apply translations to all data-i18n elements in the DOM
    function applyDOM(root) {
        if (!_ready) return
        const scope = root || document

        // data-i18n → textContent
        scope.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n')
            const val = resolve(_strings, key)
            if (val !== null) el.textContent = val
        })

        // data-i18n-html → innerHTML
        scope.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html')
            const val = resolve(_strings, key)
            if (val !== null) el.innerHTML = val
        })

        // data-i18n-ph → placeholder
        scope.querySelectorAll('[data-i18n-ph]').forEach(el => {
            const key = el.getAttribute('data-i18n-ph')
            const val = resolve(_strings, key)
            if (val !== null) el.placeholder = val
        })

        // data-i18n-title → document title
        const titleEl = scope.querySelector('[data-i18n-title]')
        if (titleEl) {
            const key = titleEl.getAttribute('data-i18n-title')
            const val = resolve(_strings, key)
            if (val !== null) document.title = val
        }

        // Update lang switcher active state
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === _lang)
        })
    }

    // Resolve base path from current page location
    const _basePath = (() => {
        const path = window.location.pathname
        return path.substring(0, path.lastIndexOf('/') + 1)
    })()

    // Load a language YAML file
    async function load(lang) {
        _lang = lang
        localStorage.setItem('lang', lang)
        document.documentElement.lang = lang

        try {
            const res = await fetch(`${_basePath}lang/${lang}.yaml?v=${Date.now()}`)
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const text = await res.text()
            _strings = jsyaml.load(text)
            _ready = true
            applyDOM()
            _callbacks.forEach(fn => fn(lang))
        } catch (e) {
            console.error(`[i18n] Failed to load lang/${lang}.yaml:`, e)
        }
    }

    // Register callback for language changes (for JS-generated content)
    function onSwitch(fn) {
        _callbacks.push(fn)
        if (_ready) fn(_lang)
    }

    // Get current language
    function lang() { return _lang }

    // Init: load saved or default language
    function init() {
        load(_lang)
    }

    return { t, applyDOM, load, onSwitch, lang, init }
})()

// Global shortcut
function t(key, vars) { return I18n.t(key, vars) }
