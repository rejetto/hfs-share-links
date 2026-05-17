exports.description = "Create links to download a file, or access a folder, without login"
exports.version = 3.11
exports.apiRequired = 12.92 // checkVfsPermission
exports.repo = "rejetto/hfs-share-links"
exports.frontend_js = "main.js"
exports.preview = ["https://github.com/user-attachments/assets/c4904e7a-c6e3-457c-bab7-3d4f8328b3c7", "https://github.com/user-attachments/assets/1a49e538-078c-406c-a38e-6df391c42813"]
exports.changelog = [
    { "version": 3.11, "message": "fix: access to folders with non-latin chars" },
    { "version": 3.1,  "message": "fix: access to folder not working + safer cookie storage + notify user of cookie usage" },
    { "version": 3.01, "message": "fix: faulty URLs when using host roots; improved security" },
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
            expiration: { type: 'date_time', label: "Expiration date", $hideUnder: 'sm', $width: 1, sm: 6,
                $render: ({ value, row }) => value ? new Date(value).toLocaleString() : `Expires in ${row.days} day(s) after first access`
            },
            days: !values.expiration && { $hideUnder: true, type: 'number', label: "Expire after", unit: 'days', min: 0, step: .01, defaultValue: 1, xs: 5, sm: 2 },
            daysStartOnAccess: !values.expiration && { $hideUnder: true, type: 'boolean', xs: 7, sm: 5 },
            deleteFileOnExpiration: { type: 'boolean', defaultValue: false, sm: 5 },
            creation: { $hideUnder: 900, disabled: true, placeholder: "unknown", xs: 6, $mergeRender: { by: {} },
                type: (!values || values.creation) && 'date_time', }, // no type to show placeholder (values is false for table, not form)
            by: { $hideUnder: true, disabled: true, placeholder: "unknown", xs: 6, $render: ({ value }) => value && ("by " + value) },
            perms: { type: 'multiselect', options: ['list','read','upload','delete'] },
        })
    },
}
exports.configDialog = {
    maxWidth: 1000
}

