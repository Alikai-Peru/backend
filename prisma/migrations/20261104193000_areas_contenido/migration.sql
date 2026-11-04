-- Texto de partida de las seis áreas. No reemplaza un lema que el panel ya guardó.

INSERT INTO "Area" ("id", "slug", "nombre", "nombreCorto", "lema", "resumen", "descripcion", "icono", "tema", "indicadorValor", "indicadorEtiqueta", "orden", "activa", "creadoEn", "actualizadoEn")
SELECT 'area-tecnologia', 'tecnologia', 'Tecnología', 'Tecnología', 'Conectividad que abre puertas', 'Llevamos internet, equipos y alfabetización digital a escuelas y comunidades donde la señal todavía no llega.', 'La distancia no debería decidir quién estudia, quién se atiende o quién vende lo que produce. En muchos pueblos la señal es intermitente y los equipos, cuando existen, no tienen quién los mantenga.

Trabajamos con la escuela, la municipalidad y las familias para instalar una conexión útil, formar a quien la va a cuidar y enseñar a usarla en clase, en la posta y en el negocio local.', 'Wifi', 'marino', 'Digital', 'inclusión en territorio', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Area" WHERE "slug" = 'tecnologia');

UPDATE "Area" SET
  "nombre" = 'Tecnología',
  "nombreCorto" = 'Tecnología',
  "lema" = 'Conectividad que abre puertas',
  "resumen" = 'Llevamos internet, equipos y alfabetización digital a escuelas y comunidades donde la señal todavía no llega.',
  "descripcion" = 'La distancia no debería decidir quién estudia, quién se atiende o quién vende lo que produce. En muchos pueblos la señal es intermitente y los equipos, cuando existen, no tienen quién los mantenga.

Trabajamos con la escuela, la municipalidad y las familias para instalar una conexión útil, formar a quien la va a cuidar y enseñar a usarla en clase, en la posta y en el negocio local.',
  "icono" = 'Wifi',
  "tema" = 'marino',
  "indicadorValor" = 'Digital',
  "indicadorEtiqueta" = 'inclusión en territorio',
  "orden" = 0,
  "actualizadoEn" = CURRENT_TIMESTAMP
WHERE "slug" = 'tecnologia' AND "lema" = '';
INSERT INTO "ObjetivoArea" ("id", "texto", "orden", "areaId")
SELECT 'obj-tecnologia-0', 'Conectar escuelas y locales comunales con un servicio que la comunidad pueda sostener.', 0, "id" FROM "Area"
WHERE "slug" = 'tecnologia' AND "lema" = 'Conectividad que abre puertas'
  AND NOT EXISTS (SELECT 1 FROM "ObjetivoArea" WHERE "id" = 'obj-tecnologia-0');
INSERT INTO "ObjetivoArea" ("id", "texto", "orden", "areaId")
SELECT 'obj-tecnologia-1', 'Formar promotores locales para el mantenimiento de equipos y redes.', 1, "id" FROM "Area"
WHERE "slug" = 'tecnologia' AND "lema" = 'Conectividad que abre puertas'
  AND NOT EXISTS (SELECT 1 FROM "ObjetivoArea" WHERE "id" = 'obj-tecnologia-1');
INSERT INTO "ObjetivoArea" ("id", "texto", "orden", "areaId")
SELECT 'obj-tecnologia-2', 'Enseñar un uso práctico de la tecnología en el aula, la salud y el trabajo.', 2, "id" FROM "Area"
WHERE "slug" = 'tecnologia' AND "lema" = 'Conectividad que abre puertas'
  AND NOT EXISTS (SELECT 1 FROM "ObjetivoArea" WHERE "id" = 'obj-tecnologia-2');
INSERT INTO "ProgramaArea" ("id", "titulo", "descripcion", "orden", "areaId")
SELECT 'prog-tecnologia-0', 'Aula conectada', 'Internet, computadoras y acompañamiento docente para que la escuela use la red en clase.', 0, "id" FROM "Area"
WHERE "slug" = 'tecnologia' AND "lema" = 'Conectividad que abre puertas'
  AND NOT EXISTS (SELECT 1 FROM "ProgramaArea" WHERE "id" = 'prog-tecnologia-0');
