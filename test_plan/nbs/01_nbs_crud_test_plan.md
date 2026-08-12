# Plan de Pruebas - NbS CRUD

## Información General

**Módulo**: WaterProof NbS CA - CRUD de Soluciones basadas en la Naturaleza
**Componente**: Gestión completa de NbS
**Archivo de referencia**: `geonode/waterproof_nbs_ca/views.py`, `models.py`
**URLs**: Definidas en `geonode/waterproof_nbs_ca/urls.py`

## Descripción del Componente

El componente NbS gestiona soluciones basadas en la naturaleza con las siguientes características:
- Creación con parámetros hidrológicos para FastFlood
- Operaciones CRUD completas
- Asociación con países y monedas
- Transformaciones RIOS
- Áreas geográficas restringidas
- Control de acceso basado en roles

## Modelos Involucrados

### WaterproofNbsCa (NbS Principal)
```python
- name: CharField (max 100, unique)
- slug: CharField (max 100, unique, auto-generado)
- description: CharField (max 2048)
- country: ForeignKey a Countries
- currency: ForeignKey a Countries
- max_benefit_req_time: Decimal(14,3)
- profit_pct_time_inter_assoc: Decimal(10,2)
- unit_implementation_cost: Decimal(14,2)
- unit_maintenance_cost: Decimal(14,2)
- periodicity_maitenance: Integer
- unit_oportunity_cost: Decimal(14,2)
- rios_transformations: ManyToMany a RiosTransformation
- activity_shapefile: ForeignKey a ActivityShapefile (nullable)
- added_by: ForeignKey a Profile (nullable)
```

### WaterproofPrLulc (Parámetros FastFlood)⚡
```python
- nbsid: ForeignKey a WaterproofNbsCa
- lucode: ForeignKey a WaterproofPrLulcParameters
- manning: Decimal(5,3)  # CRÍTICO para FastFlood
- infiltration: Decimal(5,2)  # CRÍTICO para FastFlood
```

## URLs a Probar

| URL | Método | Vista | Descripción |
|-----|--------|-------|-------------|
| `/create/` | GET/POST | `createNbs` | Crear NbS |
| `/` | GET | `listNbs` | Lista de NbS |
| `/view/<int:idx>` | GET | `viewNbs` | Ver detalles |
| `/edit/<int:idx>` | GET/POST | `editNbs` | Editar NbS |
| `/clone/<int:idx>` | GET/POST | `cloneNbs` | Clonar NbS |
| `/delete/<int:idx>` | POST | `deleteNbs` | Eliminar NbS |

## Casos de Prueba

### CP-NBS-001: Listar NbS

#### Descripción
Verificar que la lista de NbS se muestre correctamente según los permisos del usuario.

#### Pre-condiciones
- Existen NbS en la base de datos
- Usuario autenticado con diferentes roles

#### Datos de Prueba

| Usuario | Rol | NbS Esperados |
|---------|-----|---------------|
| admin_user | ADMIN | Todos los NbS (globales + específicos) |
| analyst_user | ANALYS | NbS de admin + propios |
| copart_user | COPART | Todos los NbS |
| public_user | No autenticado | Todos los NbS |

#### Pasos
1. Autenticar usuario según el caso
2. Navegar a `/nbs/` (list-nbs)
3. Verificar NbS mostrados

#### Resultado Esperado

**Admin:**
- Ve todos los NbS del sistema
- Opciones de editar/eliminar todos

**Analista:**
- Ve NbS de ADMIN (globales)
- Ve solo sus NbS específicos de país
- Solo puede editar/eliminar los propios

**Público/Otros:**
- Ve todos los NbS
- Sin opciones de edición

#### Criterios de Aceptación
- [ ] La lista se carga sin errores
- [ ] Se aplican correctamente los filtros de permisos
- [ ] Se muestra información: nombre, país, costos, moneda
- [ ] Vista: `views.listNbs()` línea 191
- [ ] Template: `waterproofnbsca_list.html`

---

### CP-NBS-002: Crear NbS - Campos Básicos

#### Descripción
Verificar la creación de un NbS con campos básicos sin parámetros FastFlood.

#### Pre-condiciones
- Usuario autenticado
- Países y monedas disponibles en base de datos

#### Datos de Entrada

| Campo | Valor Válido | Validación |
|-------|-------------|------------|
| nameNBS | "Reforestation Project A" | Único, max 100 |
| descNBS | "Reforestation in watershed area" | Requerido, max 2048 |
| countryNBS | "USA" | ISO3 válido |
| currencyCost | "USD" | ISO3 válido |
| maxBenefitTime | 15.500 | >= 0 |
| benefitTimePorc | 75.50 | >= 0 |
| maintenancePeriod | 2 | >= 0 (años) |
| implementCost | 1500.00 | >= 0 (US$/ha) |
| maintenanceCost | 50.00 | >= 0 (US$/ha) |
| oportunityCost | 200.00 | >= 0 (US$/ha) |

