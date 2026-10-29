/**
 * =========================================================================
 * THE ROYAL TOURS & TRAVELS — GOOGLE APPS SCRIPT WEBHOOK BACKEND
 * =========================================================================
 * This script receives form submissions from The Royal Tours & Travels website
 * and automatically:
 *  1. Records every enquiry/booking/contact in your linked Google Sheet.
 *  2. Sends an instant email notification to: theroyaltoursandtravelscbe@gmail.com
 *  3. Returns a JSON response with status and reference ID.
 * =========================================================================
 */

// CONFIGURATION: Set your notification email here
var NOTIFICATION_EMAIL = "theroyaltoursandtravelscbe@gmail.com"; 
var SHEET_NAME = "Royal_Enquiries";

function doPost(e) {
  var rawData = (e && e.postData) ? e.postData.contents : "";
  var data = {};
  
  if (rawData) {
    try {
      data = JSON.parse(rawData);
    } catch (err) {
      data = (e && e.parameter) ? e.parameter : {};
    }
  } else {
    data = (e && e.parameter) ? e.parameter : {};
  }

  return processInquiry(data);
}

function doGet(e) {
  // If GET contains enquiry parameters, process it
  if (e && e.parameter && (e.parameter.phone || e.parameter.package_name || e.parameter.name || e.parameter.customer_name)) {
    return processInquiry(e.parameter);
  }

  // Otherwise return status health check
  var output = ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "The Royal Tours & Travels Google Apps Script Webhook",
    notification_email: NOTIFICATION_EMAIL,
    sheet_tab: SHEET_NAME,
    timestamp: new Date()
  }));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

function processInquiry(data) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);

    // If sheet doesn't exist, create it with styled header row
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      var headers = [
        "Timestamp",
        "Reference ID",
        "Type",
        "Customer Name",
        "Phone / WhatsApp",
        "Email",
        "Package / Service",
        "Travel Date",
        "Travelers",
        "Message / Notes",
        "Status"
      ];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight("bold")
        .setBackground("#254C6B")
        .setFontColor("#FFFFFF");
      sheet.setFrozenRows(1);
    }

    var timestamp = new Date();
    var refId = data.ref_id || "RT-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
    var type = data.type || (data.service_type ? "Service Enquiry" : "Tour Booking");
    var name = data.name || data.customer_name || "Guest";
    var phone = data.phone || data.mobile || "N/A";
    var email = data.email || "N/A";
    var packageOrService = data.package_name || data.service_type || data.destination || "General Enquiry";
    var travelDate = data.travel_date || "Flexible";
    var travelers = data.travelers || "N/A";
    var message = data.message || data.notes || data.comments || "";
    var status = "New Lead";

    // Append new row to Google Sheet
    sheet.appendRow([
      timestamp,
      refId,
      type,
      name,
      phone,
      email,
      packageOrService,
      travelDate,
      travelers,
      message,
      status
    ]);

    // Send Email Notification to Agency Email
    try {
      if (NOTIFICATION_EMAIL) {
        var emailSubject = "👑 New Royal Tours Enquiry: " + packageOrService + " (" + refId + ")";
        var emailBody = "👑 THE ROYAL TOURS & TRAVELS — NEW WEBSITE INQUIRY\n\n" +
          "Reference ID: " + refId + "\n" +
          "Inquiry Type: " + type + "\n" +
          "Customer Name: " + name + "\n" +
          "Phone / WhatsApp: " + phone + "\n" +
          "Email: " + email + "\n" +
          "Package / Service: " + packageOrService + "\n" +
          "Travel Date: " + travelDate + "\n" +
          "Travelers / Group Size: " + travelers + "\n" +
          "Special Requests: " + message + "\n" +
          "Received On: " + timestamp.toLocaleString() + "\n\n" +
          "👉 Direct WhatsApp to Customer: https://wa.me/" + phone.replace(/[^0-9]/g, "") + "\n\n" +
          "— The Royal Tours & Travels Automated System";

        MailApp.sendEmail(NOTIFICATION_EMAIL, emailSubject, emailBody);
      }
    } catch (mailErr) {
      Logger.log("Email notification error: " + mailErr.toString());
    }

    var responseOutput = ContentService.createTextOutput(JSON.stringify({
      status: "success",
      success: true,
      ref_id: refId,
      message: "Enquiry successfully recorded in Google Sheets and email sent!",
      whatsapp_link: "https://wa.me/918122187439?text=" + encodeURIComponent("Hello The Royal Tours! I have submitted an enquiry (Ref: " + refId + ") for *" + packageOrService + "*. Name: " + name + ". Please provide the quotation.")
    }));
    
    responseOutput.setMimeType(ContentService.MimeType.JSON);
    return responseOutput;

  } catch (error) {
    var errorOutput = ContentService.createTextOutput(JSON.stringify({
      status: "error",
      success: false,
      message: error.toString()
    }));
    errorOutput.setMimeType(ContentService.MimeType.JSON);
    return errorOutput;

  } finally {
    lock.releaseLock();
  }
}
