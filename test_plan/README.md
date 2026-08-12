# Planes de Prueba - WaterProof FastFlood

## Descripción

Este directorio contiene los planes de prueba completos para el módulo **WaterProof FastFlood** de la aplicación GeoNode. Los planes están organizados por categorías y cubren todos los aspectos funcionales, de integración y validación del sistema.

## Estructura de Documentos

### 📋 [00_overview.md](00_overview.md)
**Resumen General del Plan de Pruebas**

Documento maestro que proporciona:
- Visión general de la aplicación
- Estructura de los componentes
- Alcance de las pruebas
- Tipos de pruebas incluidas
- Convenciones y estándares
- Referencias principales

**Leer primero** para entender la organización y alcance general.

---

### 🗺️ [01_watershed_crud_test_plan.md](01_watershed_crud_test_plan.md)
**Pruebas CRUD de Watersheds (Cuencas Hidrográficas)**

Cubre:
- **CP-WS-001 a CP-WS-010**: Casos de prueba principales
  - Listar watersheds
  - Crear watershed (3 pasos: Localización, DEM, Área NbS)
  - Editar watershed
  - Ver detalles
  - Clonar watershed
  - Eliminar watershed
  - Validar geometrías
  - Filtrar por ciudad

- **Casos de permisos**: CP-WS-P001 a CP-WS-P003
- **Casos de integración**: CP-WS-I001 a CP-WS-I002
- **Datos de prueba**: Usuarios, ciudades, geometrías
- **Matriz de trazabilidad**

**Modelos cubiertos**: `Watershed`, `Polygon`
**Vistas cubiertas**: `listWatershed`, `createWatershed`, `editWatershed`, `viewWatershed`, `cloneWatershed`, `deleteWatershed`, `validateGeometry`

---

### 📊 [02_study_cases_crud_test_plan.md](02_study_cases_crud_test_plan.md)
**Pruebas CRUD de Study Cases (Casos de Estudio)**

Cubre:
- **CP-SC-001 a CP-SC-017**: Casos de prueba principales
  - Listar study cases
  - Crear study case (7 pasos):
    1. Definición
    2. Mercado de carbono
    3. Portafolios
    4. Parámetros de modelado
    5. Parámetros financieros
    6. Actividades NbS
    7. Parámetros de análisis
  - Editar study case
  - Ver detalles
  - Clonar study case
  - Eliminar study case
  - Publicar/privatizar
  - Ejecutar análisis
  - Guardar parámetros biofísicos
  - Guardar datos de daño

- **Casos de integración**: CP-SC-I001 a CP-SC-I003
- **Validaciones especiales**: Nombres únicos, porcentajes, años, monedas
- **Matriz de trazabilidad**

**Modelos cubiertos**: `StudyCases`, `StudyCases_Parameters_Bio`, `StudyCase_damage_curve`, `StudyCase_depth_damage`, `StudyCases_NBS_Fastflood`, `StudyCases_Currency_Fastflood`
**Vistas cubiertas**: `study_cases_list`, `create_study_case`, `edit_study_case`, `view_study_case`, `clone_study_case`
**APIs cubiertas**: `save`, `delete`, `public`, `private`, `run`, `saveBiophysicals`, `saveDamageData`

---

### 🔌 [03_api_endpoints_test_plan.md](03_api_endpoints_test_plan.md)
**Pruebas de Endpoints de API REST**

Cubre:
- **CP-API-001 a CP-API-016**: Casos de prueba de endpoints

**Categorías de endpoints**:

1. **Consulta de Watersheds**
   - Verificar uso en study cases
   - Obtener por ciudad
   - Obtener información por ID
   - Listar todos

2. **Parámetros y Configuración**
   - Parámetros biofísicos por macro región
   - Parámetros por país
   - Información de daño por país
   - Costos máximos de daño

3. **NbS y Portafolios**
   - Listar NbS disponibles según contexto
   - Configuración por study case

4. **Monedas y Exchange Rates**
   - Obtener monedas de study case
   - Calcular tasas de cambio

5. **Análisis y Ejecución**
   - Crear JSON para modelo FastFlood
   - Obtener logs de ejecución

6. **Validaciones**
   - Verificar existencia por nombre
   - Validar unicidad

- **Casos de integración**: CP-API-I001 a CP-API-I002
- **Matriz de endpoints**: Métodos, autenticación, permisos
- **Consideraciones de performance**: Caching, indexing, optimización

**APIs cubiertas**: Todas las APIs en `api.py` (18 endpoints)

---

### ✅ [04_validation_test_plan.md](04_validation_test_plan.md)
**Pruebas de Validaciones**

Cubre:
- **CP-VAL-001 a CP-VAL-013**: Casos de validación

**Categorías de validaciones**:

1. **Validaciones de Modelos**
   - Nombres únicos por usuario
   - Campos requeridos
   - Restricciones de longitud

