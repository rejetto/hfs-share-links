const assert = require('node:assert/strict')
const { test } = require('node:test')

const plugin = require('../dist/plugin.js')

test('folder links outside configured host root use the request host', async () => {
    const { customRest } = makePlugin({
        links: [
            { token: 'inside', by: 'u', uri: '/dist/folder/', isFolder: true, perms: ['list'], days: 1 },
            { token: 'outside', by: 'u', uri: '/Movies/', isFolder: true, perms: ['list'], days: 1 },
        ],
        baseUrl: 'http://public.test',
        roots: { 'public.test': '/dist/' },
    })
    const ctx = makeCtx({ url: 'http://request.test/~/api/plugins/share-links/get_links' })

    const outside = await customRest.get_links({ uri: '/Movies/' }, ctx)
    assert.equal(outside.list[0].baseUrl, 'http://request.test')
    assert.equal('sharePath' in outside.list[0], false)

    const inside = await customRest.get_links({ uri: '/dist/folder/' }, ctx)
    assert.equal(inside.list[0].baseUrl, 'http://public.test')
    assert.equal(inside.list[0].sharePath, '/folder/')
})

test('includePath is saved only for folder links', async () => {
    const state = makePlugin()
    const ctx = makeCtx()

    const folder = await state.customRest.link({ uri: '/Movies/', isFolder: true, perms: ['list'], includePath: false }, ctx)
    assert.equal(folder.includePath, false)

    const file = await state.customRest.link({ uri: '/file.txt', includePath: false }, ctx)
    assert.equal('includePath' in file, false)
    assert.equal(state.links.at(-1).includePath, undefined)
})

test('short folder links redirect to the stored folder path', async () => {
    const { middleware } = makePlugin({
        links: [
            { token: 'folder-token', by: 'u', uri: '/Movies/', isFolder: true, perms: ['list'], days: 1 },
        ],
    })
    const ctx = makeCtx({ path: '/', query: { sharelink: 'folder-token' } })

    await middleware(ctx)

    assert.deepEqual(ctx.redirects, ['/Movies/?sharelink=folder-token'])
})

test('folder links already on the target path do not redirect', async () => {
    const { middleware } = makePlugin({
        links: [
            { token: 'folder-token', by: 'u', uri: '/Movies/', isFolder: true, perms: ['list'], days: 1 },
        ],
    })
    const ctx = makeCtx({ path: '/Movies/', query: { sharelink: 'folder-token' } })

    await middleware(ctx)

    assert.deepEqual(ctx.redirects, [])
})

test('existing folder links copy the saved short-url preference', async () => {
    let fileMenu
    let copied
    const oldGlobals = pickGlobals(['HFS', 'location', 'history', 'window', 'setInterval', 'clearInterval'])
    Object.assign(global, {
        location: { search: '', href: 'http://localhost/', pathname: '/' },
        history: { replaceState() {} },
        window: { addEventListener() {}, removeEventListener() {} },
        setInterval() { return 1 },
        clearInterval() {},
        HFS: {
            h,
            t: x => x,
            _: makeLodash(),
            getPluginPublic: () => '/',
            onEvent(name, cb) {
                if (name === 'fileMenu')
                    fileMenu = cb
            },
            hIcon: name => ({ icon: name }),
            iconBtn: (icon, onClick) => h('button', { onClick, icon }),
            React: { useState: initial => [initial, () => {}], useRef: () => ({ current: null }), useEffect() {} },
            dialogLib: { newDialog: async opts => ({ close() {}, opts }), alertDialog(e) { throw e } },
            customRestCall: async name => name === 'get_links' ? {
                baseUrl: 'http://localhost',
                list: [{ token: 'short', includePath: false }],
            } : false,
            copyTextToClipboard(text) { copied = text },
            toast() {},
            misc: { formatTimestamp: x => String(x) },
            watchState() {},
            state: { uri: '/' },
        },
    })
    delete require.cache[require.resolve('../dist/public/main.js')]

    try {
        require('../dist/public/main.js')
        const menu = await fileMenu({ entry: { isFolder: true, uri: '/Movies/', canDelete: () => false } })
        let dialogOptions
        global.HFS.dialogLib.newDialog = async opts => {
            dialogOptions = opts
            return { close() {} }
        }

        await menu[0].onClick()
        const copyButton = findNode(dialogOptions.Content(), node =>
            node.tag === 'button' && flatten(node.children).some(x => typeof x === 'string' && x.includes('Copy link')))
        assert.ok(copyButton)

        copyButton.props.onClick()

        assert.equal(copied, 'http://localhost/?sharelink=short')
    }
    finally {
        restoreGlobals(oldGlobals)
    }
})

