# Planes de Prueba - WaterProof NbS CA (Nature-based Solutions)

## Descripción

Este directorio contiene los planes de prueba completos para el módulo **WaterProof NbS CA (Soluciones basadas en la Naturaleza)** de la aplicación GeoNode. Los planes están organizados por categorías y enfatizan especialmente la **integración crítica con FastFlood** a través de los coeficientes Manning e Infiltration.

## Estructura de Documentos

### 📋 [00_overview.md](00_overview.md)
**Resumen General del Módulo NbS**

Documento maestro que proporciona:
- Visión general del módulo NbS
- Modelos principales y sus relaciones
- Integración con FastFlood (CRÍTICA ⚡)
- Estructura de archivos y componentes
- URLs a probar
- Flujo de uso en FastFlood
- Datos de prueba recomendados
- Convenciones de nomenclatura

**Leer primero** para entender el contexto del módulo NbS.

**Modelos clave documentados**:
- `WaterproofNbsCa`: Modelo principal de NbS
- `WaterproofPrLulc`: **CRÍTICO** - Almacena parámetros FastFlood (Manning, Infiltration)
- `RiosTransition`, `RiosActivity`, `RiosTransformation`: Jerarquía RIOS
- `ActivityShapefile`: Áreas geográficas de actividad

---

### 🔧 [01_nbs_crud_test_plan.md](01_nbs_crud_test_plan.md)
**Pruebas CRUD de NbS**

Cubre:
- **CP-NBS-001 a CP-NBS-013**: Casos de prueba principales

**Operaciones CRUD**:
1. **CP-NBS-001**: Listar NbS (con filtros por rol)
2. **CP-NBS-002**: Ver detalles de NbS
3. **CP-NBS-003**: Crear NbS con parámetros FastFlood ⚡ (CRÍTICO)
4. **CP-NBS-004**: Crear NbS con múltiples LULC codes
5. **CP-NBS-005**: Crear NbS con transformaciones RIOS
6. **CP-NBS-006**: Crear NbS con Activity Shapefile (GeoJSON)
7. **CP-NBS-007**: Editar NbS básico
8. **CP-NBS-008**: Editar parámetros FastFlood ⚡ (CRÍTICO)
9. **CP-NBS-009**: Editar transformaciones RIOS
10. **CP-NBS-010**: Clonar NbS (incluyendo parámetros FastFlood)
11. **CP-NBS-011**: Eliminar NbS (cascade delete)
12. **CP-NBS-012**: Verificar permisos por rol (ADMIN vs ANALYS)
13. **CP-NBS-013**: Validar nombre único por usuario

**Casos especiales**:
- **CP-NBS-P001 a CP-NBS-P003**: Pruebas de permisos
- **CP-NBS-I001 a CP-NBS-I002**: Pruebas de integración

**Vistas cubiertas**:
- `createNbs` (views.py:27)
- `editNbs` (views.py:355)
- `cloneNbs` (views.py:561)
- `deleteNbs` (views.py:785)
- `listNbs` (views.py:191)
- `viewNbs`

**Prioridad**: Alta ⚡ - Especialmente CP-NBS-003 y CP-NBS-008 (parámetros FastFlood)

---

### 🔗 [02_nbs_fastflood_integration_test_plan.md](02_nbs_fastflood_integration_test_plan.md)
**Pruebas de Integración con FastFlood**

Cubre:
- **CP-INT-NBS-001 a CP-INT-NBS-007**: Casos de integración

**Flujos de integración**:

1. **CP-INT-NBS-001**: Crear NbS y verificar disponibilidad en Study Case
   - Crear NbS en módulo NbS
   - Navegar a FastFlood Study Case
   - Verificar NbS aparece en Step 6
   - Duración: 5-10 minutos

2. **CP-INT-NBS-002**: Asociar NbS a Study Case
   - Seleccionar NbS en wizard de Study Case
   - Verificar asociación en tabla `StudyCases_NBS_Fastflood`
   - Duración: 3-5 minutos

3. **CP-INT-NBS-003**: Generar JSON con Manning/Infiltration ⚡ **CRÍTICO**
   - Ejecutar `getNbsJson()` en FastFlood API
   - Verificar estructura JSON correcta
   - Validar valores de Manning e Infiltration
   - Duración: 2-3 minutos
   - **Este es el test más crítico de la integración**

