/**
 * Updated Form Handler for Enhanced Package Booking Fields
 * 
 * This is the UPDATED handlePackageBooking function for api.js
 * Replace the existing function with this version to handle all new fields
 */

// ==================== UPDATED FORM HANDLER ====================
window.handlePackageBooking = async function (e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Submit';

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending enquiry...';
    }

    try {
        const pageTitleEl = document.querySelector('h1');
        const packageName = pageTitleEl ? pageTitleEl.textContent.trim() : (document.title.split('—')[0] || 'Tour Package');

        // Collect all form data using field names
        const formData = new FormData(form);
        
        // Extract individual fields
        const name = formData.get('name') || '';
        const email = formData.get('email') || '';
        const phone = formData.get('phone') || '';
        const travel_date = formData.get('travel_date') || '';
        const occasion = formData.get('occasion') || '';
        const seniors = formData.get('seniors') || '0';
        const adults = formData.get('adults') || '0';
        const children = formData.get('children') || '0';
        const special_passengers = formData.get('special_passengers') || '';
        const travel_mode = formData.get('travel_mode') || '';
        const hotel_type = formData.get('hotel_type') || '';
        const message = formData.get('message') || '';

        // Validate required fields
        if (!name || !email || !phone || !travel_date) {
            showToast('Please fill in all required fields (Name, Email, Phone, Travel Date)');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
            return;
        }

        // Generate reference ID
        const ref_id = 'RT-2026-' + Math.floor(1000 + Math.random() * 9000);

        // Build complete payload with all new fields
        const payload = {
            ref_id,
            name,
            email,
            phone,
            package_name: packageName,
            travel_date,
            occasion: occasion || 'Not specified',
            seniors: parseInt(seniors) || 0,
            adults: parseInt(adults) || 0,
            children: parseInt(children) || 0,
            special_passengers: special_passengers || 'None',
            travel_mode: travel_mode || 'Not specified',
            hotel_type: hotel_type || 'Not specified',
            message,
            type: 'Package Booking'
        };

        // Post to Google Apps Script
        forwardToGoogleAppsScript(payload);

        // Optional Backend Sync
        const backendData = await safeSyncBackend('/api/bookings', payload);

        form.reset();
        showRoyalSuccessModal(
            'Booking Enquiry Received!',
            ref_id,
            `We have reserved your enquiry for <strong>${packageName}</strong>. A confirmation email has been sent to <strong>${email}</strong>. Our tour manager will contact you shortly with the best price quotation.`,
            ''
        );

    } catch (err) {
        console.error('Booking error:', err);
        showToast('Unable to send enquiry. Please try again later.');

    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    }
};
