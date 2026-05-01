exports.description = "Create links to download a file, or access a folder, without login"
exports.version = 3
exports.apiRequired = 12.92 // checkVfsPermission
exports.repo = "rejetto/hfs-share-links"
exports.frontend_js = "main.js"
exports.preview = ["https://github.com/user-attachments/assets/c4904e7a-c6e3-457c-bab7-3d4f8328b3c7", "https://github.com/user-attachments/assets/1a49e538-078c-406c-a38e-6df391c42813"]
exports.changelog = [
    { "version": 3,    "message": "QR code" },
    { "version": 2.21, "message": "fix: improved security" },
    { "version": 2.2, "message": "option: delete file when link expires" },
    { "version": 2.13, "message": "fix: enforce expiration for folders immediately instead of in-a-minute" },
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
            days: !values.expiration && { $hideUnder: true, type: 'number', label: "Expire after", unit: 'days', min: 0, step: .01, defaultValue: 1, xs: 5, sm: 2 },
            daysStartOnAccess: !values.expiration && { $hideUnder: true, type: 'boolean', xs: 7, sm: 5 },
            deleteFileOnExpiration: { type: 'boolean', defaultValue: false, sm: 5 },
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
    const fs = api.require('fs/promises')
    const { _ } = api
    // keep in memory
    let links = []
    api.subscribeConfig('links', v => links = v.map(x => normalizeLink({ ...x, expiration: x.expiration && new Date(x.expiration) }))) // conversion is necessary for hfs 0.57.0-rc10
    // purge
    api.setInterval(purgeExpiredLinks, 60_000)

    api.events.on('checkVfsPermission', ({ node, perm, ctx }) => {
        const token = ctx.cookies.get('sharelink')
        if (!token) return
        const rec = _.find(links, { token })
        if (!rec) return
        if (isExpired(rec))
            return void purgeExpiredLinks()
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
                values.deleteFileOnExpiration = !values.isFolder && Boolean(values.deleteFileOnExpiration)
                if (values.deleteFileOnExpiration && !hasPermission(node, 'can_delete', ctx))
                    throw "missing permission"
                if (!values.isFolder)
                    values.source = node.source
                let {token} = values
                if (_.find(links, { token }))
                    throw "token already exists"
                token ||= api.misc.randomId(25) // 128 bits of randomness
                const rec = normalizeLink({ by: api.getCurrentUsername(ctx), creation: new Date, days: 0, ...values, token })
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
            if (!link || link.uri.endsWith('/')) return
            if (isExpired(link))
                return void purgeExpiredLinks()
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
            else {
                links = _.without(links, link)
                deleteLinkedFileOnExpiration(link)
            }
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

    function isExpired(link) {
        return link.expiration && link.expiration < new Date
    }

    function normalizeLink(link) {
        if (link.expiration) return link
        if (link.unit === 'd' || link.unit === 'h' || link.unit === 'm') return link
        return { ...link, unit: 'd' }
    }

    function purgeExpiredLinks() {
        const active = []
        const expired = []
        for (const link of links)
            (isExpired(link) ? expired : active).push(link)
        if (!expired.length) return
        links = active
        api.setConfig('links', links)
        expired.forEach(deleteLinkedFileOnExpiration)
    }

    async function deleteLinkedFileOnExpiration(link) {
        if (!link.deleteFileOnExpiration || link.isFolder || link.uri.endsWith('/')) return
        try {
            const source = await getLinkSource(link)
            if (!source) return
            const stats = await fs.stat(source).catch(() => null)
            if (!stats?.isFile()) return
            await fs.rm(source, { force: true })
        }
        catch (e) {
            api.log(String(e))
        }
    }

    async function getLinkSource(link) {
        if (link.source) return link.source
        const node = await urlToNode(link.uri)
        return node?.source
    }
}
