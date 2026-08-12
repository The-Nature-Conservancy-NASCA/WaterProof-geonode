# Plan de Pruebas - Watershed CRUD

## Información General

**Módulo**: WaterProof FastFlood - Watershed Management
**Componente**: Gestión de Cuencas Hidrográficas (Watersheds)
**Archivo de referencia**: `geonode/waterproof_fastflood/views.py`, `models.py`
**URLs**: Definidas en `geonode/waterproof_fastflood/urls.py`

## Descripción del Componente

El componente Watershed gestiona cuencas hidrográficas con las siguientes características:
- Creación multi-paso (3 pasos: Localización, DEM, Área NbS)
- Operaciones CRUD completas
- Asociación con ciudades y polígonos geográficos
- Validación de geometrías
- Control de acceso basado en roles

## Modelos Involucrados

### Watershed
```python
- name: CharField (max 100 caracteres)
- description: CharField (max 1024 caracteres)
- city: ForeignKey a Cities
- ws_area: FloatField (área)
- is_complete: BooleanField
- creation_date: DateField
- updated_date: DateField (auto)
- demvalue: IntegerField (resolución DEM)
- added_by: ForeignKey a User
```

### Polygon
```python
- area: FloatField
- geom: PolygonField (SRID 4326)
- geom_watershed: TextField
- delimitation_date: DateField (auto)
- watershed: ForeignKey a Watershed
- bbox: TextField (bounding box)
- resolution: IntegerField
- basin_id: IntegerField
```

## URLs a Probar

| URL | Método | Vista | Descripción |
|-----|--------|-------|-------------|
| `/` | GET | `listWatershed` | Lista de watersheds |
| `/create/` | GET/POST | `createWatershed` | Crear watershed |
| `/view/<int:idx>` | GET | `viewWatershed` | Ver detalles |
| `/edit/<int:idx>` | GET | `editWatershed` | Editar watershed |
| `/clone/<int:idx>` | GET | `cloneWatershed` | Clonar watershed |
| `/delete/<int:idx>` | POST | `deleteWatershed` | Eliminar watershed |
| `/validateGeometry/` | POST | `validateGeometry` | Validar geometría |

## Casos de Prueba

### CP-WS-001: Listar Watersheds

#### Descripción
Verificar que la lista de watersheds se muestre correctamente según los permisos del usuario.

#### Pre-condiciones
- Existen watersheds en la base de datos
- Usuario autenticado con diferentes roles

#### Datos de Prueba

| Usuario | Rol | Watersheds Esperados |
|---------|-----|---------------------|
| admin_user | ADMIN | Todos los watersheds |
| analyst_user | ANALYS | Solo sus watersheds |
| public_user | No autenticado | Lista vacía |

#### Pasos
1. Autenticar usuario según el caso
2. Navegar a `/` (list-watershed)
3. Verificar watersheds mostrados

#### Resultado Esperado
- **Admin**: Ve todos los watersheds del sistema
- **Analista**: Ve solo watersheds creados por él
- **Público**: Ve lista vacía o mensaje de login

#### Criterios de Aceptación
- [ ] La lista se carga sin errores
- [ ] Se aplican correctamente los filtros de permisos
- [ ] Se muestra información correcta: nombre, ciudad, área, estado
- [ ] Los geometrías se renderizan en el mapa
- [ ] Template: `watershed_list.html`

---

### CP-WS-002: Crear Watershed - Paso 1 (Localización)

#### Descripción
Verificar la creación del paso 1 con información básica del watershed.

#### Pre-condiciones
- Usuario autenticado
- Ciudades disponibles en la base de datos

#### Datos de Entrada

| Campo | Valor Válido | Valor Inválido |
|-------|-------------|----------------|
| watershedName | "Test Watershed 001" | "" (vacío) |
| watershedDesc | "Descripción de prueba" | "" (vacío) |
| watershedCity | ID de ciudad válida | ID inexistente |
| watershedAreaValue | 1500.50 | "abc" (texto) |
| bboxCoors | "[[-10,10],[10,-10]]" | "invalid" |
| basinId | 123 | null |

