/**
 * THE ROYAL TOURS & TRAVELS — Google Apps Script Backend v3.0
 * 
 * CAPTURED FIELDS:
 *   Full Name, Email ID, Phone, Package, Travel Date, Occasion,
 *   Seniors, Adults, Children, Special Passengers, Travel Mode,
 *   Hotel Type, Message, Reference ID, Timestamp
 *
 * DEPLOYMENT STEPS:
 *   1. Open Google Apps Script (script.google.com)
 *   2. Paste this code — replace YOUR_GOOGLE_SHEET_ID_HERE below
 *   3. Click Deploy -> New Deployment -> Web App
 *   4. Execute as: Me | Who has access: Anyone
 *   5. Copy the Web App URL -> paste into js/api.js on the website
 */

// ===== CONFIGURATION =====
const SHEET_ID   = "YOUR_GOOGLE_SHEET_ID_HERE";
const SHEET_NAME = "Bookings";
const EMAIL_TO   = "theroyaltravelscbe@gmail.com";
const BRAND_NAME = "The Royal Tours & Travels";
const BRAND_CITY = "Coimbatore, Tamil Nadu";
const WA_NUMBER  = "918122187439";

// ===== GET HANDLER (for testing in browser) =====
function doGet(e) {
    return ContentService.createTextOutput(JSON.stringify({
        status: 'ok',
        service: BRAND_NAME,
        message: 'Royal Tours GAS backend is live. Use POST to submit bookings.'
    })).setMimeType(ContentService.MimeType.JSON);
}