INSERT INTO "ProgramaArea" ("id", "titulo", "descripcion", "orden", "areaId")
SELECT 'prog-tecnologia-1', 'Promotores digitales', 'Jóvenes de la comunidad aprenden a instalar, cuidar y explicar los equipos.', 1, "id" FROM "Area"
WHERE "slug" = 'tecnologia' AND "lema" = 'Conectividad que abre puertas'
  AND NOT EXISTS (SELECT 1 FROM "ProgramaArea" WHERE "id" = 'prog-tecnologia-1');
INSERT INTO "ProgramaArea" ("id", "titulo", "descripcion", "orden", "areaId")
SELECT 'prog-tecnologia-2', 'Oficios en línea', 'Talleres cortos para vender, estudiar y hacer trámites sin salir del pueblo.', 2, "id" FROM "Area"
WHERE "slug" = 'tecnologia' AND "lema" = 'Conectividad que abre puertas'
  AND NOT EXISTS (SELECT 1 FROM "ProgramaArea" WHERE "id" = 'prog-tecnologia-2');

INSERT INTO "Area" ("id", "slug", "nombre", "nombreCorto", "lema", "resumen", "descripcion", "icono", "tema", "indicadorValor", "indicadorEtiqueta", "orden", "activa", "creadoEn", "actualizadoEn")
SELECT 'area-salud', 'salud', 'Salud', 'Salud', 'Atención donde no llega la posta', 'Acompañamos prevención, brigadas y hábitos saludables junto a los establecimientos de salud de la comunidad.', 'En varias zonas el camino a la posta es largo y la campaña de prevención llega tarde. La familia reconoce el malestar cuando ya es una urgencia.

Nos sumamos al personal de salud local: campañas de anemia y control de niño sano, orientación a las madres y una red de promotores que avisa a tiempo.', 'HeartPulse', 'selva', 'Prevención', 'cerca de la familia', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Area" WHERE "slug" = 'salud');

UPDATE "Area" SET
  "nombre" = 'Salud',
  "nombreCorto" = 'Salud',
  "lema" = 'Atención donde no llega la posta',
  "resumen" = 'Acompañamos prevención, brigadas y hábitos saludables junto a los establecimientos de salud de la comunidad.',
  "descripcion" = 'En varias zonas el camino a la posta es largo y la campaña de prevención llega tarde. La familia reconoce el malestar cuando ya es una urgencia.

Nos sumamos al personal de salud local: campañas de anemia y control de niño sano, orientación a las madres y una red de promotores que avisa a tiempo.',
  "icono" = 'HeartPulse',
  "tema" = 'selva',
  "indicadorValor" = 'Prevención',
  "indicadorEtiqueta" = 'cerca de la familia',
  "orden" = 1,
  "actualizadoEn" = CURRENT_TIMESTAMP
WHERE "slug" = 'salud' AND "lema" = '';
INSERT INTO "ObjetivoArea" ("id", "texto", "orden", "areaId")
SELECT 'obj-salud-0', 'Acercar controles básicos y campañas de prevención a la comunidad.', 0, "id" FROM "Area"
WHERE "slug" = 'salud' AND "lema" = 'Atención donde no llega la posta'
  AND NOT EXISTS (SELECT 1 FROM "ObjetivoArea" WHERE "id" = 'obj-salud-0');
INSERT INTO "ObjetivoArea" ("id", "texto", "orden", "areaId")
SELECT 'obj-salud-1', 'Formar promotores de salud que articulen con la posta.', 1, "id" FROM "Area"
WHERE "slug" = 'salud' AND "lema" = 'Atención donde no llega la posta'
  AND NOT EXISTS (SELECT 1 FROM "ObjetivoArea" WHERE "id" = 'obj-salud-1');
INSERT INTO "ObjetivoArea" ("id", "texto", "orden", "areaId")
SELECT 'obj-salud-2', 'Reforzar hábitos de alimentación, higiene y cuidado del agua.', 2, "id" FROM "Area"
WHERE "slug" = 'salud' AND "lema" = 'Atención donde no llega la posta'
  AND NOT EXISTS (SELECT 1 FROM "ObjetivoArea" WHERE "id" = 'obj-salud-2');