2. **Validaciones de Geometrías**
   - Topología de polígonos (válidos/inválidos)
   - Contención espacial
   - Formatos de archivo (GeoJSON, Shapefile)

3. **Validaciones de Negocio**
   - Suma de porcentajes (commercial + industrial ≤ 100)
   - Años permitidos (2030-2100)
   - Duración de tormenta (valores específicos)
   - Cuantiles (15, 50, 85, N/A)

4. **Validaciones de Datos**
   - Rangos numéricos
   - Monedas válidas
   - Exchange rates positivos
   - Fechas coherentes

5. **Validaciones de Permisos**
   - Edición solo por propietario/admin
   - Eliminación solo por propietario/admin
   - Integridad referencial (no eliminar con dependencias)

6. **Validaciones de Estados**
   - Transiciones de workflow
   - Estados de completitud
   - Estados de ejecución

- **Validaciones JavaScript**: Frontend en tiempo real
- **Matriz de validaciones**: Ubicación, tipo, criticidad

**Archivos cubiertos**: `views.py`, `api.py`, `models.py`, JavaScript validators

---

### 🔄 [05_integration_test_plan.md](05_integration_test_plan.md)
**Pruebas de Integración y End-to-End**

Cubre:
- **CP-INT-001 a CP-INT-007**: Flujos completos

**Flujos end-to-end**:

1. **CP-INT-001**: Flujo completo de creación de Watershed
   - 3 pasos completos
   - Verificación en BD, UI y sistema de archivos
   - Duración: 5-10 minutos

2. **CP-INT-002**: Flujo completo de creación de Study Case
   - 7 pasos completos
   - Múltiples llamadas a APIs
   - Integración con servicios externos
   - Duración: 20-30 minutos

3. **CP-INT-003**: Flujo de ejecución de análisis
   - Generación de JSON
   - Llamada a servidor externo
   - Monitoreo de logs
   - Descarga de resultados
   - Duración: 5-60 minutos (depende del modelo)

4. **CP-INT-004**: Flujo de clonación de Study Case
   - Clonar a diferente país
   - Actualizar datos específicos del país
   - Verificar independencia del original

5. **CP-INT-005**: Flujo de edición de Watershed
   - Editar múltiples pasos
   - Verificar que no se crea nuevo registro

6. **CP-INT-006**: Flujo de visibilidad público/privado
   - Cambiar estado
   - Verificar permisos según rol
   - Verificar visibilidad

7. **CP-INT-007**: Flujo de eliminación con dependencias
   - Verificar restricciones
   - Eliminar dependencias primero
   - Cascade delete

- **Configuración de ambiente**: Datos de prueba, usuarios, ciudades
- **Scripts E2E con Selenium**: Ejemplos de pruebas automatizadas
- **Matriz de flujos**: Componentes, duración, complejidad, prioridad

**Herramientas**: Django Test Client, Selenium, Factory Boy, pytest-django

---

## Guía de Uso

### Para Testers

1. **Comenzar con**: `00_overview.md` para entender el contexto
2. **Pruebas manuales**: Seguir los pasos detallados en cada documento
3. **Pruebas automatizadas**: Usar los scripts de ejemplo como base
4. **Reportar resultados**: Usar matrices de trazabilidad para tracking

### Para Desarrolladores

1. **Implementar tests**: Usar los casos de prueba como especificaciones
2. **TDD**: Escribir tests antes de implementar features
3. **Cobertura**: Asegurar que todos los casos estén cubiertos
4. **CI/CD**: Integrar tests en pipeline de integración continua

### Para Project Managers

1. **Estimación**: Usar matrices de complejidad y duración
2. **Priorización**: Revisar columna de prioridad en matrices
3. **Tracking**: Usar IDs de casos para seguimiento
4. **Reportes**: Generar reportes de cobertura y resultados

---

## Estadísticas del Plan de Pruebas

### Cobertura

| Categoría | Casos de Prueba | Archivos |
|-----------|----------------|----------|
| Watershed CRUD | 10 principales + 3 permisos + 2 integración | 01 |
| Study Cases CRUD | 17 principales + 3 integración | 02 |
| API Endpoints | 16 principales + 2 integración | 03 |
| Validaciones | 13 validaciones principales | 04 |
| Integración E2E | 7 flujos completos | 05 |
| **TOTAL** | **~70 casos de prueba** | **6 docs** |

### Componentes Cubiertos

- ✅ **Modelos**: 10+ modelos principales
- ✅ **Vistas**: 15+ vistas
- ✅ **APIs**: 18 endpoints
- ✅ **Templates**: 12 plantillas HTML
- ✅ **JavaScript**: 10+ archivos JS
- ✅ **Validaciones**: Frontend y Backend
- ✅ **Permisos**: Por rol y propietario
- ✅ **Integraciones**: APIs externas, GIS, filesystem