4. **CP-INT-NBS-004**: Ejecutar análisis FastFlood con NbS
   - Generar JSON completo
   - Ejecutar modelo FastFlood
   - Verificar que análisis se complete sin errores
   - Duración: 10-60 minutos

5. **CP-INT-NBS-005**: Editar parámetros y re-ejecutar análisis
   - Modificar Manning/Infiltration
   - Re-ejecutar análisis
   - Comparar resultados
   - Duración: 15-60 minutos

6. **CP-INT-NBS-006**: Eliminar NbS asociado a Study Case
   - Verificar restricciones de eliminación
   - Duración: 2-3 minutos

7. **CP-INT-NBS-007**: Filtrar NbS por país en Study Case
   - Verificar filtrado automático
   - Duración: 2-3 minutos

**Archivo clave**: `geonode/waterproof_fastflood/api.py` función `getNbsJson()` (línea ~842)

**Formato JSON verificado**:
```json
{
  "NbS": {
    "0-Reforestation": {
      "10-Forest": {
        "Manning": 0.500,
        "Infiltration": 0.85
      }
    }
  }
}
```

**Prioridad**: Máxima ⚡⚡⚡ - La integración correcta es fundamental para análisis FastFlood

---

### ✅ [03_nbs_validation_dynamic_api_test_plan.md](03_nbs_validation_dynamic_api_test_plan.md)
**Pruebas de Validaciones y API Dinámica**

Cubre:
- **CP-VAL-NBS-001 a CP-VAL-NBS-013**: Casos de validación
- **CP-API-NBS-001 a CP-API-NBS-003**: Endpoints dinámicos

**Validaciones de datos**:

1. **CP-VAL-NBS-001**: Validar nombre único de NbS
2. **CP-VAL-NBS-002**: Validar rangos de Manning ⚡ **CRÍTICO**
   - Forest: 0.400 - 0.800
   - Water: 0.025 - 0.035
   - Urban: 0.012 - 0.020
   - Etc.
3. **CP-VAL-NBS-003**: Validar rangos de Infiltration ⚡ **CRÍTICO**
   - Rango: 0.00 - 1.00 (porcentaje)
4. **CP-VAL-NBS-004**: Validar campos obligatorios
5. **CP-VAL-NBS-005**: Validar costos (no negativos)
6. **CP-VAL-NBS-006**: Validar periodicidad de mantenimiento

**Validaciones de archivos geográficos**:

7. **CP-VAL-NBS-007**: Validar GeoJSON de Activity Shapefile
8. **CP-VAL-NBS-008**: Validar Shapefile de Activity

**Validaciones de asociación**:

9. **CP-VAL-NBS-009**: Validar asociación NbS-Transformations
10. **CP-VAL-NBS-010**: Validar combinación única nbsid + lucode

**Validaciones frontend**:

11. **CP-VAL-NBS-011**: Validación en tiempo real - Manning
12. **CP-VAL-NBS-012**: Validación de formato CSV - Manning/Infiltration ⚡
13. **CP-VAL-NBS-013**: Validación de permisos - Edición por rol

**Endpoints de API dinámica**:

1. **CP-API-NBS-001**: `GET /nbs/load-transitions/`
   - Cargar todas las transiciones RIOS
   - Poblar primer dropdown

2. **CP-API-NBS-002**: `GET /nbs/load-activityByTransition/?transition_id={id}`
   - Cargar actividades por transición
   - Poblar segundo dropdown (cascading)

3. **CP-API-NBS-003**: `GET /nbs/load-transformationByActivity/?activity_id={id}`
   - Cargar transformaciones por actividad
   - Poblar tercer dropdown (cascading)

**Prioridad**: Alta ⚡ - Especialmente validaciones de Manning/Infiltration

---

## Guía de Uso

### Para Testers

1. **Comenzar con**: `00_overview.md` para entender el módulo NbS
2. **Pruebas manuales CRUD**: Seguir `01_nbs_crud_test_plan.md`
3. **Pruebas de integración**: Ejecutar `02_nbs_fastflood_integration_test_plan.md`
   - **CRÍTICO**: Verificar CP-INT-NBS-003 (generación JSON)
