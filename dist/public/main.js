'use strict';{
    const { h, t, _ } = HFS

    let data
    async function reload() {
        data = HFS.customRestCall('get_links')
    }
    HFS.watchState('username', reload, true)

    HFS.onEvent('additionalEntryDetails', async ({ entry }) =>
        _.find((await data).list, { uri: entry.uri }) && HFS.hIcon('link', { title: t("Share-link") }))

    HFS.onEvent('fileMenu', async ({ entry }) =>
        await data && !entry.isFolder
        && [{ id: 'share-link', icon: 'link', label: t("Share-link"), async onClick() {
            const ofThisFile = _.filter((await data).list, { uri: entry.uri })
            const { close } = await HFS.dialogLib.newDialog({
                title: t("Share-link"),
                Content() {
                    const [list, setList] = HFS.React.useState(ofThisFile)
                    return h('div', {},
                        h('form', {
                            style: { display: 'flex', flexDirection: 'column', gap: '1em' },
                            async onSubmit(ev) {
                                ev.preventDefault()
                                const data = new FormData(ev.target)
                                const days = Number(data.get('days'))
                                const onAccess = data.get('daysStartOnAccess')
                                if (!onAccess && !days)
                                    return HFS.dialogLib.alertDialog(t("0 days makes sense only when the flag is enabled"), 'warning')
                                HFS.customRestCall('link', {
                                    uri: entry.uri,
                                    ...onAccess ? { days } : { expiration: new Date(Date.now() + days * 86400_000) },
                                }).then(res => {
                                    close()
                                    copy(res.baseUrl, res.token)
                                    reload()
                                }, HFS.dialogLib.alertDialog)
                            },
                        },
                            t("Link for "), entry.uri,
                            h('div', { className: 'field' },
                                h('label', {}, t("Days to live")),
                                h('input', { type: 'number', name: 'days', min: 0, step: .01, defaultValue: 1,
                                    style: { width: '5em', marginLeft: '1em' }
                                }),
                            ),
                            h('label', { className: 'field' },
                                h('input', { type: 'checkbox', name: 'daysStartOnAccess', value: 1 }),
                                t("Days start on first access")
                            ),
                            h('button', { type: 'submit' }, HFS.hIcon('copy'),' ', t("Create share-link")),
                        ),
                        list.length > 0 && h('div', { style: { marginTop: '2em', display: 'flex', flexDirection: 'column', gap: '.5em' } },
                            t("Existing links on this file"),
                            list.map((x, i) => h('div', { key: i },
                                HFS.iconBtn('delete', async () => {
                                    await HFS.customRestCall('del_link', { token: x.token })
                                    setList(list.filter((_, j) => j !== i))
                                    reload()
                                }),
                                h('button', { onClick() { close(); copy(data.baseUrl, x.token) } },
                                    HFS.hIcon('copy'), ' ' + t("Copy") + ' - ',
                                    ...x.expiration ? [t("Expires:"), ' ', HFS.misc.formatTimestamp(x.expiration)]
                                        : [t("Days:"), ' ', x.days, ' ', x.daysStartOnAccess && t("(start on first access)")]
                                ),
                            ))
                        ),
                    )
                }
            })
        } }])

    function copy(base, token) {
        HFS.copyTextToClipboard(base + '/?sharelink=' + token)
        HFS.toast(t("Share-link copied"), 'success')
    }
}
