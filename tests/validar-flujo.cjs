const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const workflow = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const node = name => workflow.nodes.find(n => n.name === name);
const fixture = {
  'Marca temporal': '2026-09-05 21:00:00',
  Nombre: 'Persona de prueba',
  'Correo electrónico': 'demo@example.com',
  'Nombre del negocio': 'Tienda ficticia',
  '¿Qué necesitas?': 'Tienda en línea',
  'Cuéntanos sobre tu proyecto': 'Tienda de productos artesanales con catálogo y carrito.',
  'Presupuesto orientativo (USD)': 'Entre 3.000 y 5.999 USD',
  '¿Cuándo te gustaría comenzar?': 'En el próximo mes',
  row_number: 2,
};
function runCode(name, items) {
  // Respeta la opción de ejecución única del nodo, si está configurada.
  const input = (node(name).executeOnce ? items.slice(0, 1) : items).map(json => ({json}));
  const lookup = () => ({first: () => ({json: {start_ms: Date.now()}}), item: {json: {start_ms: Date.now()}}});
  const result = vm.runInNewContext('(function(){' + node(name).parameters.jsCode + '\n})()', {
    $input: {first: () => input[0], all: () => input, item: input[0]},
    $json: input[0].json,
    $: lookup,
    Date,
    console,
  }, {timeout: 1000});
  return Array.isArray(result) ? result : [result];
}
function aiResponse(puntuacion, clasificacion) {
  return {stop_reason: 'end_turn', content: [{type: 'text', text: JSON.stringify({puntuacion, clasificacion, motivo: 'Prueba controlada', asunto: 'Tu proyecto web', cuerpo: 'Gracias por compartir tu proyecto. Nuestro equipo lo revisará.'})}], usage: {input_tokens: 1000, output_tokens: 400}};
}
let failed = 0;
function test(name, fn) {
  try { fn(); console.log('OK: ' + name); }
  catch (error) { failed++; console.log('FALLO: ' + name + ' - ' + error.message); }
}
test('Una solicitud completa pasa y la clave no muestra el correo', () => {
  const result = runCode('Normalizar y validar entrada', [fixture])[0].json;
  assert.equal(result.es_valido, true);
  assert.ok(result.clave);
  assert.equal(result.clave.includes(fixture['Correo electrónico']), false);
});
test('La misma fila conserva su clave estable', () => {
  assert.equal(runCode('Normalizar y validar entrada', [fixture])[0].json.clave, runCode('Normalizar y validar entrada', [fixture])[0].json.clave);
});
test('Un proyecto vacío no pasa la validación', () => {
  assert.equal(runCode('Normalizar y validar entrada', [{...fixture, 'Cuéntanos sobre tu proyecto': ''}])[0].json.es_valido, false);
});
test('Un presupuesto vacío no pasa la validación', () => {
  assert.equal(runCode('Normalizar y validar entrada', [{...fixture, 'Presupuesto orientativo (USD)': ''}])[0].json.es_valido, false);
});
test('La IA no puede devolver puntuaciones fuera de 0 a 100', () => {
  assert.throws(() => runCode('Validar respuesta IA', [aiResponse(101, 'Alta')]));
});
test('La clasificación debe ser coherente con la puntuación', () => {
  assert.throws(() => runCode('Validar respuesta IA', [aiResponse(20, 'Alta')]));
});
for (const [score, label] of [[0,'Baja'], [39,'Baja'], [40,'Media'], [69,'Media'], [70,'Alta'], [100,'Alta']]) {
  test(`El límite ${score}/${label} es válido`, () => {
    assert.equal(runCode('Validar respuesta IA', [aiResponse(score,label)])[0].json.puntuacion, score);
  });
}
for (const score of [-1, 42.5, '80']) {
  test(`Puntuación inválida ${JSON.stringify(score)} se rechaza sin convertirla`, () => {
    assert.throws(() => runCode('Validar respuesta IA', [aiResponse(score,'Alta')]));
  });
}
test('Una respuesta truncada no se acepta aunque el texto parseara', () => {
  assert.throws(() => runCode('Validar respuesta IA', [{...aiResponse(80,'Alta'), stop_reason:'max_tokens'}]));
});
test('El cálculo de costo devuelve 0,003 USD para 1.000/400 tokens Haiku', () => {
  assert.equal(runCode('Validar respuesta IA', [aiResponse(80, 'Alta')])[0].json.costo_usd, 0.003);
});
test('Los errores almacenados no copian datos de contacto del proveedor', () => {
  const p = node('Registrar fallo de ejecución').parameters.propertiesUi.propertyValues.find(p => p.key === 'Detalle|rich_text');
  const expr = p.textContent.replace(/^=\{\{\s*/, '').replace(/\s*\}\}$/, '');
  const result = p.textContent.startsWith('={{') ? vm.runInNewContext(expr, {$json: {error: {message: 'Failed recipient demo@example.com'}}}, {timeout: 1000}) : p.textContent;
  assert.equal(String(result).includes('demo@example.com'), false);
});
test('La ausencia de reglas bloquea el procesamiento', () => {
  assert.throws(() => runCode('Validar reglas', [{}]));
});
test('Las reglas inactivas bloquean el procesamiento', () => {
  assert.throws(() => runCode('Validar reglas', [{properties:{Criterios:{rich_text:[{plain_text:'Criterio de prueba'}]},Tono:{rich_text:[{plain_text:'Español'}]},Activo:{checkbox:false}}}]));
});
test('Se leen los textos reales del formato Notion', () => {
  const result=runCode('Validar reglas', [{properties:{Criterios:{rich_text:[{plain_text:'Criterio de prueba'}]},Tono:{rich_text:[{plain_text:'Español'}]},Activo:{checkbox:true}}}])[0].json;
  assert.equal(result.criterios,'Criterio de prueba');
  assert.equal(result.tono,'Español');
});
test('El dashboard calcula los agregados con las propiedades Notion', () => {
  const records=[['Enviada al cliente',false,0.003],['Rechazada por revisor',false,0.003],['Duplicado ignorado',false,0],['Fallo de validación',true,0],['Error de ejecución',true,0]].map(([resultado,error,costo])=>({id:resultado,properties:{Resultado:{rich_text:[{plain_text:resultado}]},Error:{checkbox:error},'Costo USD':{number:costo}}}));
  const r=runCode('Dashboard: calcular agregados',records)[0].json;
  assert.equal(r.total,5);assert.equal(r.enviadas,1);assert.equal(r.rechazadas,1);assert.equal(r.duplicadas,1);assert.equal(r.errores,2);assert.equal(r.tasa,40);assert.equal(r.costo,0.006);
});
test('Solo un booleano true del humano permite enviar', () => {
  const expr=node('¿Aprobado?').parameters.conditions.conditions[0].leftValue.replace(/^=\{\{\s*/,'').replace(/\s*\}\}$/,'');
  for(const value of [false,'true',null,undefined,1]) {
    assert.equal(vm.runInNewContext(expr,{$json:{data:{approved:value}}}),false);
  }
  assert.equal(vm.runInNewContext(expr,{$json:{}}),false);
  assert.equal(vm.runInNewContext(expr,{$json:{data:{approved:true}}}),true);
});
test('La IA usa la credencial administrada y el workspace comprobado', () => {
  const ai = node('Clasificar y redactar (IA)');
  assert.equal(ai.type, 'n8n-nodes-base.httpRequest');
  assert.equal(ai.parameters.method, 'POST');
  assert.equal(ai.parameters.url, 'https://api.anthropic.com/v1/messages');
  assert.equal(ai.parameters.authentication, 'predefinedCredentialType');
  assert.equal(ai.parameters.nodeCredentialType, 'anthropicApi');
  assert.equal(ai.credentials.anthropicApi.id, 'lj8Kfq2kiEffByIk');
  const headers = Object.fromEntries(ai.parameters.headerParameters.parameters.map(p => [p.name.toLowerCase(), p.value]));
  assert.equal(headers['anthropic-workspace-id'], 'wrkspc_01PLRU4gwa5TR1DBo4ThGX3p');
  assert.equal(headers['anthropic-version'], '2023-06-01');
  assert.equal(headers['x-api-key'], undefined);
});
test('El revisor tiene una dirección de correo configurada', () => {
  const assignments = node('Configuración de ejecución').parameters.assignments.assignments;
  assert.match(assignments.find(a => a.name === 'revisor_email').value, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
});
test('El export permanece inactivo, sin datos fijados ni nodos temporales', () => {
  assert.equal(workflow.active, false);
  assert.deepEqual(workflow.pinData || {}, {});
  assert.equal(workflow.nodes.some(n => n.name.startsWith('Diagnóstico temporal')), false);
  assert.equal(workflow.nodes.filter(n => /Trigger$/.test(n.type)).length, 1);
});
console.log(`${failed} pruebas con fallo; pruebas locales de lógica, no sustituyen las pruebas end-to-end.`);
process.exitCode = failed ? 1 : 0;
