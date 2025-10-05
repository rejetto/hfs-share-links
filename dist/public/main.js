'use strict';{
    const { h, t, _ } = HFS
    const NAME = 'sharelink'

    let dataPromise
    function reload() {
        dataPromise = HFS.customRestCall('get_links')
    }
    HFS.watchState('username', reload, true)

    HFS.onEvent('additionalEntryDetails', async ({ entry }) =>
        _.find((await dataPromise).list, { uri: entry.uri }) && HFS.hIcon('link', { title: t("Share-link") }))

    HFS.onEvent('fileMenu', async ({ entry }) => {
        const data = await dataPromise
        if (!data) return
        const {isFolder} = entry
        const ofThisFile = _.filter(data.list, { uri: entry.uri })
        return !entry.url && [{ // no links
            id: 'share-links',
            icon: 'link',
            label: t("Share-links") + ' (' + ofThisFile.length + ')',
            async onClick() {
                const unitFactors = { m: 24*60, h: 24, d: 1 }
                const unitLabels = {
                    d: t("days"),
                    h: t("hours"),
                    m: t("minutes")
                }
                const { close } = await HFS.dialogLib.newDialog({
                    title: t("Share-links"),
                    Content() {
                        const [list, setList] = HFS.React.useState(ofThisFile)
                        const [unit, setUnit] = HFS.React.useState('d')
                        return h('div', {},
                            h('form', {
                                style: { display: 'flex', flexDirection: 'column', gap: '1em' },
                                async onSubmit(ev) {
                                    ev.preventDefault()
                                    const data = new FormData(ev.target)
                                    const days = Number(data.get('ttl')) / unitFactors[unit]
                                    const onAccess = data.get('daysStartOnAccess')
                                    if (!onAccess && !days)
                                        return HFS.dialogLib.alertDialog(t("0 days makes sense only when the flag is enabled"), 'warning')
                                    HFS.customRestCall('link', {
                                        uri: entry.uri,
                                        ...isFolder ? { isFolder, perms: data.getAll('perms') }
                                            : { dl: Boolean(data.get('forceDownload')) },
                                        token: data.get('token'),
                                        ...onAccess ? { days, unit } : { expiration: new Date(Date.now() + days * 86400_000) },
                                    }).then(res => {
                                        close()
                                        copy(res)
                                        reload()
                                    }, HFS.dialogLib.alertDialog)
                                },
                            },
                                t("Link for "), entry.uri,
                                h('div', { className: 'field' },
                                    h('label', {}, t("Time to live")),
                                    h('input', {
                                        type: 'number', name: 'ttl', min: 0, defaultValue: 1,
                                        style: { width: '5em', marginLeft: '1em', textAlign: 'right' },
                                    }),
                                    h('select', {
                                        value: unit,
                                        onChange: ev => setUnit(ev.target.value),
                                        style: { width: 'auto' }
                                    }, Object.entries(unitLabels).map(([v,label]) => h('option', { key: v, value: v }, label)))
                                ),
                                h('label', { className: 'field' },
                                    h('input', { type: 'checkbox', name: 'daysStartOnAccess', value: 1 }),
                                    t("Time starts from first access"),
                                ),
                                isFolder && h('fieldset', { style: { display: 'flex', flexWrap: 'wrap', gap: '1em', padding: '.8em' } },
                                    h('legend', {}, t("Permissions")),
                                    h('label', { className: 'field' },
                                        h('input', { type: 'checkbox', name: 'perms', value: 'list', defaultChecked: true }),
                                        t("List"),
                                    ),
                                    h('label', { className: 'field' },
                                        h('input', { type: 'checkbox', name: 'perms', value: 'read', defaultChecked: true }),
                                        t("Download"),
                                    ),
                                    h('label', { className: 'field' },
                                        h('input', { type: 'checkbox', name: 'perms', value: 'upload' }),
                                        t("Upload"),
                                    ),
                                    h('label', { className: 'field' },
                                        h('input', { type: 'checkbox', name: 'perms', value: 'delete' }),
                                        t("Delete"),
                                    ),
                                ),
                                !isFolder && h('label', { className: 'field' },
                                    h('input', { type: 'checkbox', name: 'forceDownload', value: 1 }),
                                    t("Force download"),
                                ),
                                h('div', { className: 'field' },
                                    h('label', {}, t("Token")),
                                    h('input', {
                                        name: 'token', placeholder: 'automatic',
                                        style: { width: '15em', marginLeft: '1em' },
                                    }),
                                ),
                                h('button', { type: 'submit' }, HFS.hIcon('copy'), ' ', t("Create share-link")),
                            ),
                            list.length > 0 && h('div', { style: { marginTop: '1em', paddingTop: '1em', borderTop: '1px solid', display: 'flex', flexDirection: 'column', gap: '.5em' } },
                                t("Existing links on this file"),
                                list.map((x, i) => h('div', {
                                    key: i,
                                    style: { display: 'flex', alignItems: 'center' }
                                },
                                    HFS.iconBtn('delete', async () => {
                                        await HFS.customRestCall('del_link', { token: x.token })
                                        setList(list.filter((_, j) => j !== i))
                                        reload()
                                    }),
                                    h('button', {
                                        onClick () {
                                            close()
                                            copy(x)
                                        },
                                    },
                                        HFS.hIcon('copy'), ' ' + t("Copy link"),
                                        ' (',
                                        ...x.expiration ? [t("Expires:"), ' ', HFS.misc.formatTimestamp(x.expiration)]
                                            : [Math.round(x.days * unitFactors[x.unit]), ' ', unitLabels[x.unit], ' ', x.daysStartOnAccess && t("from first access")],
                                        ')'
                                    ),
                                )),
                            ),
                        )
                    },
                })
            },
        }]

        async function copy(rec) {
            HFS.copyTextToClipboard(`${data.baseUrl}${rec.uri.endsWith('/') ? rec.uri : '/'}?${NAME}=${encodeURIComponent(rec.token)}${rec.dl ? '&dl' : ''}`)
            HFS.toast(t("Share-link copied"), 'success')
        }

    })

    // use a cookie to mae folders access working
    const token = new URLSearchParams(location.search).get(NAME)
        || getCookie(NAME) // user refreshed, and the cookie is still valid. Keep refreshing it
    const TTL = 5
    if (token) {
        history.replaceState({}, '', location.pathname) // hide token
        setEphemeralCookie()
        console.debug('share-link: cookie set')
        setInterval(setEphemeralCookie, (TTL - 2) * 1000)
    }

    function setEphemeralCookie() {
        document.cookie = `${NAME}=${encodeURIComponent(token)}; Max-Age=${TTL}; Secure; Path=/; SameSite=Strict;`
    }

    function getCookie(name) {
        return document.cookie.split('; ').find(x => x.startsWith(name + '='))?.split('=')[1]
    }

}
