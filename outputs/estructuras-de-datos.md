# Northstar Web Studio - Estructuras de datos

Esquema de las cuatro bases Notion utilizadas por el workflow. Solicitudes y Ejecuciones se relacionan entre sí; Configuración proporciona las reglas y el tono; Indicadores publica únicamente el resumen agregado.

## Relaciones y separación de acceso

Una Solicitud puede tener varios registros en Ejecuciones, por ejemplo un resultado original y un intento duplicado. Cada Ejecución se vincula a una Solicitud cuando esta existe; un fallo anterior a la creación puede quedar sin relación. La relación es bidireccional: Ejecuciones.Solicitud y Solicitudes.Ejecuciones.

Configuración contiene las reglas que la IA lee en tiempo de ejecución. Indicadores contiene un único resumen agregado, separado de las bases privadas y sin relación navegable hacia datos de clientes.

## Solicitudes - privada

| Propiedad | Tipo Notion | Uso |
|---|---|---|
| Solicitud | Título | Clave estable para detectar reenvíos del mismo registro; no incluye el correo en texto visible. |
| Estado | Texto | Recibida, Pendiente de aprobación, Aprobada y enviada o Rechazada. Los fallos también se consultan en Ejecuciones. |
| Correo | Correo electrónico | Destinatario, usado solo después de aprobación humana. |
| Nombre | Texto | Persona de contacto; no se pasa como campo a la IA. |
| Negocio | Texto | Nombre del negocio; contexto para el revisor. |
| Servicio | Texto | Sitio informativo, tienda, rediseño o necesidad por aclarar. |
| Proyecto | Texto | Descripción del trabajo; máximo 2.000 caracteres enviados a IA. |
| Presupuesto | Texto | Rango orientativo en USD, no una cotización. |
| Plazo | Texto | Momento deseado de inicio. |
| Puntuación | Número | Entero de 0 a 100 validado antes de guardar. |
| Clasificación | Texto | Alta, Media o Baja, coherente con la puntuación. |
| Borrador | Texto | Cuerpo propuesto por IA, pendiente de revisión. El validador admite hasta 5.000 caracteres; el caso demostrado utiliza textos breves. |
| Hilo Gmail | Texto | Identificador devuelto por Gmail tras el envío. |
| Recibida | Fecha | Momento de registro en Notion. |
| Ejecuciones | Relación | Registros asociados en Ejecuciones. |

## Ejecuciones - privada

| Propiedad | Tipo Notion | Uso |
|---|---|---|
| Ejecución | Título | Identificador de la ejecución n8n para rastreo. |
| Resultado | Texto | Enviada al cliente, Rechazada por revisor, Duplicado ignorado, Fallo de validación o Error de ejecución. |
| Etapa | Texto | Punto donde finalizó el procesamiento. |
| Detalle | Texto | Resumen controlado, sin error bruto ni datos de contacto. |
| Error | Casilla | Verdadero para un fallo; un rechazo comercial no es un error técnico. |
| Fecha | Fecha | Momento del resultado final. |
| Tokens entrada | Número | Uso informado por Anthropic, cuando está disponible. |
| Tokens salida | Número | Uso informado por Anthropic, cuando está disponible. |
| Costo USD | Número | Estimación calculada con tokens; no sustituye la factura del proveedor. |
| Duración ms | Número | Duración hasta el registro final, incluida la espera humana cuando corresponde. |
| Solicitud | Relación | Página de Solicitudes, opcional en fallos previos a su creación. |

Un valor ausente de uso no prueba costo cero: una petición fallida puede consumir recursos sin devolver métricas utilizables. El dashboard suma únicamente los costos registrados.

## Configuración - privada

| Propiedad | Tipo Notion | Uso |
|---|---|---|
| Clave | Título | Northstar-v1. |
| Criterios | Texto | Servicios, reglas de puntuación, umbrales y prohibiciones comerciales. |
| Tono | Texto | Español claro, cálido y profesional; borrador breve sin compromisos inventados. |
| Activo | Casilla | Selecciona la configuración utilizable. |

Reglas: ajuste al servicio 0-40 puntos, presupuesto 5-30 puntos, inicio 10-30 puntos. Clasificación Alta desde 70, Media desde 40 y Baja por debajo de 40. El flujo debe detenerse si no hay reglas activas completas; no debe sustituirlas silenciosamente por instrucciones vacías.

## Indicadores - única base del panel público

| Propiedad | Tipo Notion | Cálculo |
|---|---|---|
| Panel | Título | Resumen acumulado, una sola fila. |
| Ejecuciones | Número | Cantidad de registros finales en Ejecuciones. |
| Enviadas | Número | Resultado = Enviada al cliente. |
| Rechazadas | Número | Resultado = Rechazada por revisor. |
| Errores | Número | Registros con Error verdadero. |
| Duplicadas | Número | Resultado = Duplicado ignorado. |
| Tasa de errores (%) | Número | 100 × Errores / Ejecuciones; 0 si el denominador es 0. |
| Costo IA USD | Número | Suma de costos registrados. |
| Actualizado | Fecha | Última actualización correcta del resumen. |

El denominador incluye los intentos duplicados registrados. Las solicitudes que aún esperan aprobación no tienen resultado final y no se cuentan todavía. Si el registro en Notion falla, ese fallo solo podrá verse en n8n; el panel no es una medición independiente de toda caída del sistema. La consulta usa todas las páginas de resultados, no solo la primera página.

## Contratos JSON de transferencia

El archivo contratos-integracion.json documenta el contrato lógico de cada frontera, no una exportación del workflow ni un sustituto de los formatos propios de cada API. Las credenciales y los identificadores de páginas se resuelven en n8n.

1. Google Forms almacena una respuesta como fila en Sheets. n8n lee los ocho encabezados y normaliza los siete campos de negocio más la marca temporal.
2. n8n conserva el correo para Gmail/Notion, pero entrega al modelo solo servicio, proyecto, presupuesto, plazo y reglas.
3. Anthropic devuelve un bloque de texto con un objeto JSON. Se analiza y valida antes de almacenar el borrador o pedir aprobación.
4. Gmail devuelve la decisión humana a la ejecución que estaba esperando. Solo el booleano verdadero habilita el envío; ninguna cadena, ausencia o vencimiento debe interpretarse como permiso.
5. Los nodos Notion transforman valores internos en propiedades tipadas. Una relación utiliza el identificador de la página de Solicitudes, no el identificador de su base.
6. n8n calcula un objeto agregado y actualiza la página existente de Indicadores; no publica filas ni mensajes individuales.

Notion distingue el identificador del contenedor de base del identificador de su fuente de datos. En esta instalación son diferentes. Los nodos de consulta/creación usan la fuente de datos; las actualizaciones usan el identificador de la página concreta.