#### Pasos
1. Autenticar usuario
2. Navegar a `/nbs/create/`
3. Completar formulario con datos básicos
4. NO seleccionar transformaciones RIOS
5. NO agregar parámetros FastFlood
6. Enviar POST con `action=create-nbs`

#### Resultado Esperado - Éxito
```json
{
    "status": "200",
    "message": "Success"
}
```

#### Verificaciones

**Base de Datos:**
```sql
SELECT * FROM waterproof_nbs_ca_waterproofnbsca
WHERE name = 'Reforestation Project A';
-- Verificar:
-- - slug generado automáticamente
-- - added_by = usuario actual
-- - country_id correcto
-- - currency_id correcto
-- - todos los costos guardados

-- NO debe haber registros en tabla de parámetros FastFlood
SELECT COUNT(*) FROM waterproof_nbs_ca_waterproof_pr_lulc
WHERE nbsid = <nbs_id>;
-- count = 0 (sin parámetros FastFlood)
```

#### Criterios de Aceptación
- [ ] NbS creado en BD
- [ ] Slug generado automáticamente desde nombre
- [ ] `added_by` asignado al usuario actual
- [ ] Validación de nombre único
- [ ] Valores decimales parseados correctamente (coma → punto)
- [ ] Vista: `views.createNbs()` línea 27
- [ ] Template: `waterproofnbsca_form.html`

---

### CP-NBS-003: Crear NbS - Con Parámetros FastFlood ⚡ CRÍTICO

#### Descripción
Verificar la creación de NbS con parámetros Manning e Infiltration para FastFlood.

#### Pre-condiciones
- NbS con campos básicos
- Códigos LULC disponibles en tabla WaterproofPrLulcParameters

#### Datos de Entrada FastFlood

```javascript
// Arrays paralelos
lulCodes: "10,20,80"  // Forest, Shrubs, Water
manningValues: "0.500,0.400,0.035"
infiltrationValues: "0.85,0.70,0.05"
```

| LULC Code | LULC Name | Manning | Infiltration | Válido |
|-----------|-----------|---------|--------------|--------|
| 10 | Forest | 0.500 | 0.85 | ✓ |
| 20 | Shrubs | 0.400 | 0.70 | ✓ |
| 80 | Water | 0.035 | 0.05 | ✓ |

#### Pasos
1. Completar formulario básico (CP-NBS-002)
2. Agregar códigos LULC en interfaz
3. Para cada LULC, ingresar Manning e Infiltration
4. Arrays se concatenan como CSV en POST
5. Enviar formulario

#### Resultado Esperado
- NbS creado
- Registros creados en `WaterproofPrLulc` (uno por LULC)

#### Verificaciones

**Base de Datos:**
```sql
-- Verificar NbS creado
SELECT id FROM waterproof_nbs_ca_waterproofnbsca
WHERE name = 'Reforestation Project A';

-- Verificar parámetros FastFlood
SELECT
    lulc.lucode,
    lulc.lulc_desc,
    pr.manning,
    pr.infiltration
FROM waterproof_nbs_ca_waterproof_pr_lulc pr
JOIN waterproof_pr_lulc_parameters lulc ON pr.lucode_id = lulc.lucode
WHERE pr.nbsid_id = <nbs_id>
ORDER BY lulc.lucode;

-- Resultado esperado:
-- lucode | lulc_desc | manning | infiltration
-- 10     | Forest    | 0.500   | 0.85
-- 20     | Shrubs    | 0.400   | 0.70
-- 80     | Water     | 0.035   | 0.05
```

#### Criterios de Aceptación
- [ ] Un registro por cada LULC en `WaterproofPrLulc`
- [ ] Manning y Infiltration correctos para cada LULC
- [ ] Relación nbsid correcta
- [ ] Relación lucode correcta
- [ ] Valores decimales con 3 decimales (Manning) y 2 (Infiltration)
- [ ] Vista: `views.createNbs()` líneas 123-138
- [ ] **CRÍTICO**: Estos valores se usan en `api.getNbsJson()` de FastFlood

---

### CP-NBS-004: Crear NbS - Con Transformaciones RIOS

#### Descripción
Verificar la creación de NbS con transformaciones RIOS asociadas.

#### Pre-condiciones
- Transformaciones RIOS disponibles en BD
- Jerarquía: Transition → Activity → Transformation

#### Datos de Entrada

```javascript
// IDs de transformaciones seleccionadas (CSV)
riosTransformation: "1,3,5"
```

#### Pasos
1. Completar formulario básico
2. Seleccionar Transition en cascada
3. Seleccionar Activity (carga dinámica por Transition)
4. Seleccionar Transformations (carga dinámica por Activity)
5. Transformations concatenadas como CSV
6. Enviar formulario

