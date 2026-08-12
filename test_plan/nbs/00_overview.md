# Plan de Pruebas - SbN (Soluciones basadas en la Naturaleza)

## Resumen General

Este documento contiene el plan de pruebas para el módulo **WaterProof NbS CA (Nature-based Solutions)**, una aplicación Django para gestión de Soluciones basadas en la Naturaleza (SbN/NbS) con integración a análisis de FastFlood.

## Información del Módulo

**Directorio**: `geonode/waterproof_nbs_ca/`
**Propósito**: Gestión CRUD de soluciones basadas en la naturaleza y sus parámetros para análisis hidrológicos
**Integración principal**: Módulo FastFlood (análisis de inundaciones rápidas)

## Componentes de la Aplicación

La aplicación está organizada en los siguientes componentes principales:

### 1. Gestión de NbS (Nature-based Solutions)
- **Modelo principal**: `WaterproofNbsCa`
- **URL base**: `/nbs/`
- **Vistas**: `views.py`
- **Templates**: `waterproofnbsca_*.html`

### 2. Parámetros FastFlood
- **Modelo**: `WaterproofPrLulc`
- **Campos clave**: `manning`, `infiltration`
- **Propósito**: Coeficientes hidrológicos para análisis de inundaciones

### 3. Transformaciones RIOS
- **Modelos**: `RiosTransition`, `RiosActivity`, `RiosTransformation`
- **Propósito**: Definición de actividades de restauración

### 4. Áreas Restringidas
- **Modelo**: `ActivityShapefile`
- **Formato**: GeoJSON, Shapefile
- **Propósito**: Delimitación espacial de actividades NbS

## Modelos Principales

### WaterproofNbsCa (NbS Principal)

```python
class WaterproofNbsCa(models.Model):
    # Identificación
    name = CharField(max_length=100, unique=True)
    slug = CharField(max_length=100, unique=True)
    description = CharField(max_length=2048)

    # Ubicación y moneda
    country = ForeignKey(Countries, related_name='countryField')
    currency = ForeignKey(Countries, related_name='currencyField')

    # Parámetros temporales y beneficios
    max_benefit_req_time = DecimalField(max_digits=14, decimal_places=3)
    profit_pct_time_inter_assoc = DecimalField(max_digits=10, decimal_places=2)

    # Costos
    unit_implementation_cost = DecimalField(max_digits=14, decimal_places=2)
    unit_maintenance_cost = DecimalField(max_digits=14, decimal_places=2)
    periodicity_maitenance = IntegerField()
    unit_oportunity_cost = DecimalField(max_digits=14, decimal_places=2)

    # Relaciones
    rios_transformations = ManyToManyField(RiosTransformation)
    activity_shapefile = ForeignKey(ActivityShapefile, null=True)
    added_by = ForeignKey(Profile, null=True)
```

### WaterproofPrLulc (Parámetros FastFlood) ⚡ CRÍTICO

```python
class WaterproofPrLulc(models.Model):
    """
    Tabla que vincula NbS con parámetros FastFlood
    """
    nbsid = ForeignKey(WaterproofNbsCa)
    lucode = ForeignKey(WaterproofPrLulcParameters)  # Código de uso de suelo

    # CAMPOS FASTFLOOD
    manning = DecimalField(max_digits=5, decimal_places=3)        # Coeficiente Manning
    infiltration = DecimalField(max_digits=5, decimal_places=2)   # Coeficiente Infiltración
```

**Nota**: Esta tabla es fundamental para la integración con FastFlood. Los coeficientes Manning e Infiltration se utilizan en el modelo JSON de FastFlood.

### RiosTransition, RiosActivity, RiosTransformation

```python
# Jerarquía: Transition → Activity → Transformation
class RiosTransition(models.Model):
    name = CharField(max_length=100)
    description = CharField(max_length=1024)

class RiosActivity(models.Model):
    transition = ForeignKey(RiosTransition)
    name = CharField(max_length=100)
    description = CharField(max_length=1024)
    lucode = ForeignKey(WaterproofPrLulcParameters)

class RiosTransformation(models.Model):
    activity = ForeignKey(RiosActivity)
    name = CharField(max_length=100)
    description = CharField(max_length=1024)
    unique_id = CharField(max_length=1024)
```

### ActivityShapefile (Áreas Geográficas)

