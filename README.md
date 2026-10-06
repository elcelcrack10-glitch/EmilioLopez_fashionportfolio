# Emilio Lopez — portfolio

Portfolio estático en español e inglés. Incluye Pescadilla, Manuela, Feel Marni y COLORES, con las selecciones revisadas con Emilio, páginas de proceso, fashion film, biografía y CV.

## Ver la web

```sh
npm ci
npm run dev
```

Abrir **http://localhost:4173**. `npm run preview` sirve la versión ya generada en `dist/`. El servidor local admite los rangos de bytes necesarios para adelantar y retroceder el vídeo. Para detenerlo, usar Ctrl+C en la terminal que lo ejecuta.

## Editar

- `src/content.mjs`: textos ES/EN, proyectos, créditos y fotografías, con origen y pies de foto.
- `src/templates.mjs`: generación de las páginas.
- `src/style.css`: diseño y adaptación a pantallas.
- `src/app.js`: cambio de idioma y visor de fotografías.
- `src/persona.css`: diseño de la página Persona.
- `src/exhibition.css` y `src/exhibition.js`: índice de fotografías, filtros y recorridos horizontales.
- `review/`: decisiones editoriales y verificaciones locales, excluidas del repositorio público.

Después de cambiar textos o estilos, ejecutar `npm run build` y recargar el navegador.

## Imágenes y vídeo

Los archivos originales se conservan en sus carpetas. `public/` contiene solo los derivados de uso web y el CV elegido para descarga. La portada de Feel Marni procede del archivo horizontal añadido en la raíz de `MARNI/`; la foto 03 procede de `cambio.JPG`.

Para incorporar nuevas imágenes o regenerar derivados:

```sh
npm run media
npm run build
```

La preparación de HEIC y PDF utiliza Swift, PDFKit e ImageIO en macOS. Sharp genera AVIF y WebP a varios tamaños. FFmpeg crea el MP4 H.264/AAC para web. La caché comprueba cambios en ruta, tamaño, fecha de modificación y página de PDF. El material existente permite construir la web sin ejecutar de nuevo este paso.

## Validar

```sh
npm run build
npm test
```

Las pruebas utilizan el Chrome instalado y Playwright. Revisan ambos idiomas, navegación, galería, CV, contactos, vídeo, respuesta 404, contenido sin JavaScript, accesibilidad automática y anchos de 320, 768, 1024 y 1440 px.

## Publicar

`dist/` es la carpeta publicable; contiene HTML, imágenes, vídeo, CSS, JavaScript y CV. No subir las carpetas de originales, `review/`, `.cache/` o `node_modules/`. No necesita un servidor Node en producción. El alojamiento debe servir `index.html` por carpeta y admitir MP4 y solicitudes Range. Los alojamientos estáticos habituales lo hacen.

### GitHub Pages

`.github/workflows/pages.yml` construye y publica la web al subir cambios a
`main`, o mediante ejecución manual en Actions. En Settings → Pages, la fuente
debe ser **GitHub Actions**. El workflow obtiene la URL de Pages y configura
`SITE_URL` para que enlaces, imágenes, vídeo, fuentes y metadatos funcionen
incluso bajo una subcarpeta como `/post-folio/`.

El build usa solo Node.js 24 y los derivados que ya están en `public/`; no
necesita regenerar originales ni instalar dependencias en CI.

```sh
node --test checks/deployment.test.mjs
SITE_URL=https://example.github.io/post-folio npm run build
```

Sin `SITE_URL`, `npm run build` prepara la vista previa local en la raíz.
`OUTPUT_DIR` permite generar una copia de prueba en otra carpeta. La prueba
de despliegue comprueba todas las rutas publicadas, imágenes responsivas,
fuentes, CV, vídeo y metadatos en una carpeta temporal.

Las carpetas originales, revisiones, capturas, archivos de entorno y paquetes
locales están excluidos por `.gitignore`. Solo `dist/` se publica en Pages.

La biografía inglesa y los textos de proyecto son una primera redacción editable. Las comprobaciones de navegador documentadas se realizaron en Chrome; Safari y Firefox requieren una revisión específica antes de garantizar compatibilidad con esos navegadores.