#### Pasos
1. Autenticar usuario
2. Navegar a `/create/`
3. Completar formulario del paso 1
4. Enviar POST con `step=1`
5. Verificar respuesta JSON

#### Resultado Esperado - Caso Válido
```json
{
    "status": "200",
    "watershedId": <id_generado>,
    "message": "Success"
}
```

#### Resultado Esperado - Caso Inválido
```json
{
    "status": "400",
    "message": "Error saving watershed"
}
```

#### Criterios de Aceptación
- [ ] Se crea registro en tabla `Watershed`
- [ ] Se crea registro en tabla `Polygon`
- [ ] `is_complete = False`
- [ ] Se asigna `added_by` al usuario actual
- [ ] Se generan fechas de creación automáticamente
- [ ] Vista: `views.createStepOne()` línea 191

---

### CP-WS-003: Crear Watershed - Paso 2 (DEM)

#### Descripción
Verificar la selección de resolución DEM para el watershed.

#### Pre-condiciones
- Watershed creado en paso 1
- ID de watershed válido

#### Datos de Entrada

| Campo | Valores Válidos | Valores Inválidos |
|-------|----------------|------------------|
| watershedId | ID existente | ID inexistente |
| demValue | 20, 40, 150, 300, 600 | 0, -1, 1000 |

#### Pasos
1. Completar paso 1
2. Enviar POST con `step=2`
3. Incluir `watershedId` y `demValue`
4. Verificar actualización

#### Resultado Esperado
- Watershed actualizado con `demvalue`
- Polygon actualizado con `resolution`
- Status 200 con watershedId

#### Criterios de Aceptación
- [ ] Campo `demvalue` actualizado en Watershed
- [ ] Campo `resolution` actualizado en Polygon
- [ ] Valores permitidos: 20, 40, 150, 300, 600
- [ ] Vista: `views.createStepTwo()` línea 271

---

### CP-WS-004: Crear Watershed - Paso 3 (Área NbS)

#### Descripción
Verificar la delimitación del área de NbS mediante polígono.

#### Pre-condiciones
- Watershed con pasos 1 y 2 completados
- Geometría válida (GeoJSON o Shapefile)

#### Datos de Entrada

**Opción 1: Archivo GeoJSON**
```json
{
    "features": [{
        "geometry": {
            "type": "Polygon",
            "coordinates": [[[-10, 10], [10, 10], [10, -10], [-10, -10], [-10, 10]]]
        }
    }]
}
```

**Opción 2: Delimitación Manual**
```json
{
    "geometry": {
        "type": "Polygon",
        "coordinates": [[...]]
    }
}
```

#### Pasos
1. Completar pasos 1 y 2
2. Enviar POST con `step=3`
3. Incluir:
   - `watershedId`
   - `delimitArea` (GeoJSON string)
   - `isFile` (true/false)
   - `typeDelimit` (geojson/shp)
   - `watershedAreaPolygon` (geometría del área)

#### Resultado Esperado
- Polygon actualizado con `geom` y `geom_watershed`
- Watershed marcado como `is_complete = True`
- `delimitation_date` actualizado

#### Criterios de Aceptación
- [ ] Geometría válida guardada en `geom`
- [ ] `geom_watershed` guardado correctamente
- [ ] `is_complete = True`
- [ ] Fecha de delimitación registrada
- [ ] Vista: `views.createStepThree()` línea 289
- [ ] Acepta formatos: GeoJSON, Shapefile

---

### CP-WS-005: Editar Watershed - Paso 1

#### Descripción
Verificar la edición de información básica de un watershed existente.

#### Pre-condiciones
- Watershed existente creado por el usuario
- Usuario autenticado

#### Datos de Entrada

| Campo | Valor Original | Valor Actualizado |
|-------|---------------|-------------------|
| watershedName | "Watershed A" | "Watershed A - Updated" |
| watershedDesc | "Desc A" | "Descripción actualizada" |
| watershedCity | Ciudad 1 | Ciudad 2 |

