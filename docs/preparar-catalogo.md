# Editar la carta de King Bras

## Uso diario

1. Abre Google Drive con la cuenta autorizada y entra a tu archivo original del catálogo en Google Sheets. El enlace CSV publicado es solamente de lectura.
2. En la pestaña Catalogo, busca el producto por su nombre.
3. Cambia precio para modificar su importe en soles. Puedes escribir 25, 25.50 o 25,50. También se acepta que Google lo muestre como S/ 25,50. No uses separadores de miles ni dejes el precio vacío. Cero significa gratuito.
4. Cambia descripcion para actualizar su acompañamiento o detalle. Máximo 300 caracteres; nombre admite hasta 100.
5. En disponible, elige NO para agotado o SI para volver a ofrecerlo. No elimines una fila para un agotamiento temporal.
6. Espera a que Google guarde los cambios. No necesitas volver a subir la web por cada precio.

Los importes actuales son ejemplos que puedes reemplazar desde la hoja.

## Qué conservar

No cambies la primera fila ni el orden de las seis columnas: id,nombre,descripcion,precio,categoria,disponible.

Conserva el id de cada producto: conecta su fotografía con el pedido. Las categorías permitidas son A la brasa, Broaster, Conos, Combos y chaufa, Bebidas. Usa las listas desplegables para evitar errores. Una disponibilidad vacía no es válida.

Para añadir un producto, completa las seis columnas con un id nuevo, único, formado por letras minúsculas, números y guiones (máximo 64 caracteres). La descripción puede quedar vacía. Los productos nuevos muestran una ilustración hasta añadir su fotografía desde el proyecto. Cambiar un id existente equivale a retirar un producto y crear otro.

## Cuánto tarda

La web intenta actualizar al abrirla si los datos guardados tienen al menos 10 minutos. Con la página abierta y visible, vuelve a comprobar periódicamente y limita las consultas a una cada 10 minutos aproximadamente. Google puede tardar unos minutos adicionales en publicar los cambios.

Si no ves una modificación, confirma que Google guardó la celda, revisa la pestaña publicada, espera el intervalo y vuelve a abrir la página. Recargar repetidamente no evita la caché de 10 minutos. En Archivo > Compartir > Publicar en la Web debe mantenerse publicada la pestaña Catalogo como CSV y habilitada su republicación automática.

Si una fila tiene errores, se conserva toda la última carta válida para evitar mezclar datos incompletos. Comprueba precios, categorías, disponibilidad, ids repetidos y cabeceras. Corrige la fila y espera la próxima actualización.

## Si falla Google Sheets

La web conserva los últimos datos válidos del navegador y muestra un aviso cuando no pudo actualizarlos. Si es la primera visita y no hay datos guardados, muestra los 26 productos incorporados al proyecto, con precios por consultar. Esta copia no se actualiza sola con la hoja.

Los productos agotados se muestran, pero no pueden añadirse. Si un producto del pedido se agota o se retira mientras la página está abierta, queda señalado y se excluye del importe y del mensaje de WhatsApp. Los cambios de precio actualizan el importe y generan un aviso. El cliente revisa y envía personalmente el mensaje; el restaurante confirma precios, disponibilidad y delivery.

## Acceso y publicación

Publica solamente datos comerciales: el CSV es público. Concede permisos de edición solo a las personas responsables. Los visitantes no necesitan acceso de edición. Conviene proteger cabeceras y columna id. No incluyas información privada en la pestaña publicada.

## Para quien mantiene la web

- src/catalog-config.js: enlace CSV, intervalo de 10 minutos, espera máxima de 8 segundos y versión de caché. Cambiar de hoja requiere modificar el enlace y desplegar; editar sus productos no.
- src/catalog.js: validación completa, conversión a céntimos y caché por enlace de hoja. Acepta entre 1 y 500 productos, precios de 0 a 99999.99 y respuestas de hasta un millón de caracteres. No interpreta HTML de las celdas.
- src/useCatalog.js: consulta al volver a una pestaña visible y comprueba cada minuto si corresponde actualizar. Las comprobaciones no generan solicitudes antes del intervalo mínimo.
- src/product-assets.js: fotografías por id, gestionadas desde el proyecto.
- src/data/menu-backup.json: copia de emergencia. Precio y disponibilidad null significan pendientes de confirmar, nunca precio cero. Actualizarla requiere revisar datos y volver a desplegar.
- tests/catalog.test.js: pruebas ejecutables con npm test.

Para publicar esta integración, sube los cambios al repositorio conectado a Netlify. Mantén npm run build, carpeta dist y Node 22. Conserva la URL pública de producción https://kingbras.netlify.app/ en la configuración existente. No necesitas claves ni un servidor.

Después del despliegue, comprueba la carta en móvil y escritorio: deben aparecer los precios y los productos con NO deben quedar agotados. Abre un pedido de prueba y revisa su mensaje sin enviarlo. La lectura desde el navegador depende de que Google mantenga publicado el CSV y permita su acceso; si falla, se activan los respaldos.