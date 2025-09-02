const urlbase =
  "https://qa.sintesis.com.bo/pasarelapagos-msapi/embedded/api/v1/";

// API Keys por defecto
const defaultApiKeys = {
  apiKey: "dGVzdF9hcGlfa2V5XzEyMzQ1Njc4OTA=",
  apiKeySuite: "YXBpX2tleV9hZGY1ZTIzMzE2NjQwODc4Mw==",
};

// Funciones para manejar API keys
function getApiKeys() {
  const savedKeys = localStorage.getItem("apiKeys");
  if (savedKeys) {
    return JSON.parse(savedKeys);
  }
  return defaultApiKeys;
}

function saveApiKeys(keys) {
  localStorage.setItem("apiKeys", JSON.stringify(keys));
}

// Obtener API keys del localStorage
const apiKeys = getApiKeys();
const apiKey = apiKeys.apiKey;
const apiKeySuite = apiKeys.apiKeySuite;

const key = "authToken";
const keySuite = "authTokenSuite";

// Datos por defecto
const defaultRequestData = {
  email: "bolivia@sintesis.com.bo",
  firstName: "alejandro",
  lastName: "montero",
  identityNumber: "8569751",
};

// Obtener datos del localStorage o usar defaults
function getRequestData() {
  const savedData = localStorage.getItem("requestData");
  if (savedData) {
    return JSON.parse(savedData);
  }
  return defaultRequestData;
}

// Guardar datos en localStorage
function saveRequestData(data) {
  localStorage.setItem("requestData", JSON.stringify(data));
}

// Variable global para los datos de request
let requestData = getRequestData();

document.addEventListener("DOMContentLoaded", () => {
  // Verificar si existen datos guardados, si no mostrar modal

  // Event listeners para botones principales
  document
    .getElementById("generate-btn")
    .addEventListener("click", handleGenerateClick);

  document
    .getElementById("generate-btn-suite")
    .addEventListener("click", handleGenerateClickSuite);

  // Event listener para botón de configuración
  document
    .getElementById("config-btn")
    .addEventListener("click", showConfigModal);

  // Event listener para botón de API keys
  document
    .getElementById("api-keys-btn")
    .addEventListener("click", showApiKeysModal);

  // Event listeners para modal
  document
    .getElementById("config-form")
    .addEventListener("submit", handleConfigSave);

  document
    .getElementById("load-defaults")
    .addEventListener("click", loadDefaultsToForm);

  // Event listeners para modal de API keys
  document
    .getElementById("api-form")
    .addEventListener("submit", handleApiKeysSave);

  document
    .getElementById("load-default-keys")
    .addEventListener("click", loadDefaultKeysToForm);

  document
    .getElementById("cancel-api")
    .addEventListener("click", hideApiKeysModal);
  document
    .getElementById("cancel-config-api")
    .addEventListener("click", hideConfigModal);

  // Añadir animación de entrada a las tarjetas
  const cards = document.querySelectorAll(".feature-card");
  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
    card.classList.add("animate-fade-in");
  });
});

// Funciones para manejar el modal de configuración
function checkAndShowConfigModal() {
  const savedData = localStorage.getItem("requestData");
  if (!savedData) {
    showConfigModal();
  }
}

function showConfigModal() {
  const modal = document.getElementById("config-modal");
  modal.classList.remove("hidden");
  loadDataToForm();
}

function hideConfigModal() {
  const modal = document.getElementById("config-modal");
  modal.classList.add("hidden");
}

function loadDataToForm() {
  const currentData = getRequestData();

  document.getElementById("email").value = currentData.email || "";
  document.getElementById("password").value = currentData.password || "";
  document.getElementById("firstName").value = currentData.firstName || "";
  document.getElementById("lastName").value = currentData.lastName || "";
  document.getElementById("fullName").value = currentData.fullName || "";
  document.getElementById("identityNumber").value =
    currentData.identityNumber || "";
  document.getElementById("identityExtension").value =
    currentData.identityExtension || "";
  document.getElementById("identityComplement").value =
    currentData.identityComplement || "";
  document.getElementById("phoneNumber").value = currentData.phoneNumber || "";
  document.getElementById("accountType").value = currentData.accountType || "";
  document.getElementById("country").value = currentData.country || "BOLIVIA";
  document.getElementById("birthDate").value = currentData.birthDate || "";
}