```python
class ActivityShapefile(models.Model):
    activity = CharField(max_length=255)
    action = CharField(max_length=255)
    area = MultiPolygonField()  # Geometría GIS
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
| `/load-transitions/` | GET | `loadAllTransitions` | Cargar transiciones RIOS |
| `/load-activityByTransition/` | GET | `loadActivityByTransition` | Actividades por transición |
| `/load-transformationByActivity/` | GET | `loadTransformationbyActivity` | Transformaciones por actividad |

## Integración con FastFlood

### Flujo de Uso en FastFlood

1. **Usuario crea Study Case en FastFlood**
2. **Selecciona NbS** (Paso 6 del wizard de Study Case)
   - API: `/nbs/` (POST) con parámetros
   - Retorna NbS disponibles según país/ciudad
3. **FastFlood obtiene parámetros Manning e Infiltration**
   - Consulta tabla `WaterproofPrLulc`
   - Usa en generación de JSON para modelo
4. **Generación de JSON para análisis**
   - Incluye coeficientes Manning e Infiltration por LULC
   - Función: `api.getNbsJson()` en FastFlood

### Ejemplo de JSON Generado (FastFlood)

```json
{
  "NbS": {
    "0-Reforestation": {
      "10-Forest": {
        "Manning": 0.500,
        "Infiltration": 0.80
      },
      "20-Shrubs": {
        "Manning": 0.400,
        "Infiltration": 0.65
      }
    },
    "1-Wetland Restoration": {
      "80-Water": {
        "Manning": 0.035,
        "Infiltration": 0.95
      }
    }
  }
}
```

**Origen de datos**:
- NbS name: `WaterproofNbsCa.name`
- LULC code y name: `WaterproofPrLulcParameters`
- **Manning**: `WaterproofPrLulc.manning` ⚡
- **Infiltration**: `WaterproofPrLulc.infiltration` ⚡

## Estructura de Archivos de Prueba

Los planes de prueba están organizados en los siguientes archivos:

| Archivo | Descripción | Componente |
|---------|-------------|------------|
| `00_overview.md` | Resumen general | General |
| `01_nbs_crud_test_plan.md` | Pruebas CRUD de NbS | CRUD |
| `02_nbs_fastflood_integration_test_plan.md` | Pruebas de integración FastFlood | Integración |
| `03_nbs_validation_test_plan.md` | Pruebas de validaciones | Validaciones |
| `04_nbs_rios_test_plan.md` | Pruebas de transformaciones RIOS | RIOS |

## Alcance de las Pruebas

### Funcionalidades Cubiertas

1. **Operaciones CRUD**
   - Crear, Leer, Actualizar, Eliminar NbS
   - Clonar NbS
   - Validaciones de datos

2. **Parámetros FastFlood** ⚡ CRÍTICO
   - Crear/editar coeficientes Manning
   - Crear/editar coeficientes Infiltration
   - Validar rangos de valores
   - Vincular con códigos LULC

3. **Transformaciones RIOS**
   - Cargar transiciones
   - Cargar actividades
   - Cargar transformaciones
   - Asociar transformaciones a NbS

4. **Áreas Geográficas**
   - Subir GeoJSON
   - Subir Shapefile
   - Validar geometrías
   - Asociar áreas a NbS

5. **Permisos y Seguridad**
   - Autenticación de usuarios
   - Permisos por rol (ADMIN, ANALYS, etc.)
   - NbS globales (ADMIN) vs. específicos de país

6. **Integración con FastFlood**
   - Selección de NbS en Study Cases
   - Generación de JSON con parámetros
   - Uso en análisis de inundaciones

## Tipos de Pruebas

### 1. Pruebas Unitarias
- Validaciones de modelos
- Lógica de negocio en vistas
- Cálculos de costos

### 2. Pruebas de Integración
- Flujos completos de creación
- Interacción con FastFlood
- Carga de archivos geográficos

### 3. Pruebas Funcionales
- Formularios de creación/edición
- Validaciones de campos
- Manejo de errores

### 4. Pruebas de API
- Endpoints de carga dinámica
- Endpoints de consulta
- Validaciones de entrada/salida

## Datos de Prueba

### Usuarios de Prueba
- **Admin**: Usuario con rol ADMIN (NbS globales)
- **Analyst**: Usuario con rol ANALYS (NbS específicos de país)
- **Copartner**: Usuario con rol COPART

### Países y Monedas
- USA (USD)
- Colombia (COP)
- México (MXN)

### Códigos LULC (Land Use/Land Cover)
- 10: Forest
- 20: Shrubs
- 30: Grass
- 40: Crops
- 50: Building
- 60: Bare
- 70: Snow
- 80: Water
- 90: Wetland
- 100: Mangroves
- 110: Moss

### Valores de Manning (Típicos)
- Forest: 0.400 - 0.800
- Shrubs: 0.300 - 0.600
- Grass: 0.200 - 0.400
- Crops: 0.200 - 0.500
- Water: 0.025 - 0.035
- Urban: 0.012 - 0.020

### Valores de Infiltration (Típicos)
- Forest: 0.70 - 0.95
- Shrubs: 0.60 - 0.80
- Grass: 0.50 - 0.70
- Crops: 0.40 - 0.65
- Water: 0.01 - 0.05
- Urban: 0.10 - 0.30

## Herramientas Recomendadas

1. **Framework de Pruebas**: Django TestCase, pytest
2. **Cobertura**: coverage.py
3. **GIS Testing**: django.contrib.gis.tests
4. **Mocking**: unittest.mock, responses
5. **Archivos GIS**: GDAL/OGR para procesar Shapefile/GeoJSON

## Criterios de Aceptación

- **Cobertura de código**: Mínimo 80%
- **Pruebas exitosas**: 100% de las pruebas deben pasar
- **Validaciones FastFlood**: 100% de coeficientes validados
- **Documentación**: Todos los casos de prueba documentados

## Prioridades de Prueba

### Alta Prioridad ⚡
1. Creación de NbS con parámetros FastFlood
2. Edición de coeficientes Manning e Infiltration
3. Validación de rangos de valores
4. Integración con FastFlood Study Cases
5. Nombre único de NbS

### Media Prioridad
1. Carga de archivos geográficos
2. Asociación de transformaciones RIOS
3. Clonación de NbS
4. Permisos por rol

### Baja Prioridad
1. Ordenamiento de listas
2. Búsqueda y filtros
3. Exportación de datos

## Convenciones

### Nomenclatura de Pruebas
```python
test_<componente>_<accion>_<condicion>_<resultado_esperado>
```

Ejemplos:
- `test_nbs_create_with_fastflood_params_success`
- `test_nbs_edit_manning_coefficient_valid_range`
- `test_nbs_delete_by_non_owner_forbidden`
- `test_nbs_clone_preserves_fastflood_params`

### Estructura de Pruebas
```python
class TestNbsCRUD(TestCase):
    def setUp(self):
        # Preparar datos de prueba
        self.user = User.objects.create(...)
        self.country = Countries.objects.create(...)
        pass

    def test_specific_scenario(self):
        # Arrange: Configurar
        # Act: Ejecutar
        # Assert: Verificar
        pass

    def tearDown(self):
        # Limpiar datos
        pass