#### Resultado Esperado
- NbS creado
- Relaciones ManyToMany en tabla intermedia

#### Verificaciones

**Base de Datos:**
```sql
-- Verificar relaciones ManyToMany
SELECT
    tr.id,
    tr.name,
    act.name as activity_name,
    trans.name as transition_name
FROM waterproof_nbs_ca_waterproofnbsca_rios_transformations nbs_trans
JOIN waterproof_nbs_ca_riostransformation tr ON nbs_trans.riostransformation_id = tr.id
JOIN waterproof_nbs_ca_riosactivity act ON tr.activity_id = act.id
JOIN waterproof_nbs_ca_riostransition trans ON act.transition_id = trans.id
WHERE nbs_trans.waterproofnbsca_id = <nbs_id>;

-- Debe retornar 3 registros (transformations 1, 3, 5)
```

#### Criterios de Aceptación
- [ ] Transformaciones asociadas correctamente
- [ ] Relación ManyToMany funcional
- [ ] Vista: `views.createNbs()` líneas 118-121

---

### CP-NBS-005: Crear NbS - Con Área Geográfica (GeoJSON)

#### Descripción
Verificar la creación de NbS con área geográfica restringida en formato GeoJSON.

#### Pre-condiciones
- Archivo GeoJSON válido

#### Datos de Entrada

**GeoJSON (restrictedArea):**
```json
{
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [-118.5, 34.0],
                [-118.0, 34.0],
                [-118.0, 33.5],
                [-118.5, 33.5],
                [-118.5, 34.0]
            ]]
        },
        "properties": {
            "activity_n": "Reforestation",
            "action": "Plant"
        }
    }]
}
```

**Parámetros:**
```
extension: "geojson"
```

#### Pasos
1. Completar formulario básico
2. Cargar archivo GeoJSON
3. Sistema parsea y valida geometría
4. Enviar formulario

#### Resultado Esperado
- ActivityShapefile creado con geometría
- NbS asociado al shapefile

#### Verificaciones

**Base de Datos:**
```sql
-- Verificar ActivityShapefile
SELECT
    id,
    activity,
    action,
    ST_AsText(area) as geometry
FROM waterproof_nbs_ca_activityshapefile
WHERE id = (
    SELECT activity_shapefile_id
    FROM waterproof_nbs_ca_waterproofnbsca
    WHERE id = <nbs_id>
);

-- Verificar que geometría es válida
SELECT ST_IsValid(area) as is_valid
FROM waterproof_nbs_ca_activityshapefile
WHERE id = <shapefile_id>;
-- is_valid = TRUE
```

#### Criterios de Aceptación
- [ ] ActivityShapefile creado
- [ ] Geometría válida (ST_IsValid)
- [ ] Properties extraídas: activity_n, action
- [ ] NbS.activity_shapefile apunta al shapefile
- [ ] Vista: `views.createNbs()` líneas 76-98
- [ ] Soporta MultiPolygon

---

### CP-NBS-006: Crear NbS - Con Shapefile (ZIP)

#### Descripción
Verificar la creación de NbS con área geográfica en formato Shapefile.

#### Pre-condiciones
- Archivo ZIP con .shp, .shx, .dbf

#### Datos de Entrada

**Parámetros:**
```
extension: "zip"
restrictedArea: "<geojson_convertido_desde_shp>"
```

**Nota**: El shapefile se convierte a GeoJSON en el frontend antes de enviar al backend.

#### Pasos
1. Usuario selecciona archivo .zip
2. Frontend procesa shapefile (usando library como shp.js)
3. Frontend convierte a GeoJSON
4. Backend recibe GeoJSON (igual que CP-NBS-005)
5. Proceso idéntico a GeoJSON desde este punto

#### Criterios de Aceptación
- [ ] Shapefile procesado correctamente
- [ ] Conversión a GeoJSON exitosa
- [ ] Geometría guardada igual que GeoJSON
- [ ] Vista: `views.createNbs()` líneas 78-80

---

### CP-NBS-007: Editar NbS - Campos Básicos

#### Descripción
Verificar la edición de campos básicos de un NbS existente.

#### Pre-condiciones
- NbS existente creado por el usuario
- Usuario propietario o admin

#### Datos de Entrada

| Campo | Valor Original | Valor Actualizado |
|-------|---------------|-------------------|
| nameNBS | "Reforestation A" | "Reforestation A - Updated" |
| descNBS | "Desc A" | "Descripción actualizada" |
| implementCost | 1500.00 | 1800.00 |

#### Pasos
1. Autenticar como propietario del NbS
2. Navegar a `/nbs/edit/<nbs_id>`
3. Modificar campos
4. Enviar POST
5. Verificar actualización