function loadDefaultsToForm() {
  document.getElementById("email").value = defaultRequestData.email || "";
  document.getElementById("password").value = "";
  document.getElementById("firstName").value =
    defaultRequestData.firstName || "";
  document.getElementById("lastName").value = defaultRequestData.lastName || "";
  document.getElementById("fullName").value =
    defaultRequestData.firstName + " " + defaultRequestData.lastName || "";
  document.getElementById("identityNumber").value =
    defaultRequestData.identityNumber || "";
  document.getElementById("identityExtension").value = "";
  document.getElementById("identityComplement").value = "";
  document.getElementById("phoneNumber").value = "";
  document.getElementById("accountType").value = "";
  document.getElementById("country").value = "BOLIVIA";
  document.getElementById("birthDate").value = "";
}

function handleConfigSave(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const newData = {
    email: formData.get("email"),
    password: formData.get("password"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    fullName: formData.get("fullName"),
    identityNumber: formData.get("identityNumber"),
    identityExtension: formData.get("identityExtension"),
    identityComplement: formData.get("identityComplement"),
    phoneNumber: formData.get("phoneNumber"),
    accountType: formData.get("accountType"),
    country: formData.get("country"),
    birthDate: parseInt(formData.get("birthDate")),
    activated: true,
  };

  // Guardar en localStorage
  saveRequestData(newData);

  // Actualizar variable global
  requestData = newData;

  // Mostrar mensaje de éxito
  alert("Configuración guardada correctamente");

  // Cerrar modal
  hideConfigModal();
}

// Funciones para manejar el modal de API keys
function showApiKeysModal() {
  const modal = document.getElementById("api-modal");
  modal.classList.remove("hidden");
  loadKeysToForm();
}

function hideApiKeysModal() {
  const modal = document.getElementById("api-modal");
  modal.classList.add("hidden");
}

function loadKeysToForm() {
  const currentKeys = getApiKeys();

  document.getElementById("api-key-main").value = currentKeys.apiKey;
  document.getElementById("api-key-suite").value = currentKeys.apiKeySuite;
}

function loadDefaultKeysToForm() {
  document.getElementById("api-key-main").value = defaultApiKeys.apiKey;
  document.getElementById("api-key-suite").value = defaultApiKeys.apiKeySuite;
}

function handleApiKeysSave(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const newKeys = {
    apiKey: formData.get("apiKey").trim(),
    apiKeySuite: formData.get("apiKeySuite").trim(),
  };

  // Validar que no estén vacías
  if (!newKeys.apiKey || !newKeys.apiKeySuite) {
    alert("Por favor, completa ambas API keys");
    return;
  }

  // Guardar en localStorage
  saveApiKeys(newKeys);

  // Mostrar mensaje de éxito
  alert(
    "API Keys guardadas correctamente. Recarga la página para aplicar los cambios."
  );

  // Cerrar modal
  hideApiKeysModal();

  // Opcional: recargar automáticamente
  setTimeout(() => {
    window.location.reload();
  }, 2000);
}

// Capturar evento de refresco de página y limpiar storage
window.addEventListener("beforeunload", (event) => {
  // Limpiar solo tokens, mantener requestData y apiKeys
  sessionStorage.clear();

  // Limpiar localStorage excepto requestData y apiKeys
  const requestDataBackup = localStorage.getItem("requestData");
  const apiKeysBackup = localStorage.getItem("apiKeys");
  localStorage.clear();
  if (requestDataBackup) {
    localStorage.setItem("requestData", requestDataBackup);
  }
  if (apiKeysBackup) {
    localStorage.setItem("apiKeys", apiKeysBackup);
  }

  console.log("Storage limpiado (tokens) antes de refrescar/cerrar la página");
});

// También limpiar storage al cargar la página
window.addEventListener("load", () => {
  // Verificar si es un refresco de página
  if (performance.navigation.type === performance.navigation.TYPE_RELOAD) {
    // Limpiar solo tokens en refresco
    sessionStorage.clear();
    console.log("Tokens limpiados después del refresco de página");
  }
});
function showLoading(cardType = "main") {
  const btnId = cardType === "suite" ? "generate-btn-suite" : "generate-btn";
  const statusId =
    cardType === "suite" ? "status-indicator-suite" : "status-indicator";

  const btn = document.getElementById(btnId);
  const spinner = btn.querySelector(".loading-spinner");
  const statusIndicator = document.getElementById(statusId);

  btn.disabled = true;
  spinner.style.display = "inline-block";
  statusIndicator.className = "status-indicator loading";
  statusIndicator.style.display = "flex";

  const message =
    cardType === "suite"
      ? "Procesando solicitud suite..."
      : "Procesando solicitud...";

  statusIndicator.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>${message}</span>`;
}

function hideLoading(cardType = "main") {
  const btnId = cardType === "suite" ? "generate-btn-suite" : "generate-btn";
  const btn = document.getElementById(btnId);
  const spinner = btn.querySelector(".loading-spinner");

  btn.disabled = false;
  spinner.style.display = "none";
}

function showSuccess(
  message = "Sistema de pagos cargado correctamente",
  cardType = "main"
) {
  const statusId =
    cardType === "suite" ? "status-indicator-suite" : "status-indicator";
  const statusIndicator = document.getElementById(statusId);
  statusIndicator.className = "status-indicator success";
  statusIndicator.innerHTML = `<i class="fas fa-check-circle"></i> <span>${message}</span>`;

  // Ocultar después de 3 segundos
  setTimeout(() => {
    statusIndicator.style.display = "none";
  }, 3000);
}

function showError(
  message = "Error al cargar el sistema de pagos",
  cardType = "main"
) {
  const statusId =
    cardType === "suite" ? "status-indicator-suite" : "status-indicator";
  const statusIndicator = document.getElementById(statusId);
  statusIndicator.className = "status-indicator error";
  statusIndicator.style.display = "flex";
  statusIndicator.innerHTML = `<i class="fas fa-exclamation-circle"></i> <span>${message}</span>`;

  // Ocultar después de 5 segundos
  setTimeout(() => {
    statusIndicator.style.display = "none";
  }, 5000);
}

function getAuthToken(key) {
  return sessionStorage.getItem(key);
}

function setAuthToken(key, token) {
  sessionStorage.setItem(key, token);
}

async function authenticate(apiKey, cardType = "main") {
  const url = `${urlbase}auth/authenticate`;
  try {
    const btnId = cardType === "suite" ? "generate-btn-suite" : "generate-btn";
    const statusId =
      cardType === "suite" ? "status-indicator-suite" : "status-indicator";

    const btn = document.getElementById(btnId);
    const spinner = btn.querySelector(".loading-spinner");
    const statusIndicator = document.getElementById(statusId);

    btn.disabled = true;
    spinner.style.display = "inline-block";
    statusIndicator.className = "status-indicator loading";
    statusIndicator.style.display = "flex";

    const message =
      cardType === "suite"
        ? "Obteniendo credenciales suite..."
        : "Obteniendo credenciales...";

    statusIndicator.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>${message}</span>`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
    });

    if (!response.ok) throw new Error("Error en la autenticación");

    const result = await response.json();
    const tokenKey = cardType === "suite" ? keySuite : key;
    setAuthToken(tokenKey, result.accessToken);
    console.log(
      `Nuevo token de autenticación ${cardType}:`,
      result.accessToken
    );
    return result.accessToken;
  } catch (error) {
    console.error("Error al autenticar:", error);
    hideLoading(cardType);
    showError("Acceso no permitido", cardType);
    return null;
  }
}

