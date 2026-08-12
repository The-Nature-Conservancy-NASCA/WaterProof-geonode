# Plan de Pruebas - Validaciones y API Dinámica de NbS

## Información del Documento

| Atributo | Valor |
|----------|-------|
| **Módulo** | WaterProof NbS CA (Nature-based Solutions) |
| **Componente** | Validaciones y API Dinámica |
| **Directorio** | `geonode/waterproof_nbs_ca/` |
| **Versión** | 1.0 |
| **Fecha** | 2025-12-11 |
| **Autor** | Claude |

## Resumen Ejecutivo

Este documento contiene el plan de pruebas para las **validaciones** y **endpoints de API dinámica** del módulo NbS. Cubre validaciones de datos críticos (especialmente parámetros FastFlood), validaciones de archivos geográficos, y los endpoints dinámicos para carga de transformaciones RIOS.

## Objetivos

1. **Validar parámetros FastFlood**: Asegurar que los coeficientes Manning e Infiltration estén en rangos válidos
2. **Validar unicidad**: Verificar que nombres de NbS sean únicos por usuario
3. **Validar campos obligatorios**: Asegurar que todos los campos requeridos estén presentes
4. **Validar archivos geográficos**: Verificar formato y contenido de GeoJSON y Shapefile
5. **Probar endpoints dinámicos**: Verificar carga correcta de transformaciones RIOS
6. **Validar costos**: Asegurar valores numéricos positivos y coherentes

---

## Casos de Prueba: Validaciones de Datos

### CP-VAL-NBS-001: Validar Nombre Único de NbS

**Prioridad**: Alta ⚡
**Tipo**: Validación de Negocio
**Componente**: WaterproofNbsCa Model, createNbs View

#### Descripción
Verificar que el sistema no permita crear dos NbS con el mismo nombre para el mismo usuario.

#### Precondiciones
- Usuario autenticado con rol ANALYS
- Existe un NbS con nombre "Reforestation Project"

#### Datos de Prueba
```python
existing_nbs = {
    'name': 'Reforestation Project',
    'added_by': user_analys,
    'country': usa
}

new_nbs_attempt = {
    'name': 'Reforestation Project',  # Nombre duplicado
    'description': 'Another reforestation project',
    'country': usa
}
```

#### Pasos de Ejecución
1. Iniciar sesión como usuario ANALYS
2. Navegar a `/nbs/create/`
3. Llenar formulario con nombre duplicado "Reforestation Project"
4. Intentar enviar formulario

#### Resultado Esperado
- ❌ El sistema rechaza la creación
- Se muestra mensaje de error: "A NbS with this name already exists"
- No se crea registro en la base de datos
- Usuario permanece en formulario de creación

#### Validación Técnica
```python
# En views.py createNbs (línea ~50-60)
if WaterproofNbsCa.objects.filter(name=name, added_by=request.user).exists():
    return JsonResponse({'error': 'Name already exists'}, status=400)
```

#### Notas
- La validación debe ser case-insensitive
- Admin puede crear NbS globales con nombres duplicados a nivel usuario
- El slug se genera automáticamente del nombre

---

### CP-VAL-NBS-002: Validar Rangos de Manning (Crítico FastFlood) ⚡

**Prioridad**: Alta ⚡
**Tipo**: Validación de Datos FastFlood
**Componente**: WaterproofPrLulc Model, createNbs View

#### Descripción
Verificar que los valores del coeficiente de Manning estén dentro del rango válido para análisis hidrológicos.

#### Precondiciones
- Usuario autenticado
- Conocimiento de rangos típicos de Manning

#### Rangos Válidos por Tipo de Cobertura

| LULC Code | Land Cover | Manning Min | Manning Max |
|-----------|------------|-------------|-------------|
| 10 | Forest | 0.400 | 0.800 |
| 20 | Shrubs | 0.300 | 0.600 |
| 30 | Grass | 0.200 | 0.400 |
| 40 | Crops | 0.200 | 0.500 |
| 50 | Building | 0.012 | 0.020 |
| 60 | Bare | 0.025 | 0.040 |
| 70 | Snow | 0.015 | 0.025 |
| 80 | Water | 0.025 | 0.035 |
| 90 | Wetland | 0.100 | 0.200 |
| 100 | Mangroves | 0.080 | 0.150 |
| 110 | Moss | 0.035 | 0.060 |

#### Datos de Prueba - Valores Válidos
```python
valid_manning_values = [
    {'lucode': 10, 'manning': 0.500},  # Forest - OK
    {'lucode': 20, 'manning': 0.400},  # Shrubs - OK
    {'lucode': 80, 'manning': 0.030},  # Water - OK
]
```

#### Datos de Prueba - Valores Inválidos
```python
invalid_manning_values = [
    {'lucode': 10, 'manning': 0.001},  # Muy bajo para Forest
    {'lucode': 10, 'manning': 1.500},  # Muy alto para Forest
    {'lucode': 80, 'manning': 0.500},  # Muy alto para Water
    {'lucode': 50, 'manning': -0.010}, # Negativo (imposible)
    {'lucode': 30, 'manning': 0.000},  # Zero (inválido)
]
```

#### Pasos de Ejecución
1. Navegar a `/nbs/create/`
2. Llenar datos básicos del NbS
3. En sección de parámetros LULC, ingresar:
   - LULC Code: 10 (Forest)
   - Manning: 1.500 (INVÁLIDO)
   - Infiltration: 0.75