#### Pasos
1. Autenticar como propietario del watershed
2. Navegar a `/edit/<watershed_id>`
3. Modificar campos del paso 1
4. Enviar POST con `step=1` y `edit=true`
5. Verificar actualización

#### Resultado Esperado
- Registro actualizado en base de datos
- `updated_date` actualizado automáticamente
- Respuesta exitosa con watershedId

#### Criterios de Aceptación
- [ ] Solo el propietario puede editar
- [ ] Campos actualizados correctamente
- [ ] `updated_date` se actualiza automáticamente
- [ ] No se crea nuevo registro
- [ ] Vista: `views.createStepOne()` línea 241

---

### CP-WS-006: Ver Watershed

#### Descripción
Verificar la visualización de detalles de un watershed.

#### Pre-condiciones
- Watershed completo existente
- Usuario con permisos de lectura

#### Pasos
1. Navegar a `/view/<watershed_id>`
2. Verificar información mostrada

#### Resultado Esperado
- Template `watershed_view.html` renderizado
- Información completa del watershed:
  - Nombre, descripción
  - Ciudad asociada
  - Área
  - Valor DEM
  - Geometría en mapa
  - Fecha de creación

#### Criterios de Aceptación
- [ ] Toda la información se muestra correctamente
- [ ] Geometría renderizada en mapa Leaflet
- [ ] Bounding box correcto
- [ ] Información de resolución DEM
- [ ] Vista: `views.viewWatershed()` línea 458
- [ ] Template: `watershed_view.html`

---

### CP-WS-007: Clonar Watershed

#### Descripción
Verificar la clonación de un watershed existente.

#### Pre-condiciones
- Watershed fuente completo
- Usuario autenticado

#### Pasos
1. Navegar a `/clone/<watershed_id>`
2. Verificar que se carga formulario con datos del watershed original
3. Modificar nombre (debe ser único)
4. Completar proceso de creación

#### Resultado Esperado
- Formulario pre-poblado con datos del watershed original
- Permite modificar todos los campos
- Al guardar, crea nuevo watershed (no sobrescribe original)
- Nuevo watershed asociado al usuario actual

#### Criterios de Aceptación
- [ ] Datos originales cargados en formulario
- [ ] Geometría original mostrada en mapa
- [ ] Se requiere nombre único
- [ ] `added_by` es el usuario actual (no el original)
- [ ] Vista: `views.cloneWatershed()` línea 506
- [ ] Template: `watershed_clone.html`

---

### CP-WS-008: Eliminar Watershed

#### Descripción
Verificar la eliminación de un watershed.

#### Pre-condiciones
- Watershed existente
- Usuario propietario o admin
- Watershed NO usado en Study Cases

#### Pasos
1. Autenticar como propietario
2. Enviar POST a `/delete/<watershed_id>`
3. Verificar eliminación

#### Resultado Esperado - Sin Study Cases asociados
```json
{
    "status": "200",
    "reason": "success"
}
```

#### Resultado Esperado - Con Study Cases
- Error indicando que no se puede eliminar
- Referencia a Study Cases que lo usan

#### Criterios de Aceptación
- [ ] Solo propietario o admin pueden eliminar
- [ ] Eliminación en cascada de Polygon asociado
- [ ] Validar que no existan Study Cases asociados
- [ ] Vista: `views.deleteWatershed()` línea 530
- [ ] API: `api.watershedUsedByStudyCases()` línea 23

---

### CP-WS-009: Validar Geometría

#### Descripción
Verificar la validación de geometrías antes de guardar.

#### Pre-condiciones
- Geometría editable (polygon)
- Geometría de intake (bounding)

#### Datos de Prueba

**Caso 1: Geometría Válida y Contenida**
- Polígono editable válido
- Contenido dentro del intake

**Caso 2: Geometría Válida pero NO Contenida**
- Polígono válido
- Fuera del área de intake

