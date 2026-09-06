# Evidencias de funcionamiento

Prueba de concepto con datos de demostración. El video y las capturas muestran el formulario, el procesamiento en n8n, la aprobación humana, el resultado Gmail y el registro en Notion.

## Resultados observados

| Ejecución | Caso | Resultado |
|---|---|---|
| [231](https://sarafavila.app.n8n.cloud/workflow/UEVt0K0SuRrhbl6e/executions/231) | Solicitud completa | Clasificación Alta, 75/100; aprobación humana; correo enviado; registro y panel actualizados. |
| [234](https://sarafavila.app.n8n.cloud/workflow/UEVt0K0SuRrhbl6e/executions/234) | Solicitud nueva junto con una fila duplicada | Procesamiento secuencial; duplicado omitido y solicitud nueva aprobada y enviada. |
| [236](https://sarafavila.app.n8n.cloud/workflow/UEVt0K0SuRrhbl6e/executions/236) | Relectura de dos solicitudes existentes | Dos duplicados registrados; sin nueva inferencia ni correo. Ejecución completa: 6,192 s. |
| [237](https://sarafavila.app.n8n.cloud/workflow/UEVt0K0SuRrhbl6e/executions/237) | Proyecto vacío en la hoja de entrada | Dos duplicados omitidos y un fallo de validación registrado en Notion: proyecto vacío, Error=true. Ejecución completa: 7,866 s. |
| [238](https://sarafavila.app.n8n.cloud/workflow/UEVt0K0SuRrhbl6e/executions/238) | Correo inválido en la hoja de entrada | Dos duplicados omitidos y dos fallos de validación registrados: proyecto vacío y correo inválido. Ejecución completa: 7,545 s. |

La ejecución 234 devuelve data.approved=true y Gmail confirma SENT. La Solicitud conserva el hilo Gmail y se relaciona con su registro de Ejecuciones. El video documenta ese caso; el panel durante la demostración tenía 5 registros.

Tras las pruebas 236-238, el panel público contiene 14 registros terminales: 2 envíos, 9 duplicados, 3 errores de validación y 0 rechazos. Tasa de errores: 21,43 %; costo IA registrado: 0,004372 USD. Los tres errores son entradas inválidas introducidas deliberadamente para probar la protección, no fallos imprevistos del servicio.

Los cinco casos de esta tabla son ejecuciones completas distintas del mismo workflow. Las pruebas 236-238 se iniciaron manualmente en n8n, leyendo la hoja real mediante el disparador Google Sheets y usando la API real de Notion; no se fijaron datos ni se simularon respuestas de los nodos. Las filas de proyecto vacío y correo inválido se añadieron directamente a la hoja para probar datos defectuosos que el formulario normalmente impediría enviar. La prueba aislada del disparador 235 no se cuenta entre las cinco.

Los casos inválidos finalizan como Succeeded en n8n porque la contingencia se gestiona correctamente: registran Error=true en Notion, continúan el lote y actualizan el panel. En 236-238 no se ejecutan los nodos Anthropic ni Gmail.

## Capturas

| Evidencia | Qué permite comprobar |
|---|---|
| [Formulario](evidencias/01-formulario.png) | Entrada de una solicitud de diseño web. |
| [Workflow](evidencias/02-workflow.png) | Un único flujo con validaciones, IA, aprobación y registros. |
| [Bases de datos](evidencias/03-datos.png) | Solicitudes y Ejecuciones en Notion. |
| [Respuesta IA](evidencias/04-respuesta-ia.png) | Clasificación y borrador estructurados. |
| [Aprobación](evidencias/05-aprobacion.png) | Decisión humana explícita antes del envío. |
| [Correo enviado](evidencias/06-envio.png) | Resultado Gmail y estado SENT. |
| [Dashboard de la demostración](evidencias/07-dashboard.png) | Resumen al completar el caso 234. |
| [Historial de ejecuciones](evidencias/08-ejecuciones-reales.png) | Ejecuciones independientes guardadas en n8n. |
| [Correo inválido](evidencias/09-correo-invalido.png) | Ejecución 238: registro Notion con Error=true y detalle correo inválido. |
| [Proyecto vacío](evidencias/10-proyecto-vacio.png) | Ejecución 237: registro Notion con Error=true y detalle proyecto vacío. |
| [Duplicados](evidencias/11-duplicados.png) | Ejecución 236: duplicado registrado sin repetir el contacto. |
| [Dashboard tras las pruebas](evidencias/12-dashboard-pruebas.png) | 14 registros, 3 errores controlados y tasa del 21,43 %. |

## Validación local

26 comprobaciones correctas y 0 fallos sobre el código del export. Cubren entradas incompletas, clave estable, puntuaciones y tipos inválidos, coherencia de clasificación, respuestas truncadas, reglas ausentes o inactivas, minimización del error registrado, costo, agregación y aprobación estrictamente booleana.

Ejecución reproducible, sin invocar servicios externos:

```sh
node tests/validar-flujo.cjs outputs/flujo-northstar.json
```

## Alcance de la validación

La evidencia acredita cinco ejecuciones completas y dos variantes del camino infeliz con datos reales de prueba: proyecto vacío y correo inválido. Las pruebas locales complementan, pero no sustituyen, estas ejecuciones. El número de registros del dashboard no debe confundirse con el número de ejecuciones: un lote produce varios registros.

La aprobación real está comprobada. El rechazo, vencimiento, caída de API y respuestas largas no se incluyen en esta batería. El export está inactivo; las pruebas no acreditan la activación continua del disparador. El panel público está separado de la base privada, cuyo permiso de lectura debe concederse al evaluador.
