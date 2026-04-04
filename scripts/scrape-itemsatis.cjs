const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const https = require('https');

async function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                   .on('error', reject)
                   .once('close', () => resolve(filepath));
            } else {
                res.resume();
                reject(new Error(`Request Failed With Status Code: ${res.statusCode}`));
            }
        });
    });
}

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    const categories = [
        { name: 'CS2', url: 'https://www.itemsatis.com/csgo-seckin-prime-hesap.html' },
        { name: 'Valorant', url: 'https://www.itemsatis.com/valorant-hesap-satis.html' },
        { name: 'Roblox', url: 'https://www.itemsatis.com/roblox-random-hesap.html' },
        { name: 'League of Legends', url: 'https://www.itemsatis.com/lol-hesap-satis.html' }
    ];

    const allListings = [];
    const scrapedDir = path.join(__dirname, '../public/scraped/');
    if (!fs.existsSync(scrapedDir)) fs.mkdirSync(scrapedDir, { recursive: true });

    for (const cat of categories) {
        console.log(`Scraping category: ${cat.name}...`);
        await page.goto(cat.url, { waitUntil: 'networkidle' });
        
        // Wait for listings to load
        await page.waitForSelector('a.group.block', { timeout: 10000 }).catch(() => null);

        const listings = await page.evaluate((categoryName) => {
            const items = Array.from(document.querySelectorAll('a.group.block')).slice(0, 5);
            return items.map(item => {
                const title = item.querySelector('.p-3 div:nth-child(2)')?.innerText?.trim() || "";
                const price = item.querySelector('.p-3 span')?.innerText?.trim() || "0 ₺";
                const imageUrl = item.querySelector('img')?.src || "";
                const id = item.href.split('-').pop().replace('.html', '') || Math.random().toString(36).substr(2, 9);
                return {
                    id,
                    title,
                    price,
                    imageUrl,
                    category: categoryName,
                    url: item.href
                };
            });
        }, cat.name);

        for (const item of listings) {
            if (item.imageUrl) {
                const ext = path.extname(new URL(item.imageUrl).pathname) || '.png';
                const filename = `${item.id}${ext}`;
                const filepath = path.join(scrapedDir, filename);
                try {
                    await downloadImage(item.imageUrl, filepath);
                    item.image = `/scraped/${filename}`;
                    console.log(`Downloaded image for: ${item.title}`);
                } catch (e) {
                    console.error(`Failed to download image: ${item.imageUrl}`, e);
                    item.image = item.imageUrl; // Fallback to remote
                }
            }
            allListings.push(item);
        }
    }

    const dataPath = path.join(__dirname, '../src/data/itemsatis-data.json');
    fs.writeFileSync(dataPath, JSON.stringify(allListings, null, 2));
    console.log(`Successfully scraped ${allListings.length} listings to ${dataPath}`);

    await browser.close();
})();
