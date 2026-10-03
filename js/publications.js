window.addEventListener('DOMContentLoaded', () => {
    const list = document.querySelector('#inspire-publications-list');
    const status = document.querySelector('#inspire-publications-status');
    const latestList = document.querySelector('#inspire-latest-list');
    const latestStatus = document.querySelector('#inspire-latest-status');

    if (!list || !status) {
        return;
    }

    const BASE_QUERY = 'authors.recid:1639147';
    const BASE_FIELDS = 'titles,citation_count,control_number,dois,arxiv_eprints,publication_info,authors';

    const formatAuthorName = (author) => {
        const fullName = author && author.full_name ? author.full_name : '';

        if (!fullName.includes(',')) {
            return fullName;
        }

        const [lastName, firstNames] = fullName.split(',').map((part) => part.trim());
        return `${firstNames} ${lastName}`.trim();
    };

    const summarizeAuthors = (authors) => {
        const names = (authors || []).map(formatAuthorName).filter(Boolean);

        if (names.length <= 4) {
            return names.join(', ');
        }

        return `${names.slice(0, 4).join(', ')}, et al.`;
    };

    const publicationLabel = (publicationInfo) => {
        const primaryPublication = (publicationInfo || [])[0] || {};

        if (primaryPublication.pubinfo_freetext) {
            return primaryPublication.pubinfo_freetext;
        }

        const parts = [
            primaryPublication.journal_title,
            primaryPublication.journal_volume,
            primaryPublication.artid || primaryPublication.page_start,
        ].filter(Boolean);

        return parts.join(', ');
    };

    const citationLabel = (count) => `${count} citation${count === 1 ? '' : 's'}`;

    const esc = window.Site.escapeHtml;

    // INSPIRE titles may contain LaTeX ($…$, left as text for MathJax) and
    // MathML (<math>…</math>). Keep MathML elements, turn anything else into
    // plain text. A <template> parses the markup without running it.
    const MATHML_TAGS = new Set(['math', 'mrow', 'mi', 'mn', 'mo', 'ms', 'mtext', 'mspace',
        'msup', 'msub', 'msubsup', 'mfrac', 'msqrt', 'mroot', 'mover', 'munder', 'munderover',
        'mstyle', 'mpadded', 'mphantom', 'mtable', 'mtr', 'mtd', 'semantics', 'annotation']);
    const MATHML_ATTRS = new Set(['display', 'mathvariant', 'stretchy', 'fence', 'separator', 'accent']);

    const sanitizeTitle = (title) => {
        const template = document.createElement('template');
        template.innerHTML = title;
        const clean = (node) => {
            [...node.childNodes].forEach((child) => {
                if (child.nodeType === Node.TEXT_NODE) return;
                if (child.nodeType !== Node.ELEMENT_NODE || !MATHML_TAGS.has(child.localName)) {
                    child.replaceWith(document.createTextNode(child.textContent));
                    return;
                }
                [...child.attributes].forEach((attr) => {
                    if (!MATHML_ATTRS.has(attr.name)) child.removeAttribute(attr.name);
                });
                clean(child);
            });
        };
        clean(template.content);
        return template.innerHTML;
    };

    const publicationCard = (item, badge) => {
        const metadata = item.metadata || {};
        const title = ((metadata.titles || [])[0] || {}).title || 'Untitled publication';
        const authors = summarizeAuthors(metadata.authors);
        const publication = publicationLabel(metadata.publication_info);
        const year = (((metadata.publication_info || [])[0] || {}).year || '').toString();
        const citationCount = Number(metadata.citation_count || 0);
        const arxiv = ((metadata.arxiv_eprints || [])[0] || {}).value;
        const doi = ((metadata.dois || [])[0] || {}).value;
        const inspireUrl = metadata.control_number
            ? `https://inspirehep.net/literature/${metadata.control_number}`
            : 'https://inspirehep.net/authors/1639147';

        const metaBits = [publication, year].filter(Boolean).join(' · ');
        const links = [
            window.Site.externalLink(inspireUrl, 'INSPIRE'),
            doi ? window.Site.externalLink(`https://doi.org/${doi}`, 'DOI') : '',
            arxiv ? window.Site.externalLink(`https://arxiv.org/abs/${arxiv}`, 'arXiv') : '',
        ].filter(Boolean).join('');

        return `
            <li class="publication-card">
              <div class="publication-card-topline">
                <span class="publication-rank">${esc(badge)}</span>
                <span class="publication-citations">${citationLabel(citationCount)}</span>
              </div>
              <h3 class="publication-card-title">
                ${window.Site.externalLink(inspireUrl, sanitizeTitle(title))}
              </h3>
              <p class="publication-card-authors">${esc(authors)}</p>
              ${metaBits ? `<p class="publication-card-meta">${esc(metaBits)}</p>` : ''}
              <div class="publication-card-links">${links}</div>
            </li>`;
    };

    const typeset = (element) => {
        if (window.MathJax && MathJax.Hub) {
            MathJax.Hub.Queue(['Typeset', MathJax.Hub, element]);
        }
    };

    const renderPublications = (items) => {
        list.innerHTML = items.map((item, index) => publicationCard(item, `Top ${index + 1}`)).join('');
        status.hidden = true;
        list.hidden = false;
        typeset(list);
    };

    const renderLatest = (item) => {
        latestList.innerHTML = publicationCard(item, 'Latest');
        latestStatus.hidden = true;
        latestList.hidden = false;
        typeset(latestList);
    };

    // Fetch most-cited (top 5)
    const endpointCited = new URL('https://inspirehep.net/api/literature');
    endpointCited.searchParams.set('q', BASE_QUERY);
    endpointCited.searchParams.set('sort', 'mostcited');
    endpointCited.searchParams.set('size', '5');
    endpointCited.searchParams.set('fields', BASE_FIELDS);

    fetch(endpointCited.toString())
        .then((response) => {
            if (!response.ok) throw new Error(`INSPIRE request failed with status ${response.status}`);
            return response.json();
        })
        .then((data) => {
            const items = (data && data.hits && data.hits.hits) ? data.hits.hits : [];
            if (!items.length) throw new Error('No INSPIRE publications returned.');
            renderPublications(items);
        })
        .catch(() => {
            status.textContent = 'Could not load INSPIRE data right now. The hand-picked list below is still available.';
        });

    // Fetch latest (most recent)
    if (latestList && latestStatus) {
        const endpointLatest = new URL('https://inspirehep.net/api/literature');
        endpointLatest.searchParams.set('q', BASE_QUERY);
        endpointLatest.searchParams.set('sort', 'mostrecent');
        endpointLatest.searchParams.set('size', '1');
        endpointLatest.searchParams.set('fields', BASE_FIELDS);

        fetch(endpointLatest.toString())
            .then((response) => {
                if (!response.ok) throw new Error(`INSPIRE request failed with status ${response.status}`);
                return response.json();
            })
            .then((data) => {
                const items = (data && data.hits && data.hits.hits) ? data.hits.hits : [];
                if (!items.length) throw new Error('No latest publication returned.');
                renderLatest(items[0]);
            })
            .catch(() => {
                latestStatus.textContent = 'Could not load latest publication from INSPIRE.';
            });
    }

    // Live figures under the section heading (<span data-inspire="papers|citations|h-index">):
    // all INSPIRE records except the PhD thesis. On failure the numbers written
    // in index.html stay.
    const figures = document.querySelectorAll('[data-inspire]');
    if (figures.length) {
        const endpointAll = new URL('https://inspirehep.net/api/literature');
        endpointAll.searchParams.set('q', BASE_QUERY);
        endpointAll.searchParams.set('size', '250');
        endpointAll.searchParams.set('fields', 'citation_count,document_type');

        fetch(endpointAll.toString())
            .then((response) => {
                if (!response.ok) throw new Error(`INSPIRE request failed with status ${response.status}`);
                return response.json();
            })
            .then((data) => {
                const papers = ((data && data.hits && data.hits.hits) || [])
                    .map((hit) => hit.metadata || {})
                    .filter((metadata) => !(metadata.document_type || []).includes('thesis'));
                if (!papers.length) throw new Error('No INSPIRE publications returned.');
                const citations = papers
                    .map((metadata) => Number(metadata.citation_count || 0))
                    .sort((a, b) => b - a);
                const values = {
                    papers: papers.length,
                    citations: citations.reduce((sum, count) => sum + count, 0),
                    'h-index': citations.filter((count, i) => count >= i + 1).length,
                };
                figures.forEach((figure) => {
                    const value = values[figure.dataset.inspire];
                    if (value) figure.textContent = value.toLocaleString('en-US');
                });
            })
            .catch(() => {});
    }
});