INSERT INTO "ProgramaArea" ("id", "titulo", "descripcion", "orden", "areaId")
SELECT 'prog-salud-0', 'Brigadas comunitarias', 'Jornadas de despistaje y orientación con el establecimiento de salud del distrito.', 0, "id" FROM "Area"
WHERE "slug" = 'salud' AND "lema" = 'Atención donde no llega la posta'
  AND NOT EXISTS (SELECT 1 FROM "ProgramaArea" WHERE "id" = 'prog-salud-0');
INSERT INTO "ProgramaArea" ("id", "titulo", "descripcion", "orden", "areaId")
SELECT 'prog-salud-1', 'Cero anemia', 'Seguimiento a niñas y niños, con consejería a las familias y a la escuela.', 1, "id" FROM "Area"
WHERE "slug" = 'salud' AND "lema" = 'Atención donde no llega la posta'
  AND NOT EXISTS (SELECT 1 FROM "ProgramaArea" WHERE "id" = 'prog-salud-1');
INSERT INTO "ProgramaArea" ("id", "titulo", "descripcion", "orden", "areaId")
SELECT 'prog-salud-2', 'Promotores de salud', 'Vecinos capacitados para detectar señales de alarma y derivar a tiempo.', 2, "id" FROM "Area"
WHERE "slug" = 'salud' AND "lema" = 'Atención donde no llega la posta'
  AND NOT EXISTS (SELECT 1 FROM "ProgramaArea" WHERE "id" = 'prog-salud-2');

INSERT INTO "Area" ("id", "slug", "nombre", "nombreCorto", "lema", "resumen", "descripcion", "icono", "tema", "indicadorValor", "indicadorEtiqueta", "orden", "activa", "creadoEn", "actualizadoEn")
SELECT 'area-educacion', 'educacion', 'Educación', 'Educación', 'Aprender sin importar dónde naciste', 'Refuerzo escolar, lectura y formación docente para que la escuela rural no se quede atrás.', 'Una escuela con pocos docentes atiende varios grados a la vez. El refuerzo, cuando existe, depende de que alguien de fuera pueda llegar.

Acompañamos el aula con materiales, horas de refuerzo y formación para el docente, de modo que el avance se note en lectura, matemáticas y asistencia.', 'BookOpen', 'marino', 'Aula', 'refuerzo y lectura', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Area" WHERE "slug" = 'educacion');

UPDATE "Area" SET
  "nombre" = 'Educación',
  "nombreCorto" = 'Educación',
  "lema" = 'Aprender sin importar dónde naciste',
  "resumen" = 'Refuerzo escolar, lectura y formación docente para que la escuela rural no se quede atrás.',
  "descripcion" = 'Una escuela con pocos docentes atiende varios grados a la vez. El refuerzo, cuando existe, depende de que alguien de fuera pueda llegar.

Acompañamos el aula con materiales, horas de refuerzo y formación para el docente, de modo que el avance se note en lectura, matemáticas y asistencia.',
  "icono" = 'BookOpen',
  "tema" = 'marino',
  "indicadorValor" = 'Aula',
  "indicadorEtiqueta" = 'refuerzo y lectura',
  "orden" = 2,
  "actualizadoEn" = CURRENT_TIMESTAMP
WHERE "slug" = 'educacion' AND "lema" = '';
INSERT INTO "ObjetivoArea" ("id", "texto", "orden", "areaId")
SELECT 'obj-educacion-0', 'Mejorar lectura y matemáticas en primaria con refuerzo constante.', 0, "id" FROM "Area"
WHERE "slug" = 'educacion' AND "lema" = 'Aprender sin importar dónde naciste'
  AND NOT EXISTS (SELECT 1 FROM "ObjetivoArea" WHERE "id" = 'obj-educacion-0');
INSERT INTO "ObjetivoArea" ("id", "texto", "orden", "areaId")
SELECT 'obj-educacion-1', 'Acompañar al docente rural con materiales y formación breve.', 1, "id" FROM "Area"
WHERE "slug" = 'educacion' AND "lema" = 'Aprender sin importar dónde naciste'
  AND NOT EXISTS (SELECT 1 FROM "ObjetivoArea" WHERE "id" = 'obj-educacion-1');
