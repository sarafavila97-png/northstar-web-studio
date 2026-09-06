# Contratos de integración

Los esquemas de contratos-integracion.json documentan las fronteras lógicas de transferencia. Cada definición se consulta bajo $defs; no sustituye los cuerpos propios de las APIs ni el export de n8n.

## Entrada: formulario y normalización

fila_formulario exige ocho columnas: Marca temporal, Nombre, Correo electrónico, Nombre del negocio, ¿Qué necesitas?, Cuéntanos sobre tu proyecto, Presupuesto orientativo (USD) y ¿Cuándo te gustaría comenzar? Son cadenas; correo usa formato email. Servicio, presupuesto y plazo tienen opciones enumeradas. row_number es opcional, entero desde 2.

n8n genera la clave estable de la fila y normaliza los campos antes de consultar Notion. La descripción del proyecto se recorta a 2.000 caracteres. El correo se conserva para la operación, no para el análisis del modelo.

## Entrada y salida de IA

datos_para_ia contiene seis cadenas obligatorias: servicio, proyecto, presupuesto, plazo, criterios y tono. Las últimas dos se obtienen de Configuración. No admite campos adicionales.

La petición Anthropic contiene model, max_tokens, temperature, system y messages. El prompt separa las reglas del contenido no confiable de la solicitud. La respuesta se lee desde content[].text; usage aporta input_tokens y output_tokens para calcular el costo.

| Campo de salida_ia | Tipo y límite | Uso |
|---|---|---|
| puntuacion | Entero de 0 a 100 | Prioridad comercial. |
| clasificacion | Alta, Media o Baja | Alta desde 70; Media desde 40; Baja hasta 39. |
| motivo | Cadena de 1 a 1.000 caracteres | Explicación al revisor. |
| asunto | Cadena de 1 a 300 caracteres | Asunto del correo propuesto. |
| cuerpo | Cadena de 1 a 5.000 caracteres | Borrador sujeto a revisión. |

Los cinco campos son obligatorios, sin claves adicionales. Una salida truncada o una clasificación incoherente se rechaza antes de solicitar aprobación. El límite del contrato de cuerpo coincide con el validador; el caso probado usa textos breves.

## Transferencia a Notion

Los nodos Notion convierten los valores internos a propiedades tipadas: Solicitud y Ejecución son title; Correo es email; textos son rich_text; métricas son number; Error es checkbox; fechas son date. La relación Ejecuciones.Solicitud contiene el id de la página de Solicitudes.

Ejemplo de fragmento de propiedades de una escritura Notion; las cadenas entre ángulos representan identificadores resueltos por n8n:

```json
{
  "Resultado": {"rich_text": [
    {"text": {"content": "Enviada al cliente"}}
  ]},
  "Error": {"checkbox": false},
  "Solicitud": {"relation": [{"id": "<id-pagina-solicitud>"}]}
}
```

Una Solicitud puede relacionarse con varios registros de Ejecuciones. Un fallo previo a su creación puede registrarse sin relación. Las consultas y creaciones usan la fuente de datos de Notion; las actualizaciones usan la página concreta. Estos identificadores no son intercambiables.

## Gmail: decisión y resultado

decision_humana exige un objeto data con approved de tipo booleano. El único permiso de envío es el booleano verdadero:

```json
{"data": {"approved": true}}
```

El nodo de envío usa el correo de entrada y el asunto/cuerpo validados. La respuesta Gmail aporta id y threadId; el resultado observado incluye labelIds con SENT. threadId se guarda en Hilo Gmail para rastrear el contacto. La respuesta del modelo nunca determina el destinatario.

## Transferencia al dashboard

resumen_dashboard exige total, enviadas, rechazadas, errores y duplicadas como enteros no negativos; tasa como número de 0 a 100; costo como número no negativo. No admite campos adicionales. El nodo final convierte estos valores a propiedades de Indicadores y actualiza su única página de resumen, junto con la fecha.

```json
{
  "total": 5, "enviadas": 2, "rechazadas": 0,
  "errores": 0, "duplicadas": 3,
  "tasa": 0, "costo": 0.004372
}
```

No se publican correos, nombres, proyectos, borradores ni enlaces de aprobación en el panel.