function makePlugin({ links = [], baseUrl = 'http://localhost', roots = {} } = {}) {
    const state = { links: links.slice() }
    const ret = plugin.init({
        _: makeLodash(),
        require(id) {
            if (id === './listen') return { getBaseUrlOrDefault: async () => baseUrl }
            if (id === './roots') return { roots: { compiled: () => host => roots[host] } }
            if (id === './vfs') return {
                urlToNode: async uri => ({ uri, source: '/tmp/source', isFolder: uri.endsWith('/') }),
                hasPermission: () => true,
                getNodeName: node => node.uri.split('/').filter(Boolean).at(-1) || '',
                normalizeFilename: x => x.normalize('NFC'),
                nodeIsFolder: node => node.isFolder,
            }
            if (id === './serveFile') return { serveFileNode() {} }
            if (id === 'fs/promises') return require('node:fs/promises')
            throw new Error(id)
        },
        subscribeConfig(name, cb) {
            cb(state.links)
        },
        setInterval() {},
        events: { on() {} },
        getConfig(name) {
            return name === 'onlyFor' ? ['u'] : undefined
        },
        ctxBelongsTo: () => true,
        getCurrentUsername: () => 'u',
        setConfig(name, value) {
            state.links = value
        },
        misc: { randomId: () => 'generated-token' },
        log: () => {},
    })
    return Object.assign(state, ret)
}

function makeCtx({ url = 'http://localhost/', path = '/', query = {}, root, revProxyPath = '' } = {}) {
    return {
        URL: new URL(url),
        path,
        query,
        state: { root, revProxyPath },
        redirects: [],
        cookies: { get: () => undefined, set() {} },
        redirect(url) {
            this.redirects.push(url)
        },
        stop() {},
        logExtra() {},
    }
}

function makeLodash() {
    return {
        find: (arr, pred) => arr.find(matches(pred)),
        filter: (arr, pred) => arr.filter(matches(pred)),
        remove(arr, pred) {
            const match = matches(pred)
            const removed = []
            for (let i = arr.length - 1; i >= 0; i--)
                if (match(arr[i]))
                    removed.push(...arr.splice(i, 1))
            return removed.reverse()
        },
        without: (arr, item) => arr.filter(x => x !== item),
        pick(obj, keys) {
            const ret = {}
            for (const key of keys)
                if (key in obj)
                    ret[key] = obj[key]
            return ret
        },
    }
}

function matches(pred) {
    if (typeof pred === 'function') return pred
    return obj => Object.entries(pred).every(([k, v]) => obj[k] === v)
}

function h(tag, props, ...children) {
    return { tag, props: props || {}, children }
}

function findNode(node, pred) {
    if (Array.isArray(node)) {
        for (const child of node) {
            const ret = findNode(child, pred)
            if (ret) return ret
        }
        return
    }
    if (!node || typeof node !== 'object') return
    if (pred(node)) return node
    for (const child of node.children || []) {
        const ret = findNode(child, pred)
        if (ret) return ret
    }
}

function flatten(arr) {
    return arr.flatMap(x => Array.isArray(x) ? flatten(x) : [x])
}

function pickGlobals(keys) {
    const ret = {}
    for (const key of keys)
        ret[key] = key in global ? global[key] : undefined
    return ret
}

function restoreGlobals(values) {
    for (const [key, value] of Object.entries(values))
        if (value === undefined)
            delete global[key]
        else
            global[key] = value
}
