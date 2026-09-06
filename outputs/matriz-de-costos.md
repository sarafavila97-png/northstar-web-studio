# Matriz de costos y decisión

## Selección por tarea

| Tarea | Recurso elegido | Justificación |
|---|---|---|
| Validación, duplicados y KPIs | Reglas y código n8n | Son operaciones deterministas; no requieren tokens ni razonamiento generativo. |
| Clasificación y borrador breve | Claude Haiku 4.5 | Una sola inferencia resuelve ambas tareas con contexto acotado y revisión humana. |
| Autorización del contacto | Revisor en Gmail | La decisión comercial no se delega al modelo. |
| Lectura densa o proyectos complejos | Sonnet 5 o Sonnet 4.6, como alternativas | Solo se justificarían al incorporar documentos extensos o mayor razonamiento. No se utilizan en esta POC. |
| Análisis masivo no urgente | Message Batches, como alternativa | Adecuado para reclasificación histórica que tolere espera. No se utiliza en el flujo interactivo. |

La solución implementa un modelo: Claude Haiku 4.5. Los otros modelos y Batch forman parte de la comparación económica, no de la ejecución demostrada.

## Comparación económica

Precios en USD por millón de tokens, consultados el 6 de septiembre de 2026. Escenario homogéneo: 1.000 tokens de entrada y 400 de salida por solicitud; sin caché, reintentos ni herramientas adicionales.

| Alternativa | Entrada / salida por millón | Costo por solicitud | Costo por 1.000 solicitudes |
|---|---|---|---|
| Haiku 4.5, síncrono - elegido | 1,00 / 5,00 | 0,003 USD | 3,00 USD |
| Sonnet 5, síncrono | 2,00 / 10,00 | 0,006 USD | 6,00 USD |
| Sonnet 4.6, síncrono | 3,00 / 15,00 | 0,009 USD | 9,00 USD |
| Haiku 4.5, Batch - alternativa | 0,50 / 2,50 | 0,0015 USD | 1,50 USD |

Con ese mismo volumen, Haiku síncrono supone un ahorro estimado del 50 % frente a Sonnet 5 y del 66,7 % frente a Sonnet 4.6. Batch reduciría otro 50 % frente a Haiku síncrono, a cambio de procesamiento asíncrono. No son ahorros medidos en una comparación de calidad entre modelos.

Fuente: [precios oficiales de Anthropic y descuento de Message Batches](https://platform.claude.com/docs/en/about-claude/pricing).

## Consumo observado

| Ejecución n8n | Tokens de entrada | Tokens de salida | Costo IA calculado |
|---|---|---|---|
| 231 | 730 | 295 | 0,002205 USD |
| 234 | 732 | 287 | 0,002167 USD |
| Total | 1.462 | 582 | 0,004372 USD |

Fórmula: costo = tokens_entrada × 1 / 1.000.000 + tokens_salida × 5 / 1.000.000. Las métricas proceden de las respuestas de Anthropic de dos solicitudes aprobadas. Los duplicados se filtran antes de llamar al modelo.

## Controles y alcance del presupuesto

Una llamada combina clasificación y redacción. El proyecto se limita a 2.000 caracteres, la salida a 600 tokens y las reglas se obtienen de Notion. El registro de Ejecuciones permite controlar consumo y costo agregado en el panel.

Estas cifras representan inferencia, no el costo total del servicio. No incluyen suscripciones de n8n, Google o Notion, tiempo de revisión humana, reintentos ni consumo que un fallo no haya permitido registrar. Los precios del proveedor pueden cambiar; actualizar la tarifa del cálculo cuando corresponda.