async function generatePaymentLink(token, cardType = "main") {
  const url = `${urlbase}payments/generate-link`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();
    const paymentLink = data.embedUrl || data.url || data.iframeUrl;

    if (paymentLink) {
      const iframeId =
        cardType === "suite" ? "payment-iframe-suite" : "payment-iframe";
      const containerId =
        cardType === "suite" ? "iframe-container-suite" : "iframe-container";

      const iframe = document.getElementById(iframeId);
      const container = document.getElementById(containerId);

      iframe.src = paymentLink;
      container.style.display = "block";

      // Añadir animación al iframe
      iframe.style.opacity = "0";
      iframe.style.transform = "translateY(20px)";

      iframe.onload = () => {
        hideLoading(cardType);
        const message =
          cardType === "suite"
            ? "Sistema de pagos suite cargado correctamente"
            : "Sistema de pagos cargado correctamente";
        showSuccess(message, cardType);
        iframe.style.transition = "all 0.5s ease";
        iframe.style.opacity = "1";
        iframe.style.transform = "translateY(0)";

        // Scroll suave hacia el iframe
        container.scrollIntoView({ behavior: "smooth", block: "start" });
      };
    } else {
      hideLoading(cardType);
      showError("No se encontró un enlace de pago en la respuesta.", cardType);
    }
  } catch (error) {
    console.error("Error al generar el enlace de pago:", error);
    hideLoading(cardType);
    showError("Error al generar el enlace de pago.", cardType);
  }
}