4. **Pruebas de validación**: Usar `03_nbs_validation_dynamic_api_test_plan.md`
   - **CRÍTICO**: Verificar CP-VAL-NBS-002 y CP-VAL-NBS-003 (rangos)
5. **Reportar resultados**: Usar matrices de trazabilidad para tracking

### Para Desarrolladores

1. **TDD**: Escribir tests antes de implementar features
2. **Tests unitarios**: Comenzar con validaciones (Documento 03)
3. **Tests de integración**: Implementar flujos completos (Documento 02)
4. **Focus en FastFlood**: Priorizar tests de parámetros Manning/Infiltration
5. **CI/CD**: Integrar tests en pipeline

### Para Project Managers

1. **Estimación**: Usar duración indicada en cada caso de prueba
2. **Priorización**:
   - **Alta ⚡**: Parámetros FastFlood, CRUD básico
   - **Media**: Validaciones, API dinámica
   - **Baja**: Optimizaciones, casos edge
3. **Tracking**: Usar IDs de casos (CP-NBS-XXX, CP-INT-NBS-XXX, CP-VAL-NBS-XXX)
4. **Riesgos**: Cualquier fallo en parámetros FastFlood es blocker

---

## Estadísticas del Plan de Pruebas

### Cobertura

| Categoría | Casos de Prueba | Archivo |
|-----------|----------------|---------|
| NbS CRUD | 13 principales + 3 permisos + 2 integración | 01 |
| Integración FastFlood | 7 flujos completos | 02 |
| Validaciones | 13 validaciones principales | 03 |
| API Dinámica | 3 endpoints | 03 |
| **TOTAL** | **~38 casos de prueba** | **4 docs** |

### Componentes Cubiertos

- ✅ **Modelos**: 7 modelos principales
  - WaterproofNbsCa
  - **WaterproofPrLulc** (CRÍTICO ⚡)
  - WaterproofPrLulcParameters
  - RiosTransition
  - RiosActivity
  - RiosTransformation
  - ActivityShapefile

- ✅ **Vistas**: 6+ vistas
  - createNbs
  - editNbs
  - cloneNbs
  - deleteNbs
  - listNbs
  - viewNbs
  - loadAllTransitions
  - loadActivityByTransition
  - loadTransformationbyActivity

- ✅ **APIs**: 3 endpoints dinámicos + integración con FastFlood API

- ✅ **Templates**: waterproofnbsca_*.html

- ✅ **JavaScript**: waterproofnbsca_create.js, validaciones

- ✅ **Integraciones**:
  - **FastFlood** (getNbsJson() - CRÍTICO ⚡)
  - GIS (GeoJSON, Shapefile)
  - RIOS (jerarquía de transformaciones)

### Tipos de Pruebas

- 🧪 **Unitarias**: Validaciones de modelos, campos
- 🔗 **Integración**: CRUD completo, asociaciones
- 🌐 **End-to-End**: Flujos NbS → Study Case → FastFlood Analysis
- 🔒 **Seguridad**: Permisos por rol, autenticación
- ✅ **Validaciones**: Rangos de Manning/Infiltration, campos obligatorios
- 📊 **API**: Endpoints dinámicos, cascading dropdowns

---

## Convenciones de Nomenclatura

### IDs de Casos de Prueba

```
CP-<CATEGORIA>-<NUMERO>
```

**Categorías**:
- `NBS`: CRUD de NbS
- `INT-NBS`: Integración con FastFlood
- `VAL-NBS`: Validaciones de NbS
- `API-NBS`: API dinámica de NbS

**Ejemplos**:
- `CP-NBS-003`: Crear NbS con parámetros FastFlood
- `CP-INT-NBS-003`: Generar JSON con Manning/Infiltration (CRÍTICO ⚡)
- `CP-VAL-NBS-002`: Validar rangos de Manning (CRÍTICO ⚡)
- `CP-API-NBS-001`: Cargar transiciones RIOS

### Prioridades

- **Alta ⚡**: Funcionalidad crítica, parámetros FastFlood
- **Media**: Funcionalidad importante, validaciones
- **Baja**: Casos edge, optimizaciones

---

## Casos de Prueba Críticos para FastFlood ⚡⚡⚡

Estos casos son **absolutamente críticos** porque afectan directamente los análisis de inundaciones:

| ID | Caso de Prueba | Documento | Por qué es crítico |
|----|----------------|-----------|-------------------|
| **CP-NBS-003** | Crear NbS con parámetros FastFlood | 01 | Sin estos parámetros, no hay datos para análisis |
| **CP-NBS-008** | Editar parámetros FastFlood | 01 | Permite ajuste de coeficientes hidrológicos |
| **CP-INT-NBS-003** | Generar JSON con Manning/Infiltration | 02 | JSON incorrecto → análisis fallido |
| **CP-INT-NBS-004** | Ejecutar análisis FastFlood con NbS | 02 | Verifica que modelo recibe datos correctos |
| **CP-VAL-NBS-002** | Validar rangos de Manning | 03 | Valores fuera de rango → resultados incorrectos |
| **CP-VAL-NBS-003** | Validar rangos de Infiltration | 03 | Valores fuera de rango → resultados incorrectos |
| **CP-VAL-NBS-012** | Validar formato CSV | 03 | Parsing incorrecto → datos corruptos |

**Nota**: Cualquier fallo en estos casos debe considerarse un **blocker** para release.

---

## Flujo de Integración NbS → FastFlood

### Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────────┐
│                      MÓDULO NbS                                 │
├─────────────────────────────────────────────────────────────────┤
│ 1. Usuario crea NbS                                             │
│    - Name: "Reforestation"                                      │
│    - Country: USA                                               │
│    - LULC 10 (Forest): Manning=0.500, Infiltration=0.85         │
│    - LULC 20 (Shrubs): Manning=0.400, Infiltration=0.70         │
│                                                                 │
│ 2. Se guardan en tablas:                                        │
│    - WaterproofNbsCa (NbS básico)                               │
│    - WaterproofPrLulc (Parámetros FastFlood) ⚡                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                   MÓDULO FASTFLOOD                              │
├─────────────────────────────────────────────────────────────────┤
│ 3. Usuario crea Study Case                                      │
│    - Step 6: Selecciona NbS "Reforestation"                     │
│    - Se asocia en tabla StudyCases_NBS_Fastflood                │
│                                                                 │
│ 4. Usuario ejecuta análisis                                     │
│    - Llama a api.getNbsJson()                                   │
│    - Consulta WaterproofPrLulc para Manning e Infiltration ⚡   │
│                                                                 │
│ 5. Se genera JSON:                                              │
│    {                                                            │
│      "NbS": {                                                   │
│        "0-Reforestation": {                                     │
│          "10-Forest": {                                         │
│            "Manning": 0.500,       ← WaterproofPrLulc.manning   │
│            "Infiltration": 0.85    ← WaterproofPrLulc.infiltration│
│          },                                                     │
│          "20-Shrubs": {                                         │
│            "Manning": 0.400,                                    │
│            "Infiltration": 0.70                                 │
│          }                                                      │
│        }                                                        │
│      }                                                          │
│    }                                                            │
│                                                                 │
│ 6. JSON se envía a servidor de análisis FastFlood              │
│    - Modelo usa Manning e Infiltration en cálculos             │
│    - Se generan resultados de inundación                        │
└─────────────────────────────────────────────────────────────────┘
```

### Puntos de Verificación en Tests

1. ✅ **Creación**: CP-NBS-003 - Verificar que WaterproofPrLulc se crea correctamente
2. ✅ **Asociación**: CP-INT-NBS-002 - Verificar que NbS se asocia a Study Case
3. ✅ **Generación JSON**: CP-INT-NBS-003 - Verificar estructura y valores JSON
4. ✅ **Ejecución**: CP-INT-NBS-004 - Verificar que análisis se completa
5. ✅ **Validación**: CP-VAL-NBS-002/003 - Verificar rangos antes de guardar

---

## Criterios de Aceptación Global

### Cobertura de Código
- Mínimo: 80% de cobertura
- Objetivo: 90% de cobertura
- **Crítico**: 100% en WaterproofPrLulc (modelo de parámetros FastFlood)

### Pruebas Exitosas
- 100% de pruebas unitarias deben pasar
- 100% de pruebas de integración deben pasar
- **100% de pruebas críticas FastFlood (⚡) deben pasar**

### Validaciones
- Rangos de Manning: 100% validados
- Rangos de Infiltration: 100% validados
- Nombres únicos: 100% enforced
- Permisos: 100% verificados

### Performance
- APIs dinámicas: < 2 segundos de respuesta
- Carga de lista NbS: < 3 segundos
- Generación de JSON (getNbsJson): < 1 segundo

### Integración con FastFlood
- **JSON generado debe ser 100% válido**
- **Manning e Infiltration deben estar en rangos correctos**
- **Análisis FastFlood debe completarse sin errores**

---

## Herramientas Recomendadas

### Testing Frameworks
- **pytest**: Framework principal
- **Django TestCase**: Tests de Django
- **pytest-django**: Plugin pytest para Django
- **Factory Boy**: Generación de fixtures

### GIS Testing
- **django.contrib.gis.tests**: Tests de geometrías
- **GDAL/OGR**: Procesamiento de Shapefile/GeoJSON
- **GEOS**: Validación de topología

### Mocking
- **unittest.mock**: Mocking de Python
- **responses**: Mock de HTTP requests

### Code Coverage
- **coverage.py**: Medición de cobertura
- **pytest-cov**: Plugin de coverage para pytest

### Frontend Testing
- **Jest**: Tests de JavaScript
- **Selenium**: Tests E2E de UI

---

## Datos de Prueba Recomendados

### Usuarios
```python
admin_user = Profile(username='admin_test', role='ADMIN')
analyst1 = Profile(username='analyst1', role='ANALYS')
analyst2 = Profile(username='analyst2', role='ANALYS')
```

### Países y Monedas
```python
usa = Countries(iso='US', name='United States', currency_code='USD')
colombia = Countries(iso='CO', name='Colombia', currency_code='COP')
```

### LULC Parameters con Rangos Típicos

| LULC Code | Descripción | Manning Min | Manning Max | Infiltration Min | Infiltration Max |
|-----------|-------------|-------------|-------------|------------------|------------------|
| 10 | Forest | 0.400 | 0.800 | 0.70 | 0.95 |
| 20 | Shrubs | 0.300 | 0.600 | 0.60 | 0.80 |
| 30 | Grass | 0.200 | 0.400 | 0.50 | 0.70 |
| 40 | Crops | 0.200 | 0.500 | 0.40 | 0.65 |
| 50 | Building | 0.012 | 0.020 | 0.10 | 0.30 |
| 60 | Bare | 0.025 | 0.040 | 0.15 | 0.35 |
| 70 | Snow | 0.015 | 0.025 | 0.05 | 0.15 |
| 80 | Water | 0.025 | 0.035 | 0.01 | 0.05 |
| 90 | Wetland | 0.100 | 0.200 | 0.50 | 0.80 |
| 100 | Mangroves | 0.080 | 0.150 | 0.60 | 0.90 |
| 110 | Moss | 0.035 | 0.060 | 0.40 | 0.70 |

### NbS de Ejemplo
```python
reforestation_nbs = {
    'name': 'Reforestation Project',
    'description': 'Convert agricultural land to forest',
    'country': usa,
    'currency': usa,
    'max_benefit_req_time': 25.000,
    'profit_pct_time_inter_assoc': 50.00,
    'unit_implementation_cost': 5000.00,
    'unit_maintenance_cost': 500.00,
    'periodicity_maitenance': 5,
    'unit_oportunity_cost': 200.00,
    'added_by': analyst1
}