**Caso 3: Geometría Inválida**
- Polígono auto-intersectante
- Coordenadas inválidas

#### Pasos
1. Enviar POST a `/validateGeometry/`
2. Incluir:
   - `editablePolygon`: GeoJSON del polígono a validar
   - `intakePolygon`: GeoJSON del área de intake
   - `isFile`: true/false
   - `typeDelimit`: geojson/shp

#### Resultado Esperado

**Caso 1:**
```json
{
    "validPolygon": true,
    "polygonContains": true
}
```

**Caso 2:**
```json
{
    "validPolygon": true,
    "polygonContains": false
}
```

**Caso 3:**
```json
{
    "validPolygon": false,
    "polygonContains": false
}
```

#### Criterios de Aceptación
- [ ] Valida geometría usando GEOS
- [ ] Verifica contención espacial
- [ ] Soporta GeoJSON y Shapefile
- [ ] Vista: `views.validateGeometry()` línea 344

---

### CP-WS-010: Filtrar Watersheds por Ciudad

#### Descripción
Verificar el filtrado de watersheds por ciudad.

#### Pre-condiciones
- Múltiples watersheds en diferentes ciudades
- Usuario autenticado

#### Datos de Prueba
- Ciudad A: 3 watersheds
- Ciudad B: 2 watersheds
- Ciudad C: 0 watersheds

#### Pasos
1. Navegar a `/?city=<city_id>`
2. Verificar watersheds filtrados

#### Resultado Esperado
- Solo watersheds de la ciudad seleccionada
- Respeta permisos de usuario
- Lista vacía si no hay watersheds en esa ciudad

#### Criterios de Aceptación
- [ ] Filtro por ciudad funciona
- [ ] Se mantienen permisos de usuario
- [ ] Vista: `views.listWatershed()` línea 153
- [ ] Parámetro GET: `city`

---

## Casos de Prueba de Permisos

### CP-WS-P001: Usuario No Autenticado

#### Escenarios
1. Intentar crear watershed
2. Intentar editar watershed
3. Intentar eliminar watershed

#### Resultado Esperado
- Redirección a login
- Mensaje de error de autenticación

---

### CP-WS-P002: Usuario ADMIN

#### Escenarios
1. Ver todos los watersheds
2. Editar cualquier watershed
3. Eliminar cualquier watershed

#### Resultado Esperado
- Acceso completo a todas las operaciones
- Vista: `views.watersheds()` línea 400

---

### CP-WS-P003: Usuario ANALYS

#### Escenarios
1. Ver solo sus watersheds
2. Editar solo sus watersheds
3. Eliminar solo sus watersheds

#### Resultado Esperado
- Acceso limitado a sus propios registros
- Vista: `views.watersheds()` línea 419

---

## Casos de Prueba de Integración

### CP-WS-I001: Creación Completa de Watershed

#### Descripción
Prueba end-to-end de creación de watershed.

#### Pasos
1. Completar Paso 1 (Localización)
2. Completar Paso 2 (DEM)
3. Completar Paso 3 (Área NbS)
4. Verificar registro completo

#### Criterios de Aceptación
- [ ] Watershed creado con `is_complete = True`
- [ ] Polygon asociado con geometría
- [ ] Visible en lista de watersheds
- [ ] Disponible para uso en Study Cases

---

### CP-WS-I002: Flujo de Edición Completo

#### Descripción
Editar un watershed existente en todos sus pasos.

#### Pasos
1. Editar información básica (Paso 1)
2. Cambiar resolución DEM (Paso 2)
3. Actualizar geometría (Paso 3)
4. Verificar cambios

#### Criterios de Aceptación
- [ ] Todos los cambios guardados correctamente
- [ ] `updated_date` actualizado
- [ ] No se crean registros duplicados

---

## Datos de Prueba

### Usuarios
```python
# Admin User
username: admin_test
role: ADMIN
country: USA

# Analyst User
username: analyst_test
role: ANALYS
country: USA

# Copartner User
username: copartner_test
role: COPART
country: MEX
```

