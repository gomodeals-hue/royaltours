const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'royaltours.db');
const db = new sqlite3.Database(DB_PATH);

// Promise helpers for clean async/await
db.getAsync = function (sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

db.allAsync = function (sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
        });
    });
};

db.runAsync = function (sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
};

// Database Initialization & Schema Definition
async function initDb() {
    console.log('📦 Initializing SQLite database schema...');

    // 1. Bookings Table
    await db.runAsync(`
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ref_id TEXT UNIQUE NOT NULL,
            customer_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            package_name TEXT NOT NULL,
            travel_date TEXT,
            travelers TEXT,
            notes TEXT,
            status TEXT DEFAULT 'Pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 2. Contact Inquiries Table
    await db.runAsync(`
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            service_type TEXT,
            destination TEXT,
            message TEXT,
            status TEXT DEFAULT 'New',
            admin_notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 3. Tour Packages Table
    await db.runAsync(`
        CREATE TABLE IF NOT EXISTS packages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            destination TEXT NOT NULL,
            category TEXT NOT NULL,
            duration TEXT NOT NULL,
            price TEXT NOT NULL,
            price_numeric INTEGER DEFAULT 0,
            image_url TEXT,
            gallery_images TEXT,
            description TEXT,
            highlights TEXT,
            page_url TEXT,
            is_featured INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Ensure gallery_images column exists if table was already created
    try {
        await db.runAsync('ALTER TABLE packages ADD COLUMN gallery_images TEXT');
    } catch (e) {
        // column already exists
    }

    // 4. Customer Reviews Table
    await db.runAsync(`
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            location TEXT,
            rating INTEGER DEFAULT 5,
            package_name TEXT,
            review_text TEXT NOT NULL,
            is_approved INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 5. Newsletter Subscribers Table
    await db.runAsync(`
        CREATE TABLE IF NOT EXISTS newsletter (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 6. Admin Users Table
    await db.runAsync(`
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'admin',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Seed Initial Admin if none exists
    const adminExists = await db.getAsync('SELECT * FROM admins WHERE username = ?', ['admin']);
    if (!adminExists) {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync('royal2026!', salt);
        await db.runAsync(
            'INSERT INTO admins (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
            ['admin', 'admin@royaltours.com', hash, 'superadmin']
        );
        console.log('✅ Created default admin account: admin@royaltours.com / royal2026!');
    }

    // Comprehensive Initial Packages with Multiple Images (Gallery)
    const initialPackages = [
        {
            slug: 'bali-paradise',
            title: 'Bali Tropical Escape & Ubud Villas',
            destination: 'Bali, Indonesia',
            category: 'International',
            duration: '6 Days / 5 Nights',
            price: 'On Request',
            price_numeric: 0,
            image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
            gallery_images: JSON.stringify([
                { url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80', caption: 'Ubud Private Pool Villa' },
                { url: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1000&q=80', caption: 'Ulun Danu Beratan Lake Temple' },
                { url: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=1000&q=80', caption: 'Tegallalang Green Rice Terraces' },
                { url: 'https://images.unsplash.com/photo-1573790387438-4da905039392?auto=format&fit=crop&w=1000&q=80', caption: 'Luxury Floating Breakfast' },
                { url: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?auto=format&fit=crop&w=1000&q=80', caption: 'Uluwatu Cliff Sunset & Kecak Dance' },
                { url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1000&q=80', caption: 'Nusa Penida Kelingking Beach' }
            ]),
            description: 'Private pool villas, sacred temples, Mount Batur sunrise, iconic rice terraces, and Nusa Penida island excursion.',
            highlights: 'Private Pool Villa, Floating Breakfast, Uluwatu Sunset, Nusa Penida Speedboat, Airport Transfers',
            page_url: 'package-bali.html',
            is_featured: 1
        },
        {
            slug: 'dubai-luxury',
            title: 'Dazzling Dubai & Desert Safari',
            destination: 'Dubai, UAE',
            category: 'International',
            duration: '5 Days / 4 Nights',
            price: 'On Request',
            price_numeric: 0,
            image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
            gallery_images: JSON.stringify([
                { url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80', caption: 'Burj Khalifa & Downtown Dubai' },
                { url: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?auto=format&fit=crop&w=1000&q=80', caption: 'Red Dunes 4x4 Desert Safari' },
                { url: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=1000&q=80', caption: 'Dubai Marina Yacht & Skyline' },
                { url: 'https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?auto=format&fit=crop&w=1000&q=80', caption: 'Dubai Miracle Garden Blooms' },
                { url: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1000&q=80', caption: 'Burj Al Arab & Jumeirah Beach' },
                { url: 'https://images.unsplash.com/photo-1546412414-e1885259563a?auto=format&fit=crop&w=1000&q=80', caption: 'Dubai Frame & Sunset Skyline' }
            ]),
            description: 'Burj Khalifa 124th floor, 4x4 desert safari with BBQ dinner & belly dance, Marina dhow cruise, and Miracle Garden.',
            highlights: 'Burj Khalifa Top Deck, Desert Safari BBQ, Marina Cruise Dinner, Miracle Garden, UAE Visa',
            page_url: 'package-dubai.html',
            is_featured: 1
        },
        {
            slug: 'paris-london',
            title: 'Grand Europe: Paris & London',
            destination: 'France & UK',
            category: 'International',
            duration: '8 Days / 7 Nights',
            price: 'On Request',
            price_numeric: 0,
            image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
            gallery_images: JSON.stringify([
                { url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80', caption: 'Eiffel Tower & Champ de Mars' },
                { url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1000&q=80', caption: 'Big Ben & Palace of Westminster' },
                { url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1000&q=80', caption: 'Louvre Museum Glass Pyramid' },
                { url: 'https://images.unsplash.com/photo-1520986606214-8b456906c813?auto=format&fit=crop&w=1000&q=80', caption: 'Tower Bridge & Thames River' },
                { url: 'https://images.unsplash.com/photo-1509299349698-dd22323b5963?auto=format&fit=crop&w=1000&q=80', caption: 'Arc de Triomphe & Champs-Élysées' },
                { url: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=1000&q=80', caption: 'London Eye Twilight Panorama' }
            ]),
            description: 'Eiffel Tower summit, Louvre Museum, Eurostar high-speed train, Big Ben, London Eye, and Seine river cruise.',
            highlights: 'Eiffel Tower Summit, Eurostar Train, Seine River Cruise, 4-Star Central Hotels, London Eye',
            page_url: 'package-paris-london.html',
            is_featured: 1
        },
        {
            slug: 'vietnam-cambodia',
            title: 'Indochina Splendour: Vietnam & Angkor',
            destination: 'Vietnam & Cambodia',
            category: 'International',
            duration: '7 Days / 6 Nights',
            price: 'On Request',
            price_numeric: 0,
            image_url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
            gallery_images: JSON.stringify([
                { url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80', caption: 'Ha Long Bay Emerald Waters' },
                { url: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1000&q=80', caption: 'Angkor Wat Temple Sunrise' },
                { url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=80', caption: 'Hoi An Lantern Lit River' },
                { url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1000&q=80', caption: 'Golden Bridge Giant Hands, Ba Na' },
                { url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1000&q=80', caption: 'Hanoi Historic French Quarter' },
                { url: 'https://images.unsplash.com/photo-1570789210967-2cac24afeb00?auto=format&fit=crop&w=1000&q=80', caption: 'Ta Prohm Ancient Jungle Temple' }
            ]),
            description: 'Overnight luxury cruise in Ha Long Bay, Hanoi Old Quarter, Da Nang Golden Bridge, and Angkor Wat sunrise.',
            highlights: 'Ha Long 5-Star Cruise, Angkor Wat Guided Sunrise, Golden Bridge Cable Car, Cu Chi Tunnels',
            page_url: 'package-vietnam-cambodia.html',
            is_featured: 1
        },
        {
            slug: 'ooty-heritage',
            title: 'Queen of Hills: Ooty & Nilgiri Heights',
            destination: 'Ooty & Nilgiris, Tamil Nadu',
            category: 'Domestic',
            duration: '3 Days / 2 Nights',
            price: 'On Request',
            price_numeric: 0,
            image_url: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1200&q=80',
            gallery_images: JSON.stringify([
                { url: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1200&q=80', caption: 'Nilgiri Rolling Tea Plantations' },
                { url: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1000&q=80', caption: 'UNESCO Heritage Nilgiri Toy Train' },
                { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80', caption: 'Pykara Lake & Waterfalls' },
                { url: 'https://images.unsplash.com/photo-1616489953149-7551b93f2f8a?auto=format&fit=crop&w=1000&q=80', caption: 'Government Botanical Gardens' },
                { url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80', caption: 'Doddabetta Highest Peak View' },
                { url: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?auto=format&fit=crop&w=1000&q=80', caption: 'Emerald Lake & Pine Woods' }
            ]),
            description: 'Botanical Gardens, Doddabetta Peak, Pykara Waterfalls, UNESCO toy train ride, and tea factory factory tour.',
            highlights: 'Coimbatore Doorstep Pickup, Toy Train Confirmed Tickets, Private AC Cab, Hill Resort Stay',
            page_url: 'package-ooty.html',
            is_featured: 1
        },
        {
            slug: 'kodaikanal-mist',
            title: 'Princess of Hills: Kodaikanal Retreat',
            destination: 'Kodaikanal, Tamil Nadu',
            category: 'Domestic',
            duration: '3 Days / 2 Nights',
            price: 'On Request',
            price_numeric: 0,
            image_url: 'https://images.unsplash.com/photo-1609137144822-0a133f95ec84?auto=format&fit=crop&w=1200&q=80',
            gallery_images: JSON.stringify([
                { url: 'https://images.unsplash.com/photo-1609137144822-0a133f95ec84?auto=format&fit=crop&w=1200&q=80', caption: 'Kodaikanal Star Lake & Rowboats' },
                { url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1000&q=80', caption: 'Dense Pine Forest Walking Trail' },
                { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80', caption: 'Towering Pillar Rocks & Gorge' },
                { url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80', caption: 'Coaker’s Walk Cloud Canopy' },
                { url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1000&q=80', caption: 'Silver Cascade Natural Waterfall' },
                { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80', caption: 'Mannavanur Eco Lake & Grasslands' }
            ]),
            description: 'Kodai Lake boating, Coaker’s Walk, Pillar Rocks, Pine Forest, Silver Cascade, and homemade chocolate tasting.',
            highlights: 'Lake View Premium Stay, Private Vehicle, Chocolate Factory Visit, Campfire Evening',
            page_url: 'package-kodaikanal.html',
            is_featured: 1
        },
        {
            slug: 'coorg-plantations',
            title: 'Scotland of India: Coorg Coffee Haven',
            destination: 'Coorg, Karnataka',
            category: 'Domestic',
            duration: '3 Days / 2 Nights',
            price: 'On Request',
            price_numeric: 0,
            image_url: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1200&q=80',
            gallery_images: JSON.stringify([
                { url: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1200&q=80', caption: 'Lush Green Coffee Plantations' },
                { url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80', caption: 'Abbey Falls Gushing Cascade' },
                { url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1000&q=80', caption: 'Dubare River Elephant Bathing' },
                { url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1000&q=80', caption: 'Bylakuppe Tibetan Golden Temple' },
                { url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&q=80', caption: 'Raja’s Seat Sunset Viewpoint' },
                { url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80', caption: 'Luxury Heritage Plantation Estate' }
            ]),
            description: 'Abbey Falls, Raja’s Seat, Dubare Elephant Camp, Bylakuppe Golden Temple, and coffee estate homestay.',
            highlights: 'Plantation Estate Stay, Elephant Camp Interaction, Private AC Cab, Authentic Kodava Cuisine',
            page_url: 'package-coorg.html',
            is_featured: 1
        },
        {
            slug: 'rameshwaram-spiritual',
            title: 'Sacred Shores: Rameshwaram & Dhanushkodi',
            destination: 'Rameshwaram, Tamil Nadu',
            category: 'Domestic',
            duration: '2 Days / 1 Night',
            price: 'On Request',
            price_numeric: 0,
            image_url: 'https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1200&q=80',
            gallery_images: JSON.stringify([
                { url: 'https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1200&q=80', caption: 'Ramanathaswamy Temple Towers' },
                { url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=80', caption: 'Engineering Marvel: Pamban Sea Bridge' },
                { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80', caption: 'Dhanushkodi Land’s End Ocean Tip' },
                { url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80', caption: 'Sacred 1200-Pillar Corridor' },
                { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80', caption: 'Agni Theertham Holy Seashore' },
                { url: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=1000&q=80', caption: 'Dhanushkodi Ghost Town Ruins' }
            ]),
            description: 'Ramanathaswamy Temple 22 theerthams, Pamban Sea Bridge sunset, Dhanushkodi ghost town, and Dr. APJ Abdul Kalam Memorial.',
            highlights: 'VIP Darshan Assist, Pamban Bridge Sunset Stop, Dhanushkodi 4x4 Coastal Drive, Private Cab',
            page_url: 'package-rameshwaram.html',
            is_featured: 1
        },
        {
            slug: 'trivandrum-kovalam',
            title: 'Coastal Heritage: Trivandrum & Kovalam',
            destination: 'Kerala',
            category: 'Domestic',
            duration: '3 Days / 2 Nights',
            price: 'On Request',
            price_numeric: 0,
            image_url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
            gallery_images: JSON.stringify([
                { url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80', caption: 'Kovalam Lighthouse Crescent Beach' },
                { url: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1000&q=80', caption: 'Padmanabhaswamy Dravidian Temple' },
                { url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80', caption: 'Poovar Island Backwater Cruise' },
                { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80', caption: 'Samudra Beach Arabian Sunset' },
                { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80', caption: 'Traditional Kerala Ayurvedic Wellness' },
                { url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1000&q=80', caption: 'Napier Museum & Heritage Palaces' }
            ]),
            description: 'Padmanabhaswamy Temple, Kovalam Lighthouse Beach, Poovar backwater golden island cruise, and Ayurvedic wellness.',
            highlights: 'Beach Resort Stay, Poovar Island Boat Cruise, Temple Protocol Assistant, Dedicated AC Cab',
            page_url: 'package-trivandrum.html',
            is_featured: 1
        }
    ];

    // Populate / Update packages with gallery images
    for (const pkg of initialPackages) {
        const existing = await db.getAsync('SELECT id FROM packages WHERE slug = ?', [pkg.slug]);
        if (existing) {
            await db.runAsync(`
                UPDATE packages
                SET title = ?, destination = ?, category = ?, duration = ?, price = ?, price_numeric = ?,
                    image_url = ?, gallery_images = ?, description = ?, highlights = ?, page_url = ?, is_featured = ?
                WHERE slug = ?
            `, [
                pkg.title, pkg.destination, pkg.category, pkg.duration, pkg.price, pkg.price_numeric,
                pkg.image_url, pkg.gallery_images, pkg.description, pkg.highlights, pkg.page_url, pkg.is_featured,
                pkg.slug
            ]);
        } else {
            await db.runAsync(`
                INSERT INTO packages (slug, title, destination, category, duration, price, price_numeric, image_url, gallery_images, description, highlights, page_url, is_featured, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            `, [
                pkg.slug, pkg.title, pkg.destination, pkg.category, pkg.duration,
                pkg.price, pkg.price_numeric, pkg.image_url, pkg.gallery_images, pkg.description,
                pkg.highlights, pkg.page_url, pkg.is_featured
            ]);
        }
    }
    console.log(`✅ Configured ${initialPackages.length} packages with rich multi-image galleries.`);

    // Seed Sample Reviews if empty
    const reviewCount = await db.getAsync('SELECT COUNT(*) as count FROM reviews');
    if (reviewCount && reviewCount.count === 0) {
        const initialReviews = [
            {
                customer_name: 'Dr. Vignesh & Family',
                location: 'Coimbatore',
                rating: 5,
                package_name: 'Bali Tropical Escape & Ubud Villas',
                review_text: 'Our Bali family trip was organized to absolute perfection by The Royal Tours. The private pool villa and dedicated driver made everything so comfortable for our kids!'
            },
            {
                customer_name: 'Priya & Karthik',
                location: 'Tiruppur',
                rating: 5,
                package_name: 'Dazzling Dubai & Desert Safari',
                review_text: 'Best travel agency in Coimbatore! Visa processing was smooth and the luxury desert camp experience was breathtaking.'
            },
            {
                customer_name: 'Murugesan & Group',
                location: 'Erode',
                rating: 5,
                package_name: 'Grand Europe: Paris & London',
                review_text: 'Flawless 8-day European journey. Eurostar bookings, Eiffel Tower skip-the-line tickets and Indian meal options were exceptionally curated.'
            }
        ];

        for (const rev of initialReviews) {
            await db.runAsync(`
                INSERT INTO reviews (customer_name, location, rating, package_name, review_text, is_approved)
                VALUES (?, ?, ?, ?, ?, 1)
            `, [rev.customer_name, rev.location, rev.rating, rev.package_name, rev.review_text]);
        }
        console.log('✅ Seeded initial reviews.');
    }

    console.log('🚀 Database ready!');
}

module.exports = {
    db,
    initDb
};
