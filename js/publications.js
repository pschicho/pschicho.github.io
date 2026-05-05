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

    const renderPublications = (items) => {
        list.innerHTML = items.map((item) => {
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
                `<a href="${inspireUrl}" target="_blank" rel="noopener">INSPIRE</a>`,
                doi ? `<a href="https://doi.org/${doi}" target="_blank" rel="noopener">DOI</a>` : '',
                arxiv ? `<a href="https://arxiv.org/abs/${arxiv}" target="_blank" rel="noopener">arXiv</a>` : '',
            ].filter(Boolean).join('');

            return `
                <li class="publication-card">
                  <div class="publication-card-topline">
                    <span class="publication-rank">Top ${items.indexOf(item) + 1}</span>
                    <span class="publication-citations">${citationLabel(citationCount)}</span>
                  </div>
                  <h3 class="publication-card-title">
                    <a href="${inspireUrl}" target="_blank" rel="noopener">${title}</a>
                  </h3>
                  <p class="publication-card-authors">${authors}</p>
                  ${metaBits ? `<p class="publication-card-meta">${metaBits}</p>` : ''}
                  <div class="publication-card-links">${links}</div>
                </li>`;
        }).join('');

        status.hidden = true;
        list.hidden = false;
        if (window.MathJax && MathJax.Hub) {
            MathJax.Hub.Queue(['Typeset', MathJax.Hub, list]);
        }
    };

    const renderLatest = (item) => {
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
            `<a href="${inspireUrl}" target="_blank" rel="noopener">INSPIRE</a>`,
            doi ? `<a href="https://doi.org/${doi}" target="_blank" rel="noopener">DOI</a>` : '',
            arxiv ? `<a href="https://arxiv.org/abs/${arxiv}" target="_blank" rel="noopener">arXiv</a>` : '',
        ].filter(Boolean).join('');

        latestList.innerHTML = `
            <li class="publication-card">
              <div class="publication-card-topline">
                <span class="publication-rank">Latest</span>
                <span class="publication-citations">${citationLabel(citationCount)}</span>
              </div>
              <h3 class="publication-card-title">
                <a href="${inspireUrl}" target="_blank" rel="noopener">${title}</a>
              </h3>
              <p class="publication-card-authors">${authors}</p>
              ${metaBits ? `<p class="publication-card-meta">${metaBits}</p>` : ''}
              <div class="publication-card-links">${links}</div>
            </li>`;

        latestStatus.hidden = true;
        latestList.hidden = false;
        if (window.MathJax && MathJax.Hub) {
            MathJax.Hub.Queue(['Typeset', MathJax.Hub, latestList]);
        }
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
});