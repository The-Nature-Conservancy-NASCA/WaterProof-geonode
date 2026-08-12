# Plan de Pruebas - Validaciones

## Información General

**Módulo**: WaterProof FastFlood - Validaciones
**Componente**: Validaciones de datos, geometrías y reglas de negocio
**Archivos de referencia**: `views.py`, `api.py`, `models.py`

## Descripción

Este documento describe las pruebas de validación para garantizar la integridad de los datos y el cumplimiento de las reglas de negocio en la aplicación WaterProof FastFlood.

## Categorías de Validaciones

### 1. Validaciones de Modelos
- Restricciones de campos
- Valores únicos
- Relaciones obligatorias

### 2. Validaciones de Geometrías
- Topología de polígonos
- Contención espacial
- Formatos de archivo

### 3. Validaciones de Negocio
- Nombres únicos por usuario
- Permisos de edición/eliminación
- Estados de completitud

### 4. Validaciones de Datos
- Rangos numéricos
- Formatos de moneda
- Fechas válidas

---

## Casos de Prueba

### CP-VAL-001: Validación de Nombre Único - Watershed

#### Descripción
Verificar que el nombre de watershed sea único por usuario.

#### Regla de Negocio
- Un usuario NO puede tener dos watersheds con el mismo nombre
- Usuarios diferentes SÍ pueden tener watersheds con el mismo nombre

#### Casos de Prueba

**Caso 1: Crear watershed con nombre existente del mismo usuario**
```python
user1 = User.objects.get(username='user1')
Watershed.objects.create(name='Test WS', added_by=user1)
# Intentar crear otro con mismo nombre
Watershed.objects.create(name='Test WS', added_by=user1)
# Resultado esperado: Error o validación fallida
```

**Caso 2: Crear watershed con nombre existente de otro usuario**
```python
user1 = User.objects.get(username='user1')
user2 = User.objects.get(username='user2')
Watershed.objects.create(name='Test WS', added_by=user1)
Watershed.objects.create(name='Test WS', added_by=user2)
# Resultado esperado: Éxito, ambos watersheds creados
```

#### Implementación
- Validación en frontend antes de enviar
- API: `api.watershed_exist_by_name()` línea 905

#### Criterios de Aceptación
- [ ] Validación case-insensitive
- [ ] Solo aplica para mismo usuario
- [ ] Mensaje de error claro
- [ ] Permite nombres duplicados entre usuarios

---

### CP-VAL-002: Validación de Nombre Único - Study Case

#### Descripción
Verificar que el nombre de study case sea único por usuario.

#### Regla de Negocio
Idéntica a watersheds: único por usuario, permitido entre usuarios.

#### Casos de Prueba

**Caso 1: Nombre duplicado mismo usuario**
```python
user1 = User.objects.get(username='user1')
StudyCases.objects.create(name='Test SC', added_by=user1, city=city1)
# Intentar crear otro
response = api.save(request, name='Test SC', added_by=user1)
# Resultado esperado: {"id_study_case": ""}
```

**Caso 2: Nombre duplicado diferente usuario**
```python
user1 = User.objects.get(username='user1')
user2 = User.objects.get(username='user2')
StudyCases.objects.create(name='Test SC', added_by=user1, city=city1)
StudyCases.objects.create(name='Test SC', added_by=user2, city=city2)
# Resultado esperado: Ambos creados exitosamente
```

#### Implementación
- Validación en `api.save()` línea 99-102
- API de verificación: `api.studycase_exist_by_name()` línea 881

#### Criterios de Aceptación
- [ ] Validación case-insensitive (`name__iexact`)
- [ ] Retorna `id_study_case=""` si existe
- [ ] Frontend muestra mensaje apropiado

---

### CP-VAL-003: Validación de Geometría - Polígono Válido

#### Descripción
Verificar que las geometrías sean topológicamente válidas.

#### Regla de Negocio
Los polígonos deben cumplir con topología válida según OGC Simple Features.

#### Casos de Prueba

**Caso 1: Polígono Válido**
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
- Resultado: `validPolygon = true`

**Caso 2: Polígono Auto-intersectante**
```json
{
    "type": "Polygon",
    "coordinates": [[
        [-118.5, 34.0],
        [-118.0, 33.5],
        [-118.0, 34.0],
        [-118.5, 33.5],
        [-118.5, 34.0]
    ]]
}
```
- Resultado: `validPolygon = false`

