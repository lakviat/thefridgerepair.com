const form = document.querySelector(".lead-form");
const message = document.querySelector(".form-message");

function setFormMessage(text, type = "") {
  if (!message) return;
  message.textContent = text;
  message.className = "form-message";
  if (type) {
    message.classList.add(`is-${type}`);
  }
}

function formatPhoneInput(value) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

if (form) {
  const phoneInput = form.querySelector('input[name="phone"]');

  phoneInput?.addEventListener("input", (event) => {
    event.target.value = formatPhoneInput(event.target.value);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFormMessage("");

    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const issue = String(formData.get("issue") || "").trim();

    if (!name || !phone || !issue) {
      setFormMessage("Please complete all fields before submitting.", "error");
      return;
    }

    if (phone.replace(/\D/g, "").length < 10) {
      setFormMessage("Please enter a valid mobile number.", "error");
      return;
    }

    const endpoint = form.dataset.endpoint || window.LEAD_ENDPOINT || "";
    const payload = new URLSearchParams({
      name,
      phone,
      issue,
      page: window.location.href,
      source: "website",
      submittedAt: new Date().toISOString()
    });

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton?.setAttribute("disabled", "disabled");
    submitButton?.setAttribute("aria-busy", "true");

    try {
      if (!endpoint) {
        await new Promise((resolve) => {
          window.setTimeout(resolve, 400);
        });
        form.reset();
        setFormMessage(
          "Thanks. Your request has been captured and the live form endpoint can be connected next.",
          "success"
        );
        return;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        body: payload
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      form.reset();
      setFormMessage(
        "Thank you. We received your request and will be in touch shortly.",
        "success"
      );
    } catch (error) {
      setFormMessage(
        "Something went wrong while sending your request. Please call 645-224-9787 for the fastest response.",
        "error"
      );
    } finally {
      submitButton?.removeAttribute("disabled");
      submitButton?.removeAttribute("aria-busy");
    }
  });
}
