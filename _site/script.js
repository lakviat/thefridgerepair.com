const form = document.querySelector(".lead-form");
const message = document.querySelector(".form-message");
const dynamicCityEyebrow = document.querySelector("[data-dynamic-city-eyebrow]");
const dynamicCityHeading = document.querySelector("[data-dynamic-city-heading]");

const DEFAULT_CITY = "South Florida";
const LOCATION_CACHE_KEY = "the_fridge_repair_city_v1";
const LOCATION_CACHE_TTL_MS = 1000 * 60 * 60 * 12;

const supportedCityLookup = {
  miami: "Miami",
  "fort lauderdale": "Fort Lauderdale",
  "ft lauderdale": "Fort Lauderdale",
  hollywood: "Hollywood",
  hallandale: "Hallandale Beach",
  "hallandale beach": "Hallandale Beach",
  dania: "Dania Beach",
  "dania beach": "Dania Beach",
  "boca raton": "Boca Raton",
  pompano: "Pompano Beach",
  "pompano beach": "Pompano Beach"
};

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

function isGoogleAppsScriptEndpoint(url) {
  return /script\.google\.com|script\.googleusercontent\.com/i.test(url);
}

function normalizeCityName(city) {
  return String(city || "")
    .trim()
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ");
}

function getSupportedCity(city) {
  return supportedCityLookup[normalizeCityName(city)] || "";
}

function isHomepagePath() {
  const { pathname } = window.location;
  return pathname === "/" || pathname === "/index.html" || pathname === "";
}

function canUseDynamicHomepageCity() {
  if (!isHomepagePath()) return false;
  if (!dynamicCityEyebrow || !dynamicCityHeading) return false;

  return (
    dynamicCityEyebrow.textContent.includes(DEFAULT_CITY) &&
    dynamicCityHeading.textContent.includes(DEFAULT_CITY)
  );
}

function applyHomepageCity(city) {
  const supportedCity = getSupportedCity(city);
  if (!supportedCity) return;

  dynamicCityEyebrow.textContent = `${supportedCity} Refrigerator Repair`;
  dynamicCityHeading.textContent = `${supportedCity} refrigerator repair without the wait.`;
}

function getCachedHomepageCity() {
  try {
    const raw = window.localStorage.getItem(LOCATION_CACHE_KEY);
    if (!raw) return "";

    const parsed = JSON.parse(raw);
    if (!parsed || parsed.expiresAt < Date.now()) {
      window.localStorage.removeItem(LOCATION_CACHE_KEY);
      return "";
    }

    return getSupportedCity(parsed.city);
  } catch (error) {
    return "";
  }
}

function setCachedHomepageCity(city) {
  const supportedCity = getSupportedCity(city);
  if (!supportedCity) return;

  try {
    window.localStorage.setItem(
      LOCATION_CACHE_KEY,
      JSON.stringify({
        city: supportedCity,
        expiresAt: Date.now() + LOCATION_CACHE_TTL_MS
      })
    );
  } catch (error) {
    // Ignore storage failures and keep the default city in place.
  }
}

async function fetchHomepageCityFromIp() {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 1800);

  try {
    const response = await fetch("https://ipwhois.app/json/", {
      signal: controller.signal,
      cache: "no-store"
    });

    if (!response.ok) {
      return "";
    }

    const data = await response.json();
    return getSupportedCity(data.city);
  } catch (error) {
    return "";
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function enhanceHomepageCity() {
  if (!canUseDynamicHomepageCity()) return;

  const cachedCity = getCachedHomepageCity();
  if (cachedCity) {
    applyHomepageCity(cachedCity);
    return;
  }

  const detectedCity = await fetchHomepageCityFromIp();
  if (!detectedCity) return;

  applyHomepageCity(detectedCity);
  setCachedHomepageCity(detectedCity);
}

void enhanceHomepageCity();

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

      const requestOptions = {
        method: "POST",
        body: payload
      };

      const usesAppsScript = isGoogleAppsScriptEndpoint(endpoint);
      if (usesAppsScript) {
        requestOptions.mode = "no-cors";
      }

      const response = await fetch(endpoint, requestOptions);

      if (usesAppsScript) {
        form.reset();
        setFormMessage(
          "Thank you. Your request was sent and we will be in touch shortly.",
          "success"
        );
        return;
      }

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