exports.init = api => {
    const { getBaseUrlOrDefault } = api.require('./listen')
    const { roots } = api.require('./roots')
    const { urlToNode, hasPermission, getNodeName, normalizeFilename } = api.require('./vfs')
    const { serveFileNode } = api.require('./serveFile')
    const fs = api.require('fs/promises')
    const { _ } = api
    // keep in memory
    let links = []
    let folderLinksByToken = new Map()
    const shareLinkCookieRefreshed = Symbol('shareLinkCookieRefreshed')
    const shareLinkTokens = Symbol('shareLinkTokens')
    const shareLinkNodeAccess = Symbol('shareLinkNodeAccess')
    api.subscribeConfig('links', v => {
        links = v.map(x => normalizeLink({ ...x, expiration: x.expiration && new Date(x.expiration) })) // conversion is necessary for hfs 0.57.0-rc10
        // checkVfsPermission runs once per permission check, so keep stable matching data out of its hot path
        folderLinksByToken = new Map(links.filter(x => x.isFolder).map(link => [link.token, makeFolderLinkAccess(link)]))
    })
    // purge
    api.setInterval(purgeExpiredLinks, 60_000)

    api.events.on('checkVfsPermission', ({ node, perm, ctx }) => {
        const access = getAccessForNode(ctx, node)
        if (!access) return
        if (isExpired(access.link))
            return void purgeExpiredLinks()
        if (access.perms.has(perm)) {
            // a cookie-only visit skips middleware, so refresh access only after permission is confirmed
            setShareLinkCookie(ctx, access.link.token)
            return 0
        }
    })

    return {
        onDirEntry({ entry, node, ctx }) {
            try { limitAccess(ctx) }
            catch { return }
            const username = api.getCurrentUsername(ctx)
            const uri = nodeToLinkUri(node, entry)
            const count = links.filter(link => link.by === username && link.uri === uri && !isExpired(link)).length
            if (count)
                entry.shareLinks = count
        },
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
                const baseUrl = await getBaseUrlOrDefault()
                const root = getRootForBaseUrl(baseUrl)
                return { ...safeLink(rec), baseUrl, ...(root && { sharePath: stripApplicableRoot(rec.uri, root) }) }
            },
            async get_links(filter = {}, ctx) {
                try { limitAccess(ctx) }
                catch { return false }
                const baseUrl = await getBaseUrlOrDefault()
                const root = getRootForBaseUrl(baseUrl)
                const includeSharePath = 'uri' in filter
                filter.by = api.getCurrentUsername(ctx)
                return {
                    baseUrl,
                    list: _.filter(links, filter).map(link => safeLink(link, includeSharePath && root)),
                }
            },
            del_link(filter, ctx) {
                limitAccess(ctx)
                filter.by = api.getCurrentUsername(ctx)
                _.remove(links, filter)
                api.setConfig('links', links)
            },
            get_sharelink_access({ uri }, ctx) {
                const access = uri && getAccessForUri(getShareLinkTokens(ctx), normalizeUri(uri))
                if (!access || !uri || !isLinkForUri(access, uri) || !access.perms.has('can_list')) return false
                setShareLinkCookie(ctx, access.link.token)
                return true
            },
        },
        async middleware(ctx) {
            const tokens = getShareLinkTokens(ctx)
            if (tokens.length)
                ctx[shareLinkTokens] = tokens
            const queryToken = ctx.query.sharelink
            if (!queryToken) return
            const link = _.find(links, { token: queryToken })
            if (!link) return
            if (isExpired(link))
                return void purgeExpiredLinks()
            if (link.uri.endsWith('/')) {
                setShareLinkCookie(ctx, queryToken)
                return
            }
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

    function nodeToLinkUri(node, entry) {
        const uri = nodeToUrl(node)
        return entry.n.endsWith('/') ? uri : uri.slice(0, -1)
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

    function setShareLinkCookie(ctx, token) {
        if (ctx[shareLinkCookieRefreshed] === token) return
        ctx[shareLinkCookieRefreshed] = token
        // keep the cookie short-lived so folder access does not silently survive normal browsing
        ctx.cookies.set('sharelink', encodeURIComponent(JSON.stringify([token, ...getCookieShareLinkTokens(ctx).filter(x => x !== token)].slice(0, 8))), { maxAge: 120_000, sameSite: 'strict', httpOnly: true })
    }

    function getFolderLinkAccess(token) {
        const access = folderLinksByToken.get(token)
        if (!access || isExpired(access.link)) return
        return access
    }

    function getAccessForUri(tokens, normalizedUri) {
        for (const token of tokens) {
            const access = getFolderLinkAccess(token)
            if (access && isLinkForNormalizedUri(access, normalizedUri))
                return access
        }
    }

    function getAccessForNode(ctx, node) {
        if (!ctx[shareLinkTokens]?.length) return
        ctx[shareLinkNodeAccess] ||= new WeakMap()
        if (ctx[shareLinkNodeAccess].has(node))
            return ctx[shareLinkNodeAccess].get(node)
        // APIs like get_file_details receive many uris, so there is no single request uri to preselect
        const access = getAccessForUri(ctx[shareLinkTokens], normalizeUri(nodeToUrl(node)))
        ctx[shareLinkNodeAccess].set(node, access)
        return access
    }

    function makeFolderLinkAccess(link) {
        // share links can store mixed encoded paths while HFS compares decoded paths or fully encoded node URLs
        return { link, normalizedUri: enforceFinalSlash(normalizeUri(link.uri)), perms: makeAllowedPerms(link.perms) }
    }

    function makeAllowedPerms(perms = []) {
        // store HFS permission names so the permission hook only needs a Set lookup
        const ret = new Set()
        if (perms.includes('list')) {
            ret.add('can_list')
            ret.add('can_see')
        }
        if (perms.includes('read')) {
            ret.add('can_read')
            ret.add('can_archive')
        }
        if (perms.includes('upload')) ret.add('can_upload')
        if (perms.includes('delete')) ret.add('can_delete')
        return ret
    }

    function isLinkForUri(access, uri) {
        return isLinkForNormalizedUri(access, normalizeUri(uri))
    }

    function isLinkForNormalizedUri(access, uri) {
        return uri.startsWith(access.normalizedUri)
    }

    function normalizeUri(uri) {
        return normalizeFilename(decodeUri(uri))
    }

    function getShareLinkTokens(ctx) {
        const token = ctx.query.sharelink
        if (token) return [token]
        return getCookieShareLinkTokens(ctx)
    }

    function getCookieShareLinkTokens(ctx) {
        return parseShareLinkCookie(ctx.cookies.get('sharelink'))
    }

    function parseShareLinkCookie(value) {
        if (!value) return []
        try {
            const ret = JSON.parse(decodeURIComponent(value))
            if (Array.isArray(ret)) return ret.filter(x => typeof x === 'string')
        }
        catch {}
        if (value.includes('~')) return [value, ...value.split('~').filter(Boolean)].slice(0, 8)
        try { return [decodeURIComponent(value)] }
        catch { return [value] }
    }

    function decodeUri(uri) {
        try { return decodeURI(uri) }
        catch { return uri }
    }

    function enforceFinalSlash(uri) {
        return uri.endsWith('/') ? uri : uri + '/'
    }

    function safeLink(link, root) {
        const ret = _.pick(link, ['token', 'expiration', 'days', 'daysStartOnAccess', 'unit', 'dl'])
        if (root)
            ret.sharePath = stripApplicableRoot(link.uri, root)
        return ret
    }

    function getRootForBaseUrl(baseUrl) {
        try {
            const root = roots.compiled()?.(new URL(baseUrl).host)
            return root && root !== '/' ? root : undefined
        }
        catch {}
    }

    function stripApplicableRoot(uri, root) {
        if (!root || root === '/') return uri
        if (uri === root.slice(0, -1)) return '/'
        if (!uri.startsWith(root)) return uri
        // a host root is applied again by HFS, so public links must not include it
        return '/' + uri.slice(root.length)
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