// ===== MAIN POST HANDLER =====
function doPost(e) {
    try {
        const payload = JSON.parse(e.postData.contents);

        const ref_id            = payload.ref_id             || generateRefId();
        const name              = payload.name               || 'N/A';
        const email             = payload.email              || 'N/A';
        const phone             = payload.phone              || 'N/A';
        const packageName       = payload.package_name       || 'General Inquiry';
        const travelDate        = payload.travel_date        || 'N/A';
        const occasion          = payload.occasion           || 'Not specified';
        const seniors           = payload.seniors            || 0;
        const adults            = payload.adults             || 0;
        const children          = payload.children           || 0;
        const totalPax          = (parseInt(seniors) || 0) + (parseInt(adults) || 0) + (parseInt(children) || 0);
        const specialPassengers = payload.special_passengers || 'None';
        const travelMode        = payload.travel_mode        || 'Not specified';
        const hotelType         = payload.hotel_type         || 'Not specified';
        const message           = payload.message            || 'No message provided';
        const bookingType       = payload.type               || 'Package Booking';
        const timestamp         = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

        // ── Sheet (non-fatal — email still sends even if sheet fails) ──
        try {
            appendToSheet({ timestamp, ref_id, name, email, phone, packageName, travelDate, occasion, seniors, adults, children, totalPax, specialPassengers, travelMode, hotelType, message, bookingType });
        } catch (sheetErr) {
            Logger.log('Sheet write skipped: ' + sheetErr.toString());
        }

        // ── Team notification (always runs) ──
        sendTeamEmail({ ref_id, name, email, phone, packageName, travelDate, occasion, seniors, adults, children, totalPax, specialPassengers, travelMode, hotelType, message, timestamp });

        // ── Customer confirmation ──
        if (email && email !== 'N/A' && email.includes('@')) {
            sendCustomerEmail({ ref_id, name, email, packageName, travelDate });
        }

        return ContentService.createTextOutput(JSON.stringify({
            status: 'success',
            message: 'Booking enquiry received!',
            ref_id: ref_id,
            whatsapp_link: 'https://wa.me/' + WA_NUMBER + '?text=Hello%20Royal%20Tours!%20My%20booking%20ref%20is%20' + ref_id + '.%20Package%3A%20' + encodeURIComponent(packageName)
        })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        Logger.log('doPost Error: ' + error.toString());
        return ContentService.createTextOutput(JSON.stringify({
            status: 'error',
            message: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

// ===== GOOGLE SHEET HELPER =====
function appendToSheet(data) {
    // Skip silently if SHEET_ID not configured
    if (!SHEET_ID || SHEET_ID === 'YOUR_GOOGLE_SHEET_ID_HERE') {
        Logger.log('Sheet write skipped: SHEET_ID not configured.');
        return;
    }
    var ss   = SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) { sheet = ss.insertSheet(SHEET_NAME); }

    if (sheet.getLastRow() === 0) {
        var headers = ["Timestamp","Reference ID","Name","Email","Phone","Package","Travel Date","Occasion","Seniors","Adults","Children","Total Pax","Special Passengers","Travel Mode","Hotel Type","Message","Booking Type"];
        sheet.appendRow(headers);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#1E3A5F").setFontColor("#FFFFFF");
        sheet.setFrozenRows(1);
    }

    sheet.appendRow([data.timestamp, data.ref_id, data.name, data.email, data.phone, data.packageName, data.travelDate, data.occasion, data.seniors, data.adults, data.children, data.totalPax, data.specialPassengers, data.travelMode, data.hotelType, data.message, data.bookingType]);
}

// ===== TEAM NOTIFICATION EMAIL (Premium Template) =====
function sendTeamEmail(d) {
    var modeIcon = d.travelMode === 'Flight' ? '✈️' : d.travelMode === 'Train' ? '🚂' : d.travelMode === 'Bus' ? '🚌' : d.travelMode === 'Cab' ? '🚗' : '🚀';
    var specialAlert = (d.specialPassengers && d.specialPassengers !== 'None')
        ? '<div style="margin-top:10px;background:#FFF7ED;border:1px solid #FED7AA;border-radius:8px;padding:10px 14px;"><p style="margin:0;font-size:10px;font-weight:700;color:#9A3412;">⚠️ Special Passengers: ' + d.specialPassengers + '</p></div>'
        : '';

    var subject = '🎉 New Booking Inquiry: ' + d.ref_id + ' — ' + d.packageName;
    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f0f4f8;font-family:Segoe UI,Arial,sans-serif;">'
        + '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:30px 0;"><tr><td align="center">'
        + '<table width="620" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">'

        // Header
        + '<tr><td style="background:linear-gradient(135deg,#0E1721 0%,#1E3A5F 60%,#35658C 100%);padding:36px 40px;text-align:center;">'
        + '<h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">🌍 The Royal Tours <span style="font-weight:300;font-style:italic;color:#F59E0B;">&amp; Travels</span></h1>'
        + '<p style="margin:8px 0 0;color:#93C5FD;font-size:12px;">New Booking Enquiry Received</p>'
        + '</td></tr>'

        // Reference Box
        + '<tr><td style="padding:24px 40px 0;">'
        + '<div style="background:#EFF6FF;border-left:4px solid #35658C;border-radius:8px;padding:16px 20px;">'
        + '<table width="100%" cellpadding="0" cellspacing="0"><tr>'
        + '<td><p style="margin:0;font-size:10px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:1px;">Booking Reference</p>'
        + '<p style="margin:6px 0 0;font-size:20px;font-weight:800;color:#1E3A5F;font-family:monospace;">' + d.ref_id + '</p></td>'
        + '<td style="text-align:right;"><p style="margin:0;font-size:10px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:1px;">Received At</p>'
        + '<p style="margin:6px 0 0;font-size:12px;font-weight:600;color:#374151;">' + d.timestamp + '</p></td>'
        + '</tr></table></div></td></tr>'

        // Package Highlight
        + '<tr><td style="padding:20px 40px 0;">'
        + '<div style="background:linear-gradient(135deg,#FEF3C7,#FDE68A);border:1px solid #F59E0B;border-radius:10px;padding:14px 18px;">'
        + '<p style="margin:0;font-size:10px;font-weight:700;color:#92400E;text-transform:uppercase;letter-spacing:1px;">Selected Package</p>'
        + '<p style="margin:6px 0 0;font-size:16px;font-weight:800;color:#1C1917;">✈️ ' + d.packageName + '</p>'
        + '<p style="margin:4px 0 0;font-size:12px;color:#78350F;">Travel Date: <strong>' + d.travelDate + '</strong> &nbsp;|&nbsp; Occasion: <strong>' + d.occasion + '</strong></p>'
        + '</div></td></tr>'

        // Customer Info
        + '<tr><td style="padding:24px 40px 0;">'
        + '<h2 style="margin:0 0 12px;font-size:13px;font-weight:700;color:#1E3A5F;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #E2E8F0;padding-bottom:8px;">👤 Customer Information</h2>'
        + '<table width="100%" cellpadding="0" cellspacing="0">'
        + '<tr><td width="50%" style="padding:6px 0;vertical-align:top;"><p style="margin:0;font-size:10px;font-weight:600;color:#94A3B8;text-transform:uppercase;">Full Name</p><p style="margin:3px 0 0;font-size:14px;font-weight:700;color:#0F172A;">' + d.name + '</p></td>'
        + '<td width="50%" style="padding:6px 0;vertical-align:top;"><p style="margin:0;font-size:10px;font-weight:600;color:#94A3B8;text-transform:uppercase;">Phone / WhatsApp</p><p style="margin:3px 0 0;font-size:14px;font-weight:700;"><a href="tel:' + d.phone + '" style="color:#35658C;text-decoration:none;">' + d.phone + '</a></p></td></tr>'
        + '<tr><td colspan="2" style="padding:6px 0;"><p style="margin:0;font-size:10px;font-weight:600;color:#94A3B8;text-transform:uppercase;">Email Address</p><p style="margin:3px 0 0;font-size:14px;font-weight:700;"><a href="mailto:' + d.email + '" style="color:#35658C;text-decoration:none;">' + d.email + '</a></p></td></tr>'
        + '</table></td></tr>'

        // Traveler Breakdown
        + '<tr><td style="padding:24px 40px 0;">'
        + '<h2 style="margin:0 0 12px;font-size:13px;font-weight:700;color:#1E3A5F;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #E2E8F0;padding-bottom:8px;">👥 Traveler Breakdown</h2>'
        + '<table width="100%" cellpadding="8" cellspacing="4">'
        + '<tr>'
        + '<td style="width:22%;text-align:center;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;"><p style="margin:0;font-size:22px;font-weight:800;color:#1E3A5F;">' + d.seniors + '</p><p style="margin:2px 0 0;font-size:9px;font-weight:700;color:#94A3B8;text-transform:uppercase;">Seniors (60+)</p></td>'
        + '<td style="width:4%;text-align:center;color:#CBD5E1;font-size:16px;">+</td>'
        + '<td style="width:22%;text-align:center;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;"><p style="margin:0;font-size:22px;font-weight:800;color:#1E3A5F;">' + d.adults + '</p><p style="margin:2px 0 0;font-size:9px;font-weight:700;color:#94A3B8;text-transform:uppercase;">Adults</p></td>'
        + '<td style="width:4%;text-align:center;color:#CBD5E1;font-size:16px;">+</td>'
        + '<td style="width:22%;text-align:center;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;"><p style="margin:0;font-size:22px;font-weight:800;color:#1E3A5F;">' + d.children + '</p><p style="margin:2px 0 0;font-size:9px;font-weight:700;color:#94A3B8;text-transform:uppercase;">Children</p></td>'
        + '<td style="width:4%;text-align:center;color:#CBD5E1;font-size:16px;">=</td>'
        + '<td style="width:22%;text-align:center;background:#1E3A5F;border-radius:10px;"><p style="margin:0;font-size:22px;font-weight:800;color:#fff;">' + d.totalPax + '</p><p style="margin:2px 0 0;font-size:9px;font-weight:700;color:#93C5FD;text-transform:uppercase;">Total</p></td>'
        + '</tr></table>'
        + specialAlert
        + '</td></tr>'

        // Travel Preferences
        + '<tr><td style="padding:24px 40px 0;">'
        + '<h2 style="margin:0 0 12px;font-size:13px;font-weight:700;color:#1E3A5F;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #E2E8F0;padding-bottom:8px;">🏨 Travel Preferences</h2>'
        + '<table width="100%" cellpadding="0" cellspacing="0"><tr>'
        + '<td width="50%" style="padding:6px 0;"><p style="margin:0;font-size:10px;font-weight:600;color:#94A3B8;text-transform:uppercase;">Travel Mode</p><p style="margin:3px 0 0;font-size:14px;font-weight:700;color:#0F172A;">' + modeIcon + ' ' + d.travelMode + '</p></td>'
        + '<td width="50%" style="padding:6px 0;"><p style="margin:0;font-size:10px;font-weight:600;color:#94A3B8;text-transform:uppercase;">Hotel Preference</p><p style="margin:3px 0 0;font-size:14px;font-weight:700;color:#0F172A;">' + d.hotelType + '</p></td>'
        + '</tr></table></td></tr>'

        // Message
        + '<tr><td style="padding:24px 40px 0;">'
        + '<h2 style="margin:0 0 10px;font-size:13px;font-weight:700;color:#1E3A5F;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #E2E8F0;padding-bottom:8px;">💬 Message / Special Requests</h2>'
        + '<div style="background:#F8FAFC;border-left:3px solid #F59E0B;border-radius:0 8px 8px 0;padding:14px 16px;">'
        + '<p style="margin:0;font-size:13px;color:#374151;line-height:1.7;">' + d.message + '</p></div></td></tr>'

        // Action Buttons
        + '<tr><td style="padding:28px 40px;">'
        + '<table width="100%" cellpadding="0" cellspacing="0"><tr>'
        + '<td width="48%"><a href="mailto:' + d.email + '?subject=Re: Your Tour Enquiry ' + d.ref_id + '" style="display:block;background:#35658C;color:#fff;text-align:center;padding:13px;border-radius:50px;font-size:12px;font-weight:700;text-decoration:none;">📧 Reply to Customer</a></td>'
        + '<td width="4%"></td>'
        + '<td width="48%"><a href="https://wa.me/' + WA_NUMBER + '?text=Hello%20' + encodeURIComponent(d.name) + '!%20Regarding%20your%20' + encodeURIComponent(d.packageName) + '%20enquiry%20(Ref:%20' + d.ref_id + ')" style="display:block;background:#25D366;color:#fff;text-align:center;padding:13px;border-radius:50px;font-size:12px;font-weight:700;text-decoration:none;">💬 WhatsApp Customer</a></td>'
        + '</tr></table></td></tr>'

        // Footer
        + '<tr><td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:20px 40px;text-align:center;">'
        + '<p style="margin:0;font-size:11px;color:#64748B;">Automated notification from <strong>' + BRAND_NAME + '</strong> website.<br>' + BRAND_CITY + ' | Respond within 2 hours for best conversion.</p>'
        + '</td></tr>'
        + '</table></td></tr></table></body></html>';

    try {
        MailApp.sendEmail({
            to: EMAIL_TO,
            subject: subject,
            htmlBody: html,
            name: BRAND_NAME,
            replyTo: (d.email && d.email !== 'N/A') ? d.email : EMAIL_TO
        });
    } catch (e1) {
        Logger.log('MailApp failed, trying GmailApp: ' + e1.toString());
        GmailApp.sendEmail(EMAIL_TO, subject, 'Please view this message with an HTML-capable email client.', {
            htmlBody: html,
            name: BRAND_NAME,
            replyTo: (d.email && d.email !== 'N/A') ? d.email : EMAIL_TO
        });
    }
}

// ===== CUSTOMER CONFIRMATION EMAIL =====
function sendCustomerEmail(d) {
    var subject = 'Enquiry Confirmed | ' + d.ref_id + ' | ' + BRAND_NAME;
    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f0f4f8;font-family:Segoe UI,Arial,sans-serif;">'
        + '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:30px 0;"><tr><td align="center">'
        + '<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">'
        + '<tr><td style="background:linear-gradient(135deg,#0E1721 0%,#1E3A5F 60%,#35658C 100%);padding:36px 40px;text-align:center;">'
        + '<p style="margin:0;font-size:40px;">✅</p>'
        + '<h1 style="margin:8px 0 0;color:#fff;font-size:22px;font-weight:700;">Enquiry Confirmed!</h1>'
        + '<p style="margin:8px 0 0;color:#93C5FD;font-size:13px;">We have received your tour enquiry</p>'
        + '</td></tr>'
        + '<tr><td style="padding:30px 40px;">'
        + '<p style="margin:0 0 16px;font-size:15px;color:#1E293B;">Dear <strong>' + d.name + '</strong>,</p>'
        + '<p style="margin:0 0 24px;font-size:13px;color:#475569;line-height:1.8;">Thank you for choosing <strong>' + BRAND_NAME + '</strong>! We have received your booking enquiry for <strong>' + d.packageName + '</strong>. Our travel expert will contact you within <strong>2 hours</strong> with a personalised quote.</p>'
        + '<div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px;padding:18px 20px;text-align:center;margin:0 0 24px;">'
        + '<p style="margin:0;font-size:10px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:1px;">Your Booking Reference</p>'
        + '<p style="margin:8px 0 0;font-size:24px;font-weight:800;color:#1E3A5F;font-family:monospace;letter-spacing:2px;">' + d.ref_id + '</p>'
        + '<p style="margin:6px 0 0;font-size:11px;color:#94A3B8;">Save this for future communication</p>'
        + '</div>'
        + '<div style="background:#F8FAFC;border-radius:10px;padding:16px 20px;margin:0 0 24px;">'
        + '<table width="100%" cellpadding="0" cellspacing="0">'
        + '<tr><td style="padding:6px 0;font-size:12px;color:#94A3B8;font-weight:600;">Package</td><td style="padding:6px 0;font-size:12px;color:#1E293B;font-weight:700;text-align:right;">' + d.packageName + '</td></tr>'
        + '<tr><td style="padding:6px 0;font-size:12px;color:#94A3B8;font-weight:600;border-top:1px solid #E2E8F0;">Travel Date</td><td style="padding:6px 0;font-size:12px;color:#1E293B;font-weight:700;text-align:right;border-top:1px solid #E2E8F0;">' + d.travelDate + '</td></tr>'
        + '</table></div>'
        + '<div style="text-align:center;">'
        + '<a href="https://wa.me/' + WA_NUMBER + '?text=Hello!%20My%20booking%20ref%20is%20' + d.ref_id + '%20for%20' + encodeURIComponent(d.packageName) + '" style="display:inline-block;background:#25D366;color:#fff;padding:14px 32px;border-radius:50px;font-size:13px;font-weight:700;text-decoration:none;">💬 Chat with Us on WhatsApp</a>'
        + '</div></td></tr>'
        + '<tr><td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:20px 40px;text-align:center;">'
        + '<p style="margin:0;font-size:11px;color:#64748B;line-height:1.8;"><strong>' + BRAND_NAME + '</strong><br>' + BRAND_CITY + '<br><a href="https://wa.me/' + WA_NUMBER + '" style="color:#35658C;">WhatsApp: +91 81221 87439</a></p>'
        + '</td></tr>'
        + '</table></td></tr></table></body></html>';

    try {
        MailApp.sendEmail({
            to: d.email,
            subject: subject,
            htmlBody: html,
            name: BRAND_NAME,
            replyTo: EMAIL_TO
        });
    } catch (e1) {
        Logger.log('Customer MailApp failed: ' + e1.toString());
        try {
            GmailApp.sendEmail(d.email, subject, 'Please view this message with an HTML-capable email client.', {
                htmlBody: html,
                name: BRAND_NAME,
                replyTo: EMAIL_TO
            });
        } catch (e2) {
            Logger.log('Customer GmailApp failed: ' + e2.toString());
        }
    }
}

// ===== UTILITY =====
function generateRefId() {
    var year = new Date().getFullYear();
    var rand = Math.floor(1000 + Math.random() * 9000);
    return 'RT-' + year + '-' + rand;
}

// ===== TEST FUNCTION (Run from Apps Script Editor to verify) =====
function testDeployment() {
    var testPayload = {
        ref_id: 'RT-2026-TEST',
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '+91 98765 43210',
        package_name: 'Bali Tropical Paradise (6D/5N)',
        travel_date: '2027-01-15',
        occasion: 'Honeymoon',
        seniors: 0,
        adults: 2,
        children: 0,
        special_passengers: 'None',
        travel_mode: 'Flight',
        hotel_type: '4 Star',
        message: 'Test booking from Apps Script editor.',
        type: 'Package Booking'
    };
    var e = { postData: { contents: JSON.stringify(testPayload) } };
    var result = doPost(e);
    Logger.log('Test Result: ' + result.getContent());
}