4. Intentar guardar

#### Resultado Esperado - Valores Inválidos
- ❌ El sistema rechaza el valor
- Mensaje: "Manning coefficient out of valid range for Forest (0.400-0.800)"
- No se guarda el registro WaterproofPrLulc
- Usuario puede corregir el valor

#### Resultado Esperado - Valores Válidos
- ✅ El sistema acepta el valor
- Se crea registro en WaterproofPrLulc
- El valor está disponible para getNbsJson()

#### Validación Técnica
```python
# Campo en models.py
class WaterproofPrLulc(models.Model):
    manning = models.DecimalField(max_digits=5, decimal_places=3)

    def clean(self):
        if self.manning <= 0:
            raise ValidationError("Manning must be positive")
        if self.manning > 2.000:
            raise ValidationError("Manning exceeds maximum value")
```

#### Query de Verificación
```sql
-- Verificar valores guardados
SELECT
    nbsid_id,
    lucode_id,
    manning,
    infiltration
FROM waterproof_nbs_ca_waterproofprlulc
WHERE manning NOT BETWEEN 0.001 AND 2.000;
-- Debe retornar 0 registros
```

#### Notas
- Los rangos se basan en literatura hidrológica estándar
- Valores muy bajos (<0.010) pueden causar inestabilidades en modelo FastFlood
- Valores muy altos (>1.000) son físicamente improbables

---

### CP-VAL-NBS-003: Validar Rangos de Infiltration (Crítico FastFlood) ⚡

**Prioridad**: Alta ⚡
**Tipo**: Validación de Datos FastFlood
**Componente**: WaterproofPrLulc Model

#### Descripción
Verificar que los valores de infiltración estén en rango válido (0.00 - 1.00), representando porcentajes.

#### Precondiciones
- Usuario autenticado
- Coeficiente de infiltración representa % de agua que se infiltra

#### Datos de Prueba - Valores Válidos
```python
valid_infiltration = [
    {'lucode': 10, 'infiltration': 0.85},   # Forest - Alta infiltración
    {'lucode': 80, 'infiltration': 0.02},   # Water - Baja infiltración
    {'lucode': 50, 'infiltration': 0.15},   # Building - Baja
    {'lucode': 30, 'infiltration': 0.60},   # Grass - Media
    {'lucode': 100, 'infiltration': 1.00},  # Mangroves - Máxima
    {'lucode': 60, 'infiltration': 0.00},   # Bare - Mínima
]
```

#### Datos de Prueba - Valores Inválidos
```python
invalid_infiltration = [
    {'lucode': 10, 'infiltration': 1.50},   # >100% (imposible)
    {'lucode': 20, 'infiltration': -0.10},  # Negativo (imposible)
    {'lucode': 80, 'infiltration': 2.00},   # >100%
]
```

#### Pasos de Ejecución
1. Crear NbS con parámetro LULC
2. Ingresar Infiltration = 1.50 (150%)
3. Intentar guardar

#### Resultado Esperado - Valores Inválidos
- ❌ Sistema rechaza
- Mensaje: "Infiltration must be between 0.00 and 1.00 (0-100%)"
- No se crea registro

#### Resultado Esperado - Valores Válidos
- ✅ Sistema acepta
- Registro guardado correctamente
- Valor disponible en JSON FastFlood

#### Validación Técnica
```python
# En models.py
class WaterproofPrLulc(models.Model):
    infiltration = models.DecimalField(max_digits=5, decimal_places=2)

    def clean(self):
        if not (0.00 <= self.infiltration <= 1.00):
            raise ValidationError("Infiltration must be between 0.00 and 1.00")
```

#### Query de Verificación
```sql
SELECT * FROM waterproof_nbs_ca_waterproofprlulc
WHERE infiltration < 0.00 OR infiltration > 1.00;
-- Debe retornar 0 registros
```

---

### CP-VAL-NBS-004: Validar Campos Obligatorios de NbS

**Prioridad**: Alta
**Tipo**: Validación de Modelo
**Componente**: WaterproofNbsCa Model

#### Descripción
Verificar que todos los campos obligatorios estén presentes al crear/editar NbS.

#### Campos Obligatorios

| Campo | Tipo | Validación | Mensaje Error |
|-------|------|------------|---------------|
| name | CharField(100) | required, unique | "Name is required" |
| description | CharField(2048) | required | "Description is required" |
| country | ForeignKey | required | "Country is required" |
| currency | ForeignKey | required | "Currency is required" |
| max_benefit_req_time | Decimal(14,3) | required, >0 | "Max benefit time must be positive" |
| profit_pct_time_inter_assoc | Decimal(10,2) | required, 0-100 | "Profit percentage must be 0-100" |
| unit_implementation_cost | Decimal(14,2) | required, >=0 | "Implementation cost required" |
| unit_maintenance_cost | Decimal(14,2) | required, >=0 | "Maintenance cost required" |
| periodicity_maitenance | Integer | required, >0 | "Maintenance periodicity required" |
| unit_oportunity_cost | Decimal(14,2) | required, >=0 | "Opportunity cost required" |

#### Datos de Prueba - Formulario Incompleto
```python
incomplete_data = {
    'name': 'Test NbS',
    # 'description': missing!
    'country': 1,
    # 'currency': missing!
    # 'max_benefit_req_time': missing!
    # ... otros campos faltantes
}
```