INSERT INTO "ObjetivoArea" ("id", "texto", "orden", "areaId")
SELECT 'obj-educacion-2', 'Involucrar a las familias en la asistencia y en el hábito de leer.', 2, "id" FROM "Area"
WHERE "slug" = 'educacion' AND "lema" = 'Aprender sin importar dónde naciste'
  AND NOT EXISTS (SELECT 1 FROM "ObjetivoArea" WHERE "id" = 'obj-educacion-2');
INSERT INTO "ProgramaArea" ("id", "titulo", "descripcion", "orden", "areaId")
SELECT 'prog-educacion-0', 'Refuerzo escolar', 'Horas extra de lectura y matemáticas, dentro de la escuela y con la misma comunidad.', 0, "id" FROM "Area"
WHERE "slug" = 'educacion' AND "lema" = 'Aprender sin importar dónde naciste'
  AND NOT EXISTS (SELECT 1 FROM "ProgramaArea" WHERE "id" = 'prog-educacion-0');
INSERT INTO "ProgramaArea" ("id", "titulo", "descripcion", "orden", "areaId")
SELECT 'prog-educacion-1', 'Docente acompañado', 'Encuentros cortos para planificar clases multigrado y compartir materiales.', 1, "id" FROM "Area"
WHERE "slug" = 'educacion' AND "lema" = 'Aprender sin importar dónde naciste'
  AND NOT EXISTS (SELECT 1 FROM "ProgramaArea" WHERE "id" = 'prog-educacion-1');
INSERT INTO "ProgramaArea" ("id", "titulo", "descripcion", "orden", "areaId")
SELECT 'prog-educacion-2', 'Biblioteca viva', 'Libros, lectura en voz alta y un rincón de consulta que la escuela administra.', 2, "id" FROM "Area"
WHERE "slug" = 'educacion' AND "lema" = 'Aprender sin importar dónde naciste'
  AND NOT EXISTS (SELECT 1 FROM "ProgramaArea" WHERE "id" = 'prog-educacion-2');

INSERT INTO "Area" ("id", "slug", "nombre", "nombreCorto", "lema", "resumen", "descripcion", "icono", "tema", "indicadorValor", "indicadorEtiqueta", "orden", "activa", "creadoEn", "actualizadoEn")
SELECT 'area-agricultura-sostenible', 'agricultura-sostenible', 'Agricultura Sostenible', 'Agricultura', 'Tierra que alimenta y genera ingresos', 'Huertos, riego y buenas prácticas para que la parcela familiar rinda sin agotar el suelo ni el agua.', 'La chacra familiar alimenta la casa y, cuando sobra, es el único ingreso. El riego inseguro y el suelo cansado reducen esa cosecha año a año.

Trabajamos técnicas simples: huertos escolares y familiares, cuidado del agua y organización para vender mejor lo que ya se produce.', 'Sprout', 'selva', 'Chacra', 'alimento e ingreso', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Area" WHERE "slug" = 'agricultura-sostenible');

UPDATE "Area" SET
  "nombre" = 'Agricultura Sostenible',
  "nombreCorto" = 'Agricultura',
  "lema" = 'Tierra que alimenta y genera ingresos',
  "resumen" = 'Huertos, riego y buenas prácticas para que la parcela familiar rinda sin agotar el suelo ni el agua.',
  "descripcion" = 'La chacra familiar alimenta la casa y, cuando sobra, es el único ingreso. El riego inseguro y el suelo cansado reducen esa cosecha año a año.

Trabajamos técnicas simples: huertos escolares y familiares, cuidado del agua y organización para vender mejor lo que ya se produce.',
  "icono" = 'Sprout',
  "tema" = 'selva',
  "indicadorValor" = 'Chacra',
  "indicadorEtiqueta" = 'alimento e ingreso',
  "orden" = 3,
  "actualizadoEn" = CURRENT_TIMESTAMP
WHERE "slug" = 'agricultura-sostenible' AND "lema" = '';
INSERT INTO "ObjetivoArea" ("id", "texto", "orden", "areaId")
SELECT 'obj-agricultura-sostenible-0', 'Mejorar la producción familiar sin depender de insumos caros.', 0, "id" FROM "Area"
WHERE "slug" = 'agricultura-sostenible' AND "lema" = 'Tierra que alimenta y genera ingresos'
  AND NOT EXISTS (SELECT 1 FROM "ObjetivoArea" WHERE "id" = 'obj-agricultura-sostenible-0');
