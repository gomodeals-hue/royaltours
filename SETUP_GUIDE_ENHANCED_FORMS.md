# Royal Tours - Form Enhancement Setup Guide

## Summary of Changes

You now have three important files to update your package booking forms:

1. **Code_UPDATED.gs** - Updated Google Apps Script with new fields
2. **FORM_HANDLER_UPDATED.js** - Updated JavaScript API handler
3. **HTML Form Template** - Shown below for all packages

---

## New Fields Added

### 1. Email ID
- **Field Name:** `email`
- **Type:** Email input
- **Required:** Yes
- **Placeholder:** `your@email.com`

### 2. Occasion (Dropdown)
- **Field Name:** `occasion`
- **Type:** Select dropdown
- **Options:**
  - Honeymoon
  - Family Vacation
  - Corporate Team Outing
  - College Trip
  - Adventure Getaway

### 3. Guest Breakdown
- **Seniors:** `seniors` (number, default 0)
- **Adults:** `adults` (number, default 0)
- **Children:** `children` (number, default 0)
- **Special Passengers:** `special_passengers` (text, e.g., "Pregnant, Disabled")

### 4. Travel Mode (Dropdown)
- **Field Name:** `travel_mode`
- **Options:**
  - Flight
  - Train
  - Bus
  - Cab

### 5. Hotel Preference (Dropdown)
- **Field Name:** `hotel_type`
- **Options:**
  - 5 Star
  - 4 Star
  - 3 Star
  - 2 Star
  - 1 Star

### 6. Message / Special Requests
- **Field Name:** `message`
- **Type:** Textarea
- **Rows:** 3

---

## Step-by-Step Setup

### Step 1: Update Google Apps Script

1. Open your existing Google Apps Script (from Extensions → Apps Script)
2. Replace the entire `Code.gs` file with the content from `Code_UPDATED.gs`
3. Update the `SHEET_ID` and `EMAIL_TO_SEND` variables:
   ```javascript
   const SHEET_ID = "YOUR_GOOGLE_SHEET_ID_HERE"; // Your Google Sheet ID
   const EMAIL_TO_SEND = "theroyaltravelscbe@gmail.com"; // Your email
   ```
4. Click "Deploy" → Create new deployment
5. Select type "Web app"
6. Set to execute as your email
7. Allow access to "Anyone"
8. Copy the new deployment URL

### Step 2: Update Frontend API Handler

1. Open `js/api.js`
2. Find the `handlePackageBooking` function (around line 160)
3. Replace it entirely with the code from `FORM_HANDLER_UPDATED.js`
4. Update the Google Apps Script URL if you created a new deployment

### Step 3: Update All Package HTML Forms

For each of these files, replace the form section:
- `package-bali.html`
- `package-coorg.html`
- `package-dubai.html`
- `package-kodaikanal.html`
- `package-ooty.html`
- `package-paris-london.html`
- `package-rameshwaram.html`
- `package-trivandrum.html`
- `package-vietnam-cambodia.html`

**Find this section:**
```html
<form onsubmit="handlePackageBooking(event)" class="space-y-4 pt-4 border-t border-neutral-100">
    <div>
        <label class="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Your Full Name</label>
        <input type="text" required placeholder="..." />
    </div>
    <!-- ... other old fields ... -->
</form>
```