#### Pasos de Ejecución
1. Navegar a `/nbs/create/`
2. Llenar solo campo 'name'
3. Dejar otros campos vacíos
4. Intentar guardar

#### Resultado Esperado
- ❌ Sistema rechaza formulario
- Se muestran mensajes de error para cada campo faltante
- No se crea registro en base de datos
- Usuario puede corregir errores

#### Validación en Frontend
```javascript
// En waterproofnbsca_create.js
function validateForm() {
    let errors = [];

    if (!$('#name').val()) {
        errors.push('Name is required');
    }
    if (!$('#description').val()) {
        errors.push('Description is required');
    }
    // ... otros campos

    return errors;
}
```

---

### CP-VAL-NBS-005: Validar Costos (No Negativos)

**Prioridad**: Media
**Tipo**: Validación de Negocio
**Componente**: WaterproofNbsCa Model

#### Descripción
Verificar que los costos (implementación, mantenimiento, oportunidad) no sean negativos.

#### Datos de Prueba - Valores Inválidos
```python
invalid_costs = {
    'unit_implementation_cost': -1000.00,  # Negativo
    'unit_maintenance_cost': -500.00,      # Negativo
    'unit_oportunity_cost': -200.00,       # Negativo
}
```

#### Datos de Prueba - Valores Válidos
```python
valid_costs = {
    'unit_implementation_cost': 0.00,      # Zero OK
    'unit_maintenance_cost': 1500.50,      # Positivo
    'unit_oportunity_cost': 800.25,        # Positivo
}
```

#### Resultado Esperado
- Valores negativos: ❌ Rechazados con mensaje "Costs cannot be negative"
- Valores cero: ✅ Aceptados
- Valores positivos: ✅ Aceptados

---

### CP-VAL-NBS-006: Validar Periodicidad de Mantenimiento

**Prioridad**: Media
**Tipo**: Validación de Negocio
**Componente**: WaterproofNbsCa Model

#### Descripción
Verificar que la periodicidad de mantenimiento sea un valor entero positivo (años).

#### Datos de Prueba
```python
valid_periodicity = [1, 2, 5, 10, 15, 20]  # Años razonables
invalid_periodicity = [0, -1, -5]           # Cero o negativos
```

#### Resultado Esperado
- 0 o negativo: ❌ "Maintenance periodicity must be positive"
- Valores positivos: ✅ Aceptados

---

## Casos de Prueba: Validaciones de Archivos Geográficos

### CP-VAL-NBS-007: Validar GeoJSON de Activity Shapefile

**Prioridad**: Media
**Tipo**: Validación de Archivo
**Componente**: ActivityShapefile Model, createNbs View

#### Descripción
Verificar que el sistema valide correctamente archivos GeoJSON subidos para delimitar áreas de actividad NbS.

#### Precondiciones
- Usuario autenticado
- Disponibilidad de archivos GeoJSON de prueba

#### Datos de Prueba - GeoJSON Válido
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-77.0364, 38.8951],
            [-77.0365, 38.8950],
            [-77.0363, 38.8949],
            [-77.0362, 38.8950],
            [-77.0364, 38.8951]
          ]
        ]
      },
      "properties": {
        "activity": "Reforestation",
        "action": "Plant Trees"
      }
    }
  ]
}
```

#### Datos de Prueba - GeoJSON Inválido
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          // Polígono no cerrado (primer punto != último)
          [
            [-77.0364, 38.8951],
            [-77.0365, 38.8950],
            [-77.0363, 38.8949]
            // Falta punto de cierre!
          ]
        ]
      }
    }
  ]
}
```

#### Pasos de Ejecución
1. Crear NbS básico
2. En sección de Activity Shapefile, seleccionar archivo GeoJSON
3. Subir archivo con polígono no cerrado
4. Intentar guardar

#### Resultado Esperado - Archivo Inválido
- ❌ Sistema rechaza archivo
- Mensaje: "Invalid GeoJSON: Polygon not closed"
- No se crea registro ActivityShapefile
- Usuario puede subir otro archivo

#### Resultado Esperado - Archivo Válido
- ✅ Sistema acepta archivo
- Se crea registro ActivityShapefile
- Geometría almacenada en campo MultiPolygonField
- Geometría visible en mapa (si existe visualización)

#### Validación Técnica
```python
# En views.py
from django.contrib.gis.geos import GEOSGeometry, GEOSException

try:
    geom = GEOSGeometry(geojson_string)
    if not geom.valid:
        raise ValidationError("Invalid geometry")
except GEOSException as e:
    return JsonResponse({'error': str(e)}, status=400)
```

---

### CP-VAL-NBS-008: Validar Shapefile de Activity

**Prioridad**: Media
**Tipo**: Validación de Archivo
**Componente**: ActivityShapefile Model

#### Descripción
Verificar que el sistema procese correctamente archivos Shapefile (.shp, .shx, .dbf, .prj).

#### Precondiciones
- Usuario autenticado
- Archivos Shapefile completos (todos los componentes)

#### Componentes de Shapefile Requeridos
- `.shp`: Geometrías
- `.shx`: Índice de geometrías
- `.dbf`: Atributos
- `.prj`: Sistema de coordenadas (opcional pero recomendado)

