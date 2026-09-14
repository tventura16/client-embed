# Guía de integración — Eventos de notificación (embebido)

> Para clientes que embeben **MisCuentas Web** en un `<iframe>` (web) o en un `WebView` nativo (Android/iOS/React Native).
> Implementación de referencia: `EmbeddedNotifierService` (`core/services/v2/embedded-notifier.service.ts`).

## 1. Qué resuelve esta guía

Cuando un usuario paga dentro de MisCuentas Web embebido, tu aplicación (el "integrador") necesita enterarse del resultado — éxito, fallo o cancelación — **sin depender de que el usuario haga clic en ningún botón**. MisCuentas Web te notifica automáticamente enviando un mensaje a tu aplicación en cuanto el resultado se confirma.

El mecanismo de transporte depende de dónde estés embebiendo:

| Plataforma | Transporte |
|---|---|
| Web (`<iframe>`) | `window.postMessage` |
| Android (`WebView`) | JS bridge (`addJavascriptInterface`) |
| iOS (`WKWebView`) | JS bridge (`WKScriptMessageHandler`) |
| React Native (`react-native-webview`) | `window.ReactNativeWebView.postMessage` |

MisCuentas Web detecta automáticamente cuál está disponible y usa la primera que encuentre (bridge nativo antes que `postMessage` web). **No necesitas configurar nada del lado de MisCuentas Web** — solo registrar el receptor correspondiente en tu app, como se explica abajo.

---

## 2. Contrato del evento

Todo evento llega con el mismo *envelope*, sin importar la plataforma:

```jsonc
{
  "sintesis": {
    "version": "1.0",
    "type": "PAYMENT_SUCCESS",          // PAYMENT_SUCCESS | PAYMENT_FAILED | PAYMENT_CANCELLED | SESSION_FINISHED
    "service": "PAYMENT_GATEWAY_SINTESIS",
    "timestamp": "2026-09-09T14:32:10.123Z",  // ISO-8601 UTC
    "data": { /* ver sección 3, varía según el type */ }
  }
}
```

- **`version`** — versión del contrato (`"1.0"` hoy). Solo cambia si se rompe compatibilidad; nuevos campos en `data` se agregan sin subir la versión. Tu parser debe ignorar campos desconocidos, no rechazarlos.
- **`type`** — uno de los 3 valores. Usa esto para decidir qué hacer, nunca asumas el orden de llegada.
- En **web** (`postMessage`), `event.data` llega como el objeto ya estructurado (no como string). En **Android/iOS/React Native**, el bridge solo acepta strings — tu app recibe un `String` con este mismo JSON serializado; tenés que hacer `JSON.parse` (o el equivalente en Kotlin/Swift) vos mismo.

### ¿Cuándo se dispara cada evento?

| `type` | Cuándo | Garantizado aunque el usuario... |
|---|---|---|
| `PAYMENT_SUCCESS` | Al confirmarse el pago (recibo real, no un estado intermedio) | cierre el iframe/WebView inmediatamente después de pagar |
| `PAYMENT_FAILED` | Rechazo del gateway/3DS, timeout, o error de red no recuperable | — |
| `PAYMENT_CANCELLED` | El usuario presiona "Volver"/"Cancelar" **antes** de completar el pago | — |
| `SESSION_FINISHED` | Inmediatamente después de cualquiera de los 3 anteriores, **y también** cuando el usuario presiona "Finalizar"/vuelve desde la pantalla de éxito | — |

`SESSION_FINISHED` es una señal de "la sesión embebida terminó" pensada para integradores a los que solo les interesa saber cuándo cerrar el iframe/WebView, sin necesidad de distinguir el resultado puntual. Si ya manejas los 3 eventos anteriores, podés ignorarlo. Puede llegar **más de una vez** por sesión (una al confirmarse el pago, otra al volver manualmente) — trátalo como una señal idempotente, no como un contador.

No se dispara ningún evento para usuarios `REGULAR`/`ANonymous` (login directo, no embebido) — solo aplica a sesiones iniciadas vía el link embebido (`/embedded?tk=...&tke=...`).

---

## 3. Payload de `data` por tipo de evento

Los campos exactos varían levemente según el método de pago (QR, tarjeta ATC, Tigo Money, pasarela general), pero siempre incluyen como mínimo lo siguiente:

### `PAYMENT_SUCCESS`

