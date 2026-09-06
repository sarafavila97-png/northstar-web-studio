# Northstar Web Studio

Calificación de solicitudes y seguimiento comercial para una agencia de diseño web. Un único workflow conecta Google Forms, n8n, Notion, Anthropic y Gmail: analiza cada proyecto, propone una respuesta y espera aprobación humana antes de contactar al cliente.

## Demostración

https://github.com/user-attachments/assets/29f86f4f-3cc7-4c32-8549-43a80dafdc39

[Ver la demostración en español · 2:58](outputs/demo-northstar-es.mp4)

## Entregables

| Criterio | Documento o acceso |
|---|---|
| Mapa de arquitectura | [Documentación técnica, sección 1](outputs/documentacion-tecnica.pdf) |
| Estructuras de datos y contratos JSON | [Documentación técnica, secciones 2 y 3](outputs/documentacion-tecnica.pdf) · [Esquemas JSON](outputs/contratos-integracion.json) |
| Optimización de costos | [Matriz comparativa y de decisión](outputs/matriz-de-costos.pdf) |
| Seguridad y resiliencia | [Documentación técnica, sección 4](outputs/documentacion-tecnica.pdf) |
| Dashboard de control | [Panel público de indicadores](https://wheat-chime-134.notion.site/Resumen-acumulado-3d370ff3965f8027be80e063dd1e5b79) |

## Archivos y accesos

- [Workflow n8n para importar](outputs/flujo-northstar.json).
- [Evidencias de funcionamiento y capturas](outputs/evidencias.md).
- [Formulario de nuevas solicitudes](https://docs.google.com/forms/d/e/1FAIpQLSddNs7nd9NDTPNkxqi9bCO_jvlUdvXRQj8hTrlhPj6JC50z9A/viewform).
- [Base de datos en Notion](https://app.notion.com/p/Northstar-Web-Studio-Centro-de-operaciones-3d370ff3965f8045bbc3dbea63645635): acceso restringido; el evaluador necesita permiso de lectura.
- [Workflow en n8n Cloud](https://sarafavila.app.n8n.cloud/workflow/UEVt0K0SuRrhbl6e): requiere acceso a la instancia.

## Operación

1. El cliente completa el formulario y su respuesta llega a Google Sheets.
2. n8n valida la entrada, evita duplicados y consulta las reglas comerciales en Notion.
3. Claude Haiku 4.5 devuelve una clasificación y un borrador en JSON.
4. El revisor aprueba o rechaza desde Gmail. Solo una aprobación explícita permite el envío.
5. Notion conserva el resultado y el panel muestra los indicadores agregados.

Validación: cinco ejecuciones completas documentadas, incluidos proyecto vacío y correo inválido; 26 comprobaciones locales correctas. Consulte las [evidencias](outputs/evidencias.md).

El export se entrega inactivo y sin secretos. Para usarlo en otra instancia, hay que asociar credenciales, fuentes de datos y revisor antes de activarlo. El alcance se detalla en [Evidencias](outputs/evidencias.md#alcance-de-la-validación).