INSERT INTO "ObjetivoArea" ("id", "texto", "orden", "areaId")
SELECT 'obj-agricultura-sostenible-1', 'Cuidar el suelo y el agua con prácticas que la comunidad pueda repetir.', 1, "id" FROM "Area"
WHERE "slug" = 'agricultura-sostenible' AND "lema" = 'Tierra que alimenta y genera ingresos'
  AND NOT EXISTS (SELECT 1 FROM "ObjetivoArea" WHERE "id" = 'obj-agricultura-sostenible-1');
INSERT INTO "ObjetivoArea" ("id", "texto", "orden", "areaId")
SELECT 'obj-agricultura-sostenible-2', 'Acercar la cosecha a la olla escolar y al mercado local.', 2, "id" FROM "Area"
WHERE "slug" = 'agricultura-sostenible' AND "lema" = 'Tierra que alimenta y genera ingresos'
  AND NOT EXISTS (SELECT 1 FROM "ObjetivoArea" WHERE "id" = 'obj-agricultura-sostenible-2');
INSERT INTO "ProgramaArea" ("id", "titulo", "descripcion", "orden", "areaId")
SELECT 'prog-agricultura-sostenible-0', 'Huertos familiares', 'Parcelas de hortalizas para la olla diaria y para la venta del excedente.', 0, "id" FROM "Area"
WHERE "slug" = 'agricultura-sostenible' AND "lema" = 'Tierra que alimenta y genera ingresos'
  AND NOT EXISTS (SELECT 1 FROM "ProgramaArea" WHERE "id" = 'prog-agricultura-sostenible-0');
INSERT INTO "ProgramaArea" ("id", "titulo", "descripcion", "orden", "areaId")
SELECT 'prog-agricultura-sostenible-1', 'Agua que rinde', 'Riego sencillo y cuidado de la fuente, acordado con la comunidad.', 1, "id" FROM "Area"
WHERE "slug" = 'agricultura-sostenible' AND "lema" = 'Tierra que alimenta y genera ingresos'
  AND NOT EXISTS (SELECT 1 FROM "ProgramaArea" WHERE "id" = 'prog-agricultura-sostenible-1');
INSERT INTO "ProgramaArea" ("id", "titulo", "descripcion", "orden", "areaId")
SELECT 'prog-agricultura-sostenible-2', 'Biohuertos escolares', 'El huerto de la escuela alimenta el refrigerio y enseña a cultivar.', 2, "id" FROM "Area"
WHERE "slug" = 'agricultura-sostenible' AND "lema" = 'Tierra que alimenta y genera ingresos'
  AND NOT EXISTS (SELECT 1 FROM "ProgramaArea" WHERE "id" = 'prog-agricultura-sostenible-2');

INSERT INTO "Area" ("id", "slug", "nombre", "nombreCorto", "lema", "resumen", "descripcion", "icono", "tema", "indicadorValor", "indicadorEtiqueta", "orden", "activa", "creadoEn", "actualizadoEn")
SELECT 'area-ayuda-social', 'ayuda-social', 'Ayuda Social', 'Ayuda Social', 'Respuesta rápida cuando más urge', 'Abrigo, alimentos y apoyo inmediato para familias afectadas por el frío, la lluvia o una emergencia.', 'El friaje, el huayco o una enfermedad inesperada dejan a una familia sin abrigo, sin despensa y sin a quién llamar esa semana.

Organizamos ayuda concreta y de corto plazo, coordinada con la autoridad local, y la usamos para detectar qué programa permanente hace falta después.', 'HandHeart', 'marino', 'Urgente', 'apoyo a la familia', 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Area" WHERE "slug" = 'ayuda-social');

UPDATE "Area" SET
  "nombre" = 'Ayuda Social',
  "nombreCorto" = 'Ayuda Social',
  "lema" = 'Respuesta rápida cuando más urge',
  "resumen" = 'Abrigo, alimentos y apoyo inmediato para familias afectadas por el frío, la lluvia o una emergencia.',
  "descripcion" = 'El friaje, el huayco o una enfermedad inesperada dejan a una familia sin abrigo, sin despensa y sin a quién llamar esa semana.