#### Resultado Esperado - Éxito
```json
{
    "status": "200",
    "message": "Success"
}
```

#### Verificaciones

**Base de Datos:**
```sql
SELECT
    name,
    description,
    unit_implementation_cost
FROM waterproof_nbs_ca_waterproofnbsca
WHERE id = <nbs_id>;

-- name = "Reforestation A - Updated"
-- description = "Descripción actualizada"
-- unit_implementation_cost = 1800.00
```

#### Criterios de Aceptación
- [ ] Solo propietario o admin pueden editar
- [ ] Campos actualizados correctamente
- [ ] Slug se actualiza si cambia el nombre
- [ ] No se crea nuevo registro (mismo ID)
- [ ] Validación de nombre único (excepto el propio)
- [ ] Vista: `views.editNbs()` línea 355
- [ ] Template: `waterproofnbsca_edit.html`

---

### CP-NBS-008: Editar NbS - Actualizar Parámetros FastFlood ⚡ CRÍTICO

#### Descripción
Verificar la actualización de coeficientes Manning e Infiltration.

#### Pre-condiciones
- NbS con parámetros FastFlood existentes
- Usuario propietario

#### Datos de Entrada

**Estado Actual:**
```
LULC 10 (Forest): Manning=0.500, Infiltration=0.85
LULC 20 (Shrubs): Manning=0.400, Infiltration=0.70
```

**Actualización:**
```
lulCodes: "10,20,30"  // Agregar LULC 30 (Grass)
manningValues: "0.550,0.420,0.300"  // Actualizar 10 y 20, agregar 30
infiltrationValues: "0.90,0.75,0.65"
```

#### Pasos
1. Navegar a edición
2. Modificar valores existentes de Manning/Infiltration
3. Agregar nuevos LULC
4. Eliminar LULC no seleccionados
5. Enviar formulario

#### Resultado Esperado
- Registros anteriores eliminados
- Nuevos registros creados con valores actualizados

#### Verificaciones

**Base de Datos:**
```sql
-- Verificar que registros antiguos fueron eliminados y reemplazados
SELECT
    lulc.lucode,
    pr.manning,
    pr.infiltration
FROM waterproof_nbs_ca_waterproof_pr_lulc pr
JOIN waterproof_pr_lulc_parameters lulc ON pr.lucode_id = lulc.lucode
WHERE pr.nbsid_id = <nbs_id>
ORDER BY lulc.lucode;

-- Resultado esperado:
-- lucode | manning | infiltration
-- 10     | 0.550   | 0.90
-- 20     | 0.420   | 0.75
-- 30     | 0.300   | 0.65
```

#### Criterios de Aceptación
- [ ] Registros anteriores eliminados (línea 516-519)
- [ ] Nuevos registros creados (línea 521-534)
- [ ] Valores actualizados correctamente
- [ ] Nuevos LULC agregados
- [ ] LULC eliminados ya no en BD
- [ ] Vista: `views.editNbs()` líneas 516-534
- [ ] **CRÍTICO**: Cambios reflejados inmediatamente en FastFlood

---

### CP-NBS-009: Editar NbS - Actualizar Transformaciones RIOS

#### Descripción
Verificar la actualización de transformaciones RIOS asociadas.

#### Pre-condiciones
- NbS con transformaciones RIOS existentes

#### Datos de Entrada

**Estado Actual:**
- Transformations: [1, 3, 5]

**Actualización:**
- Transformations: [1, 5, 7, 9]
  - Mantener: 1, 5
  - Eliminar: 3
  - Agregar: 7, 9

#### Pasos
1. Editar NbS
2. Modificar selección de transformations
3. Enviar formulario

#### Resultado Esperado
- ManyToMany actualizado
- Transformations agregadas
- Transformations eliminadas

#### Verificaciones

**Base de Datos:**
```sql
SELECT riostransformation_id
FROM waterproof_nbs_ca_waterproofnbsca_rios_transformations
WHERE waterproofnbsca_id = <nbs_id>
ORDER BY riostransformation_id;

-- Resultado esperado: [1, 5, 7, 9]
```

#### Criterios de Aceptación
- [ ] Transformations agregadas: `nbs.rios_transformations.add()`
- [ ] Transformations eliminadas: `nbs.rios_transformations.remove()`
- [ ] Diferencias calculadas correctamente (líneas 454-465)
- [ ] Vista: `views.editNbs()` líneas 454-466

---

### CP-NBS-010: Editar NbS - Actualizar Área Geográfica

#### Descripción
Verificar la actualización del área geográfica restringida.

#### Pre-condiciones
- NbS con ActivityShapefile existente

#### Datos de Entrada

**Parámetro:**
```
uploadNewArea: "true"  // Subir nueva área
extension: "geojson"
restrictedArea: <nuevo_geojson>
```