**Caso 3: Anillo No Cerrado**
```json
{
    "type": "Polygon",
    "coordinates": [[
        [-118.5, 34.0],
        [-118.0, 34.0],
        [-118.0, 33.5]
    ]]
}
```
- Resultado: Error al parsear geometría

#### Implementación
- Vista: `views.validateGeometry()` línea 344
- Usa `GEOSGeometry.valid`

#### Criterios de Aceptación
- [ ] Valida usando GEOS
- [ ] Retorna boolean en JSON
- [ ] Maneja errores de parseo

---

### CP-VAL-004: Validación de Contención Espacial

#### Descripción
Verificar que el polígono delimitado esté contenido dentro del área de intake.

#### Regla de Negocio
El área delimitada debe estar completamente dentro del bounding box del watershed.

#### Casos de Prueba

**Caso 1: Polígono Contenido**
```python
intake_geom = Polygon([
    (-120, 35), (-115, 35), (-115, 30), (-120, 30), (-120, 35)
])
editable_geom = Polygon([
    (-119, 34), (-116, 34), (-116, 31), (-119, 31), (-119, 34)
])
result = intake_geom.contains(editable_geom)
# Resultado: True
```

**Caso 2: Polígono Parcialmente Fuera**
```python
intake_geom = Polygon([
    (-120, 35), (-115, 35), (-115, 30), (-120, 30), (-120, 35)
])
editable_geom = Polygon([
    (-121, 34), (-116, 34), (-116, 31), (-121, 31), (-121, 34)
])
result = intake_geom.contains(editable_geom)
# Resultado: False
```

#### Implementación
- Vista: `views.validateGeometry()` línea 387
- Usa `GEOSGeometry.contains()`

#### Criterios de Aceptación
- [ ] Usa operación espacial GEOS
- [ ] Retorna `polygonContains` boolean
- [ ] Valida antes de guardar

---

### CP-VAL-005: Validación de Formato de Archivo

#### Descripción
Verificar que los archivos de geometría sean formatos soportados.

#### Regla de Negocio
Formatos soportados: GeoJSON (.geojson) y Shapefile (.shp)

#### Casos de Prueba

**Caso 1: GeoJSON Válido**
```json
{
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[...]]
        }
    }]
}
```
- Resultado: Parseo exitoso

**Caso 2: Shapefile (procesado por backend)**
- Upload de .shp + .shx + .dbf
- Conversión a GeoJSON
- Resultado: Parseo exitoso

**Caso 3: Formato No Soportado**
```
archivo.kml
archivo.gpx
```
- Resultado: Error de formato no soportado

#### Implementación
- Frontend valida extensión
- Backend parsea con `json.loads()`
- Vista: `views.validateGeometry()` línea 357

#### Criterios de Aceptación
- [ ] Acepta GeoJSON
- [ ] Acepta Shapefile
- [ ] Rechaza otros formatos
- [ ] Mensaje de error descriptivo

---

### CP-VAL-006: Validación de Campos Requeridos - Watershed

#### Descripción
Verificar que todos los campos obligatorios estén presentes.

#### Campos Requeridos

**Paso 1 (Localización):**
- name (no vacío, max 100 caracteres)
- description (no vacío, max 1024 caracteres)
- city (ID válido)
- watershedAreaValue (número positivo)
- bboxCoors (string JSON válido)
- basinId (entero)

**Paso 2 (DEM):**
- demValue (uno de: 20, 40, 150, 300, 600)

**Paso 3 (Área NbS):**
- delimitArea (GeoJSON válido)
- watershedAreaPolygon (geometría)

#### Casos de Prueba

**Caso 1: Todos los campos presentes**
- Resultado: Éxito

**Caso 2: Campo name vacío**
```python
data = {
    'watershedName': '',
    'watershedDesc': 'Desc',
    'watershedCity': 1
}
# Resultado: Error de validación
```

**Caso 3: demValue inválido**
```python
data = {
    'demValue': 100  # No está en lista permitida
}
# Resultado: Error de validación
```

#### Criterios de Aceptación
- [ ] Valida presencia de campos
- [ ] Valida tipos de datos
- [ ] Valida rangos/opciones
- [ ] Retorna errores descriptivos

---