Organizamos ayuda concreta y de corto plazo, coordinada con la autoridad local, y la usamos para detectar qué programa permanente hace falta después.',
  "icono" = 'HandHeart',
  "tema" = 'marino',
  "indicadorValor" = 'Urgente',
  "indicadorEtiqueta" = 'apoyo a la familia',
  "orden" = 4,
  "actualizadoEn" = CURRENT_TIMESTAMP
WHERE "slug" = 'ayuda-social' AND "lema" = '';
INSERT INTO "ObjetivoArea" ("id", "texto", "orden", "areaId")
SELECT 'obj-ayuda-social-0', 'Entregar abrigo, alimentos y útiles a familias en emergencia.', 0, "id" FROM "Area"
WHERE "slug" = 'ayuda-social' AND "lema" = 'Respuesta rápida cuando más urge'
  AND NOT EXISTS (SELECT 1 FROM "ObjetivoArea" WHERE "id" = 'obj-ayuda-social-0');
INSERT INTO "ObjetivoArea" ("id", "texto", "orden", "areaId")
SELECT 'obj-ayuda-social-1', 'Coordinar la entrega con la municipalidad y los líderes comunales.', 1, "id" FROM "Area"
WHERE "slug" = 'ayuda-social' AND "lema" = 'Respuesta rápida cuando más urge'
  AND NOT EXISTS (SELECT 1 FROM "ObjetivoArea" WHERE "id" = 'obj-ayuda-social-1');
INSERT INTO "ObjetivoArea" ("id", "texto", "orden", "areaId")
SELECT 'obj-ayuda-social-2', 'Pasar de la ayuda puntual a un programa que se sostenga.', 2, "id" FROM "Area"
WHERE "slug" = 'ayuda-social' AND "lema" = 'Respuesta rápida cuando más urge'
  AND NOT EXISTS (SELECT 1 FROM "ObjetivoArea" WHERE "id" = 'obj-ayuda-social-2');
INSERT INTO "ProgramaArea" ("id", "titulo", "descripcion", "orden", "areaId")
SELECT 'prog-ayuda-social-0', 'Abrigo andino', 'Frazadas, ropa de cama y abrigo para las noches de helada.', 0, "id" FROM "Area"
WHERE "slug" = 'ayuda-social' AND "lema" = 'Respuesta rápida cuando más urge'
  AND NOT EXISTS (SELECT 1 FROM "ProgramaArea" WHERE "id" = 'prog-ayuda-social-0');
INSERT INTO "ProgramaArea" ("id", "titulo", "descripcion", "orden", "areaId")
SELECT 'prog-ayuda-social-1', 'Olla de emergencia', 'Alimentos básicos para los días en que la familia no puede abastecerse.', 1, "id" FROM "Area"
WHERE "slug" = 'ayuda-social' AND "lema" = 'Respuesta rápida cuando más urge'
  AND NOT EXISTS (SELECT 1 FROM "ProgramaArea" WHERE "id" = 'prog-ayuda-social-1');
INSERT INTO "ProgramaArea" ("id", "titulo", "descripcion", "orden", "areaId")
SELECT 'prog-ayuda-social-2', 'Mochila escolar', 'Útiles y uniformes para que una emergencia no corte el año escolar.', 2, "id" FROM "Area"
WHERE "slug" = 'ayuda-social' AND "lema" = 'Respuesta rápida cuando más urge'
  AND NOT EXISTS (SELECT 1 FROM "ProgramaArea" WHERE "id" = 'prog-ayuda-social-2');

INSERT INTO "Area" ("id", "slug", "nombre", "nombreCorto", "lema", "resumen", "descripcion", "icono", "tema", "indicadorValor", "indicadorEtiqueta", "orden", "activa", "creadoEn", "actualizadoEn")
SELECT 'area-cultura', 'cultura', 'Cultura', 'Cultura', 'Identidad que no se pierde', 'Lengua, oficio y memoria local para que las niñas y los niños hereden lo que la comunidad sabe hacer.', 'Cuando la escuela solo enseña en castellano y el oficio de los abuelos no tiene relevo, el pueblo guarda la fiesta pero pierde la práctica.