#### Pasos
1. Editar NbS
2. Seleccionar "Upload new area"
3. Cargar nuevo GeoJSON/Shapefile
4. Enviar formulario

#### Resultado Esperado
- ActivityShapefile existente actualizado
- Geometría reemplazada

#### Verificaciones

**Base de Datos:**
```sql
-- Verificar que shapefile fue actualizado (no reemplazado)
SELECT
    id,
    activity,
    action,
    ST_AsText(area) as new_geometry
FROM waterproof_nbs_ca_activityshapefile
WHERE id = (
    SELECT activity_shapefile_id
    FROM waterproof_nbs_ca_waterproofnbsca
    WHERE id = <nbs_id>
);

-- Mismo ID, nueva geometría
```

#### Criterios de Aceptación
- [ ] Si `uploadNewArea=true`: actualiza shapefile existente o crea nuevo
- [ ] Si `uploadNewArea=false`: mantiene shapefile original
- [ ] Vista: `views.editNbs()` líneas 468-500
- [ ] Actualización in-place si shapefile existe

---

### CP-NBS-011: Ver NbS

#### Descripción
Verificar la visualización de detalles de un NbS.

#### Pre-condiciones
- NbS existente
- Usuario con permisos de lectura

#### Pasos
1. Navegar a `/nbs/view/<nbs_id>`
2. Verificar información mostrada

#### Resultado Esperado
- Template `waterproofnbsca_view.html` renderizado (inexistente en archivos, usar waterproofnbsca_detail_list.html)
- Información completa del NbS:
  - Nombre, descripción
  - País, moneda
  - Costos (implementación, mantenimiento, oportunidad)
  - Transformaciones RIOS
  - Parámetros FastFlood (Manning, Infiltration por LULC)
  - Área geográfica si existe

#### Criterios de Aceptación
- [ ] Toda la información se muestra correctamente
- [ ] Parámetros FastFlood visibles
- [ ] Transformaciones RIOS listadas
- [ ] Área geográfica renderizada en mapa
- [ ] Vista: `views.viewNbs()` línea 742
- [ ] Template: `waterproofnbsca_detail_list.html` (el view.html no existe en archivos)

---

### CP-NBS-012: Clonar NbS

#### Descripción
Verificar la clonación de un NbS existente.

#### Pre-condiciones
- NbS fuente existente
- Usuario autenticado

#### Pasos
1. Navegar a `/nbs/clone/<nbs_id>`
2. Verificar formulario pre-poblado
3. Modificar nombre (debe ser único)
4. Opcionalmente modificar otros campos
5. Opcionalmente subir nueva área geográfica
6. Completar clonación

#### Resultado Esperado
- Formulario pre-poblado con datos del NbS original
- Permite modificar todos los campos
- Al guardar, crea nuevo NbS (no sobrescribe original)
- Nuevo NbS asociado al usuario actual

#### Datos Clonados
- ✓ Campos básicos (nombre debe cambiarse)
- ✓ País y moneda
- ✓ Costos
- ✓ Transformaciones RIOS
- ✓ Parámetros FastFlood (Manning, Infiltration) ⚡ CRÍTICO
- ✓ Área geográfica (opcional: mantener o reemplazar)

#### Verificaciones

**Base de Datos:**
```sql
-- Verificar NbS original intacto
SELECT name FROM waterproof_nbs_ca_waterproofnbsca WHERE id = <original_id>;

-- Verificar nuevo NbS
SELECT
    id,
    name,
    added_by_id
FROM waterproof_nbs_ca_waterproofnbsca
WHERE name = 'Reforestation A - Clone';

-- Verificar parámetros FastFlood clonados
SELECT COUNT(*) FROM waterproof_nbs_ca_waterproof_pr_lulc
WHERE nbsid_id = <clone_id>;
-- count debe ser igual al original
```

#### Opciones de Área Geográfica

**Opción 1**: Mantener área original (`uploadNewArea=false`)
```python
# Se copia ActivityShapefile
shapefile = ActivityShapefile(
    action=shapefileOld.action,
    activity=shapefileOld.activity,
    area=shapefileOld.area
)
shapefile.save()
```

**Opción 2**: Subir nueva área (`uploadNewArea=true`)
- Proceso idéntico a crear NbS con área nueva

#### Criterios de Aceptación
- [ ] Datos originales cargados en formulario
- [ ] Parámetros FastFlood precargados ⚡
- [ ] Se requiere nombre único
- [ ] `added_by` es el usuario actual (no el original)
- [ ] Área geográfica opcional (mantener o reemplazar)
- [ ] Parámetros FastFlood clonados correctamente
- [ ] Vista: `views.cloneNbs()` línea 561
- [ ] Template: `waterproofnbsca_clone.html`

---

### CP-NBS-013: Eliminar NbS

#### Descripción
Verificar la eliminación de un NbS.

