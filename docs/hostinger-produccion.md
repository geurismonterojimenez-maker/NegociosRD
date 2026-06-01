# Deploy Hostinger - Tu Negocio RD

Dominio oficial: `https://tunegociord.com`

## Tipo de hosting requerido

La plataforma necesita hosting Node.js, no solo hosting estatico, porque usa:

- `server.ts` compilado a `dist/server.cjs`.
- APIs `/api/news`, `/api/rates`, `/api/checkout/config` y `/api/checkout/session`.
- SEO server-side con canonical, Open Graph, Twitter Cards, Schema.org, sitemap y robots.

En Hostinger se debe usar un plan con soporte para Node.js o VPS.

## Build y start

Comando de build:

```bash
npm install
npm run build
```

Archivo de inicio:

```bash
dist/server.cjs
```

Comando de inicio:

```bash
npm start
```

El servidor lee `PORT` desde el hosting. Si Hostinger asigna un puerto interno, debe configurarse como variable `PORT`.

## Variables de entorno

```bash
NODE_ENV=production
PORT=3000
PUBLIC_SITE_URL=https://tunegociord.com
VITE_PUBLIC_SITE_URL=https://tunegociord.com
APP_URL=https://tunegociord.com

GEMINI_API_KEY=

GMAIL_USER=facturas@tunegociord.com
GMAIL_APP_PASSWORD=
INVOICE_FROM_NAME=Tu Negocio RD
INVOICE_REPLY_TO=soporte@tunegociord.com
INVOICE_BCC=

CHECKOUT_PROVIDER=azul_google_pay
AZUL_MERCHANT_ID=
AZUL_AUTH_KEY=
AZUL_ENV=production

GOOGLE_PAY_MERCHANT_ID=
GOOGLE_PAY_GATEWAY=pagosazul
```

Para pruebas locales usa:

```bash
CHECKOUT_PROVIDER=demo
```

## Gmail para facturas

1. Crear o usar una cuenta Google Workspace/Gmail del dominio, por ejemplo `facturas@tunegociord.com`.
2. Activar verificacion en dos pasos.
3. Crear una App Password.
4. Guardar esa clave en `GMAIL_APP_PASSWORD`.

No se debe usar la contrasena normal de Gmail.

## Azul y Google Pay

Para dejar Azul operativo necesitas solicitar a Azul:

- Alta del comercio para e-commerce.
- Credenciales de produccion.
- Habilitacion del dominio `https://tunegociord.com`.
- Habilitacion de Google Pay para el comercio.
- Merchant ID / identificador del comercio.
- Auth key o credencial equivalente.

El proyecto ya valida esas variables antes de permitir un checkout con `azul` o `azul_google_pay`. Cuando falten credenciales, el backend devuelve error 503. Aunque existan credenciales, el backend devuelve 501 hasta conectar la captura real certificada de Azul; esto evita activar PRO sin cobro real.

Google Pay debe tokenizarse contra una pasarela admitida. En este proyecto queda declarado como `GOOGLE_PAY_GATEWAY=pagosazul` y `GOOGLE_PAY_MERCHANT_ID`, pero la captura final debe enviarse al backend y procesarse con Azul antes de cambiar la suscripcion a PRO.

Referencias tecnicas:

- Google Pay Web API: `https://developers.google.com/pay/api/web/overview`
- Google Pay request objects/tokenization: `https://developers.google.com/pay/api/web/reference/request-objects`
- Azul Google Pay: `https://dev.azul.com.do/Pages/developer/documentos/plugins/Integracion_con_Google_Pay.pdf`
- Azul Pagina de Pagos: `https://dev.azul.com.do/Pages/developer/documentos/plugins/Documento-E-Commerce-AZUL-Pagina-Pagos-%28Espanol%29-2023-08.pdf`

## URLs a probar despues del deploy

- `https://tunegociord.com/`
- `https://tunegociord.com/precios`
- `https://tunegociord.com/admin`
- `https://tunegociord.com/api/checkout/config`
- `https://tunegociord.com/api/rates`
- `https://tunegociord.com/robots.txt`
- `https://tunegociord.com/sitemap.xml`

## Checklist post-publicacion

- Agregar `tunegociord.com` a dominios autorizados de Firebase Auth.
- Verificar SSL activo.
- Verificar que `/admin` tenga `noindex`.
- Probar registro/login Google y correo.
- Probar compra demo antes de activar Azul.
- Probar factura por correo con una cuenta real.
- Cambiar `CHECKOUT_PROVIDER` a `azul_google_pay` solo cuando Azul confirme credenciales.
- Revisar logs del servidor en Hostinger.
