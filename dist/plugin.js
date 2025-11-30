exports.description = "Create links to download a file, or access a folder, without login"
exports.version = 2.12
exports.apiRequired = 12.92 // checkVfsPermission
exports.repo = "rejetto/hfs-share-links"
exports.frontend_js = "main.js"
exports.preview = ["https://github.com/user-attachments/assets/c4904e7a-c6e3-457c-bab7-3d4f8328b3c7", "https://github.com/user-attachments/assets/1a49e538-078c-406c-a38e-6df391c42813"]
exports.changelog = [
    { "version": 2.12, "message": "fix: links should not be case sensitive" },
    { "version": 2.11, "message": "compatibility with firefox 52" },
    { "version": 2.1, "message": "you can set hours or minutes instead of days" },
    { "version": 2.02, "message": "zip support" },
    { "version": 2.01, "message": "folders support" },
    { "version": 1.2, "message": "improved security and logs" },
    { "version": 1.21, "message": "preview of number of links on a file" },
    { "version": 1.22, "message": "force-download flag" },
    { "version": 1.3, "message": "customizable token" },
    { "version": 1.31, "message": "fix: bad link in case of spaces in the token" }
]
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
            daysStartOnAccess: !values.expiration && { $hideUnder: true, type: 'boolean', xs: 7, sm: 9 },
            creation: { $hideUnder: 900, disabled: true, placeholder: "unknown", xs: 6, $mergeRender: { by: {} },
                type: (!values || values.creation) && 'date_time', }, // no type to show placeholder (values is false for table, not form)
            by: { $hideUnder: true, disabled: true, placeholder: "unknown", xs: 6, $render: ({ value }) => value && ("by " + value) },
        })
    },
}
exports.configDialog = {
    maxWidth: 1000
}

exports.init = api => {
    const { getBaseUrlOrDefault } = api.require('./listen')
    const { urlToNode, hasPermission, getNodeName, isSameFilenameAs } = api.require('./vfs')
    const { serveFileNode } = api.require('./serveFile')
    const { _ } = api
    // keep in memory
    let links = []
    api.subscribeConfig('links', v => links = v.map(x => ({ ...x, expiration: x.expiration && new Date(x.expiration) }))) // conversion is necessary for hfs 0.57.0-rc10
    // purge
    api.setInterval(() => {
        const now = new Date
        api.setConfig('links', links.filter(l => !(now > new Date(l.expiration))))
    }, 60_000)

    api.events.on('checkVfsPermission', ({ node, perm, ctx }) => {
        const token = ctx.cookies.get('sharelink')
        if (!token) return
        const rec = _.find(links, { token })
        if (!rec?.isFolder) return
        const match = isSameFilenameAs(rec.uri)
        const startsAsRecord = x => match(x.slice(0, rec.uri.length))
        if (startsAsRecord(ctx.path) || startsAsRecord(nodeToUrl(node)))
            if (rec.perms?.includes(perm.replace('can_', '').replace('see', 'list').replace('archive', 'read')))
                return 0
    })

    return {
        customRest: {
            async link(values, ctx) {
                limitAccess(ctx)
                if (!values.uri)
                    throw "missing uri"
                const node = await urlToNode(values.uri, ctx)
                if (!node)
                    throw "bad uri"
                if (!hasPermission(node, 'can_read', ctx))
                    throw "missing permission"
                if (!values.expiration)
                    values.daysStartOnAccess = true
                let {token} = values
                if (_.find(links, { token }))
                    throw "token already exists"
                token ||= api.misc.randomId(25) // 128 bits of randomness
                const rec = { by: api.getCurrentUsername(ctx), creation: new Date, days: 0, ...values, token }
                api.setConfig('links', [...links, rec])
                return { ...rec, baseUrl: await getBaseUrlOrDefault() }
            },
            async get_links(filter, ctx) {
                try { limitAccess(ctx) }
                catch { return false }
                filter.by = api.getCurrentUsername(ctx)
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
            const token = ctx.query.sharelink
            if (!token) return
            const link = _.find(links, { token })
            if (!link || link.uri.endsWith('/') || link.expiration && link.expiration < new Date) return
            ctx.stop()
            const node = await urlToNode(link.uri)
            if (!node) return
            await serveFileNode(ctx, node)
            ctx.logExtra(null, { URI: link.uri })
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

    function nodeToUrl(n) {
        let ret = ''
        while (n) {
            const name = encodeURIComponent(getNodeName(n))
            ret = name + '/' + ret
            n = n.parent
        }
        return ret
    }

    function limitAccess(ctx) {
        const limitTo = api.getConfig('onlyFor')
        if (!limitTo?.length) return
        if (!api.ctxBelongsTo(ctx, limitTo))
            throw 401
    }
}