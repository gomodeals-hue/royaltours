const https = require('https');
const fs = require('fs');

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function main() {
    try {
        console.log('Fetching https://www.theroyaltoursandtravels.co.in/ ...');
        const html = await fetchUrl('https://www.theroyaltoursandtravels.co.in/');
        fs.writeFileSync('server/official-home.html', html, 'utf8');
        console.log('Saved official-home.html (' + html.length + ' bytes)');

        // Extract all links
        const regex = /href=["']([^"']+)["']/gi;
        let match;
        const allLinks = new Set();
        while ((match = regex.exec(html)) !== null) {
            allLinks.add(match[1]);
        }

        console.log('\n--- ALL NAVIGATION & PACKAGE LINKS ---');
        const relevantLinks = Array.from(allLinks).filter(l => 
            l.endsWith('.htm') || l.endsWith('.html') || l.includes('tour') || l.includes('package') || l.includes('services') || l.includes('about')
        );
        console.log(relevantLinks);

        // Fetch subpages if any package pages exist
        for (const link of relevantLinks) {
            if (link.includes('tour') || link.includes('package') || link.includes('hotel') || link.includes('service')) {
                const fullUrl = link.startsWith('http') ? link : `https://www.theroyaltoursandtravels.co.in/${link.replace(/^\//, '')}`;
                try {
                    console.log('\nFetching subpage:', fullUrl);
                    const subHtml = await fetchUrl(fullUrl);
                    const subFilename = 'server/' + link.replace(/[^a-zA-Z0-9]/g, '_') + '.html';
                    fs.writeFileSync(subFilename, subHtml, 'utf8');
                    console.log(`Saved ${subFilename} (${subHtml.length} bytes)`);
                } catch (err) {
                    console.error('Failed to fetch', fullUrl, err.message);
                }
            }
        }

    } catch (e) {
        console.error('Error:', e);
    }
}

main();
