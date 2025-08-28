const urlbase =
  "https://qa.sintesis.com.bo/pasarelapagos-msapi/embedded/api/v1/";
const apiKey = "dGVzdF9hcGlfa2V5XzEyMzQ1Njc4OTA=";
const apiKeySuite = "YXBpX2tleV9hZGY1ZTIzMzE2NjQwODc4Mw==";

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

function showLoading() {
  const btn = document.getElementById("generate-btn");
  const spinner = btn.querySelector(".loading-spinner");
  const statusIndicator = document.getElementById("status-indicator");

  btn.disabled = true;
  spinner.style.display = "inline-block";
  statusIndicator.className = "status-indicator loading";
  statusIndicator.style.display = "flex";
  statusIndicator.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> <span>Procesando solicitud...</span>';
}

function hideLoading() {
  const btn = document.getElementById("generate-btn");
  const spinner = btn.querySelector(".loading-spinner");

  btn.disabled = false;
  spinner.style.display = "none";
}

function showSuccess(message = "Sistema de pagos cargado correctamente") {
  const statusIndicator = document.getElementById("status-indicator");
  statusIndicator.className = "status-indicator success";
  statusIndicator.innerHTML = `<i class="fas fa-check-circle"></i> <span>${message}</span>`;

  // Ocultar después de 3 segundos
  setTimeout(() => {
    statusIndicator.style.display = "none";
  }, 3000);
}

function showError(message = "Error al cargar el sistema de pagos") {
  const statusIndicator = document.getElementById("status-indicator");
  statusIndicator.className = "status-indicator error";
  statusIndicator.style.display = "flex";
  statusIndicator.innerHTML = `<i class="fas fa-exclamation-circle"></i> <span>${message}</span>`;

  // Ocultar después de 5 segundos
  setTimeout(() => {
    statusIndicator.style.display = "none";
  }, 5000);
}

function getAuthToken() {
  return sessionStorage.getItem("authToken");
}

function setAuthToken(token) {
  sessionStorage.setItem("authToken", token);
}

async function authenticate() {
  const url = `${urlbase}auth/authenticate`;
  try {
    const btn = document.getElementById("generate-btn");
    const spinner = btn.querySelector(".loading-spinner");
    const statusIndicator = document.getElementById("status-indicator");

    btn.disabled = true;
    spinner.style.display = "inline-block";
    statusIndicator.className = "status-indicator loading";
    statusIndicator.style.display = "flex";
    statusIndicator.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> <span>Obteniendo credenciales...</span>';
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
    });

    if (!response.ok) throw new Error("Error en la autenticación");

    const result = await response.json();
    setAuthToken(result.accessToken);
    console.log("Nuevo token de autenticación:", result.accessToken);
    return result.accessToken;
  } catch (error) {
    console.error("Error al autenticar:", error);
    hideLoading();
    showError("Acceso no permitido");
    return null;
  }
}

async function generatePaymentLink(token) {
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
      const iframe = document.getElementById("payment-iframe");
      const container = document.getElementById("iframe-container");

      iframe.src = paymentLink;
      container.style.display = "block";

      // Añadir animación al iframe
      iframe.style.opacity = "0";
      iframe.style.transform = "translateY(20px)";

      iframe.onload = () => {
        hideLoading();
        showSuccess("Sistema de pagos cargado correctamente");
        iframe.style.transition = "all 0.5s ease";
        iframe.style.opacity = "1";
        iframe.style.transform = "translateY(0)";

        // Scroll suave hacia el iframe
        container.scrollIntoView({ behavior: "smooth", block: "start" });
      };
    } else {
      hideLoading();
      showError("No se encontró un enlace de pago en la respuesta.");
    }
  } catch (error) {
    console.error("Error al generar el enlace de pago:", error);
    hideLoading();
    showError("Error al generar el enlace de pago.");
  }
}

async function handleGenerateClick() {
  let token = getAuthToken();

  if (!isTokenValid(token)) {
    token = await authenticate();
  }

  if (token) {
    await generatePaymentLink(token);
  } else {
    hideLoading();
    showError("Acceso no permitido");
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
