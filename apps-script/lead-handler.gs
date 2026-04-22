const RECIPIENT_EMAIL = "tvmount360@gmail.com";

function doPost(e) {
  try {
    const payload = getPayload(e);
    const name = sanitize(payload.name);
    const phone = sanitize(payload.phone);
    const issue = sanitize(payload.issue);
    const page = sanitize(payload.page);
    const submittedAt = sanitize(payload.submittedAt);

    if (!name || !phone || !issue) {
      return jsonResponse({
        ok: false,
        message: "Missing required fields."
      });
    }

    const subject = "New Fridge Repair Lead";
    const body = [
      "A new website lead was submitted.",
      "",
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Issue: ${issue}`,
      `Page: ${page}`,
      `Submitted At: ${submittedAt}`
    ].join("\n");

    MailApp.sendEmail({
      to: RECIPIENT_EMAIL,
      subject: subject,
      body: body
    });

    return jsonResponse({
      ok: true,
      message: "Lead received."
    });
  } catch (error) {
    return jsonResponse({
      ok: false,
      message: error.message || "Unexpected error."
    });
  }
}

function getPayload(e) {
  if (e && e.parameter && Object.keys(e.parameter).length) {
    return e.parameter;
  }

  if (e && e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (error) {
      return {};
    }
  }

  return {};
}

function sanitize(value) {
  return String(value || "").trim();
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