async function generatePaymentLinkSuite(token) {
  const url = `${urlbase}payments/generate-embed-link`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    const paymentLink = data.embedUrl || data.url || data.iframeUrl;

    if (paymentLink) {
      const iframe = document.getElementById("payment-iframe-suite");
      const container = document.getElementById("iframe-container-suite");

      iframe.src = paymentLink;
      container.style.display = "block";

      // Añadir animación al iframe
      iframe.style.opacity = "0";
      iframe.style.transform = "translateY(20px)";

      iframe.onload = () => {
        hideLoading("suite");
        showSuccess("Sistema de pagos suite cargado correctamente", "suite");
        iframe.style.transition = "all 0.5s ease";
        iframe.style.opacity = "1";
        iframe.style.transform = "translateY(0)";

        // Scroll suave hacia el iframe
        container.scrollIntoView({ behavior: "smooth", block: "start" });
      };
    } else {
      hideLoading("suite");
      showError("No se encontró un enlace de pago en la respuesta.", "suite");
    }
  } catch (error) {
    console.error("Error al generar el enlace de pago suite:", error);
    hideLoading("suite");
    showError("Error al generar el enlace de pago.", "suite");
  }
}

async function handleGenerateClick() {
  let token = getAuthToken(key);

  if (!isTokenValid(token)) {
    const currentApiKeys = getApiKeys();
    token = await authenticate(currentApiKeys.apiKey, "main");
  }

  if (token) {
    await generatePaymentLink(token, "main");
  } else {
    hideLoading("main");
    showError("Acceso no permitido", "main");
  }
}

async function handleGenerateClickSuite() {
  let token = getAuthToken(keySuite);

  if (!isTokenValid(token)) {
    const currentApiKeys = getApiKeys();
    token = await authenticate(currentApiKeys.apiKeySuite, "suite");
  }

  if (token) {
    await generatePaymentLinkSuite(token);
  } else {
    hideLoading("suite");
    showError("Acceso no permitido", "suite");
  }
}

function isTokenValid(token) {
  if (!token) return false;

  try {
    const payloadBase64 = token.split(".")[1];
    const payload = JSON.parse(atob(payloadBase64));
    const currentTime = Math.floor(Date.now() / 1000); // tiempo actual en segundos
    return payload.exp && payload.exp > currentTime;
  } catch (error) {
    console.error("Error al validar el token:", error);
    return false;
  }
}