#### Datos de Prueba - Shapefile Completo
```
reforestation_area.shp  (geometrías)
reforestation_area.shx  (índice)
reforestation_area.dbf  (atributos: activity, action)
reforestation_area.prj  (EPSG:4326)
```

#### Datos de Prueba - Shapefile Incompleto
```
incomplete.shp  (solo geometrías, faltan .shx y .dbf)
```

#### Pasos de Ejecución
1. Crear NbS
2. Subir archivo .shp sin archivos complementarios
3. Intentar procesar

#### Resultado Esperado - Incompleto
- ❌ Error: "Shapefile incomplete. Please upload .shp, .shx, and .dbf files"

#### Resultado Esperado - Completo
- ✅ Procesamiento exitoso
- Geometrías convertidas a GeoJSON internamente
- Almacenamiento en MultiPolygonField

#### Validación con GDAL/OGR
```python
from osgeo import ogr

driver = ogr.GetDriverByName('ESRI Shapefile')
dataSource = driver.Open(shapefile_path, 0)

if dataSource is None:
    raise ValidationError("Could not open shapefile")

layer = dataSource.GetLayer()
if layer.GetFeatureCount() == 0:
    raise ValidationError("Shapefile contains no features")
```

---

## Casos de Prueba: Endpoints de API Dinámica

### CP-API-NBS-001: Cargar Todas las Transiciones RIOS

**Prioridad**: Alta
**Tipo**: API Dinámica
**Componente**: loadAllTransitions View
**URL**: `/nbs/load-transitions/`
**Método**: GET

#### Descripción
Verificar que el endpoint retorne todas las transiciones RIOS disponibles para poblar dropdown en frontend.

#### Precondiciones
- Base de datos contiene registros en RiosTransition

#### Datos de Prueba
```sql
INSERT INTO waterproof_nbs_ca_riostransition (id, name, description) VALUES
(1, 'Agricultural to Forest', 'Transition from agricultural land to forest'),
(2, 'Bare to Wetland', 'Transition from bare soil to wetland'),
(3, 'Urban to Green Infrastructure', 'Transition from urban to green infrastructure');
```

#### Request
```http
GET /nbs/load-transitions/
Authorization: Bearer {token}
```

#### Resultado Esperado
**Status Code**: 200 OK

**Response Body**:
```json
{
  "transitions": [
    {
      "id": 1,
      "name": "Agricultural to Forest",
      "description": "Transition from agricultural land to forest"
    },
    {
      "id": 2,
      "name": "Bare to Wetland",
      "description": "Transition from bare soil to wetland"
    },
    {
      "id": 3,
      "name": "Urban to Green Infrastructure",
      "description": "Transition from urban to green infrastructure"
    }
  ]
}
```

#### Validación Técnica
```python
# En views.py loadAllTransitions (línea ~800)
from django.http import JsonResponse
from .models import RiosTransition

def loadAllTransitions(request):
    transitions = RiosTransition.objects.all().values('id', 'name', 'description')
    return JsonResponse({'transitions': list(transitions)})
```

#### Uso en Frontend
```javascript
// En waterproofnbsca_create.js
$.get('/nbs/load-transitions/', function(data) {
    data.transitions.forEach(function(transition) {
        $('#transitionSelect').append(
            $('<option></option>')
                .attr('value', transition.id)
                .text(transition.name)
        );
    });
});
```

#### Validaciones Adicionales
- ✅ Verificar que retorne array vacío si no hay transiciones
- ✅ Verificar ordenamiento (por nombre alfabético)
- ✅ Verificar permisos (solo usuarios autenticados)

---

### CP-API-NBS-002: Cargar Actividades por Transición

**Prioridad**: Alta
**Tipo**: API Dinámica
**Componente**: loadActivityByTransition View
**URL**: `/nbs/load-activityByTransition/`
**Método**: GET

#### Descripción
Verificar que el endpoint retorne actividades RIOS filtradas por transición seleccionada (cascading dropdown).

#### Precondiciones
- Existe transición con id=1
- Existen actividades asociadas a esa transición

#### Datos de Prueba
```sql
-- Transition
INSERT INTO waterproof_nbs_ca_riostransition (id, name) VALUES
(1, 'Agricultural to Forest');

-- Activities for this transition
INSERT INTO waterproof_nbs_ca_riosactivity (id, transition_id, name, description, lucode_id) VALUES
(1, 1, 'Afforestation', 'Plant new trees', 10),
(2, 1, 'Agroforestry', 'Combine agriculture with trees', 40);
```

#### Request
```http
GET /nbs/load-activityByTransition/?transition_id=1
Authorization: Bearer {token}
```

#### Resultado Esperado
**Status Code**: 200 OK

**Response Body**:
```json
{
  "activities": [
    {
      "id": 1,
      "name": "Afforestation",
      "description": "Plant new trees",
      "lucode_id": 10
    },
    {
      "id": 2,
      "name": "Agroforestry",
      "description": "Combine agriculture with trees",
      "lucode_id": 40
    }
  ]
}
```

#### Validación Técnica
```python
# En views.py loadActivityByTransition
def loadActivityByTransition(request):
    transition_id = request.GET.get('transition_id')

    if not transition_id:
        return JsonResponse({'error': 'transition_id required'}, status=400)

    activities = RiosActivity.objects.filter(
        transition_id=transition_id
    ).values('id', 'name', 'description', 'lucode_id')

    return JsonResponse({'activities': list(activities)})
```

