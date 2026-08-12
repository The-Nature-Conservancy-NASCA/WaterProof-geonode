# Plan de Pruebas - WaterProof FastFlood

## Resumen General

Este documento contiene el plan de pruebas para el módulo **WaterProof FastFlood**, una aplicación Django para gestión de cuencas hidrográficas (watersheds) y casos de estudio de inundaciones rápidas.

## Componentes de la Aplicación

La aplicación está organizada en los siguientes componentes principales:

### 1. Gestión de Cuencas Hidrográficas (Watersheds)
- **Modelo principal**: `Watershed`, `Polygon`
- **URL base**: `/`
- **Vistas**: `views.py`
- **Templates**: `watershed_*.html`

### 2. Casos de Estudio (Study Cases)
- **Modelo principal**: `StudyCases`
- **URL base**: `/studyCase/`
- **Vistas**: `views.py`
- **Templates**: `studycases_*.html`

### 3. API Endpoints
- **Archivo**: `api.py`
- **Funcionalidad**: Endpoints REST para operaciones CRUD y consultas de datos

## Estructura de Archivos de Prueba

Los planes de prueba están organizados en los siguientes archivos:

| Archivo | Descripción | Componente |
|---------|-------------|------------|
| `01_watershed_crud_test_plan.md` | Pruebas CRUD de Watersheds | Watersheds |
| `02_study_cases_crud_test_plan.md` | Pruebas CRUD de Study Cases | Study Cases |
| `03_api_endpoints_test_plan.md` | Pruebas de API endpoints | API |
| `04_validation_test_plan.md` | Pruebas de validaciones | Validaciones |
| `05_integration_test_plan.md` | Pruebas de integración | Integración |

## Alcance de las Pruebas

### Funcionalidades Cubiertas

1. **Operaciones CRUD**
   - Crear, Leer, Actualizar, Eliminar
   - Clonar entidades
   - Validaciones de datos

2. **Permisos y Seguridad**
   - Autenticación de usuarios
   - Permisos por rol (ADMIN, ANALYS, COPART, etc.)
   - Visibilidad pública/privada

3. **Integraciones**
   - Integración con servicios externos (API de modelos)
   - Manejo de geometrías (GIS)
   - Procesamiento de archivos (GeoJSON, Shapefile)

4. **Flujos de Trabajo**
   - Creación multi-paso de Watersheds (3 pasos)
   - Creación multi-paso de Study Cases (7 pasos)
   - Ejecución de análisis

## Tipos de Pruebas

### 1. Pruebas Unitarias
- Validaciones de modelos
- Lógica de negocio en vistas
- Funciones auxiliares

### 2. Pruebas de Integración
- Flujos completos de creación
- Interacción entre Watersheds y Study Cases
- Llamadas a APIs externas

### 3. Pruebas Funcionales
- Navegación por wizards multi-paso
- Validaciones de formularios
- Manejo de errores

### 4. Pruebas de API
- Endpoints REST
- Validaciones de entrada/salida
- Códigos de respuesta HTTP

## Datos de Prueba

### Usuarios de Prueba
- **Admin**: Usuario con rol ADMIN
- **Analyst**: Usuario con rol ANALYS
- **Public**: Usuario no autenticado

### Ubicaciones de Prueba
- Ciudades válidas con coordenadas
- Países con configuración de moneda
- Regiones con datos biofísicos

### Geometrías de Prueba
- Polígonos válidos (GeoJSON)
- Shapefiles
- Bounding boxes

## Herramientas Recomendadas

1. **Framework de Pruebas**: Django TestCase, pytest
2. **Cobertura**: coverage.py
3. **API Testing**: Django REST Framework Test Client, requests-mock
4. **GIS Testing**: django.contrib.gis.tests
5. **Mocking**: unittest.mock, responses

## Criterios de Aceptación

- **Cobertura de código**: Mínimo 80%
- **Pruebas exitosas**: 100% de las pruebas deben pasar
- **Documentación**: Todos los casos de prueba deben estar documentados
- **Performance**: Los endpoints deben responder en menos de 2 segundos

## Convenciones

### Nomenclatura de Pruebas
```python
test_<componente>_<accion>_<condicion>_<resultado_esperado>
```

Ejemplos:
- `test_watershed_create_with_valid_data_success`
- `test_studycase_delete_by_non_owner_forbidden`
- `test_api_get_watersheds_by_city_returns_list`

### Estructura de Pruebas
```python
class TestWatershedCRUD(TestCase):
    def setUp(self):
        # Preparar datos de prueba
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

- **Modelos**: `geonode/waterproof_fastflood/models.py`
- **Vistas**: `geonode/waterproof_fastflood/views.py`
- **API**: `geonode/waterproof_fastflood/api.py`
- **URLs**: `geonode/waterproof_fastflood/urls.py`
- **Templates**: `geonode/templates/waterproof_fastflood/`

## Historial de Cambios

| Fecha | Versión | Autor | Descripción |
|-------|---------|-------|-------------|
| 2025-12-11 | 1.0 | Claude | Creación inicial del plan de pruebas |