### CP-VAL-007: Validación de Campos Requeridos - Study Case

#### Descripción
Verificar campos obligatorios en cada paso de creación de study case.

#### Campos Requeridos por Paso

**Paso 1 (Definición):**
- name (único por usuario)
- description (max 500)
- city_id (válido)
- watersheds[] (al menos 1)

**Paso 2 (Mercado de Carbono):**
- carbon_market (true/false)
- Si true: carbon_market_value, carbon_market_currency

**Paso 3 (Portafolios):**
- portfolios[] (puede estar vacío)

**Paso 4 (Parámetros de Modelado):**
- ocean_elevation (decimal)
- commercial_value (0-100)
- industrial_value (0-100)
- exponential_parameters (0 o 1)
- damage_currency (código válido)
- exchange_rate (> 0)

**Paso 5 (Parámetros Financieros):**
- Todos los campos de costos
- discount rate (0-100)
- financial_currency

**Paso 6 (Actividades NbS):**
- nbs[] (al menos 1)

**Paso 7 (Parámetros de Análisis):**
- analysis_type (1 o 2)
- analysis_currency
- period_analysis (> 0)
- change_year (en lista permitida)
- storm_duration (en lista permitida)
- quantile (en lista permitida)

#### Criterios de Aceptación
- [ ] Valida en cada paso
- [ ] No permite avanzar sin completar
- [ ] Mensajes claros por campo

---

### CP-VAL-008: Validación de Rangos Numéricos

#### Descripción
Verificar que los valores numéricos estén en rangos válidos.

#### Rangos Definidos

| Campo | Mínimo | Máximo | Tipo |
|-------|--------|--------|------|
| ocean_elevation | -10.00 | 10.00 | Decimal(4,2) |
| commercial_value | 0 | 100 | Integer (%) |
| industrial_value | 0 | 100 | Integer (%) |
| discount_rate | 0.00 | 100.00 | Decimal(5,2) |
| channel_manning | 0.01 | 1.00 | Decimal |
| width_mul | 0 | ∞ | Decimal |
| width_exp | 0 | ∞ | Decimal |
| depth_mul | 0 | ∞ | Decimal |
| depth_exp | 0 | ∞ | Decimal |
| min_cross | 0 | ∞ | Decimal |

#### Validaciones Especiales

**Suma de Porcentajes:**
```python
commercial_value + industrial_value <= 100
```

**Años Permitidos:**
```python
change_year in [2030, 2040, 2050, 2060, 2070, 2080, 2090, 2100]
```

**Duración de Tormenta:**
```python
storm_duration in [3, 6, 12, 24, 48, 72, 120, 240]  # horas
```

**Cuantiles:**
```python
quantile in [15, 50, 85, 'N/A']
```

#### Criterios de Aceptación
- [ ] Frontend valida antes de enviar
- [ ] Backend valida en API
- [ ] Mensajes de error específicos por campo

---

### CP-VAL-009: Validación de Monedas

#### Descripción
Verificar que los códigos de moneda sean válidos.

#### Regla de Negocio
- Código de moneda debe existir en tabla Countries
- Exchange rate debe ser > 0
- Monedas consistentes en todo el study case

#### Casos de Prueba

**Caso 1: Moneda Válida**
```python
currency = "USD"
exists = Countries.objects.filter(currency=currency).exists()
# Resultado: True
```

**Caso 2: Moneda Inválida**
```python
currency = "XXX"
exists = Countries.objects.filter(currency=currency).exists()
# Resultado: False
```

**Caso 3: Exchange Rate Válido**
```python
exchange_rate = 1.25
# Resultado: Válido (> 0)
```

**Caso 4: Exchange Rate Inválido**
```python
exchange_rate = 0
# Resultado: Inválido (<= 0)
```

#### Criterios de Aceptación
- [ ] Validación contra tabla Countries
- [ ] Exchange rate positivo
- [ ] Dropdown con monedas válidas en UI

---

### CP-VAL-010: Validación de Permisos - Edición

#### Descripción
Verificar que solo usuarios autorizados puedan editar recursos.

#### Reglas de Negocio

**Watershed:**
- Propietario puede editar
- Admin puede editar cualquiera
- Otros usuarios NO pueden editar

**Study Case:**
- Propietario puede editar
- Admin puede editar cualquiera
- Otros usuarios NO pueden editar

#### Casos de Prueba