#### Casos de Error

**Sin transition_id**:
```http
GET /nbs/load-activityByTransition/
```
Response: `400 Bad Request` - "transition_id required"

**Transición inexistente**:
```http
GET /nbs/load-activityByTransition/?transition_id=999
```
Response: `200 OK` - `{"activities": []}`

---

### CP-API-NBS-003: Cargar Transformaciones por Actividad

**Prioridad**: Alta
**Tipo**: API Dinámica
**Componente**: loadTransformationbyActivity View
**URL**: `/nbs/load-transformationByActivity/`
**Método**: GET

#### Descripción
Verificar que el endpoint retorne transformaciones RIOS filtradas por actividad seleccionada (tercer nivel de cascading dropdown).

#### Precondiciones
- Existe actividad con id=1
- Existen transformaciones asociadas a esa actividad

#### Datos de Prueba
```sql
-- Activity
INSERT INTO waterproof_nbs_ca_riosactivity (id, name) VALUES
(1, 'Afforestation');

-- Transformations for this activity
INSERT INTO waterproof_nbs_ca_riostransformation (id, activity_id, name, description, unique_id) VALUES
(1, 1, 'Pine Plantation', 'Plant pine trees in degraded areas', 'TRANS-001'),
(2, 1, 'Native Forest Restoration', 'Restore native forest species', 'TRANS-002');
```

#### Request
```http
GET /nbs/load-transformationByActivity/?activity_id=1
Authorization: Bearer {token}
```

#### Resultado Esperado
**Status Code**: 200 OK

**Response Body**:
```json
{
  "transformations": [
    {
      "id": 1,
      "name": "Pine Plantation",
      "description": "Plant pine trees in degraded areas",
      "unique_id": "TRANS-001"
    },
    {
      "id": 2,
      "name": "Native Forest Restoration",
      "description": "Restore native forest species",
      "unique_id": "TRANS-002"
    }
  ]
}
```

#### Validación Técnica
```python
# En views.py loadTransformationbyActivity
def loadTransformationbyActivity(request):
    activity_id = request.GET.get('activity_id')

    if not activity_id:
        return JsonResponse({'error': 'activity_id required'}, status=400)

    transformations = RiosTransformation.objects.filter(
        activity_id=activity_id
    ).values('id', 'name', 'description', 'unique_id')

    return JsonResponse({'transformations': list(transformations)})
```

#### Flujo Completo: Selección en Cascada

```javascript
// 1. Usuario selecciona Transition
$('#transitionSelect').change(function() {
    const transitionId = $(this).val();

    // 2. Cargar Activities
    $.get(`/nbs/load-activityByTransition/?transition_id=${transitionId}`, function(data) {
        $('#activitySelect').empty();
        data.activities.forEach(activity => {
            $('#activitySelect').append(`<option value="${activity.id}">${activity.name}</option>`);
        });
    });
});

// 3. Usuario selecciona Activity
$('#activitySelect').change(function() {
    const activityId = $(this).val();

    // 4. Cargar Transformations
    $.get(`/nbs/load-transformationByActivity/?activity_id=${activityId}`, function(data) {
        $('#transformationSelect').empty();
        data.transformations.forEach(transformation => {
            $('#transformationSelect').append(`<option value="${transformation.id}">${transformation.name}</option>`);
        });
    });
});
```

---

## Casos de Prueba: Validaciones de Asociación

### CP-VAL-NBS-009: Validar Asociación NbS-Transformations

**Prioridad**: Media
**Tipo**: Validación de Relación
**Componente**: WaterproofNbsCa Model, ManyToManyField

#### Descripción
Verificar que se puedan asociar múltiples transformaciones a un NbS y que la relación se mantenga correctamente.

#### Precondiciones
- Existe NbS con id=1
- Existen transformaciones con ids [1, 2, 3]

#### Datos de Prueba
```python
nbs = WaterproofNbsCa.objects.get(id=1)
transformations_to_add = [1, 2, 3]
```

#### Pasos de Ejecución
1. Crear o editar NbS
2. Seleccionar transformaciones RIOS: [1, 2, 3]
3. Guardar NbS
4. Verificar asociación en base de datos

#### Resultado Esperado
```sql
-- Query de verificación
SELECT
    nbs.id AS nbs_id,
    nbs.name AS nbs_name,
    t.id AS transformation_id,
    t.name AS transformation_name
FROM waterproof_nbs_ca_waterproofnbsca AS nbs
JOIN waterproof_nbs_ca_waterproofnbsca_rios_transformations AS m2m
    ON nbs.id = m2m.waterproofnbsca_id
JOIN waterproof_nbs_ca_riostransformation AS t
    ON m2m.riostransformation_id = t.id
WHERE nbs.id = 1;
```

**Resultado**:
```
nbs_id | nbs_name            | transformation_id | transformation_name
-------|---------------------|-------------------|--------------------
1      | Reforestation       | 1                 | Pine Plantation
1      | Reforestation       | 2                 | Native Forest Rest.
1      | Reforestation       | 3                 | Agroforestry
```

#### Validación de Desasociación
1. Editar NbS
2. Remover transformación id=2
3. Guardar
4. Verificar que solo queden [1, 3]

---

### CP-VAL-NBS-010: Validar Combinación Única nbsid + lucode

