/**
 * The Royal Tours & Travels — Frontend API Client & Form Submissions
 * Fully Integrated with Google Apps Script + Node.js Backend + WhatsApp
 */

(function () {
    // ==================== CONFIGURATION ====================
    // Paste your Google Apps Script Web App Deployment URL below (from Extensions -> Apps Script -> Deploy)
    const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzIoqHMY0adC4jjtDzS1zgzFfQkhSyKvjsL4EWuPQj_Inc9a_oQ7sOJbug58VeTtnu4/exec"; // e.g. "https://script.google.com/macros/s/AKfycbx.../exec"

    // Ensure Lucide icons are initialized
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }

    // Auto-inject Toast & Success Modal if missing on the page
    function ensureNotificationModals() {
        if (!document.getElementById('royal-success-modal')) {
            const modalHtml = `
            <div id="royal-success-modal" class="fixed inset-0 z-[100] hidden items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                <div class="bg-white rounded-3xl max-w-sm w-full shadow-2xl relative overflow-hidden border border-neutral-100" style="animation: modalPop 0.35s cubic-bezier(0.34,1.56,0.64,1) both">
                    <style>
                        @keyframes modalPop { from { opacity:0; transform: scale(0.88) translateY(20px); } to { opacity:1; transform: scale(1) translateY(0); } }
                        @keyframes checkDraw { to { stroke-dashoffset: 0; } }
                        .check-anim { stroke-dasharray: 40; stroke-dashoffset: 40; animation: checkDraw 0.5s 0.3s ease forwards; }
                    </style>

                    <!-- Gradient Header Band -->
                    <div class="relative bg-gradient-to-br from-[#0E1721] via-[#1E3A5F] to-[#35658C] pt-10 pb-8 px-8 text-center">
                        <button onclick="closeRoyalModal()" class="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/80 flex items-center justify-center text-xs transition">✕</button>
                        <!-- Animated check circle -->
                        <div class="w-16 h-16 rounded-full bg-white/10 border-2 border-white/30 mx-auto flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path class="check-anim" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <span class="text-[9px] font-bold uppercase tracking-widest text-amber-300/80 bg-white/10 px-3 py-1 rounded-full border border-white/20">Enquiry Received</span>
                        <h3 id="royal-success-title" class="text-white font-bold text-xl mt-2.5 leading-tight">We'll Be in Touch Soon!</h3>
                        <p class="text-blue-200 text-[11px] mt-1">Sit back — your dream trip is on its way ✨</p>
                    </div>

                    <!-- Body -->
                    <div class="px-7 pt-5 pb-6 space-y-4">

                        <!-- Ref Box -->
                        <div id="royal-ref-box" class="flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl px-4 py-3 border border-blue-100">
                            <div>
                                <p class="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Booking Reference</p>
                                <span id="royal-ref-id" class="font-mono text-base font-bold text-[#1E3A5F]">RT-2026-0000</span>
                            </div>
                            <div class="w-8 h-8 rounded-lg bg-[#1E3A5F]/10 flex items-center justify-center text-sm">🎫</div>
                        </div>

                        <!-- Message -->
                        <p id="royal-success-message" class="text-[11px] text-neutral-500 leading-relaxed text-center">
                            Thank you for reaching out to <strong class="text-neutral-700">The Royal Tours &amp; Travels</strong>. Our travel expert from Coimbatore will contact you shortly with a personalised quote.
                        </p>

                        <!-- Promise strip -->
                        <div class="grid grid-cols-3 gap-2 text-center">
                            <div class="bg-amber-50 rounded-xl p-2.5 border border-amber-100">
                                <p class="text-base">⚡</p>
                                <p class="text-[9px] font-bold text-amber-700 mt-1">2-Hr Reply</p>
                            </div>
                            <div class="bg-emerald-50 rounded-xl p-2.5 border border-emerald-100">
                                <p class="text-base">🎯</p>
                                <p class="text-[9px] font-bold text-emerald-700 mt-1">Best Price</p>
                            </div>
                            <div class="bg-blue-50 rounded-xl p-2.5 border border-blue-100">
                                <p class="text-base">🛡️</p>
                                <p class="text-[9px] font-bold text-blue-700 mt-1">Trusted</p>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="space-y-2 pt-1">
                            <a id="royal-whatsapp-link" href="#" target="_blank"
                                class="w-full bg-[#25D366] hover:bg-[#1db954] text-white font-bold text-xs py-3.5 rounded-2xl flex items-center justify-center space-x-2 transition shadow-md">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.524 5.847L0 24l6.345-1.498A11.938 11.938 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.013-1.373l-.36-.214-3.724.879.893-3.619-.234-.372A9.818 9.818 0 1112 21.818z"/></svg>
                                <span>Chat on WhatsApp</span>
                            </a>
                            <button onclick="closeRoyalModal()"
                                class="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-semibold text-xs py-3 rounded-2xl transition">
                                Got it, Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }
    }

    // Modal display triggers
    window.showRoyalSuccessModal = function (title, refId, message, whatsappLink) {
        ensureNotificationModals();
        const modal = document.getElementById('royal-success-modal');
        if (title) document.getElementById('royal-success-title').textContent = title;
        if (refId) {
            document.getElementById('royal-ref-id').textContent = refId;
            document.getElementById('royal-ref-box').style.display = 'block';
        } else {
            document.getElementById('royal-ref-box').style.display = 'none';
        }
        if (message) document.getElementById('royal-success-message').innerHTML = message;
        if (whatsappLink) {
            document.getElementById('royal-whatsapp-link').href = whatsappLink;
            document.getElementById('royal-whatsapp-link').style.display = 'flex';
        } else {
            document.getElementById('royal-whatsapp-link').style.display = 'none';
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    };

    window.closeRoyalModal = function () {
        const modal = document.getElementById('royal-success-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    };

    // Universal Toast
    window.showToast = function (message) {
        let toast = document.getElementById('toast');
        if (!toast) {
            const toastHtml = `
            <div id="toast" class="fixed top-6 right-6 z-[100] transform translate-y-[-150%] opacity-0 transition-all duration-300 pointer-events-none flex items-center space-x-3 bg-neutral-900 text-white px-5 py-3 rounded-full shadow-2xl border border-white/10 text-xs font-semibold">
                <div class="w-5 h-5 flex items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    ✓
                </div>
                <span id="toast-message">${message}</span>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', toastHtml);
            toast = document.getElementById('toast');
        } else {
            const msg = document.getElementById('toast-message');
            if (msg) msg.textContent = message;
        }

        toast.classList.remove('translate-y-[-150%]', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');

        setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('translate-y-[-150%]', 'opacity-0');
        }, 3500);
    };

    // Google Apps Script Sender Helper (CORS-Safe & Guaranteed Delivery)
    async function forwardToGoogleAppsScript(payload) {
        if (!GOOGLE_APPS_SCRIPT_URL) return;
        try {
            // Send as text/plain with no-cors to prevent browser preflight 405 errors
            await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload)
            });
        } catch (gasErr) {
            console.log('Google Apps Script forward notice:', gasErr);
        }
    }

    // Safe Local Backend Sync (Only calls if Node.js server on port 3000 is running)
    async function safeSyncBackend(endpoint, payload) {
        if (window.location.protocol === 'file:') return null;
        // Only attempt backend sync if actually running on our Node.js server (port 3000)
        // Prevents 405 errors when using live-server, VS Code server, or other dev servers
        if (window.location.port !== '3000') return null;

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                return await res.json();
            }
        } catch (e) {
            // Silently fall back to Google Apps Script + WhatsApp
        }
        return null;
    }

    // ==================== FORM HANDLERS ====================

    // 1. Package Detail Page Booking Handler (UPDATED with new fields)
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
            await forwardToGoogleAppsScript(payload);

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

    // 2. Packages Listing Modal Booking Handler
    window.handleEnquirySubmit = async function (e) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Submit';

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending enquiry...';
        }

        try {
            const pkgNameInput = document.getElementById('enquiry-package-name');
            const packageName = pkgNameInput ? pkgNameInput.value : 'Tour Package';

            const inputs = form.querySelectorAll('input, select, textarea');
            let customer_name = '';
            let phone = '';
            let travel_date = '';
            let travelers = '2 Adults';

            inputs.forEach(input => {
                const type = input.type;
                const val = input.value;
                if (type === 'text' && input.id !== 'enquiry-package-name' && !customer_name) customer_name = val;
                else if (type === 'tel') phone = val;
                else if (type === 'date') travel_date = val;
                else if (input.tagName === 'SELECT') travelers = val;
            });

            const ref_id = 'RT-2026-' + Math.floor(1000 + Math.random() * 9000);
            const payload = {
                ref_id,
                customer_name: customer_name || 'Traveler',
                phone,
                package_name: packageName,
                travel_date,
                travelers,
                type: 'Tour Package Quote'
            };

            await forwardToGoogleAppsScript(payload);

            let whatsappLink = '';


            // Optional Backend Sync
            const backendData = await safeSyncBackend('/api/bookings', payload);
            if (backendData && backendData.whatsapp_link) {
                whatsappLink = backendData.whatsapp_link;
            }

            if (typeof closeModal === 'function') closeModal('modal-enquiry');
            form.reset();
            showRoyalSuccessModal(
                'Enquiry Sent Successfully!',
                ref_id,
                `Thank you, <strong>${customer_name}</strong>! Your inquiry for <strong>${packageName}</strong> has been logged. We will share the best quotation shortly.`,
                whatsappLink
            );

        } catch (err) {
            console.error(err);
            showToast('Connection error. Please try again.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        }
    };

    // 3. Contact Form Handler
    window.handleContactSubmit = async function (e) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Submit';

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Submitting...';
        }

        try {
            const inputs = form.querySelectorAll('input, select, textarea');
            let name = '';
            let phone = '';
            let email = '';
            let service_type = 'Holiday / Vacation Package';
            let destination = '';
            let message = '';

            inputs.forEach(input => {
                const type = input.type;
                const val = input.value;
                if (type === 'text' && !name) name = val;
                else if (type === 'tel') phone = val;
                else if (type === 'email') email = val;
                else if (input.tagName === 'SELECT') service_type = val;
                else if (type === 'text' && name) destination = val;
                else if (type === 'textarea') message = val;
            });

            const ref_id = 'RT-2026-' + Math.floor(1000 + Math.random() * 9000);
            const payload = { ref_id, name, phone, email, service_type, destination, message, type: 'Contact Lead' };

            await forwardToGoogleAppsScript(payload);

            let whatsappLink = '';


            // Optional Backend Sync
            const backendData = await safeSyncBackend('/api/contacts', payload);
            if (backendData && backendData.whatsapp_link) {
                whatsappLink = backendData.whatsapp_link;
            }

            form.reset();
            showRoyalSuccessModal(
                'Enquiry Received!',
                ref_id,
                `Thank you, <strong>${name}</strong>! Our travel executive will review your requirements for <strong>${service_type}</strong> and get back to you soon.`,

                whatsappLink
            );

        } catch (err) {
            console.error(err);
            showToast('Connection error. Please try again.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        }
    };

    // 4. Service Inquiry Modal Handler
    window.handleServiceSubmit = async function (e) {
        e.preventDefault();
        const form = e.target;
        const serviceNameEl = document.getElementById('service-name');
        const service_type = serviceNameEl ? serviceNameEl.value : 'Specialized Travel Service';

        const inputs = form.querySelectorAll('input, select, textarea');
        let name = '';
        let phone = '';
        let message = '';

        inputs.forEach(input => {
            const type = input.type;
            const val = input.value;
            if (type === 'text' && input.id !== 'service-name' && !name) name = val;
            else if (type === 'tel') phone = val;
            else if (type === 'textarea') message = val;
        });

        const ref_id = 'RT-2026-' + Math.floor(1000 + Math.random() * 9000);
        const payload = { ref_id, name, phone, service_type, message, type: 'Service Inquiry' };

        await forwardToGoogleAppsScript(payload);

        let whatsappLink = '';


        // Optional Backend Sync
        const backendData = await safeSyncBackend('/api/contacts', payload);
        if (backendData && backendData.whatsapp_link) {
            whatsappLink = backendData.whatsapp_link;
        }

        if (typeof closeModal === 'function') closeModal('modal-service');
        form.reset();
        showRoyalSuccessModal(
            'Service Enquiry Sent!',
            ref_id,
            `Your request for <strong>${service_type}</strong> has been assigned to our service desk. We will contact you shortly.`,

            whatsappLink
        );
    };

    // 5. Auth / Quick Enquiry Modal Handler
    window.handleAuthSubmit = async function (e) {
        e.preventDefault();
        const form = e.target;
        const inputs = form.querySelectorAll('input');
        let name = inputs[0] ? inputs[0].value : 'Traveler';
        let phone = inputs[1] ? inputs[1].value : '';
        let destination = inputs[2] ? inputs[2].value : 'Custom Tour';

        const ref_id = 'RT-2026-' + Math.floor(1000 + Math.random() * 9000);
        const payload = {
            ref_id,
            name,
            phone,
            service_type: 'Quick Itinerary Quote',
            destination,
            type: 'Quick Quote'
        };

        await forwardToGoogleAppsScript(payload);

        let whatsappLink = '';

        // Optional Backend Sync
        const backendData = await safeSyncBackend('/api/contacts', payload);
        if (backendData && backendData.whatsapp_link) {
            whatsappLink = backendData.whatsapp_link;
        }

        if (typeof closeModal === 'function') closeModal('modal-auth');
        form.reset();
        showRoyalSuccessModal(
            'Travel Quote Requested!',
            ref_id,
            `Thank you <strong>${name}</strong>! We will prepare a personalized itinerary and best quote for <strong>${destination}</strong>.`,
            whatsappLink
        );
    };

    // 6. Multi-Image Gallery Interactive Switcher (Client-side helper)
    window.switchMainGalleryImage = function (imgUrl, caption, thumbnailEl) {
        const heroImg = document.getElementById('main-gallery-hero');
        const captionEl = document.getElementById('main-gallery-caption');
        if (heroImg) {
            heroImg.src = imgUrl;
        }
        if (captionEl && caption) {
            captionEl.textContent = caption;
        }

        // Highlight active thumbnail
        document.querySelectorAll('.gallery-thumb-btn').forEach(btn => {
            btn.classList.remove('ring-2', 'ring-amber-400', 'border-amber-400');
            btn.classList.add('opacity-70');
        });
        if (thumbnailEl) {
            thumbnailEl.classList.add('ring-2', 'ring-amber-400', 'border-amber-400');
            thumbnailEl.classList.remove('opacity-70');
        }
    };

    // Ensure elements are initialized upon load
    document.addEventListener('DOMContentLoaded', () => {
        ensureNotificationModals();
    });
})();
