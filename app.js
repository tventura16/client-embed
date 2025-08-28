const urlbase =
  "https://qa.sintesis.com.bo/pasarelapagos-msapi/embedded/api/v1/";
const apiKey = "dGVzdF9hcGlfa2V5XzEyMzQ1Njc4OTA=";
const apiKeySuite = "YXBpX2tleV9hZGY1ZTIzMzE2NjQwODc4Mw==";
const key = "authToken";
const keySuite = "authTokenSuite";

const requestData = {
  email: "davidm04@idepro.com",
  password: "p4ssw0rd$",
  firstName: "eitner",
  lastName: "montero",
  fullName: "david montero",
  identityNumber: "5808569",
  identityExtension: "tj",
  identityComplement: "01",
  phoneNumber: "75118536",
  accountType: "MCE",
  country: "BOLIVIA",
  birthDate: 19850616,
  activated: true,
};

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("generate-btn")
    .addEventListener("click", handleGenerateClick);

  document
    .getElementById("generate-btn-suite")
    .addEventListener("click", handleGenerateClickSuite);

  // Añadir animación de entrada a las tarjetas
  const cards = document.querySelectorAll(".feature-card");
  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
    card.classList.add("animate-fade-in");
  });
});

// Capturar evento de refresco de página y limpiar storage
window.addEventListener("beforeunload", (event) => {
  // Limpiar localStorage
  localStorage.clear();

  // Limpiar sessionStorage
  sessionStorage.clear();

  console.log("Storage limpiado antes de refrescar/cerrar la página");
});

// También limpiar storage al cargar la página
window.addEventListener("load", () => {
  // Verificar si es un refresco de página
  if (performance.navigation.type === performance.navigation.TYPE_RELOAD) {
    localStorage.clear();
    sessionStorage.clear();
    console.log("Storage limpiado después del refresco de página");
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
async function handleGenerateClick() {
  let token = getAuthToken(key);

  if (!isTokenValid(token)) {
    token = await authenticate(apiKey, "main");
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
    token = await authenticate(apiKeySuite, "suite");
  }

  if (token) {
    await generatePaymentLink(token, "suite");
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
