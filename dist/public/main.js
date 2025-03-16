'use strict';{
    const { onlyFor } = HFS.getPluginConfig()
    const { h, state } = HFS

    HFS.onEvent('fileMenu', ({ entry }) =>
        (!onlyFor?.length || onlyFor.some(HFS.userBelongsTo))
        && !entry.isFolder
        && [{ id: 'share-link', icon: 'link', label: HFS.t("Share-link"), async onClick() {
            const res = await HFS.customRestCall('get_links', { uri: entry.uri })
            const { close } = await HFS.dialogLib.newDialog({
                title: HFS.t("Share-link"),
                Content() {
                    const [list, setList] = HFS.React.useState(res.list)
                    return h('div', {},
                        h('form', {
                            style: { display: 'flex', flexDirection: 'column', gap: '1em' },
                            async onSubmit(ev) {
                                const data = new FormData(ev.target)
                                const res = await HFS.customRestCall('link', {
                                    uri: entry.uri,
                                    days: Number(data.get('days')),
                                    daysStartOnAccess: Boolean(data.get('daysStartOnAccess')),
                                })
                                close()
                                copy(res.baseUrl, res.token)
                            },
                        },
                            h('div', { className: 'field' },
                                h('label', {}, HFS.t("Days to live")),
                                h('input', { type: 'number', name: 'days', min: .01, step: .01, defaultValue: 1 }),
                            ),
                            h('div', { className: 'field' },
                                h('label', {}, h('input', { type: 'checkbox', name: 'daysStartOnAccess', value: 1 }), HFS.t("Days start on first access")),
                            ),
                            h('button', { type: 'submit' }, HFS.t("Create share-link")),
                        ),
                        list.length > 0 && h('div', { style: { marginTop: '1em', display: 'flex', flexDirection: 'column', gap: '.5em' } },
                            HFS.t("Existing links on this file"),
                            list.map((x, i) => h('div', { key: i },
                                HFS.iconBtn('delete', () =>
                                    HFS.customRestCall('del_link', { token: x.token })
                                        .then(() => setList(list.filter((_, j) => j !== i)))),
                                h('button', { onClick() { close(); copy(res.baseUrl, x.token) } },
                                    HFS.hIcon('copy'), ' ',
                                    ...x.expiration ? [HFS.t("Expires:"), ' ', HFS.misc.formatTimestamp(x.expiration)]
                                        : [HFS.t("Days:"), ' ', x.days, ' ', x.daysStartOnAccess && HFS.t("(start on first access)")]
                                ),
                            ))
                        ),
                    )
                }
            })
        } }])

    function copy(base, token) {
        HFS.copyTextToClipboard(base + '/?sharelink=' + token)
        HFS.toast(HFS.t("Share-link copied"), 'success')
    }
}