#### Pre-condiciones
- NbS existente
- Usuario propietario o admin
- NbS NO usado en Study Cases de FastFlood

#### Pasos
1. Autenticar como propietario
2. Enviar POST a `/nbs/delete/<nbs_id>`
3. Verificar eliminación

#### Resultado Esperado - Sin Study Cases

```json
{
    "status": "200",
    "reason": "success"
}
```

#### Resultado Esperado - NbS No Encontrado

```json
{
    "status": "400",
    "reason": "NBS not found"
}
```

#### Verificaciones

**Base de Datos:**
```sql
-- Verificar NbS eliminado
SELECT COUNT(*) FROM waterproof_nbs_ca_waterproofnbsca WHERE id = <nbs_id>;
-- count = 0

-- Verificar cascade delete de parámetros FastFlood
SELECT COUNT(*) FROM waterproof_nbs_ca_waterproof_pr_lulc WHERE nbsid_id = <nbs_id>;
-- count = 0

-- Verificar cascade delete de relaciones ManyToMany
SELECT COUNT(*) FROM waterproof_nbs_ca_waterproofnbsca_rios_transformations
WHERE waterproofnbsca_id = <nbs_id>;
-- count = 0

-- Verificar ActivityShapefile eliminado (si existe)
SELECT COUNT(*) FROM waterproof_nbs_ca_activityshapefile
WHERE id = <shapefile_id>;
-- count = 0 (cascade)
```

#### Advertencia - Uso en FastFlood

**IMPORTANTE**: Antes de permitir eliminación, verificar:

```sql
-- Verificar si NbS está usado en Study Cases
SELECT COUNT(*)
FROM waterproof_fastflood_studycases_nbs
WHERE nbs_id = <nbs_id>;
```

Si count > 0:
- NO permitir eliminación
- Mostrar mensaje: "This NbS is used by X study cases. Cannot delete."

#### Criterios de Aceptación
- [ ] Solo propietario o admin pueden eliminar
- [ ] Eliminación en cascada:
  - `WaterproofPrLulc` (parámetros FastFlood)
  - Relaciones ManyToMany con RIOS
  - `ActivityShapefile` (si existe)
- [ ] Validar que NO esté en uso en Study Cases de FastFlood
- [ ] Vista: `views.deleteNbs()` línea 785

---

## Casos de Prueba de Permisos

### CP-NBS-P001: Usuario No Autenticado

#### Escenarios
1. Intentar crear NbS
2. Intentar editar NbS
3. Intentar eliminar NbS

#### Resultado Esperado
- Render de `waterproofnbsca_login_error.html`
- Sin acceso a operaciones de escritura

---

### CP-NBS-P002: Usuario ADMIN

#### Escenarios
1. Crear NbS globales (sin país específico → deprecated, ahora todos tienen país)
2. Crear NbS de cualquier país
3. Ver todos los NbS
4. Editar cualquier NbS
5. Eliminar cualquier NbS

#### Resultado Esperado
- Acceso completo a todas las operaciones
- Campo de país deshabilitado en formulario (línea 172-175, 377-380)
- `countryEnable = 'disabled'`

---

### CP-NBS-P003: Usuario ANALYS

#### Escenarios
1. Ver NbS de admin + propios
2. Editar solo sus NbS
3. Eliminar solo sus NbS
4. Crear NbS de su país

#### Resultado Esperado
- Acceso limitado a sus propios registros
- Campo de país habilitado
- Vista: `views.listNbs()` línea 211

---

## Casos de Prueba de Validación

### CP-NBS-V001: Validación de Nombre Único

#### Descripción
El nombre de NbS debe ser único globalmente.

#### Casos de Prueba

**Caso 1**: Crear NbS con nombre existente
```python
# Resultado: Error 400
{
    "status": "400",
    "message": "Duplicated nbs"
}
```

**Caso 2**: Editar NbS con nombre de otro NbS
```python
# Resultado: Error 400
# Mensaje: "Duplicated nbs"
```

**Caso 3**: Editar NbS manteniendo su propio nombre
```python
# Resultado: Éxito 200
# Permite mantener el mismo nombre
```

#### Criterios de Aceptación
- [ ] Validación global (no por usuario)
- [ ] Case-insensitive usando custom QuerySet (línea 33-39)
- [ ] Manager personalizado (línea 44-46)
- [ ] Vista crear: líneas 64-72
- [ ] Vista editar: líneas 431-443

---

### CP-NBS-V002: Validación de Valores Numéricos >= 0

#### Campos a Validar

| Campo | Debe ser | Validación |
|-------|----------|------------|
| maxBenefitTime | >= 0 | Años |
| benefitTimePorc | >= 0 | Porcentaje |
| maintenancePeriod | >= 0 | Años |
| implementCost | >= 0 | US$/ha |
| maintenanceCost | >= 0 | US$/ha |
| oportunityCost | >= 0 | US$/ha |

