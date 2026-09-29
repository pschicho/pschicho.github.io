// Renders the Teaching section's lectures (window.LECTURES) and builds the
// Outreach section with its navbar link from window.OUTREACH. Outreach adds
// nothing while its list is empty, so the section striping stays intact.
window.addEventListener('DOMContentLoaded', () => {
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    function formatDate(item) {
        if (item.dateLabel) return item.dateLabel;
        const [year, month] = item.date.split('-');
        return month ? `${MONTHS[Number(month) - 1]} ${year}` : year;
    }

    function newestFirst(items) {
        return [...items].sort((a, b) => b.date.localeCompare(a.date));
    }

    function streamItem(o) {
        return window.Site.streamItem({
            title: o.title,
            url: o.url,
            meta: [formatDate(o), o.where],
            buttons: o.links
        });
    }

    // Lectures
    const lecturesRoot = document.getElementById('lectures-root');
    if (lecturesRoot && window.LECTURES) {
        lecturesRoot.innerHTML = newestFirst(window.LECTURES).map(streamItem).join('\n');
    }

    // Outreach
    const outreach = window.OUTREACH || [];
    const teaching = document.getElementById('teaching');
    if (outreach.length === 0 || !teaching) return;

    const section = document.createElement('section');
    section.id = 'outreach';
    section.className = 'home-section wg-contact';
    section.innerHTML = `
        <div class="home-section-bg"></div>
        <div class="container">
            <div class="row">
                <div class="section-heading col-12 col-lg-4 mb-3 mb-lg-0 d-flex flex-column align-items-center align-items-lg-start">
                    <h1>Outreach</h1>
                </div>
                <div class="col-12 col-lg-8">
                    ${newestFirst(outreach).map(streamItem).join('\n')}
                </div>
            </div>
        </div>`;
    teaching.after(section);

    const teachingNav = document.querySelector('#navbar-main a[href="#teaching"]');
    if (teachingNav) {
        const li = document.createElement('li');
        li.className = 'nav-item';
        li.innerHTML = '<a class="nav-link" href="#outreach" data-target="#outreach"><span>Outreach</span></a>';
        teachingNav.closest('li').after(li);
    }
});
