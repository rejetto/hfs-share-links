exports.description = "Create links to download a file without login"
exports.version = 1
exports.apiRequired = 12.1 // array.fields as function
exports.repo = "rejetto/hfs-share-links"
exports.frontend_js = "main.js"
exports.config = {
    onlyFor: {
        type: 'username',
        multiple: true,
        label: "Show only for",
        helperText: "Leave empty to allow everyone",
    },
    links: {
        type: 'array',
        defaultValue: [],
        form: { maxWidth: 'sm' },
        fields: values => ({
            uri: { $width: 1.5, label: "URI", type: 'vfs_path', $mergeRender: { expiration: {} } },
            token: { required: true, $hideUnder: true },
            expiration: { type: 'date_time', label: "Expiration date", $hideUnder: 'sm', $width: 1,
                $render: ({ value, row }) => value ? new Date(value).toLocaleString() : `Expires in ${row.days} day(s) after first access`
            },
            days: !values.expiration && { $hideUnder: true, type: 'number', label: "Expire after", unit: 'days', min: 0, step: .01, defaultValue: 1, xs: 5, sm: 3 },
            daysStartOnAccess: !values.expiration && { $hideUnder: true, type: 'boolean', xs: 7, sm: 4 },
            by: { $hideUnder: 900, disabled: true, placeholder: "none", xs: 6, $mergeRender: { creation: {} } },
            creation: { $hideUnder: true, disabled: true, placeholder: "unknown", type: (!values || values.creation) && 'date_time', xs: 6 }, // no type to show placeholder (values is false for table, not form)
        })
    },
}
exports.configDialog = {
    maxWidth: 1000
}

exports.init = api => {
    const { getBaseUrlOrDefault } = api.require('./listen')
    const { urlToNode } = api.require('./vfs')
    const { serveFileNode } = api.require('./serveFile')
    const { _ } = api
    // keep in memory
    let links = []
    api.subscribeConfig('links', v => links = v.map(x => ({ ...x, expiration: x.expiration && new Date(x.expiration) })))
    // purge
    api.setInterval(() => {
        const now = new Date
        api.setConfig('links', links.filter(l => !(now > new Date(l.expiration))))
    }, 60_000)

    return {
        customRest: {
            async link(values, ctx) {
                limitAccess(ctx)
                const token = api.misc.randomId(25) // 128 bits of randomness
                api.setConfig('links', [...links, { token, by: api.getCurrentUsername(ctx), creation: new Date, ...values }])
                return { token, baseUrl: await getBaseUrlOrDefault() }
            },
            async get_links(filter, ctx) {
                try { limitAccess(ctx) }
                catch { return false }
                return {
                    baseUrl: await getBaseUrlOrDefault(),
                    list: _.filter(links, filter)
                }
            },
            del_link(filter, ctx) {
                limitAccess(ctx)
                _.remove(links, filter)
                api.setConfig('links', links)
            },
        },
        async middleware(ctx) {
            const { sharelink } = ctx.query
            if (!sharelink) return
            ctx.stop()
            const link = links.find(l => l.token === sharelink)
            if (!link || link.expiration && link.expiration < new Date) return
            const node = await urlToNode(link.uri)
            if (!node) return
            await serveFileNode(ctx, node)
            if (!link.daysStartOnAccess || link.expiration) return
            if (link.days) {
                link.expiration = new Date(Date.now() + link.days * 86400_000)
                links = links.slice()
            }
            else
                links = _.without(links, link)
            api.setConfig('links', links)
        },
    }

    function limitAccess(ctx) {
        const limitTo = api.getConfig('onlyFor')
        if (!limitTo?.length) return
        if (!api.ctxBelongsTo(ctx, limitTo))
            throw 401
    }
}