window.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('group-members-root');
    if (!root || !window.GROUP_MEMBERS) return;

    const LEVELS = [
        { key: 'phd',     label: 'PhD students' },
        { key: 'master',  label: 'Master students' },
        { key: 'bachelor',label: 'Bachelor students' },
        { key: 'visitor', label: 'Visitors' },
    ];

    function memberCard(m) {
        const nameHtml = m.url
            ? `<a href="${m.url}" target="_blank" rel="noopener">${m.name}</a>`
            : m.name;
        const photoHtml = m.photo
            ? `<img class="member-photo" src="${m.photo}" alt="${m.name}" loading="lazy">`
            : `<div class="member-photo-placeholder"><i class="fas fa-user"></i></div>`;
        const emailHtml = m.email
            ? `<span class="member-email"><i class="fas fa-envelope fa-xs" style="margin-right:4px;opacity:.6;"></i>${m.email.replace('@', '[at]')}</span>`
            : '';
        return `
        <div class="member-card">
            ${photoHtml}
            <div class="member-info">
                <span class="member-name">${nameHtml}</span>
                ${emailHtml}
            </div>
        </div>`;
    }

    function section(label, members, topMargin) {
        if (members.length === 0) {
            return `<div style="margin-top:${topMargin};">
                <h4 style="margin-bottom:4px;">${label}</h4>
                <p style="margin:0;color:#6c757d;"><em>currently none</em></p>
            </div>`;
        }
        return `<div style="margin-top:${topMargin};">
            <h4 style="margin-bottom:8px;">${label}</h4>
            <div class="member-cards">
                ${members.map(memberCard).join('\n')}
            </div>
        </div>`;
    }

    const active = window.GROUP_MEMBERS.filter(m => m.status === 'active');
    const former = window.GROUP_MEMBERS.filter(m => m.status === 'former');

    let html = '';
    LEVELS.forEach((lvl, i) => {
        const members = active.filter(m => m.level === lvl.key);
        html += section(lvl.label, members, i === 0 ? '16px' : '14px');
    });

    // Former students — plain linked list, no cards
    if (former.length > 0) {
        const items = former.map(m => {
            const nameHtml = m.url
                ? `<a href="${m.url}" target="_blank" rel="noopener">${m.name}</a>`
                : m.name;
            const emailSpan = m.email
                ? ` <span style="font-size:.85em;color:#6c757d;">(${m.email})</span>`
                : '';
            return `<li>${nameHtml}${emailSpan}</li>`;
        }).join('\n');
        html += `<div style="margin-top:14px;">
            <h4 style="margin-bottom:4px;">Former members</h4>
            <ul style="margin:4px 0 0 1.2em; padding:0;">${items}</ul>
        </div>`;
    }

    root.innerHTML = html;
});