#### Resultado Esperado - Valores Negativos
```json
{
    "status": "400",
    "message": "Field empty"  // Mensaje genérico
}
```

#### Criterios de Aceptación
- [ ] Validación en crear: línea 60-61
- [ ] Validación en editar: línea 427-428
- [ ] Validación en clonar: línea 627-629

---

### CP-NBS-V003: Validación de Parámetros FastFlood ⚡ CRÍTICO

#### Rangos Válidos

| Parámetro | Tipo | Min | Max | Típico | Uso |
|-----------|------|-----|-----|--------|-----|
| manning | Decimal(5,3) | 0.001 | 2.000 | 0.025-0.800 | Rugosidad de Manning |
| infiltration | Decimal(5,2) | 0.00 | 1.00 | 0.10-0.95 | Tasa de infiltración (0-100%) |

#### Casos de Prueba

**Caso 1**: Manning fuera de rango
```python
manning = -0.5  # Negativo
# Resultado: Debe rechazarse (validación en frontend)

manning = 3.0  # Muy alto
# Resultado: Advertencia o rechazo
```

**Caso 2**: Infiltration fuera de rango (0-1)
```python
infiltration = 1.5  # > 1.00
# Resultado: Debe rechazarse

infiltration = -0.2  # Negativo
# Resultado: Debe rechazarse
```

**Caso 3**: Valores dentro de rangos típicos
```python
# Forest
manning = 0.500  # ✓
infiltration = 0.85  # ✓

# Water
manning = 0.035  # ✓
infiltration = 0.05  # ✓

# Urban
manning = 0.015  # ✓
infiltration = 0.20  # ✓
```

#### Criterios de Aceptación
- [ ] Validación de rangos en frontend
- [ ] Validación de tipo Decimal en backend
- [ ] Manning: 3 decimales
- [ ] Infiltration: 2 decimales
- [ ] Mensajes de error claros

---

## Matriz de Trazabilidad

| ID Caso | Requisito | Vista | Template | Prioridad |
|---------|-----------|-------|----------|-----------|
| CP-NBS-001 | Listar NbS | listNbs | waterproofnbsca_list.html | Alta |
| CP-NBS-002 | Crear básico | createNbs | waterproofnbsca_form.html | Alta |
| CP-NBS-003 | Crear con FastFlood | createNbs | waterproofnbsca_form.html | **Crítica** |
| CP-NBS-004 | Crear con RIOS | createNbs | waterproofnbsca_form.html | Media |
| CP-NBS-005 | Crear con GeoJSON | createNbs | waterproofnbsca_form.html | Media |
| CP-NBS-006 | Crear con Shapefile | createNbs | waterproofnbsca_form.html | Media |
| CP-NBS-007 | Editar básico | editNbs | waterproofnbsca_edit.html | Alta |
| CP-NBS-008 | Editar FastFlood | editNbs | waterproofnbsca_edit.html | **Crítica** |
| CP-NBS-009 | Editar RIOS | editNbs | waterproofnbsca_edit.html | Media |
| CP-NBS-010 | Editar área geo | editNbs | waterproofnbsca_edit.html | Media |
| CP-NBS-011 | Ver NbS | viewNbs | waterproofnbsca_detail_list.html | Media |
| CP-NBS-012 | Clonar NbS | cloneNbs | waterproofnbsca_clone.html | Alta |
| CP-NBS-013 | Eliminar NbS | deleteNbs | - | Alta |

---

## Scripts de Prueba Recomendados