**Prioridad**: Media
**Tipo**: Validación de Integridad
**Componente**: WaterproofPrLulc Model

#### Descripción
Verificar que se pueda tener múltiples registros WaterproofPrLulc por NbS (diferentes LULC codes), pero que la combinación nbsid + lucode sea única.

#### Escenario Válido: Múltiples LULC por NbS
```python
# NbS "Reforestation" (id=1) con 3 LULC codes
[
    {'nbsid': 1, 'lucode': 10, 'manning': 0.500, 'infiltration': 0.85},  # Forest
    {'nbsid': 1, 'lucode': 20, 'manning': 0.400, 'infiltration': 0.70},  # Shrubs
    {'nbsid': 1, 'lucode': 30, 'manning': 0.300, 'infiltration': 0.60},  # Grass
]
```
**Resultado**: ✅ Permitido - Diferentes LULC codes

#### Escenario Inválido: Duplicación de LULC
```python
# Intento de duplicar lucode=10 para mismo NbS
[
    {'nbsid': 1, 'lucode': 10, 'manning': 0.500, 'infiltration': 0.85},  # Ya existe
    {'nbsid': 1, 'lucode': 10, 'manning': 0.600, 'infiltration': 0.90},  # DUPLICADO!
]
```
**Resultado**: ❌ Rechazado - "LULC code 10 already exists for this NbS"

#### Validación Técnica
```python
# En models.py
class WaterproofPrLulc(models.Model):
    class Meta:
        unique_together = ('nbsid', 'lucode')
```

---

## Casos de Prueba: Validaciones Frontend

### CP-VAL-NBS-011: Validación en Tiempo Real - Manning

**Prioridad**: Media
**Tipo**: Validación Frontend
**Componente**: waterproofnbsca_create.js

#### Descripción
Verificar que el frontend valide coeficientes Manning en tiempo real antes de enviar al backend.

#### Implementación JavaScript
```javascript
// En waterproofnbsca_create.js
$('#manning_input').on('blur', function() {
    const manningValue = parseFloat($(this).val());
    const lucodeSelected = $('#lucode_select').val();

    // Rangos por LULC
    const ranges = {
        10: {min: 0.400, max: 0.800, name: 'Forest'},
        20: {min: 0.300, max: 0.600, name: 'Shrubs'},
        80: {min: 0.025, max: 0.035, name: 'Water'},
        // ... otros
    };

    const range = ranges[lucodeSelected];

    if (manningValue < range.min || manningValue > range.max) {
        showError(`Manning for ${range.name} must be between ${range.min} and ${range.max}`);
        $(this).addClass('is-invalid');
    } else {
        $(this).removeClass('is-invalid');
        hideError();
    }
});
```

#### Resultado Esperado
- Usuario ingresa valor fuera de rango
- Mensaje de error aparece inmediatamente
- Campo se marca con borde rojo
- Botón "Save" se deshabilita hasta corregir

---

### CP-VAL-NBS-012: Validación de Formato CSV - Manning/Infiltration

**Prioridad**: Media
**Tipo**: Validación de Entrada
**Componente**: createNbs View

#### Descripción
Verificar que el sistema procese correctamente las cadenas CSV de Manning e Infiltration enviadas desde el frontend.

#### Formato Esperado
```javascript
// Frontend envía como strings separados por comas
manning_values = "0.500,0.400,0.300"      // 3 valores
infiltration_values = "0.85,0.70,0.60"    // 3 valores
lulc_codes = "10,20,30"                   // 3 códigos
```

#### Procesamiento en Backend
```python
# En views.py createNbs (líneas ~123-138)
manning_str = request.POST.get('manning')  # "0.500,0.400,0.300"
infiltration_str = request.POST.get('infiltration')
lucode_str = request.POST.get('lulc_codes')

manning_list = [float(x) for x in manning_str.split(',')]
infiltration_list = [float(x) for x in infiltration_str.split(',')]
lucode_list = [int(x) for x in lucode_str.split(',')]

# Validar que tengan la misma longitud
if len(manning_list) != len(infiltration_list) != len(lucode_list):
    return JsonResponse({'error': 'Parameter count mismatch'}, status=400)

# Crear registros WaterproofPrLulc
for i in range(len(lucode_list)):
    WaterproofPrLulc.objects.create(
        nbsid=new_nbs,
        lucode_id=lucode_list[i],
        manning=manning_list[i],
        infiltration=infiltration_list[i]
    )
```

#### Casos de Error

**Longitudes no coinciden**:
```python
manning = "0.500,0.400"        # 2 valores
infiltration = "0.85,0.70,0.60"  # 3 valores
```
Response: `400 Bad Request` - "Parameter count mismatch"

**Formato inválido**:
```python
manning = "0.500,abc,0.300"  # "abc" no es número
```
Response: `400 Bad Request` - "Invalid numeric format"

---

### CP-VAL-NBS-013: Validación de Permisos - Edición por Rol

**Prioridad**: Alta
**Tipo**: Validación de Seguridad
**Componente**: editNbs View

#### Descripción
Verificar que solo el propietario del NbS o usuarios ADMIN puedan editarlo.

#### Precondiciones
```python
# NbS creado por user_analys1
nbs = WaterproofNbsCa.objects.create(
    name='Test NbS',
    added_by=user_analys1,
    # ... otros campos
)

# Usuarios de prueba
user_analys1 = Profile(role='ANALYS')  # Propietario
user_analys2 = Profile(role='ANALYS')  # Otro analista
user_admin = Profile(role='ADMIN')     # Admin
```

