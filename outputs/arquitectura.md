# Arquitectura y operación

Northstar Web Studio recibe consultas de diseño web mediante Google Forms. El sistema prioriza cada solicitud y prepara una respuesta comercial en español, con aprobación humana obligatoria antes de enviar el correo.

## Flujo único

Google Forms guarda las respuestas en Google Sheets. El disparador de nuevas filas inicia un único workflow n8n de 27 nodos, incluida una nota de configuración. El procesamiento es secuencial, con una solicitud por iteración.

| Etapa | Operación y destino |
|---|---|
| Entrada | Sheets activa n8n; se configura el revisor y se normalizan los ocho campos del formulario. |
| Validación | Una entrada incompleta se registra como fallo de validación en Ejecuciones, sin llamar a la IA. |
| Duplicados | Una clave estable de la fila permite consultar Solicitudes. Un duplicado se registra sin generar otro correo. |
| Memoria | Se crea la Solicitud en Notion y se leen los criterios y el tono de Configuración. Las reglas ausentes o inactivas bloquean la inferencia. |
| Análisis | Una petición a Anthropic clasifica y redacta. Se valida el JSON, la puntuación y su coherencia antes de guardar el borrador en Solicitudes. |
| Revisión | Gmail envía al revisor la clasificación y el borrador, con botones Aprobar y Rechazar. La ejecución espera hasta dos días. |
| Resultado | La aprobación permite el correo al cliente y guarda el identificador del hilo. El rechazo cambia el estado sin enviar. Ambas rutas registran su resultado en Ejecuciones. |
| Continuación | Cada resultado terminal devuelve el control al bucle para procesar la siguiente solicitud. Al terminar el lote, se consultan los registros y se actualiza Indicadores. |
| Contingencias | Los errores de consulta, reglas, IA, aprobación, envío o actualización de Solicitudes desembocan en Registrar fallo de ejecución. Si el registro final falla, el detalle permanece en n8n. |

## Configuración de la instalación

El archivo flujo-northstar.json conserva los parámetros operativos de la instalación de demostración y referencias a credenciales administradas, sin sus secretos. Las reglas comerciales y el tono se leen dinámicamente de Notion. Los identificadores de recursos y el correo del revisor son configuración de instalación, no datos de cada cliente.

Para importar: asociar las credenciales de Google Sheets, Gmail, Notion y Anthropic; revisar la hoja y pestaña del disparador, las fuentes de datos y páginas de Notion, el revisor y el encabezado de workspace de Anthropic. El modelo es claude-haiku-4-5, con max_tokens=600 y temperature=0.2. El export está inactivo y no contiene datos fijados.

## Procedimiento operativo

Enviar una solicitud de prueba desde el formulario, ejecutar una prueba del workflow y revisar el borrador recibido por Gmail. Aprobar solo si el contenido, el destinatario y las condiciones son correctos. Comprobar el resultado en Solicitudes, el registro en Ejecuciones y el panel agregado. Para operación continua, habilitar el disparador después de validar credenciales y acceso; las ejecuciones observadas se describen en evidencias.md.

El rechazo detiene el contacto comercial; no abre un circuito automático de edición. Para corregir una propuesta, el operador revisa el caso y decide un nuevo envío. Antes de reanudar un fallo posterior al envío, debe comprobar el hilo Gmail para evitar duplicados.