# Parámetros FastFlood asociados
fastflood_params = [
    {'lucode': 10, 'manning': 0.500, 'infiltration': 0.85},  # Forest
    {'lucode': 20, 'manning': 0.400, 'infiltration': 0.70},  # Shrubs
]
```

### Jerarquía RIOS de Ejemplo
```python
transition = RiosTransition(
    name='Agricultural to Forest',
    description='Convert agricultural land to forest'
)

activity = RiosActivity(
    transition=transition,
    name='Afforestation',
    description='Plant trees in degraded areas',
    lucode=lulc_forest
)

transformation = RiosTransformation(
    activity=activity,
    name='Pine Plantation',
    description='Plant pine trees',
    unique_id='TRANS-001'
)
```

---

## Próximos Pasos

### Para Implementación

1. **Fase 1**: Tests unitarios de validaciones (1-2 semanas)
   - CP-VAL-NBS-002: Rangos Manning ⚡
   - CP-VAL-NBS-003: Rangos Infiltration ⚡
   - CP-VAL-NBS-001: Nombre único
   - CP-VAL-NBS-004: Campos obligatorios

2. **Fase 2**: Tests de CRUD (1-2 semanas)
   - CP-NBS-003: Crear NbS con parámetros FastFlood ⚡
   - CP-NBS-008: Editar parámetros FastFlood ⚡
   - CP-NBS-010: Clonar NbS
   - CP-NBS-011: Eliminar NbS

3. **Fase 3**: Tests de integración FastFlood (1 semana)
   - CP-INT-NBS-003: Generar JSON ⚡⚡⚡ **CRÍTICO**
   - CP-INT-NBS-004: Ejecutar análisis
   - CP-INT-NBS-002: Asociar NbS a Study Case

4. **Fase 4**: Tests de API dinámica (1 semana)
   - CP-API-NBS-001: Load transitions
   - CP-API-NBS-002: Load activities
   - CP-API-NBS-003: Load transformations

5. **Fase 5**: Optimización y CI/CD (1 semana)
   - Automatización completa
   - Reportes automáticos
   - Performance tests

### Para Mantenimiento

- Actualizar casos cuando cambien rangos de Manning/Infiltration
- Agregar casos para nuevos LULC codes
- Revisar integración cuando se actualice FastFlood
- Mantener sincronizados con cambios en getNbsJson()

---

## Referencias

### Código Fuente
- **Directorio**: `geonode/waterproof_nbs_ca/`
- **Modelos**: `models.py` (líneas clave: WaterproofPrLulc)
- **Vistas**: `views.py` (líneas clave: 27, 123-138, 355, 516-534)
- **URLs**: `urls.py`
- **Templates**: `templates/waterproof_nbs_ca/waterproofnbsca_*.html`
- **JavaScript**: `static/waterproof_nbs_ca/js/waterproofnbsca_create.js`

### Integración FastFlood
- **API FastFlood**: `geonode/waterproof_fastflood/api.py`
- **Función crítica**: `getNbsJson()` (línea ~842)
- **Modelos FastFlood**: `StudyCases`, `StudyCases_NBS_Fastflood`

### Documentación Externa
- Django Testing: https://docs.djangoproject.com/en/stable/topics/testing/
- pytest-django: https://pytest-django.readthedocs.io/
- GEOS (GIS): https://docs.djangoproject.com/en/stable/ref/contrib/gis/geos/
- Manning's roughness coefficient: https://en.wikipedia.org/wiki/Manning_formula

---

## Glosario de Términos

- **NbS**: Nature-based Solutions (Soluciones basadas en la Naturaleza)
- **SbN**: Soluciones basadas en la Naturaleza (término en español)
- **LULC**: Land Use / Land Cover (Uso de suelo / Cobertura terrestre)
- **Manning**: Coeficiente de rugosidad de Manning (0.001-2.000)
- **Infiltration**: Tasa de infiltración del suelo (0.00-1.00 = 0-100%)
- **RIOS**: Resource Investment Optimization System
- **FastFlood**: Módulo de análisis de inundaciones rápidas
- **Study Case**: Caso de estudio de análisis hidrológico
- **Watershed**: Cuenca hidrográfica
- **GeoJSON**: Formato JSON para datos geoespaciales
- **Shapefile**: Formato de archivo GIS de ESRI

---

## Matriz de Trazabilidad: Requisito → Caso de Prueba

| Requisito Funcional | Casos de Prueba | Documento | Prioridad |
|---------------------|-----------------|-----------|-----------|
| **Crear NbS con parámetros FastFlood** | CP-NBS-003, CP-VAL-NBS-002, CP-VAL-NBS-003 | 01, 03 | Alta ⚡ |
| **Editar parámetros FastFlood** | CP-NBS-008, CP-VAL-NBS-012 | 01, 03 | Alta ⚡ |
| **Generar JSON para FastFlood** | CP-INT-NBS-003 | 02 | **Crítica ⚡⚡⚡** |
| **Asociar NbS a Study Case** | CP-INT-NBS-002 | 02 | Alta |
| **Ejecutar análisis con NbS** | CP-INT-NBS-004 | 02 | Alta ⚡ |
| **Validar rangos hidrológicos** | CP-VAL-NBS-002, CP-VAL-NBS-003 | 03 | Alta ⚡ |
| **Clonar NbS** | CP-NBS-010 | 01 | Media |
| **Eliminar NbS** | CP-NBS-011, CP-INT-NBS-006 | 01, 02 | Media |
| **Permisos por rol** | CP-NBS-012, CP-NBS-P001-P003 | 01 | Alta |
| **Subir archivos GIS** | CP-NBS-006, CP-VAL-NBS-007, CP-VAL-NBS-008 | 01, 03 | Media |
| **Selección cascada RIOS** | CP-API-NBS-001, CP-API-NBS-002, CP-API-NBS-003 | 03 | Media |
| **Nombre único** | CP-NBS-013, CP-VAL-NBS-001 | 01, 03 | Alta |

---

## Checklist de Preparación para Testing

### Ambiente de Desarrollo

- [ ] Base de datos PostgreSQL con PostGIS instalado
- [ ] GDAL/OGR instalados para procesamiento GIS
- [ ] Datos de prueba cargados (LULC parameters, países, usuarios)
- [ ] Módulo FastFlood funcional (para tests de integración)

### Datos de Prueba

- [ ] 3+ usuarios con diferentes roles (ADMIN, ANALYS, COPART)
- [ ] 3+ países con monedas configuradas
- [ ] 11 LULC parameters creados (códigos 10-110)
- [ ] Jerarquía RIOS: 2+ transiciones, 3+ actividades, 5+ transformaciones
- [ ] Archivos GIS de prueba (GeoJSON válido/inválido, Shapefile completo/incompleto)

### Herramientas

- [ ] pytest y pytest-django instalados
- [ ] coverage.py configurado
- [ ] Factory Boy para fixtures
- [ ] Postman o similar para tests de API
- [ ] Selenium para tests E2E (opcional)

### Configuración

- [ ] Settings de test configurados (`settings_test.py`)
- [ ] Base de datos de test separada
- [ ] Archivos estáticos recolectados
- [ ] Variables de entorno configuradas

---

## Reporte de Bugs: Template

```markdown
## Bug ID: BUG-NBS-XXX