```python
# test_nbs_crud.py
from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from geonode.waterproof_nbs_ca.models import WaterproofNbsCa, WaterproofPrLulc
from geonode.waterproof_parameters.models import Countries, WaterproofPrLulcParameters

class NbsCRUDTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = get_user_model().objects.create_user(
            username='testuser',
            password='testpass',
            professional_role='ANALYS',
            country='USA'
        )
        self.country = Countries.objects.get(iso3='USA')
        self.lulc_forest = WaterproofPrLulcParameters.objects.get(lucode=10)
        self.lulc_water = WaterproofPrLulcParameters.objects.get(lucode=80)

    def test_create_nbs_with_fastflood_params_success(self):
        """CP-NBS-003: Crear NbS con parámetros FastFlood"""
        self.client.login(username='testuser', password='testpass')
        response = self.client.post('/nbs/create/', {
            'action': 'create-nbs',
            'nameNBS': 'Test NbS FastFlood',
            'descNBS': 'Test Description',
            'countryNBS': 'USA',
            'currencyCost': 'USD',
            'maxBenefitTime': '15.5',
            'benefitTimePorc': '75.5',
            'maintenancePeriod': '2',
            'implementCost': '1500.00',
            'maintenanceCost': '50.00',
            'oportunityCost': '200.00',
            'lulCodes': '10,80',
            'manningValues': '0.500,0.035',
            'infiltrationValues': '0.85,0.05',
        })

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['status'], '200')

        # Verificar NbS creado
        nbs = WaterproofNbsCa.objects.get(name='Test NbS FastFlood')
        self.assertIsNotNone(nbs)

        # Verificar parámetros FastFlood
        fastflood_params = WaterproofPrLulc.objects.filter(nbsid=nbs)
        self.assertEqual(fastflood_params.count(), 2)

        # Verificar valores específicos
        forest_param = fastflood_params.get(lucode=self.lulc_forest)
        self.assertEqual(float(forest_param.manning), 0.500)
        self.assertEqual(float(forest_param.infiltration), 0.85)

        water_param = fastflood_params.get(lucode=self.lulc_water)
        self.assertEqual(float(water_param.manning), 0.035)
        self.assertEqual(float(water_param.infiltration), 0.05)

    def test_edit_nbs_update_fastflood_params(self):
        """CP-NBS-008: Editar parámetros FastFlood"""
        # Crear NbS inicial
        nbs = WaterproofNbsCa.objects.create(
            name='Test NbS',
            slug='test-nbs',
            description='Test',
            country=self.country,
            currency=self.country,
            max_benefit_req_time=15,
            profit_pct_time_inter_assoc=75,
            unit_implementation_cost=1500,
            unit_maintenance_cost=50,
            periodicity_maitenance=2,
            unit_oportunity_cost=200,
            added_by=self.user
        )

        # Parámetros iniciales
        WaterproofPrLulc.objects.create(
            nbsid=nbs,
            lucode=self.lulc_forest,
            manning=0.500,
            infiltration=0.85
        )

        # Editar
        self.client.login(username='testuser', password='testpass')
        response = self.client.post(f'/nbs/edit/{nbs.id}', {
            'nameNBS': 'Test NbS',
            'descNBS': 'Test',
            'countryNBS': 'USA',
            'currencyCost': 'USD',
            'maxBenefitTime': '15',
            'benefitTimePorc': '75',
            'maintenancePeriod': '2',
            'implementCost': '1500',
            'maintenanceCost': '50',
            'oportunityCost': '200',
            'lulCodes': '10,80',  # Agregar Water
            'manningValues': '0.550,0.035',  # Actualizar Forest, agregar Water
            'infiltrationValues': '0.90,0.05',
        })

        self.assertEqual(response.status_code, 200)

        # Verificar actualización
        params = WaterproofPrLulc.objects.filter(nbsid=nbs)
        self.assertEqual(params.count(), 2)  # Forest + Water

        forest_param = params.get(lucode=self.lulc_forest)
        self.assertEqual(float(forest_param.manning), 0.550)  # Actualizado
        self.assertEqual(float(forest_param.infiltration), 0.90)  # Actualizado

    def test_delete_nbs_cascade_fastflood_params(self):
        """CP-NBS-013: Eliminar NbS con cascade de parámetros"""
        # Crear NbS con parámetros
        nbs = WaterproofNbsCa.objects.create(
            name='Test NbS Delete',
            slug='test-nbs-delete',
            description='Test',
            country=self.country,
            currency=self.country,
            max_benefit_req_time=15,
            profit_pct_time_inter_assoc=75,
            unit_implementation_cost=1500,
            unit_maintenance_cost=50,
            periodicity_maitenance=2,
            unit_oportunity_cost=200,
            added_by=self.user
        )

        WaterproofPrLulc.objects.create(
            nbsid=nbs,
            lucode=self.lulc_forest,
            manning=0.500,
            infiltration=0.85
        )

        nbs_id = nbs.id

        # Eliminar
        self.client.login(username='testuser', password='testpass')
        response = self.client.post(f'/nbs/delete/{nbs_id}')

        self.assertEqual(response.status_code, 200)

        # Verificar NbS eliminado
        self.assertFalse(WaterproofNbsCa.objects.filter(id=nbs_id).exists())

        # Verificar parámetros eliminados (cascade)
        self.assertEqual(
            WaterproofPrLulc.objects.filter(nbsid_id=nbs_id).count(),
            0
        )
```

---

## Referencias

- **Modelos**: `geonode/waterproof_nbs_ca/models.py`
- **Vistas**: `geonode/waterproof_nbs_ca/views.py`
- **URLs**: `geonode/waterproof_nbs_ca/urls.py`
- **Templates**: `geonode/waterproof_nbs_ca/templates/waterproof_nbs_ca/`
- **JavaScript**: `geonode/waterproof_nbs_ca/static/waterproof_nbs_ca/js/`
- **Integración FastFlood**: `geonode/waterproof_fastflood/api.py` (función `getNbsJson`)
