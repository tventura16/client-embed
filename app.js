const urlbase =
  "https://qa.sintesis.com.bo/pasarelapagos-msapi/embedded/api/v1/";

// API Keys por defecto
const defaultApiKeys = {
  apiKey: "dGVzdF9hcGlfa2V5XzEyMzQ1Njc4OTA=",
  apiKeySuite: "YXBpX2tleV9hZGY1ZTIzMzE2NjQwODc4Mw==",
  apiKeyAccount: "Zm9qU29iTzF0dDdQeFlzS3VkR2syQzN0cnY3emE0bE8=",
};

// Funciones para manejar API keys
function getApiKeys() {
  const savedKeys = localStorage.getItem("apiKeys");
  if (savedKeys) {
    const parsed = JSON.parse(savedKeys);
    // Asegurar que todas las keys existen, usar defaults para las que falten
    return {
      apiKey: parsed.apiKey || defaultApiKeys.apiKey,
      apiKeySuite: parsed.apiKeySuite || defaultApiKeys.apiKeySuite,
      apiKeyAccount: parsed.apiKeyAccount || defaultApiKeys.apiKeyAccount,
    };
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
const apiKeyAccount = apiKeys.apiKeyAccount;

const key = "authToken";
const keySuite = "authTokenSuite";
const keyAccount = "authTokenAccount";

// Datos por defecto
const defaultRequestData = {
  email: "bolivia@sintesis.com.bo",
  firstName: "alejandro",
  lastName: "montero",
  identityNumber: "8569751",
  identityExtension: "tj",
  accountNumber: 1234567890,
  clientId: 12345,
};

// Obtener datos del localStorage o usar defaults
function getRequestData() {
  const savedData = localStorage.getItem("requestData");
  if (savedData) {
    const parsed = JSON.parse(savedData);
    // Asegurar que todos los campos existen, usar defaults para los que falten
    return {
      email: parsed.email || defaultRequestData.email,
      firstName: parsed.firstName || defaultRequestData.firstName,
      lastName: parsed.lastName || defaultRequestData.lastName,
      identityNumber:
        parsed.identityNumber || defaultRequestData.identityNumber,
      identityExtension:
        parsed.identityExtension || defaultRequestData.identityExtension,
      accountNumber: parsed.accountNumber || defaultRequestData.accountNumber,
      clientId: parsed.clientId || defaultRequestData.clientId,
    };
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

  document
    .getElementById("generate-btn-account")
    .addEventListener("click", handleGenerateClickAccount);

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
  document.getElementById("firstName").value = currentData.firstName || "";
  document.getElementById("lastName").value = currentData.lastName || "";
  document.getElementById("identityNumber").value =
    currentData.identityNumber || "";
  document.getElementById("identityExtension").value =
    currentData.identityExtension || "";
  document.getElementById("accountNumber").value =
    currentData.accountNumber || "";
  document.getElementById("clientId").value = currentData.clientId || "";
}

function loadDefaultsToForm() {
  document.getElementById("email").value = defaultRequestData.email || "";
  document.getElementById("firstName").value =
    defaultRequestData.firstName || "";
  document.getElementById("lastName").value = defaultRequestData.lastName || "";
  document.getElementById("identityNumber").value =
    defaultRequestData.identityNumber || "";
  document.getElementById("identityExtension").value =
    defaultRequestData.identityExtension || "";
  document.getElementById("accountNumber").value =
    defaultRequestData.accountNumber || "";
  document.getElementById("clientId").value = defaultRequestData.clientId || "";
}

function handleConfigSave(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const newData = {
    email: formData.get("email"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    identityNumber: formData.get("identityNumber"),
    identityExtension: formData.get("identityExtension"),
    accountNumber: parseInt(formData.get("accountNumber")),
    clientId: parseInt(formData.get("clientId")),
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
  document.getElementById("api-key-account").value = currentKeys.apiKeyAccount;
}

function loadDefaultKeysToForm() {
  document.getElementById("api-key-main").value = defaultApiKeys.apiKey;
  document.getElementById("api-key-suite").value = defaultApiKeys.apiKeySuite;
  document.getElementById("api-key-account").value =
    defaultApiKeys.apiKeyAccount;
}

function handleApiKeysSave(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const newKeys = {
    apiKey: formData.get("apiKey").trim(),
    apiKeySuite: formData.get("apiKeySuite").trim(),
    apiKeyAccount: formData.get("apiKeyAccount").trim(),
  };

  // Validar que no estén vacías
  if (!newKeys.apiKey || !newKeys.apiKeySuite || !newKeys.apiKeyAccount) {
    alert("Por favor, completa todas las API keys");
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
  let btnId, statusId;

  if (cardType === "suite") {
    btnId = "generate-btn-suite";
    statusId = "status-indicator-suite";
  } else if (cardType === "account") {
    btnId = "generate-btn-account";
    statusId = "status-indicator-account";
  } else {
    btnId = "generate-btn";
    statusId = "status-indicator";
  }

  const btn = document.getElementById(btnId);
  const spinner = btn.querySelector(".loading-spinner");
  const statusIndicator = document.getElementById(statusId);

  btn.disabled = true;
  spinner.style.display = "inline-block";
  statusIndicator.className = "status-indicator loading";
  statusIndicator.style.display = "flex";

  let message;
  if (cardType === "suite") {
    message = "Procesando solicitud suite...";
  } else if (cardType === "account") {
    message = "Procesando solicitud débito en cuenta...";
  } else {
    message = "Procesando solicitud...";
  }

  statusIndicator.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>${message}</span>`;
}

function hideLoading(cardType = "main") {
  let btnId;

  if (cardType === "suite") {
    btnId = "generate-btn-suite";
  } else if (cardType === "account") {
    btnId = "generate-btn-account";
  } else {
    btnId = "generate-btn";
  }

  const btn = document.getElementById(btnId);
  const spinner = btn.querySelector(".loading-spinner");

  btn.disabled = false;
  spinner.style.display = "none";
}

function showSuccess(
  message = "Sistema de pagos cargado correctamente",
  cardType = "main"
) {
  let statusId;

  if (cardType === "suite") {
    statusId = "status-indicator-suite";
  } else if (cardType === "account") {
    statusId = "status-indicator-account";
  } else {
    statusId = "status-indicator";
  }

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
  let statusId;

  if (cardType === "suite") {
    statusId = "status-indicator-suite";
  } else if (cardType === "account") {
    statusId = "status-indicator-account";
  } else {
    statusId = "status-indicator";
  }

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
    let btnId, statusId;

    if (cardType === "suite") {
      btnId = "generate-btn-suite";
      statusId = "status-indicator-suite";
    } else if (cardType === "account") {
      btnId = "generate-btn-account";
      statusId = "status-indicator-account";
    } else {
      btnId = "generate-btn";
      statusId = "status-indicator";
    }

    const btn = document.getElementById(btnId);
    const spinner = btn.querySelector(".loading-spinner");
    const statusIndicator = document.getElementById(statusId);

    btn.disabled = true;
    spinner.style.display = "inline-block";
    statusIndicator.className = "status-indicator loading";
    statusIndicator.style.display = "flex";

    let message;
    if (cardType === "suite") {
      message = "Obteniendo credenciales suite...";
    } else if (cardType === "account") {
      message = "Obteniendo credenciales débito en cuenta...";
    } else {
      message = "Obteniendo credenciales...";
    }

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
    const data = result.data;
    let tokenKey;

    if (cardType === "suite") {
      tokenKey = keySuite;
    } else if (cardType === "account") {
      tokenKey = keyAccount;
    } else {
      tokenKey = key;
    }

    setAuthToken(tokenKey, data.accessToken);
    console.log(`Nuevo token de autenticación ${cardType}:`, data.accessToken);
    return data.accessToken;
  } catch (error) {
    console.error("Error al autenticar:", error);
    hideLoading(cardType);
    showError("Acceso no permitido", cardType);
    return null;
  }
}

async function generatePaymentLink(token, cardType = "main") {
  const url = `${urlbase}embed/generate-link`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: requestData.email,
        firstName: requestData.firstName,
        lastName: requestData.lastName,
        identityNumber: requestData.identityNumber,
      }),
    });

    const result = await response.json();

    if (result.success) {
      const dataResult = result.data;
      let iframeId, containerId;

      if (cardType === "suite") {
        iframeId = "payment-iframe-suite";
        containerId = "iframe-container-suite";
      } else {
        iframeId = "payment-iframe";
        containerId = "iframe-container";
      }

      const iframe = document.getElementById(iframeId);
      const container = document.getElementById(containerId);

      iframe.src =
        dataResult.embedUrl || dataResult.url || dataResult.iframeUrl;
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
  const url = `${urlbase}embed/generate-link`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: requestData.email,
        firstName: requestData.firstName,
        lastName: requestData.lastName,
        identityNumber: requestData.identityNumber,
      }),
    });

    const result = await response.json();

    if (result.success) {
      const dataResult = result.data;
      const iframe = document.getElementById("payment-iframe-suite");
      const container = document.getElementById("iframe-container-suite");

      iframe.src =
        dataResult.embedUrl || dataResult.url || dataResult.iframeUrl;
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

async function generateAccountDebitLink(token) {
  const url = `${urlbase}embed/generate-link-account`;

  try {
    const requestBody = {
      customer: {
        email: requestData.email,
        firstName: requestData.firstName,
        lastName: requestData.lastName,
        identityNumber: requestData.identityNumber,
        identityExtension: requestData.identityExtension,
      },
      account: {
        accountNumber: requestData.accountNumber,
        clientId: requestData.clientId,
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    if (result.success) {
      const dataResult = result.data;
      const iframe = document.getElementById("payment-iframe-account");
      const container = document.getElementById("iframe-container-account");

      iframe.src =
        dataResult.embedUrl || dataResult.url || dataResult.iframeUrl;
      container.style.display = "block";

      // Añadir animación al iframe
      iframe.style.opacity = "0";
      iframe.style.transform = "translateY(20px)";

      iframe.onload = () => {
        hideLoading("account");
        showSuccess(
          "Sistema de débito en cuenta cargado correctamente",
          "account"
        );
        iframe.style.transition = "all 0.5s ease";
        iframe.style.opacity = "1";
        iframe.style.transform = "translateY(0)";

        // Scroll suave hacia el iframe
        container.scrollIntoView({ behavior: "smooth", block: "start" });
      };
    } else {
      hideLoading("account");
      showError(
        "No se encontró un enlace de débito en cuenta en la respuesta.",
        "account"
      );
    }
  } catch (error) {
    console.error("Error al generar el enlace de débito en cuenta:", error);
    hideLoading("account");
    showError("Error al generar el enlace de débito en cuenta.", "account");
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

async function handleGenerateClickAccount() {
  let token = getAuthToken(keyAccount);

  if (!isTokenValid(token)) {
    const currentApiKeys = getApiKeys();
    token = await authenticate(currentApiKeys.apiKeyAccount, "account");
  }

  if (token) {
    await generateAccountDebitLink(token);
  } else {
    hideLoading("account");
    showError("Acceso no permitido", "account");
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