**Fecha**: YYYY-MM-DD
**Reportado por**: [Nombre]
**Caso de prueba**: CP-NBS-XXX / CP-INT-NBS-XXX / CP-VAL-NBS-XXX

### Descripción
[Descripción breve del bug]

### Severidad
- [ ] Blocker ⚡⚡⚡ (afecta parámetros FastFlood o funcionalidad crítica)
- [ ] Critical (afecta funcionalidad principal)
- [ ] Major (afecta funcionalidad importante)
- [ ] Minor (afecta casos edge o UX)

### Pasos para Reproducir
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

### Resultado Esperado
[Qué debería pasar]

### Resultado Actual
[Qué pasó realmente]

### Evidencia
- Screenshot: [adjuntar]
- Logs: [adjuntar]
- Traceback: [adjuntar]

### Ambiente
- OS: [Windows/Linux/Mac]
- Browser: [Chrome/Firefox/etc]
- Django version: [X.X.X]
- Commit hash: [XXXXXXX]

### Impacto en FastFlood
- [ ] Bloquea análisis FastFlood
- [ ] Genera resultados incorrectos
- [ ] No afecta FastFlood
```

---

## Historial de Cambios

| Fecha | Versión | Autor | Descripción |
|-------|---------|-------|-------------|
| 2025-12-11 | 1.0 | Claude | Creación inicial del README para planes de prueba NbS |

---

## Contacto y Soporte

Para preguntas sobre los planes de prueba NbS:
- Revisar documentación en `/docs`
- Consultar código fuente en `geonode/waterproof_nbs_ca/`
- Verificar integración FastFlood en `geonode/waterproof_fastflood/api.py`

---

**Nota Final**: Este módulo NbS es **crítico** para el correcto funcionamiento de los análisis FastFlood. Los parámetros Manning e Infiltration almacenados en `WaterproofPrLulc` son utilizados directamente por el modelo hidrológico. Cualquier error en estos valores puede resultar en análisis incorrectos o fallidos. Por tanto, las pruebas marcadas con ⚡ deben ejecutarse con máxima atención y cualquier fallo debe tratarse como blocker.

**Prioridad de Testing**: Integración FastFlood > Validaciones > CRUD > API Dinámica
