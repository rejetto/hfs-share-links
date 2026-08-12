const assert = require('node:assert/strict')
const test = require('node:test')

const plugin = require('../dist/plugin.js')

test('folder links cannot grant permissions the creator does not have', async () => {
    const permissions = new Set(['can_read', 'can_list', 'can_see'])
    const { customRest } = plugin.init({
        _: {
            find: (arr, pred) => arr.find(x => Object.entries(pred).every(([k, v]) => x[k] === v)),
            pick: (obj, keys) => Object.fromEntries(keys.filter(k => k in obj).map(k => [k, obj[k]])),
        },
        require(id) {
            if (id === './listen') return { getBaseUrlOrDefault: async () => 'http://localhost' }
            if (id === './roots') return { roots: { compiled: () => () => undefined } }
            if (id === './vfs') return {
                urlToNode: async () => ({ source: '/tmp/source' }),
                hasPermission: (_node, perm) => permissions.has(perm),
                getNodeName: () => 'Movies',
                normalizeFilename: String,
                nodeIsFolder: () => true,
            }
            if (id === './serveFile') return { serveFileNode() {} }
            if (id === 'fs/promises') return require('node:fs/promises')
            throw Error(id)
        },
        subscribeConfig(_name, cb) { cb([]) },
        setInterval() {},
        events: { on() {} },
        getConfig(name) { return name === 'onlyFor' ? ['u'] : undefined },
        ctxBelongsTo: () => true,
        getCurrentUsername: () => 'u',
        setConfig() {},
        misc: { randomId: () => 'token' },
        log() {},
    })

    await assert.rejects(
        customRest.link({ uri: '/Movies/', isFolder: false, perms: ['list', 'delete'] }, {}),
        /missing permission/)
})
