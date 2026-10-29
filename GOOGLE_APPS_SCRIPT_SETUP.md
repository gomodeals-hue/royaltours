# 📋 Google Apps Script Setup Guide — The Royal Tours & Travels

This guide explains how to connect your website forms (Contact Us, Tour Bookings, Flight Inquiries, Newsletter) directly to **Google Sheets** and receive **instant email notifications** using **Google Apps Script**.

---

## ⚡ 3-Minute Quick Setup

### Step 1: Open Google Sheets
1. Go to [sheets.google.com](https://sheets.google.com) and create a **Blank Spreadsheet**.
2. Name the spreadsheet: **"The Royal Tours & Travels Leads"**.

### Step 2: Open Apps Script Editor
1. In your Google Sheet menu bar, click **Extensions** → **Apps Script**.
2. Delete any default code in `Code.gs`.
3. Copy and paste the entire contents of [`google-apps-script/Code.gs`](file:///e:/GMD/Royaltours/google-apps-script/Code.gs) into the editor.
4. (Optional) Update `NOTIFICATION_EMAIL` on Line 13 to your preferred agency email address.

### Step 3: Deploy as Web App
1. At the top right of Apps Script, click the blue **Deploy** button → **New deployment**.
2. Click the gear icon ⚙️ next to "Select type" and choose **Web app**.
3. Fill in the settings:
   - **Description**: `Royal Tours Website Webhook`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone` *(Crucial: Select "Anyone" so website visitors can submit without Google login)*
4. Click **Deploy**.
5. Grant permissions if prompted (Click *Advanced* → *Go to script (unsafe)* → *Allow*).
6. Copy the **Web App URL** (it looks like `https://script.google.com/macros/s/AKfycbx.../exec`).

### Step 4: Paste Web App URL in `js/api.js`
Open [`js/api.js`](file:///e:/GMD/Royaltours/js/api.js) and paste your URL on Line 7:
```javascript
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
```

---

## 🎯 What Happens on Every Submission:
1. **Google Sheet auto-populates** with a formatted row:
   - Timestamp, Unique Ref ID (e.g. `RT-2026-9941`), Customer Name, Phone, Email, Package/Service Name, Travel Date, Travelers Count, Notes, and Status (`New Lead`).
2. **Instant Email Alert** arrives in your inbox with all lead details and a 1-click WhatsApp link to contact the customer.
3. **The Customer** instantly sees a modal with their Reference ID and a 1-click button to start a WhatsApp chat with your agency.