#### Escenarios de Prueba

**Escenario 1: Propietario edita su NbS**
- Usuario: user_analys1 (propietario)
- Acción: Editar NbS
- Resultado: ✅ Permitido

**Escenario 2: Admin edita NbS de otro usuario**
- Usuario: user_admin (ADMIN)
- Acción: Editar NbS de user_analys1
- Resultado: ✅ Permitido (ADMIN puede editar todos)

**Escenario 3: Otro analista intenta editar**
- Usuario: user_analys2 (otro ANALYS)
- Acción: Editar NbS de user_analys1
- Resultado: ❌ Prohibido - "You don't have permission to edit this NbS"

#### Validación Técnica
```python
# En views.py editNbs (línea ~370)
def editNbs(request, idx):
    nbs = get_object_or_404(WaterproofNbsCa, id=idx)
    user_profile = request.user.profile

    # Verificar permisos
    if user_profile.role != 'ADMIN' and nbs.added_by != user_profile:
        return JsonResponse({'error': 'Permission denied'}, status=403)

    # Continuar con edición...
```

---

## Matriz de Validaciones

| ID | Validación | Tipo | Ubicación | Criticidad | FastFlood |
|----|------------|------|-----------|------------|-----------|
| CP-VAL-NBS-001 | Nombre único | Backend | views.py:50 | Alta | No |
| CP-VAL-NBS-002 | Rangos Manning | Backend/Frontend | models.py, JS | **Alta ⚡** | **Sí** |
| CP-VAL-NBS-003 | Rangos Infiltration | Backend/Frontend | models.py, JS | **Alta ⚡** | **Sí** |
| CP-VAL-NBS-004 | Campos obligatorios | Backend/Frontend | models.py, JS | Alta | No |
| CP-VAL-NBS-005 | Costos no negativos | Backend | models.py | Media | No |
| CP-VAL-NBS-006 | Periodicidad positiva | Backend | models.py | Media | No |
| CP-VAL-NBS-007 | GeoJSON válido | Backend | views.py | Media | No |
| CP-VAL-NBS-008 | Shapefile completo | Backend | views.py | Media | No |
| CP-VAL-NBS-009 | Asociación NbS-Trans | Backend | models.py | Media | No |
| CP-VAL-NBS-010 | nbsid+lucode único | Backend | models.py | Media | Sí |
| CP-VAL-NBS-011 | Validación tiempo real | Frontend | JS | Media | Sí |
| CP-VAL-NBS-012 | Formato CSV | Backend | views.py:123 | Alta | Sí |
| CP-VAL-NBS-013 | Permisos edición | Backend | views.py:370 | Alta | No |

---

## Matriz de API Dinámica

| ID | Endpoint | Método | Parámetros | Retorna | Uso |
|----|----------|--------|------------|---------|-----|
| CP-API-NBS-001 | `/load-transitions/` | GET | Ninguno | Array de RiosTransition | Poblar dropdown 1 |
| CP-API-NBS-002 | `/load-activityByTransition/` | GET | `transition_id` | Array de RiosActivity | Poblar dropdown 2 (cascada) |
| CP-API-NBS-003 | `/load-transformationByActivity/` | GET | `activity_id` | Array de RiosTransformation | Poblar dropdown 3 (cascada) |

---

## Configuración de Ambiente de Pruebas

### Datos de Prueba Requeridos

#### 1. Usuarios
```python
admin_user = Profile.objects.create(
    username='admin_test',
    role='ADMIN'
)

analys_user1 = Profile.objects.create(
    username='analyst1',
    role='ANALYS'
)

analys_user2 = Profile.objects.create(
    username='analyst2',
    role='ANALYS'
)
```

#### 2. Países y Monedas
```python
usa = Countries.objects.create(
    iso='US',
    name='United States',
    currency_code='USD'
)

colombia = Countries.objects.create(
    iso='CO',
    name='Colombia',
    currency_code='COP'
)
```

#### 3. LULC Parameters
```python
lulc_forest = WaterproofPrLulcParameters.objects.create(
    lucode=10,
    description='Forest'
)

lulc_water = WaterproofPrLulcParameters.objects.create(
    lucode=80,
    description='Water'
)
```

#### 4. RIOS Hierarchy
```python
# Transition
transition = RiosTransition.objects.create(
    name='Agricultural to Forest',
    description='Convert agricultural land to forest'
)

# Activity
activity = RiosActivity.objects.create(
    transition=transition,
    name='Afforestation',
    description='Plant trees',
    lucode=lulc_forest
)

# Transformation
transformation = RiosTransformation.objects.create(
    activity=activity,
    name='Pine Plantation',
    description='Plant pine trees',
    unique_id='TRANS-001'
)
```

---

## Scripts de Prueba Automatizados

### Script 1: Validación de Manning/Infiltration