```jsonc
{
  "txCode": "TX-000123456",       // código de transacción, para conciliar con tu backend
  "idSession": "a1b2c3d4...",
  "cliente": 141424,               // codCliente del módulo pagado (puede venir null)
  "moduleDescrip": "YANBAL",
  "monto": 245.50,
  "moneda": "BS."                  // "BS." o "$us."
}
```

### `PAYMENT_FAILED`

```jsonc
{
  "idSession": "a1b2c3d4...",
  "txCode": "TX-000123457",        // presente en QR/ATC-3DS; puede faltar en fallos muy tempranos
  "reason": "TRUNCATED",           // código corto (ver tabla) o el título del error mostrado al usuario
  "message": "El pago no se completó exitosamente. Por favor, intente nuevamente."  // puede faltar según el método
}
```

`reason` no es un enum cerrado hoy — varía según dónde ocurrió el fallo:

| Método de pago | Valores típicos de `reason` |
|---|---|
| QR (BCP/BNB) y QR Crossborder | `"TRUNCATED"` (QR expiró sin pago) |
| Tarjeta ATC (autorización inicial o 3DS) | Título del error mostrado (ej. `"Error"`, `"Error en el pago"`) |
| Tigo Money | Título del error mostrado (ej. `"Error"`) |

> Si necesitas un código de error estable y tipado para automatizar reintentos, avísanos — hoy `reason` prioriza el mensaje humano-legible sobre un código de máquina.

### `PAYMENT_CANCELLED`

```jsonc
{
  "idSession": "a1b2c3d4...",
  "stage": "QR"    // en qué pantalla estaba el usuario al cancelar
}
```

Valores posibles de `stage`: `QR`, `QR_CROSSBORDER`, `PASARELA`, `ATC`, `ATC_WEBVIEW_3DS`, `TIGO`.

### `SESSION_FINISHED`

```jsonc
{
  "idSession": "a1b2c3d4...",
  "reason": "PAYMENT_SUCCESS"    // PAYMENT_SUCCESS | PAYMENT_FAILED | PAYMENT_CANCELLED (evento que lo disparó), o "USER_RETURN" (el usuario presionó "Finalizar"/volver desde la pantalla de éxito)
}
```

---

## 4. Cómo escuchar el evento — por plataforma

### 4.1 Web (`<iframe>`)

```html
<iframe id="miscuentas" src="https://miscuentas.tudominio.com/embedded?tk=...&tke=..."></iframe>

<script>
  window.addEventListener('message', (event) => {
    // Siempre valida el origin antes de confiar en el mensaje
    if (event.origin !== 'https://miscuentas.tudominio.com') return;

    const msg = event.data?.sintesis;
    if (!msg) return; // no es un evento nuestro

    switch (msg.type) {
      case 'PAYMENT_SUCCESS':
        console.log('Pago confirmado', msg.data.txCode, msg.data.monto);
        // cerrar el iframe, refrescar tu UI, marcar la orden como pagada
        break;
      case 'PAYMENT_FAILED':
        console.warn('Pago fallido', msg.data.reason);
        break;
      case 'PAYMENT_CANCELLED':
        console.info('Usuario canceló en', msg.data.stage);
        break;
      case 'SESSION_FINISHED':
        // cerrar el iframe/modal, sin importar el resultado puntual
        break;
    }
  });
</script>
```

**Importante**: MisCuentas Web solo envía el `postMessage` con el `targetOrigin` correcto si logra capturar tu origen desde `document.referrer` al cargar el iframe. Si tu sitio usa `Referrer-Policy: no-referrer` (o el iframe tiene `sandbox` sin `allow-same-origin`), el `referrer` llega vacío y **el evento no se envía** (no hay fallback inseguro a otro origin). Si necesitas soportar ese caso, avísanos para agregar un mecanismo alternativo (ej. origin fijo por parámetro de configuración).

### 4.2 Android (`WebView` nativo)

Registra un bridge JS con el nombre exacto `SintesisPagosBridge` **antes** de cargar la URL:

```kotlin
class SintesisPagosBridge(private val onEvent: (String) -> Unit) {
    @JavascriptInterface
    fun postMessage(json: String) {
        onEvent(json)
    }
}

webView.settings.javaScriptEnabled = true
webView.addJavascriptInterface(
    SintesisPagosBridge { json ->
        runOnUiThread {
            val root = JSONObject(json)
            val sintesis = root.getJSONObject("sintesis")
            when (sintesis.getString("type")) {
                "PAYMENT_SUCCESS" -> { /* ... */ }
                "PAYMENT_FAILED" -> { /* ... */ }
                "PAYMENT_CANCELLED" -> { /* ... */ }
                "SESSION_FINISHED" -> { /* ... */ }
            }
        }
    },
    "SintesisPagosBridge" // el nombre debe ser exactamente este
)
webView.loadUrl("https://miscuentas.tudominio.com/embedded?tk=...&tke=...")
```