### Tipos de Pruebas

- 🧪 **Unitarias**: Validaciones, modelos, funciones
- 🔗 **Integración**: APIs, vistas, base de datos
- 🎭 **Funcionales**: Wizards, formularios, workflows
- 🌐 **End-to-End**: Flujos completos con Selenium
- 🔒 **Seguridad**: Permisos, autenticación, autorización
- 📊 **Performance**: Optimizaciones, caching, indexing

---

## Convenciones de Nomenclatura

### IDs de Casos de Prueba

```
CP-<CATEGORIA>-<NUMERO>
```

**Categorías**:
- `WS`: Watershed
- `SC`: Study Case
- `API`: API Endpoint
- `VAL`: Validation
- `INT`: Integration

**Ejemplos**:
- `CP-WS-001`: Caso de prueba de Watershed #1
- `CP-SC-010`: Caso de prueba de Study Case #10
- `CP-API-005`: Caso de prueba de API #5
- `CP-VAL-003`: Caso de validación #3
- `CP-INT-002`: Caso de integración #2

### Prioridades

- **Alta**: Funcionalidad crítica, flujos principales
- **Media**: Funcionalidad importante, casos comunes
- **Baja**: Casos edge, optimizaciones, nice-to-have

---

## Criterios de Aceptación Global

### Cobertura de Código
- Mínimo: 80% de cobertura
- Objetivo: 90% de cobertura
- Crítico: 100% en validaciones de seguridad

### Pruebas Exitosas
- 100% de pruebas unitarias deben pasar
- 100% de pruebas de integración deben pasar
- 95%+ de pruebas E2E deben pasar (puede haber flakiness)

### Performance
- APIs: < 2 segundos de respuesta
- Carga de listas: < 3 segundos
- Ejecución de análisis: Variable según modelo

### Documentación
- Todos los casos documentados
- Todos los resultados registrados
- Todos los bugs reportados con ID de caso

---

## Herramientas Recomendadas

### Testing Frameworks
- **pytest**: Framework principal
- **Django TestCase**: Tests de Django
- **pytest-django**: Plugin pytest para Django
- **Selenium**: Tests E2E con navegador
- **Factory Boy**: Generación de fixtures

### Code Coverage
- **coverage.py**: Medición de cobertura
- **pytest-cov**: Plugin de coverage para pytest

### Mocking
- **unittest.mock**: Mocking de Python
- **responses**: Mock de HTTP requests
- **requests-mock**: Mock de requests library

### CI/CD
- **GitHub Actions**: Automatización
- **GitLab CI**: Pipeline de integración
- **Jenkins**: Servidor de CI

### Reporting
- **Allure**: Reportes visuales
- **pytest-html**: Reportes HTML
- **JUnit XML**: Formato estándar

---

## Próximos Pasos

### Para Implementación

1. **Fase 1**: Implementar tests unitarios
   - Validaciones (04_validation_test_plan.md)
   - Modelos básicos

2. **Fase 2**: Implementar tests de integración
   - API endpoints (03_api_endpoints_test_plan.md)
   - Vistas principales

3. **Fase 3**: Implementar tests E2E
   - Flujos críticos (05_integration_test_plan.md)
   - Watershed creation
   - Study case creation

4. **Fase 4**: Optimización y CI/CD
   - Performance tests
   - Automatización completa
   - Reportes automáticos

### Para Mantenimiento

- Actualizar casos cuando cambien requisitos
- Agregar casos para nuevas features
- Revisar y actualizar datos de prueba
- Mantener scripts de automatización

---

## Referencias

### Código Fuente
- **Directorio**: `geonode/waterproof_fastflood/`
- **Modelos**: `models.py`
- **Vistas**: `views.py`
- **APIs**: `api.py`
- **URLs**: `urls.py`
- **Templates**: `geonode/templates/waterproof_fastflood/`
- **JavaScript**: `geonode/waterproof_fastflood/static/waterproof_fastflood/js/`

### Documentación Externa
- Django Testing: https://docs.djangoproject.com/en/stable/topics/testing/
- pytest-django: https://pytest-django.readthedocs.io/
- Selenium: https://www.selenium.dev/documentation/
- GEOS (GIS): https://docs.djangoproject.com/en/stable/ref/contrib/gis/geos/

---

## Historial de Cambios

| Fecha | Versión | Autor | Descripción |
|-------|---------|-------|-------------|
| 2025-12-11 | 1.0 | Claude | Creación inicial de planes de prueba |

---

## Contacto y Soporte

Para preguntas, sugerencias o reportar issues con los planes de prueba:
- Crear issue en repositorio del proyecto
- Contactar al equipo de QA
- Revisar documentación en `/docs`

---

**Nota**: Este plan de pruebas es un documento vivo que debe actualizarse conforme evoluciona la aplicación.
