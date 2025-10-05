# Función VIA — HÍBRIDO (Free con marca + 5 limpios + 10/día)

Este paquete implementa el plan aprobado:
- **Free**: avatares ilimitados con marca de agua, **5 créditos sin marca** de bienvenida, límite **10/día** (local).
- **PRO / Creator+**: activación local post-pago (demo). En producción se valida en servidor con Auth + Webhooks.

## Estructura
```
/
  index.html
  app.js
  install.js
  manifest.webmanifest
  sw.js
  pricing.html
  subscribe.html
  success.html
  cancel.html
  assets/logo.png
```

## Deploy rápido (GitHub Pages)
1. Creá repo `fi-via` y subí la carpeta raíz.
2. Settings → Pages → Deploy from branch (main / root).
3. Usá la URL pública para el QR y LinkedIn.

> Si publicás en subcarpeta, cambiá rutas absolutas del `sw.js` y `start_url` del manifest.

## Producción (V1.1)
- Auth (Supabase/Firebase) con magic link.
- Créditos y planes en DB; device binding suave.
- Integración MP/PayPal (preapproval/subscriptions) + Webhooks de verificación.
- Emisión de `subscription_token` y control de créditos en servidor.