Acompañamos talleres de lengua, música, cerámica y relato oral, con maestros de la propia comunidad y un registro sencillo de lo que no quieren que se olvide.', 'Theater', 'dorado', 'Memoria', 'oficio y lengua', 5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Area" WHERE "slug" = 'cultura');

UPDATE "Area" SET
  "nombre" = 'Cultura',
  "nombreCorto" = 'Cultura',
  "lema" = 'Identidad que no se pierde',
  "resumen" = 'Lengua, oficio y memoria local para que las niñas y los niños hereden lo que la comunidad sabe hacer.',
  "descripcion" = 'Cuando la escuela solo enseña en castellano y el oficio de los abuelos no tiene relevo, el pueblo guarda la fiesta pero pierde la práctica.

Acompañamos talleres de lengua, música, cerámica y relato oral, con maestros de la propia comunidad y un registro sencillo de lo que no quieren que se olvide.',
  "icono" = 'Theater',
  "tema" = 'dorado',
  "indicadorValor" = 'Memoria',
  "indicadorEtiqueta" = 'oficio y lengua',
  "orden" = 5,
  "actualizadoEn" = CURRENT_TIMESTAMP
WHERE "slug" = 'cultura' AND "lema" = '';
INSERT INTO "ObjetivoArea" ("id", "texto", "orden", "areaId")
SELECT 'obj-cultura-0', 'Dar un lugar a la lengua y al relato local dentro de la escuela.', 0, "id" FROM "Area"
WHERE "slug" = 'cultura' AND "lema" = 'Identidad que no se pierde'
  AND NOT EXISTS (SELECT 1 FROM "ObjetivoArea" WHERE "id" = 'obj-cultura-0');
INSERT INTO "ObjetivoArea" ("id", "texto", "orden", "areaId")
SELECT 'obj-cultura-1', 'Transmitir oficios de la comunidad a las nuevas generaciones.', 1, "id" FROM "Area"
WHERE "slug" = 'cultura' AND "lema" = 'Identidad que no se pierde'
  AND NOT EXISTS (SELECT 1 FROM "ObjetivoArea" WHERE "id" = 'obj-cultura-1');
INSERT INTO "ObjetivoArea" ("id", "texto", "orden", "areaId")
SELECT 'obj-cultura-2', 'Registrar fiestas, cantos y saberes con el permiso de quien los guarda.', 2, "id" FROM "Area"
WHERE "slug" = 'cultura' AND "lema" = 'Identidad que no se pierde'
  AND NOT EXISTS (SELECT 1 FROM "ObjetivoArea" WHERE "id" = 'obj-cultura-2');
INSERT INTO "ProgramaArea" ("id", "titulo", "descripcion", "orden", "areaId")
SELECT 'prog-cultura-0', 'Taller de oficio', 'Cerámica, tejido o el saber local, enseñado por maestras y maestros del pueblo.', 0, "id" FROM "Area"
WHERE "slug" = 'cultura' AND "lema" = 'Identidad que no se pierde'
  AND NOT EXISTS (SELECT 1 FROM "ProgramaArea" WHERE "id" = 'prog-cultura-0');
INSERT INTO "ProgramaArea" ("id", "titulo", "descripcion", "orden", "areaId")
SELECT 'prog-cultura-1', 'Lengua en el aula', 'Horas de quechua u otra lengua originaria junto a la clase regular.', 1, "id" FROM "Area"
WHERE "slug" = 'cultura' AND "lema" = 'Identidad que no se pierde'
  AND NOT EXISTS (SELECT 1 FROM "ProgramaArea" WHERE "id" = 'prog-cultura-1');
INSERT INTO "ProgramaArea" ("id", "titulo", "descripcion", "orden", "areaId")
SELECT 'prog-cultura-2', 'Memoria viva', 'Relatos, cantos y fotos reunidos con las familias para la escuela y el local comunal.', 2, "id" FROM "Area"
WHERE "slug" = 'cultura' AND "lema" = 'Identidad que no se pierde'
  AND NOT EXISTS (SELECT 1 FROM "ProgramaArea" WHERE "id" = 'prog-cultura-2');