```python
from django.test import TestCase
from waterproof_nbs_ca.models import WaterproofNbsCa, WaterproofPrLulc
from django.core.exceptions import ValidationError

class TestFastFloodParameterValidation(TestCase):

    def setUp(self):
        self.nbs = WaterproofNbsCa.objects.create(name='Test NbS', ...)
        self.lucode_forest = WaterproofPrLulcParameters.objects.get(lucode=10)

    def test_manning_out_of_range_high(self):
        """Test que Manning muy alto sea rechazado"""
        param = WaterproofPrLulc(
            nbsid=self.nbs,
            lucode=self.lucode_forest,
            manning=1.500,  # Demasiado alto
            infiltration=0.75
        )

        with self.assertRaises(ValidationError):
            param.full_clean()

    def test_manning_valid_range(self):
        """Test que Manning en rango válido sea aceptado"""
        param = WaterproofPrLulc.objects.create(
            nbsid=self.nbs,
            lucode=self.lucode_forest,
            manning=0.500,  # Válido para Forest
            infiltration=0.75
        )

        self.assertEqual(param.manning, 0.500)

    def test_infiltration_out_of_range(self):
        """Test que Infiltration >1.00 sea rechazado"""
        param = WaterproofPrLulc(
            nbsid=self.nbs,
            lucode=self.lucode_forest,
            manning=0.500,
            infiltration=1.50  # >100%
        )

        with self.assertRaises(ValidationError):
            param.full_clean()
```

### Script 2: Validación de API Dinámica

```python
from django.test import TestCase, Client
from django.urls import reverse
import json

class TestDynamicAPIs(TestCase):

    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user('testuser', password='12345')
        self.client.login(username='testuser', password='12345')

        # Crear datos de prueba
        self.transition = RiosTransition.objects.create(
            name='Test Transition'
        )
        self.activity = RiosActivity.objects.create(
            transition=self.transition,
            name='Test Activity'
        )

    def test_load_all_transitions(self):
        """Test endpoint de transiciones"""
        response = self.client.get(reverse('loadAllTransitions'))

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertIn('transitions', data)
        self.assertEqual(len(data['transitions']), 1)

    def test_load_activity_by_transition(self):
        """Test endpoint de actividades por transición"""
        url = reverse('loadActivityByTransition')
        response = self.client.get(url, {'transition_id': self.transition.id})

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(len(data['activities']), 1)

    def test_load_activity_without_transition_id(self):
        """Test que falle sin transition_id"""
        url = reverse('loadActivityByTransition')
        response = self.client.get(url)

        self.assertEqual(response.status_code, 400)
```

---

## Criterios de Aceptación

### Validaciones de Datos
- ✅ 100% de validaciones de Manning/Infiltration deben funcionar
- ✅ Nombres únicos deben ser enforced
- ✅ Campos obligatorios deben ser validados
- ✅ Rangos numéricos deben ser verificados

### Validaciones de Archivos
- ✅ GeoJSON válidos deben ser procesados correctamente
- ✅ Shapefile completos deben ser aceptados
- ✅ Geometrías inválidas deben ser rechazadas

### API Dinámica
- ✅ Endpoints deben responder en < 2 segundos
- ✅ Cascading dropdowns deben funcionar correctamente
- ✅ Errores deben retornar status codes apropiados (400, 403, 404)

### Seguridad
- ✅ Permisos por rol deben ser enforced
- ✅ Solo propietario/admin pueden editar
- ✅ Usuarios no autenticados deben ser rechazados

---

## Herramientas de Testing

### Backend
- **Django TestCase**: Tests de modelos y vistas
- **pytest**: Framework de testing
- **Factory Boy**: Generación de datos de prueba
- **coverage.py**: Cobertura de código

### Frontend
- **Jest**: Tests de JavaScript
- **Selenium**: Tests end-to-end de UI
- **Postman**: Tests manuales de API

### Validación GIS
- **GDAL/OGR**: Procesamiento de Shapefile
- **django.contrib.gis.geos**: Validación de geometrías

---

## Prioridades de Implementación

### Fase 1: Validaciones Críticas FastFlood ⚡
1. CP-VAL-NBS-002: Rangos Manning
2. CP-VAL-NBS-003: Rangos Infiltration
3. CP-VAL-NBS-012: Formato CSV

### Fase 2: Validaciones de Negocio
4. CP-VAL-NBS-001: Nombre único
5. CP-VAL-NBS-004: Campos obligatorios
6. CP-VAL-NBS-013: Permisos

### Fase 3: API Dinámica
7. CP-API-NBS-001: Load transitions
8. CP-API-NBS-002: Load activities
9. CP-API-NBS-003: Load transformations

### Fase 4: Validaciones de Archivos
10. CP-VAL-NBS-007: GeoJSON
11. CP-VAL-NBS-008: Shapefile

---

## Referencias

- **Modelos**: `geonode/waterproof_nbs_ca/models.py`
- **Vistas**: `geonode/waterproof_nbs_ca/views.py`
- **JavaScript**: `geonode/waterproof_nbs_ca/static/waterproof_nbs_ca/js/waterproofnbsca_create.js`
- **URLs**: `geonode/waterproof_nbs_ca/urls.py`

---

## Historial de Cambios

| Fecha | Versión | Autor | Descripción |
|-------|---------|-------|-------------|
| 2025-12-11 | 1.0 | Claude | Creación inicial del plan de validaciones y API dinámica |

---

**Nota Importante**: Las validaciones de Manning e Infiltration (CP-VAL-NBS-002 y CP-VAL-NBS-003) son **críticas** para la correcta ejecución de análisis FastFlood. Cualquier valor fuera de rango puede causar fallos en el modelo hidrológico o resultados incorrectos.
