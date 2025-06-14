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
                                const hours = Number(data.get('hours') || 0)
                                const minutes = Number(data.get('minutes') || 0)
                                const seconds = Number(data.get('seconds') || 0)
                                const onAccess = data.get('daysStartOnAccess')

                                const totalMs = (((days * 24 + hours) * 60 + minutes) * 60 + seconds) * 1000 

                                if (!onAccess && totalMs === 0)
                                    return HFS.dialogLib.alertDialog(t("0 days makes sense only when the flag is enabled"), 'warning')
                                HFS.customRestCall('link', {
                                    uri: entry.uri,
                                    ...onAccess ? { days: totalMs / 86400000, daysStartOnAccess: true }
                                                : { expiration: new Date(Date.now() + totalMs) },

                                }).then(res => {
                                    close()
                                    copy(res.baseUrl, res.token)
                                    reload()
                                }, HFS.dialogLib.alertDialog)
                            },
                        },
                            t("Link for "), entry.uri,
                            h('div', { className: 'field' },
                            h('label', {}, t("Time to live")),
                            h('input', { type: 'number', name: 'days', min: 0, step: 1, defaultValue: 1, placeholder: t("days"), style: { width: '7em', marginLeft: '1em' } }),
                            h('input', { type: 'number', name: 'hours', min: 0, max: 23, step: 1, placeholder: t("hours"), style: { width: '7em', marginLeft: '1em' } }),
                            h('input', { type: 'number', name: 'minutes', min: 0, max: 59, step: 1, placeholder: t("minutes"), style: { width: '7em', marginLeft: '1em' } }),
                            h('input', { type: 'number', name: 'seconds', min: 0, max: 59, step: 1, placeholder: t("seconds"), style: { width: '7em', marginLeft: '1em' } }),
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