**Caso 1: Propietario edita su watershed**
```python
user = watershed.added_by
# Login como user
# Resultado: Permitido
```

**Caso 2: Usuario diferente intenta editar**
```python
user1 = watershed.added_by
user2 = otro_usuario
# Login como user2
# Intentar editar watershed de user1
# Resultado: Prohibido (403)
```

**Caso 3: Admin edita cualquier watershed**
```python
admin_user.professional_role = 'ADMIN'
# Login como admin
# Editar watershed de cualquier usuario
# Resultado: Permitido
```

#### Implementación
- Verificar en vistas antes de procesar
- Comparar `request.user` con `resource.added_by`
- Verificar `request.user.professional_role == 'ADMIN'`

#### Criterios de Aceptación
- [ ] Validación en backend (no solo frontend)
- [ ] Código de error HTTP apropiado (403)
- [ ] Mensaje de error descriptivo
- [ ] Log de intento no autorizado

---

### CP-VAL-011: Validación de Permisos - Eliminación

#### Descripción
Verificar permisos de eliminación y restricciones de integridad referencial.

#### Reglas de Negocio

**Watershed:**
- Solo propietario o admin pueden eliminar
- NO se puede eliminar si tiene study cases asociados

**Study Case:**
- Solo propietario o admin pueden eliminar
- Eliminación en cascada de datos relacionados

#### Casos de Prueba

**Caso 1: Eliminar watershed sin study cases**
```python
watershed.study_cases.count() == 0
# Resultado: Permitido
```

**Caso 2: Eliminar watershed con study cases**
```python
watershed.study_cases.count() > 0
# Resultado: Prohibido, mensaje de error
```

**Caso 3: Verificar cascade en study case**
```python
study_case.delete()
# Verificar eliminación de:
# - StudyCases_NBS_Fastflood
# - StudyCases_Parameters_Bio
# - StudyCase_damage_curve
# - StudyCase_depth_damage
```

#### Implementación
- API watershed: `api.watershedUsedByStudyCases()` línea 23
- Frontend verifica antes de confirmar eliminación
- Backend valida antes de DELETE

#### Criterios de Aceptación
- [ ] Validación de integridad referencial
- [ ] Mensaje explicativo si hay dependencias
- [ ] Confirmación explícita del usuario
- [ ] Log de eliminación

---

### CP-VAL-012: Validación de Estados

#### Descripción
Verificar transiciones válidas de estado.

#### Estados del Watershed
- `is_complete = False`: En creación (pasos 1-2)
- `is_complete = True`: Completo (paso 3 finalizado)

#### Estados del Study Case
- `is_complete = False`: En configuración
- `is_complete = True`: Configuración completa
- `is_run_analysis = False`: No ejecutado
- `is_run_analysis = True`: Análisis en ejecución/ejecutado
- `is_public = False`: Privado
- `is_public = True`: Público

#### Transiciones Válidas

**Watershed:**
```
Incompleto → Completo (al terminar paso 3)
Completo → Editable (cualquier momento)
```

**Study Case:**
```
Incompleto → Completo (al terminar paso 7)
Completo → Listo para ejecutar
Privado ⇄ Público (toggle por propietario/admin)
```

#### Validaciones

1. No ejecutar análisis si `is_complete = False`
2. No usar watershed si `is_complete = False`
3. Solo propietario/admin pueden cambiar visibilidad

#### Criterios de Aceptación
- [ ] Estados reflejan workflow correctamente
- [ ] Transiciones validadas en backend
- [ ] UI deshabilita acciones según estado

---

### CP-VAL-013: Validación de Fechas

#### Descripción
Verificar manejo correcto de fechas.

#### Reglas

**Fechas Automáticas:**
- `creation_date`: Set al crear
- `updated_date`: Auto-update (auto_now=True)
- `delimitation_date`: Set en paso 3 de watershed
- `edit_date`: Update manual en cada edición

**Validaciones:**
- `updated_date >= creation_date`
- `edit_date >= create_date`

#### Casos de Prueba

**Caso 1: Creación**
```python
watershed = Watershed.objects.create(...)
assert watershed.creation_date is not None
assert watershed.updated_date is not None
```

**Caso 2: Actualización**
```python
old_date = watershed.updated_date
time.sleep(1)
watershed.name = "Updated"
watershed.save()
assert watershed.updated_date > old_date
```

