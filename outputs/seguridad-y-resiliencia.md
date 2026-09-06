# Seguridad y resiliencia

## Minimización y acceso

La IA recibe servicio, proyecto, presupuesto, plazo, criterios y tono. Nombre y correo no se incorporan como campos al prompt. La descripción se limita a 2.000 caracteres; el formulario solicita no incluir información sensible. El texto libre puede contener datos personales introducidos por el cliente: no existe un anonimizado automático integral.

Solicitudes, Configuración y Ejecuciones permanecen privadas. El panel público contiene exclusivamente totales, tasa de errores, costo y fecha de actualización, sin relaciones navegables a clientes. El export guarda referencias a credenciales, no claves ni tokens. La lectura para evaluación debe concederse solo a destinatarios autorizados.

Los datos del formulario se delimitan como contenido no confiable dentro del prompt. La salida se analiza como JSON y se validan campos, tipos, longitudes y coherencia de la clasificación. El modelo no ejecuta herramientas ni decide el destinatario.

## Aprobación humana

Gmail envía al revisor la clasificación, puntuación, motivo y borrador. La ejecución queda suspendida con una espera máxima configurada de dos días. Solo data.approved === true habilita el envío al cliente; false, cadenas, valores ausentes y números no lo autorizan. El vencimiento no equivale a aprobación.

El revisor comprueba el contenido comercial y puede rechazarlo. No se envían cotizaciones ni compromisos contractuales automáticamente. El correo del cliente proviene de la entrada validada, no de la salida del modelo.

## Rutas de contingencia

| Situación | Respuesta del flujo |
|---|---|
| Datos incompletos | Registrar fallo de validación con Error=true; no invocar IA ni Gmail. |
| Fila ya procesada | Registrar duplicado y continuar; no repetir inferencia ni contacto. |
| Reglas ausentes o inactivas | Bloquear el análisis y registrar fallo de ejecución. |
| Fallo de API o JSON inválido | Usar la salida de error del nodo y registrar el fallo; no aprobar ni enviar un borrador inválido. |
| Rechazo humano | Marcar Rechazada y registrar el resultado con Error=false. |
| Error de Gmail o de actualización | Registrar fallo de ejecución; el operador comprueba el estado real antes de reintentar. |
| Notion no permite registrar el fallo | La ejecución falla en n8n. Consultar su historial y recuperar manualmente el registro. |
| Fallo al actualizar el dashboard | Revisar n8n y la fecha Actualizado del panel; un resumen antiguo no acredita disponibilidad actual. |

La búsqueda de duplicados, lectura de reglas, petición a Anthropic y consulta final de Ejecuciones tienen reintentos habilitados. Gmail y los registros finales no tienen reintentos automáticos configurados. Las salidas de error están dentro del mismo workflow; no se requiere un segundo flujo de errores.

## Recuperación y límites operativos

Tras un fallo posterior al envío, comprobar Gmail y Solicitudes antes de reintentar. Operar secuencialmente: la clave de fila no bloquea ejecuciones concurrentes. El panel solo refleja registros guardados; la espera humana retrasa el lote.

El validador permite cuerpos de 5.000 caracteres, pero la escritura de textos largos en Notion requiere prueba específica. La demostración utiliza borradores breves. La retención y eliminación son manuales.