**Replace with this complete form:**
```html
<form onsubmit="handlePackageBooking(event)" class="space-y-4 pt-4 border-t border-neutral-100">
    <!-- Name Field -->
    <div>
        <label class="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Your Full Name</label>
        <input type="text" name="name" required placeholder="e.g. Anand Kumar"
            class="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-[#35658C] focus:outline-none" />
    </div>

    <!-- Email Field -->
    <div>
        <label class="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Email ID</label>
        <input type="email" name="email" required placeholder="your@email.com"
            class="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-[#35658C] focus:outline-none" />
    </div>

    <!-- Phone Field -->
    <div>
        <label class="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Phone / WhatsApp</label>
        <input type="tel" name="phone" required placeholder="+91 98765 43210"
            class="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-[#35658C] focus:outline-none" />
    </div>

    <!-- Travel Date Field -->
    <div>
        <label class="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Expected Travel Date</label>
        <input type="date" name="travel_date" required
            class="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-[#35658C] focus:outline-none" />
    </div>

    <!-- Occasion Field -->
    <div>
        <label class="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Occasion</label>
        <select name="occasion" class="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-[#35658C] focus:outline-none">
            <option value="">-- Select Occasion --</option>
            <option>Honeymoon</option>
            <option>Family Vacation</option>
            <option>Corporate Team Outing</option>
            <option>College Trip</option>
            <option>Adventure Getaway</option>
        </select>
    </div>

    <!-- Seniors & Adults (2-column grid) -->
    <div class="grid grid-cols-2 gap-3">
        <div>
            <label class="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Seniors</label>
            <input type="number" name="seniors" min="0" value="0" placeholder="0"
                class="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-[#35658C] focus:outline-none" />
        </div>
        <div>
            <label class="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Adults</label>
            <input type="number" name="adults" min="0" value="0" placeholder="0"
                class="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-[#35658C] focus:outline-none" />
        </div>
    </div>

    <!-- Children & Special Passengers (2-column grid) -->
    <div class="grid grid-cols-2 gap-3">
        <div>
            <label class="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Children</label>
            <input type="number" name="children" min="0" value="0" placeholder="0"
                class="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-[#35658C] focus:outline-none" />
        </div>
        <div>
            <label class="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Special Passengers</label>
            <input type="text" name="special_passengers" placeholder="e.g. Pregnant, Disabled"
                class="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-[#35658C] focus:outline-none" />
        </div>
    </div>

    <!-- Travel Mode Field -->
    <div>
        <label class="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Travel Mode</label>
        <select name="travel_mode" class="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-[#35658C] focus:outline-none">
            <option value="">-- Select Mode --</option>
            <option>Flight</option>
            <option>Train</option>
            <option>Bus</option>
            <option>Cab</option>
        </select>
    </div>

    <!-- Hotel Preference Field -->
    <div>
        <label class="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Hotel Preference</label>
        <select name="hotel_type" class="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-[#35658C] focus:outline-none">
            <option value="">-- Select Star Rating --</option>
            <option>5 Star</option>
            <option>4 Star</option>
            <option>3 Star</option>
            <option>2 Star</option>
            <option>1 Star</option>
        </select>
    </div>

    <!-- Message / Special Requests Field -->
    <div>
        <label class="block text-[11px] font-bold text-neutral-700 uppercase mb-1">Message / Special Requests</label>
        <textarea name="message" placeholder="Any special requests or notes..."
            class="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-[#35658C] focus:outline-none resize-none" rows="3"></textarea>
    </div>

    <!-- Submit Button -->
    <button type="submit"
        class="w-full bg-[#121B24] hover:bg-neutral-800 text-white font-bold text-xs py-3.5 rounded-full transition shadow-md hover:scale-[1.01] flex items-center justify-center space-x-2">
        <span>Enquire Now</span>
        <i data-lucide="send" class="w-4 h-4 text-amber-300"></i>
    </button>
</form>
```

---

## Google Sheet Structure

Your Google Sheet will now have these columns:

| Column | Field |
|--------|-------|
| A | Timestamp |
| B | Reference ID |
| C | Name |
| D | Email |
| E | Phone |
| F | Package |
| G | Travel Date |
| H | Occasion |
| I | Seniors |
| J | Adults |
| K | Children |
| L | Special Passengers |
| M | Travel Mode |
| N | Hotel Type |
| O | Message |
| P | Booking Type |

---

## Email Format

When a customer submits a booking, they will receive an email with:
- Booking reference ID
- Confirmation message
- Link to contact support

Your inbox will receive a detailed email with all the collected information formatted nicely.

---

## Testing the Setup

1. Fill out a test booking form
2. Check your email inbox for the confirmation
3. Check your Google Sheet for the new row
4. Verify all fields are captured correctly

---

## Troubleshooting

**Issue:** Forms not submitting
- ✓ Verify Google Apps Script deployment URL is correct in `js/api.js`
- ✓ Check browser console for errors (F12 → Console tab)
- ✓ Ensure all field `name` attributes match the form handler

**Issue:** Google Sheet not updating
- ✓ Verify `SHEET_ID` and `SHEET_NAME` in Google Apps Script
- ✓ Check that your account has edit access to the sheet
- ✓ Ensure sheet tab name matches exactly (case-sensitive)

**Issue:** Emails not sending
- ✓ Verify `EMAIL_TO_SEND` in Google Apps Script
- ✓ Check Gmail spam folder
- ✓ Ensure Google Apps Script has Gmail permission

---

## Need Help?

All files are ready to use:
- `google-apps-script/Code_UPDATED.gs` - Updated backend
- `FORM_HANDLER_UPDATED.js` - Updated form handler
- Package HTML files ready to be updated with new form template
