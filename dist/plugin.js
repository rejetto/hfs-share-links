exports.description = "Create links to download a file without login"
exports.version = 9
exports.repo = "rejetto/hfs-share-links"
exports.frontend_js = "main.js"
exports.config = {
    onlyFor: {
        frontend: true,
        type: 'username',
        multiple: true,
        label: "Show only for",
        helperText: "Leave empty to allow everyone",
    },
    links: {
        type: 'array',
        defaultValue: [],
        fields: {
            uri: { disabled: true, $width: 1 },
            token: { disabled: true, $hideUnder: 1e9 },
            days: { type: 'number', unit: 'days', min: .01, step: .01, defaultValue: 1 },
            daysStartOnAccess: { type: 'boolean' },
            expiration: { type: 'date_time' },
        }
    },
}
exports.configDialog = {
    maxWidth: '40em'
}

exports.init = api => {
    const { getBaseUrlOrDefault } = api.require('./listen')
    const { urlToNode } = api.require('./vfs')
    const { serveFileNode } = api.require('./serveFile')
    // keep in memory
    let links = []
    api.subscribeConfig('links', v => links = v)
    // purge
    api.setInterval(() => {
        const now = new Date
        api.setConfig('links', links.filter(l => !(new Date(l.expiration) < now)))
    }, 60_000)

    return {
        customRest: {
            async link(values) {
                const token = api.misc.randomId(50) // 258 bits of randomness
                api.setConfig('links', [...links, { token, ...values }])
                return { token, baseUrl: await getBaseUrlOrDefault() }
            },
            async get_links(filter) {
                return {
                    baseUrl: await getBaseUrlOrDefault(),
                    list: api._.filter(links, filter)
                }
            },
            del_link(filter) {
                api._.remove(links, filter)
                api.setConfig('links', links)
            },
        },
        async middleware(ctx) {
            const {sharelink} = ctx.query
            if (!sharelink) return
            const link = links.find(l => l.token === sharelink)
            const valid = link && !(new Date(link.expiration) < new Date)
            const node = valid && await urlToNode(link.uri)
            if (!node) return ctx.status = 404
            await serveFileNode(ctx, node)
            return ctx.stop()
        },
    }
}