### 4.3 iOS (`WKWebView`)

Registra un `WKScriptMessageHandler` también con el nombre exacto `SintesisPagosBridge`:

```swift
class ViewController: UIViewController, WKScriptMessageHandler {

    func setupWebView() {
        let contentController = WKUserContentController()
        contentController.add(self, name: "SintesisPagosBridge")

        let config = WKWebViewConfiguration()
        config.userContentController = contentController

        let webView = WKWebView(frame: view.bounds, configuration: config)
        let url = URL(string: "https://miscuentas.tudominio.com/embedded?tk=...&tke=...")!
        webView.load(URLRequest(url: url))
        view.addSubview(webView)
    }

    func userContentController(_ userContentController: WKUserContentController,
                                didReceive message: WKScriptMessage) {
        guard message.name == "SintesisPagosBridge",
              let body = message.body as? [String: Any],
              let sintesis = body["sintesis"] as? [String: Any],
              let type = sintesis["type"] as? String else { return }

        switch type {
        case "PAYMENT_SUCCESS": break // ...
        case "PAYMENT_FAILED": break  // ...
        case "PAYMENT_CANCELLED": break // ...
        case "SESSION_FINISHED": break // ...
        default: break
        }
    }
}
```

> A diferencia de Android/React Native, en iOS el bridge recibe el objeto ya deserializado (`message.body`), no un string — no hace falta `JSONSerialization` manual salvo que prefieras trabajarlo así.

### 4.4 React Native (`react-native-webview`)

No requiere registrar nada extra — `react-native-webview` ya expone `window.ReactNativeWebView` automáticamente dentro del WebView:

```tsx
import { WebView } from 'react-native-webview';

function PaymentScreen() {
  return (
    <WebView
      source={{ uri: 'https://miscuentas.tudominio.com/embedded?tk=...&tke=...' }}
      onMessage={(event) => {
        const msg = JSON.parse(event.nativeEvent.data)?.sintesis;
        if (!msg) return;

        switch (msg.type) {
          case 'PAYMENT_SUCCESS':
            // ...
            break;
          case 'PAYMENT_FAILED':
            // ...
            break;
          case 'PAYMENT_CANCELLED':
            // ...
            break;
          case 'SESSION_FINISHED':
            // ...
            break;
        }
      }}
    />
  );
}
```

---

## 5. Buenas prácticas para el integrador

- **Idempotencia**: usa `txCode`/`idSession` para deduplicar si por algún motivo procesas el mismo evento dos veces (ej. reconexión de tu WebView).
- **No asumas que `PAYMENT_SUCCESS` es la única confirmación válida** — si tu negocio requiere certeza absoluta del cobro, concilia igualmente contra tu backend/gateway; el evento es una notificación en tiempo real, no un comprobante fiscal.
- **Maneja el caso de "no llegó ningún evento"**: si el usuario cierra la app/pestaña de forma abrupta (ej. mata el proceso) antes de que el mensaje se entregue, no vas a recibir nada. Ten un mecanismo de reconciliación por `txCode` como respaldo.
- **Valida el origin** en web (sección 4.1) y **el nombre del bridge** en nativo — no proceses mensajes de fuentes que no reconoces.
- **Versión del contrato**: revisa `sintesis.version` si vas a hacer parsing estricto; hoy es `"1.0"` y los cambios aditivos a `data` no la incrementan.

---

## 6. Alcance actual y roadmap

Cubierto hoy: QR (BCP/BNB), QR Crossborder, Pasarela general, Tarjeta ATC (ambas etapas: autorización + 3DS), Tigo Money.

Pendiente de definir con clientes reales, no incluido en esta versión:
- Fallback por deep link / Universal Link para WebViews sin soporte de JS bridge.
- Código de error tipado y estable en `PAYMENT_FAILED.reason` (hoy es texto libre en algunos métodos).
- Evento `EMBED_READY` (sesión establecida) y `EMBED_RESIZE` (alto de contenido, para auto-resize del iframe).

Si tu integración necesita alguno de estos, contáctanos para priorizarlo.