#### Criterios de Aceptación
- [ ] Fechas en UTC
- [ ] Formato ISO 8601
- [ ] Timezone-aware

---

## Validaciones de JavaScript (Frontend)

### V-JS-001: Validación en Tiempo Real

#### Formularios con Validación Inmediata
- Nombre único (check al blur)
- Email formato válido
- Campos numéricos (solo números)
- Rangos de valores

#### Implementación
- Archivos: `watershed_create.js`, `study_cases_create_ws.js`
- Eventos: `onblur`, `onchange`, `oninput`

---

### V-JS-002: Validación de Wizard

#### Pasos del Wizard
- No permitir avanzar sin completar paso actual
- Validar antes de `$('#smartwizard').smartWizard('next')`
- Indicadores visuales de completitud

---

## Matriz de Validaciones

| Validación | Ubicación | Tipo | Crítica |
|------------|-----------|------|---------|
| Nombre único watershed | API | Negocio | Alta |
| Nombre único study case | API | Negocio | Alta |
| Geometría válida | Vista | GIS | Alta |
| Contención espacial | Vista | GIS | Alta |
| Formato archivo | Vista | Formato | Media |
| Campos requeridos | Frontend/API | Datos | Alta |
| Rangos numéricos | Frontend/API | Datos | Media |
| Moneda válida | API | Datos | Media |
| Permisos edición | Vista | Seguridad | Alta |
| Permisos eliminación | API | Seguridad | Alta |
| Estados workflow | API | Negocio | Alta |
| Integridad referencial | API | Negocio | Alta |

---

## Scripts de Prueba Recomendados

```python
# test_validations.py
from django.test import TestCase
from django.contrib.gis.geos import Polygon, GEOSGeometry
from geonode.waterproof_fastflood.models import Watershed, StudyCases

class ValidationTests(TestCase):

    def test_unique_name_per_user(self):
        """Watershed name debe ser único por usuario"""
        user1 = User.objects.create(username='user1')
        user2 = User.objects.create(username='user2')

        # User1 crea watershed
        ws1 = Watershed.objects.create(
            name='Test',
            added_by=user1,
            city=self.city,
            demvalue=150
        )

        # User2 puede crear con mismo nombre
        ws2 = Watershed.objects.create(
            name='Test',
            added_by=user2,
            city=self.city,
            demvalue=150
        )

        self.assertNotEqual(ws1.id, ws2.id)

    def test_geometry_validation(self):
        """Polígono debe ser válido topológicamente"""
        # Polígono válido
        valid_poly = Polygon((
            (-118, 34), (-117, 34), (-117, 33), (-118, 33), (-118, 34)
        ))
        self.assertTrue(valid_poly.valid)

        # Polígono auto-intersectante
        invalid_coords = (
            (-118, 34), (-117, 33), (-117, 34), (-118, 33), (-118, 34)
        )
        invalid_poly = Polygon(invalid_coords)
        self.assertFalse(invalid_poly.valid)

    def test_contains_validation(self):
        """Polígono debe estar contenido en bounding box"""
        bbox = Polygon((
            (-120, 35), (-115, 35), (-115, 30), (-120, 30), (-120, 35)
        ))

        # Polígono contenido
        inner = Polygon((
            (-119, 34), (-116, 34), (-116, 31), (-119, 31), (-119, 34)
        ))
        self.assertTrue(bbox.contains(inner))

        # Polígono fuera
        outer = Polygon((
            (-121, 34), (-116, 34), (-116, 31), (-121, 31), (-121, 34)
        ))
        self.assertFalse(bbox.contains(outer))

    def test_percentage_sum_validation(self):
        """commercial_value + industrial_value debe ser <= 100"""
        sc = StudyCases.objects.create(...)
        sc.commercial_value = 60
        sc.industrial_value = 50

        # Validación debería fallar
        total = sc.commercial_value + sc.industrial_value
        self.assertLessEqual(total, 100)
```

---

## Referencias

- **Validaciones de geometría**: `views.validateGeometry()` línea 344
- **Validaciones de negocio**: `api.save()` línea 78
- **Validaciones de existencia**: `api.studycase_exist_by_name()`, `api.watershed_exist_by_name()`
- **JavaScript**: `geonode/waterproof_fastflood/static/waterproof_fastflood/js/`