### Ciudades
```python
# Ciudad 1
name: "New York"
country: USA
id: 1

# Ciudad 2
name: "Los Angeles"
country: USA
id: 2

# Ciudad 3
name: "Ciudad de México"
country: MEX
id: 3
```

### Geometrías de Prueba

**Polígono Válido (GeoJSON)**
```json
{
    "type": "Polygon",
    "coordinates": [[
        [-118.5, 34.0],
        [-118.0, 34.0],
        [-118.0, 33.5],
        [-118.5, 33.5],
        [-118.5, 34.0]
    ]]
}
```

**Bounding Box**
```json
[[-118.5, 33.5], [-118.0, 34.0]]
```

---

## Matriz de Trazabilidad

| ID Caso | Requisito | Vista | Template | Prioridad |
|---------|-----------|-------|----------|-----------|
| CP-WS-001 | Listar watersheds | listWatershed | watershed_list.html | Alta |
| CP-WS-002 | Crear paso 1 | createStepOne | watershed_create.html | Alta |
| CP-WS-003 | Crear paso 2 | createStepTwo | watershed_create.html | Alta |
| CP-WS-004 | Crear paso 3 | createStepThree | watershed_create.html | Alta |
| CP-WS-005 | Editar paso 1 | createStepOne (edit) | watershed_edit.html | Media |
| CP-WS-006 | Ver watershed | viewWatershed | watershed_view.html | Media |
| CP-WS-007 | Clonar watershed | cloneWatershed | watershed_clone.html | Media |
| CP-WS-008 | Eliminar watershed | deleteWatershed | - | Alta |
| CP-WS-009 | Validar geometría | validateGeometry | - | Alta |
| CP-WS-010 | Filtrar por ciudad | listWatershed | watershed_list.html | Baja |

---

## Notas de Implementación

### Consideraciones Especiales

1. **Geometrías GIS**
   - Usar `django.contrib.gis.geos.GEOSGeometry`
   - SRID 4326 (WGS84)
   - Validar topología con `.valid`

2. **Manejo de Fechas**
   - `creation_date`: Manual en creación
   - `updated_date`: Auto con `auto_now=True`
   - `delimitation_date`: Auto en paso 3

3. **Archivos Soportados**
   - GeoJSON (.geojson)
   - Shapefile (.shp + .shx + .dbf)

4. **Resoluciones DEM Permitidas**
   - 20m (10048x8526px, 209.1 MB)
   - 40m (5024x4263px, 56.7 MB)
   - 150m (1256x1065px, 4.5 MB)
   - 300m (628x532px, 1.8 MB)
   - 600m (314x266px, 0.6 MB)

### Scripts de Prueba Recomendados

```python
# test_watershed_crud.py
from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from geonode.waterproof_fastflood.models import Watershed, Polygon
from geonode.waterproof_parameters.models import Cities

class WatershedCRUDTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = get_user_model().objects.create_user(
            username='testuser',
            password='testpass',
            professional_role='ANALYS'
        )
        self.city = Cities.objects.create(
            name='Test City',
            country_id=1
        )

    def test_create_watershed_step1_success(self):
        self.client.login(username='testuser', password='testpass')
        response = self.client.post('/create/', {
            'step': '1',
            'edit': 'false',
            'watershedName': 'Test Watershed',
            'watershedDesc': 'Test Description',
            'watershedCity': self.city.id,
            'watershedAreaValue': '1500.50',
            'bboxCoors': '[[-10,10],[10,-10]]',
            'basinId': '123'
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['status'], '200')
        self.assertIn('watershedId', data)
```

---

## Referencias

- **Código fuente**: `geonode/waterproof_fastflood/`
- **Modelos**: Líneas 10-93 en `models.py`
- **Vistas**: `views.py`
- **URLs**: Líneas 7-13 en `urls.py`
- **Templates**: `geonode/templates/waterproof_fastflood/watershed_*.html`