```

## Referencias

- **Modelos**: `geonode/waterproof_nbs_ca/models.py`
- **Vistas**: `geonode/waterproof_nbs_ca/views.py`
- **URLs**: `geonode/waterproof_nbs_ca/urls.py`
- **Templates**: `geonode/waterproof_nbs_ca/templates/waterproof_nbs_ca/`
- **JavaScript**: `geonode/waterproof_nbs_ca/static/waterproof_nbs_ca/js/`
- **Integración FastFlood**: `geonode/waterproof_fastflood/api.py` (función `getNbsJson`)

## Campos Críticos para FastFlood

### En WaterproofPrLulc (Tabla de Parámetros)

| Campo | Tipo | Rango | Descripción | Uso en FastFlood |
|-------|------|-------|-------------|------------------|
| **manning** | Decimal(5,3) | 0.001 - 2.000 | Coeficiente de rugosidad de Manning | `LulcParams.Manning` en JSON |
| **infiltration** | Decimal(5,2) | 0.00 - 1.00 | Tasa de infiltración (0-100%) | `LulcParams.InfiltrationChange` en JSON |
| lucode | FK | - | Código de uso de suelo (LULC) | Key en JSON de NbS |
| nbsid | FK | - | ID de la NbS | Agrupación en JSON |

### Validaciones Requeridas

1. **Manning**: Debe estar en rango válido según tipo de cobertura
2. **Infiltration**: Debe ser porcentaje (0.00 - 1.00)
3. **lucode**: Debe existir en tabla WaterproofPrLulcParameters
4. **Combinación nbsid + lucode**: Puede haber múltiples registros por NbS

## Historial de Cambios

| Fecha | Versión | Autor | Descripción |
|-------|---------|-------|-------------|
| 2025-12-11 | 1.0 | Claude | Creación inicial del plan de pruebas NbS |

---

**Nota**: Este plan de pruebas enfatiza la correcta configuración de parámetros FastFlood (Manning e Infiltration) que son críticos para los análisis de inundaciones.
