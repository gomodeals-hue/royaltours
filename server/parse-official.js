const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('server').filter(f => f.includes('holiday_packages') && f.endsWith('.html'));

const packagesData = [];

files.forEach(f => {
    const content = fs.readFileSync(path.join('server', f), 'utf8');
    
    // Extract title
    const titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/i) || content.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : f;

    // Extract duration
    const durMatch = content.match(/(\d+\s*Nights?\s*\/\s*\d+\s*Days?|\d+\s*Days?\s*\/\s*\d+\s*Nights?|\d+\s*Days?)/i);
    const duration = durMatch ? durMatch[1].trim() : '';

    // Extract overview / description
    const descMatch = content.match(/<div class="desc"[^>]*>([\s\S]*?)<\/div>/i) || 
                      content.match(/<div class="package-details"[^>]*>([\s\S]*?)<\/div>/i) ||
                      content.match(/<div[^>]*itemprop="description"[^>]*>([\s\S]*?)<\/div>/i);
    const desc = descMatch ? descMatch[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';

    // Extract Itinerary days
    const days = [];
    const dayRegex = /(Day\s*\d+[^<]*)([\s\S]*?)(?=Day\s*\d+|$)/gi;
    let dMatch;
    while ((dMatch = dayRegex.exec(content)) !== null) {
        const dTitle = dMatch[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        const dText = dMatch[2].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
        if (dTitle.length > 3 && dTitle.length < 150) {
            days.push({ day: dTitle, text: dText });
        }
    }

    packagesData.push({
        file: f,
        title,
        duration,
        desc: desc.slice(0, 400),
        itinerarySample: days.slice(0, 4)
    });
});

console.log(JSON.stringify(packagesData, null, 2));
