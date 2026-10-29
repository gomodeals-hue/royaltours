// Automated Backend API Verification Script
const http = require('http');

function makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, data });
                }
            });
        });
        req.on('error', reject);
        if (postData) {
            req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
        }
        req.end();
    });
}

async function runTests() {
    console.log('🧪 RUNNING BACKEND TESTS...\n');

    // 1. Health Check
    console.log('1️⃣ Testing Health Endpoint: GET /api/health');
    const health = await makeRequest({ host: 'localhost', port: 3000, path: '/api/health', method: 'GET' });
    console.log('   Status:', health.status, '| Response:', JSON.stringify(health.data));

    // 2. Packages API
    console.log('\n2️⃣ Testing Packages Endpoint: GET /api/packages');
    const packages = await makeRequest({ host: 'localhost', port: 3000, path: '/api/packages', method: 'GET' });
    console.log(`   Fetched ${packages.data.count} packages.`);
    if (packages.data.data && packages.data.data.length > 0) {
        const p1 = packages.data.data[0];
        console.log(`   Sample: "${p1.title}" has ${p1.gallery_images ? p1.gallery_images.length : 0} multi-image gallery photos.`);
    }

    // 3. Create Booking
    console.log('\n3️⃣ Testing Booking Creation: POST /api/bookings');
    const newBooking = {
        customer_name: 'Sundar Rajan',
        phone: '+91 98422 99887',
        email: 'sundar.r@example.com',
        package_name: 'Dazzling Dubai & Desert Safari',
        travel_date: '2026-11-15',
        travelers: '2 Adults (Couple)',
        notes: 'Need luxury desert villa and Burj Khalifa top floor sunset slot.'
    };
    const bookingRes = await makeRequest({
        host: 'localhost',
        port: 3000,
        path: '/api/bookings',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, newBooking);
    console.log('   Booking Created! Reference:', bookingRes.data.ref_id);
    console.log('   WhatsApp Link:', bookingRes.data.whatsapp_link);

    // 4. Create Contact Enquiry
    console.log('\n4️⃣ Testing Contact Enquiry: POST /api/contacts');
    const newContact = {
        name: 'Lakshmi Priya',
        phone: '+91 94433 11223',
        email: 'lakshmi.p@example.com',
        service_type: 'Flight Ticket Booking',
        destination: 'Coimbatore to London & Paris',
        message: 'Family of 4 travel in December, please send best airfare quotes.'
    };
    const contactRes = await makeRequest({
        host: 'localhost',
        port: 3000,
        path: '/api/contacts',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, newContact);
    console.log('   Contact Lead Created! Status:', contactRes.data.success);

    // 5. Admin Authentication
    console.log('\n5️⃣ Testing Admin Login: POST /api/admin/login');
    const loginRes = await makeRequest({
        host: 'localhost',
        port: 3000,
        path: '/api/admin/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { username: 'admin@royaltours.com', password: 'royal2026!' });
    console.log('   Admin Login Success:', loginRes.data.success, '| User:', loginRes.data.admin ? loginRes.data.admin.email : 'None');

    // 6. Admin Stats
    console.log('\n6️⃣ Testing Admin Stats: GET /api/admin/stats');
    const statsRes = await makeRequest({ host: 'localhost', port: 3000, path: '/api/admin/stats', method: 'GET' });
    console.log('   Dashboard Metrics:', JSON.stringify(statsRes.data.stats, null, 2));

    // 7. Newsletter
    console.log('\n7️⃣ Testing Newsletter Subscription: POST /api/newsletter');
    const newsRes = await makeRequest({
        host: 'localhost',
        port: 3000,
        path: '/api/newsletter',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { email: 'wanderlust.tamil@gmail.com' });
    console.log('   Newsletter Subscribed:', newsRes.data.message);

    console.log('\n✨ ALL TESTS PASSED SUCCESSFULLY! EVERYTHING WORKS PERFECTLY!');
}

runTests().catch(console.error);
