# Plan de Pruebas - Integración y End-to-End

## Información General

**Módulo**: WaterProof FastFlood - Pruebas de Integración
**Componente**: Flujos completos end-to-end
**Tipo**: Pruebas de integración, funcionales y de sistema

## Descripción

Este documento describe las pruebas de integración que verifican el funcionamiento correcto de flujos completos que involucran múltiples componentes, vistas, APIs y modelos trabajando juntos.

## Alcance

### Flujos Cubiertos
1. Creación completa de Watershed (3 pasos)
2. Creación completa de Study Case (7 pasos)
3. Clonación de recursos
4. Ejecución de análisis
5. Publicación y compartición
6. Edición de recursos existentes

### Componentes Integrados
- Frontend (templates + JavaScript)
- Backend (views + API)
- Base de datos (models)
- Servicios externos (API de modelos)
- Sistema de archivos (GeoJSON, resultados)

---

## Casos de Prueba de Integración

### CP-INT-001: Flujo Completo - Crear Watershed

#### Descripción
Prueba end-to-end de creación de watershed desde inicio hasta fin.

#### Pre-condiciones
- Usuario autenticado con rol ANALYS
- Ciudad seleccionada
- Bounding box disponible en mapa

#### Flujo de Prueba

**1. Inicio**
```
Usuario → GET /create/
Sistema → Renderiza watershed_create.html
Sistema → Carga ciudades, monedas, mapa
```

**2. Paso 1 - Localización**
```
Usuario → Completa formulario:
  - Name: "Test Watershed Integration"
  - Description: "Watershed para prueba de integración"
  - City: Selecciona de dropdown
  - Area: Dibuja en mapa
  - Bounding Box: Se calcula automáticamente
  - Basin ID: Se obtiene de API

Usuario → Click "Next"
Frontend → Valida campos
Frontend → POST /create/ (step=1, edit=false)

Backend → views.createStepOne()
Backend → Crea Watershed (is_complete=False)
Backend → Crea Polygon (geom=None)
Backend → Response: {"status": "200", "watershedId": 10}

Frontend → Guarda watershedId
Frontend → Avanza a paso 2
```

**3. Paso 2 - DEM**
```
Usuario → Selecciona resolución DEM (150m)
Usuario → Click "Next"

Frontend → POST /create/ (step=2, watershedId=10, demValue=150)

Backend → views.createStepTwo()
Backend → Actualiza Watershed.demvalue = 150
Backend → Actualiza Polygon.resolution = 150
Backend → Response: {"status": "200", "watershedId": 10}

Frontend → Avanza a paso 3
```

**4. Paso 3 - Área NbS**
```
Usuario → Opción A: Dibuja polígono en mapa
          Opción B: Sube archivo GeoJSON

Frontend → Valida geometría
Frontend → POST /validateGeometry/
Backend → Verifica topología y contención
Backend → Response: {"validPolygon": true, "polygonContains": true}

Usuario → Click "Finish"
Frontend → POST /create/ (step=3, watershedId=10, delimitArea=geojson)

Backend → views.createStepThree()
Backend → Actualiza Polygon.geom
Backend → Actualiza Polygon.geom_watershed
Backend → Actualiza Watershed.is_complete = True
Backend → Response: {"status": "200", "watershedId": 10}

Frontend → Redirect a /
Sistema → Muestra watershed en lista
```

#### Verificaciones

**Base de Datos:**
```sql
SELECT * FROM waterproof_fastflood_watershed WHERE id = 10;
-- Verificar:
-- - name = "Test Watershed Integration"
-- - is_complete = TRUE
-- - demvalue = 150
-- - added_by = <user_id>

SELECT * FROM waterproof_fastflood_polygon WHERE watershed_id = 10;
-- Verificar:
-- - geom IS NOT NULL
-- - geom_watershed IS NOT NULL
-- - resolution = 150
```

**UI:**
- Watershed visible en lista
- Geometría renderizada en mapa
- Botones de View/Edit/Clone disponibles

#### Criterios de Aceptación
- [ ] Todos los 3 pasos se completan sin errores
- [ ] Watershed creado en BD con todos los datos
- [ ] Polygon asociado correctamente
- [ ] Geometría válida y guardada
- [ ] `is_complete = True` al finalizar
- [ ] Visible en lista inmediatamente
- [ ] Usuario puede ver/editar/clonar

#### Tiempo Estimado
5-10 minutos (usuario)

---

### CP-INT-002: Flujo Completo - Crear Study Case

#### Descripción
Prueba end-to-end de creación de study case con todos los pasos.

#### Pre-condiciones
- Usuario autenticado
- Al menos 1 watershed completo disponible
- NbS disponibles para la ciudad
- Datos de damage disponibles para el país

#### Flujo de Prueba

**1. Inicio**
```
Usuario → GET /studyCase/create
Sistema → Renderiza studycases_form.html
Sistema → Carga watersheds, portfolios, monedas
```

**2. Paso 1 - Definición**
```
Usuario → Completa:
  - Name: "Test Study Case Integration"
  - Description: "Study case para prueba de integración"
  - City: Selecciona
  - Watersheds: Selecciona 1+

Usuario → Click "Next"

Frontend → Verifica nombre único
Frontend → POST /save/ (name, description, city_id, watersheds[])

Backend → api.save()
Backend → Valida nombre único por usuario
Backend → Crea StudyCases
Backend → Asocia watersheds (many-to-many)
Backend → Response: {"id_study_case": 25}

Frontend → Guarda id_study_case
Frontend → Avanza a paso 2
```

**3. Paso 2 - Mercado de Carbono**
```
Usuario → Selecciona "Sí" para mercado de carbono
Usuario → Ingresa:
  - Value: 25.50
  - Currency: USD

Usuario → Click "Next"

Frontend → POST /save/ (carbon_market=true, ...)

Backend → api.save()
Backend → Actualiza StudyCases:
  - benefit_carbon_market = True
  - cm_value = 25.50
  - cm_currency = "USD"
Backend → Response: {"id_study_case": 25}

Frontend → Avanza a paso 3
```

**4. Paso 3 - Portafolios**
```
Usuario → Selecciona portafolios (ej: [1, 3])

Usuario → Click "Next"

Frontend → POST /save/ (portfolios[]=[1, 3])

Backend → api.save()
Backend → Limpia portfolios anteriores
Backend → Asocia nuevos portfolios
Backend → Response: {"id_study_case": 25}

Frontend → Avanza a paso 4
```

**5. Paso 4 - Parámetros de Modelado**
```
Frontend → GET /max-damage-cost/<country_iso>
Backend → Retorna max damage costs por país

Usuario → Completa parámetros:
  - Ocean elevation: 0.5
  - Commercial value: 30
  - Industrial value: 20
  - Exponential params: 1
  - Channel params: ...
  - Damage currency: USD

Usuario → Click "Next"

Frontend → POST /save/ (ocean_elevation, commercial_value, ...)

Backend → api.save()
Backend → Actualiza todos los parámetros
Backend → Response: {"id_study_case": 25}

Frontend → Avanza a paso 5
```

**6. Paso 5 - Parámetros Financieros**
```
Frontend → GET /parametersbycountry/<city_id>
Backend → Retorna parámetros por defecto del país

Usuario → Completa costos de plataforma:
  - Director: 5000
  - Implementation: 3000
  - Discount rate: 5.5
  - ...

Usuario → Click "Next"

Frontend → POST /save/ (director, implementation, ...)

Backend → api.save()
Backend → Actualiza parámetros financieros
Backend → Response: {"id_study_case": 25}

Frontend → Avanza a paso 6
```

**7. Paso 6 - Actividades NbS**
```
Frontend → POST /nbs/ (process=Create)
Backend → api.getNBS()
Backend → Retorna NbS disponibles (admin + usuario)

Usuario → Selecciona NbS (ej: [1, 2, 5])

Frontend → POST /save/ (nbs[]=[1, 2, 5])

Backend → api.save()
Backend → Crea/elimina registros en StudyCases_NBS_Fastflood
Backend → Response: {"id_study_case": 25}

Frontend → Obtiene parámetros biofísicos
Frontend → GET /bioByMacro/<watershed_id>
Backend → Retorna parámetros por macro región

Usuario → Ajusta valores de carbono si necesario
Usuario → Click "Next"

Frontend → POST /savebio/
Backend → api.saveBiophysicals()
Backend → Guarda parámetros en StudyCases_Parameters_Bio

Frontend → Obtiene datos de daño
Frontend → GET /damageInfo/<country_iso>
Backend → Retorna curvas de daño

Usuario → Revisa/ajusta curvas de daño
Usuario → Click "Next"

Frontend → POST /savedamage/
Backend → api.saveDamageData()
Backend → Guarda curvas en StudyCase_damage_curve
Backend → Guarda max damage en StudyCase_depth_damage

Frontend → Avanza a paso 7
```

**8. Paso 7 - Parámetros de Análisis**
```
Usuario → Completa:
  - Analysis type: FULL (opción 1)
  - Analysis currency: USD
  - Period: 20 años
  - Climate scenario: RCP 4.5
  - Change year: 2050
  - Storm duration: 24h
  - Quantile: 50

Usuario → Click "Finish"

Frontend → POST /save/ (analysis_type=1, ...)

Backend → api.save()
Backend → Actualiza StudyCases:
  - is_complete = True
  - analysis_type = "FULL"
  - analysis_currency = "USD"
  - ...
Backend → Response: {"id_study_case": 25}

Frontend → GET /currencys/?id=25&currency=USD
Backend → api.getStudyCaseCurrencys()
Backend → Retorna monedas con exchange rates

Frontend → POST /save/ (currencys=[...])
Backend → Guarda exchange rates en StudyCases_Currency_Fastflood

Frontend → Redirect a /studyCase/
Sistema → Muestra study case en lista
```

#### Verificaciones

**Base de Datos:**
```sql
-- Study Case principal
SELECT * FROM waterproof_fastflood_studycases WHERE id = 25;
-- is_complete = TRUE
-- benefit_carbon_market = TRUE
-- analysis_type = 'FULL'

-- Watersheds asociados
SELECT * FROM waterproof_fastflood_studycases_watershed WHERE studycases_id = 25;

-- Portfolios asociados
SELECT * FROM study_case_portfolios WHERE studycase_id = 25;

-- NbS asociados
SELECT * FROM waterproof_fastflood_studycases_nbs WHERE studycase_id = 25;

-- Parámetros biofísicos
SELECT COUNT(*) FROM waterproof_fastflood_parameters_biophysical WHERE study_case_id = 25;
-- Debe haber múltiples registros (uno por lucode)

-- Curvas de daño
SELECT COUNT(*) FROM waterproof_fastflood_damage_curves WHERE study_case_id = 25;

-- Max damage
SELECT * FROM waterproof_fastflood_depth_damages WHERE study_case_id = 25;

-- Exchange rates
SELECT * FROM waterproof_fastflood_studycase_currency WHERE studycase_id = 25;
```

**UI:**
- Study case visible en lista
- Botones View/Edit/Clone/Run disponibles
- Estado: Completo, listo para ejecutar

#### Criterios de Aceptación
- [ ] Todos los 7 pasos se completan
- [ ] Study case creado con `is_complete = True`
- [ ] Todas las relaciones establecidas correctamente
- [ ] Parámetros biofísicos guardados
- [ ] Datos de daño guardados
- [ ] Exchange rates calculados y guardados
- [ ] Visible en lista
- [ ] Listo para ejecutar análisis

#### Tiempo Estimado
20-30 minutos (usuario)

---

### CP-INT-003: Flujo Completo - Ejecutar Análisis

#### Descripción
Prueba de ejecución de análisis de un study case completo.

#### Pre-condiciones
- Study case completo (`is_complete = True`)
- Folder name asignado
- Todos los parámetros configurados

#### Flujo de Prueba

**1. Preparación**
```
Usuario → Navega a /studyCase/view/25
Sistema → Muestra botón "Run Analysis"
```

**2. Generar JSON de Configuración**
```
Usuario → Click "Run Analysis"

Frontend → POST /getjson/ (id_study_case=25)

Backend → api.createJson()
Backend → Obtiene Study Case y Watershed
Backend → Obtiene parámetros de Fastflood_json_params
Backend → Obtiene NbS y sus parámetros (manning, infiltration)
Backend → Construye JSON completo
Backend → POST a servidor externo (timeout 5s)
  URL: https://dev.water-proof.org/wf-models/save_json

Servidor Externo → Guarda JSON en filesystem
Servidor Externo → Response: {"message": "JSON saved successfully"}

Backend → Response a Frontend:
  {"status": "ok", "response_data": {...}}
```

**3. Marcar como En Ejecución**
```
Frontend → POST /fastflood/run/ (run_analysis=true, id_study_case=25)

Backend → api.run()
Backend → Actualiza StudyCases.is_run_analysis = True
Backend → Response: {"id_study_case": 25}

Frontend → Muestra indicador de "Running..."
```

**4. Monitorear Ejecución**
```
Frontend → Polling cada 10s:
  GET /logsinfobyid/25/

Backend → api.getStudyCasesLogStatus()
Backend → Consulta log_fastflood WHERE study_case_id = 25
Backend → Response: [
  {"step_id": 1, "status": "completed", "message": "..."},
  {"step_id": 2, "status": "running", "message": "..."}
]

Frontend → Actualiza UI con progreso
```

**5. Finalización**
```
Sistema → Análisis completa
Sistema → Genera resultados en /app/outputs/fastflood/{folder}/

Frontend → Detecta status "completed" en todos los steps
Frontend → Muestra mensaje de éxito
Frontend → Habilita botón "Download Results"
```

#### Verificaciones

**JSON Generado (muestra):**
```json
{
    "ProjectPath": "/app/outputs/fastflood/sc_25_folder",
    "NameBasinFolder": "WI_10",
    "DemResolution": 150,
    "NbS": {
        "0-Reforestation": {
            "10-Forest": {
                "Manning": 0.5,
                "Infiltration": 0.8
            }
        }
    },
    "ClimateParams": {
        "Scenario": "R45",
        "Period": 2050
    }
}
```

**Base de Datos:**
```sql
SELECT is_run_analysis FROM waterproof_fastflood_studycases WHERE id = 25;
-- is_run_analysis = TRUE

SELECT * FROM log_fastflood WHERE study_case_id = 25 ORDER BY step_id;
-- Múltiples registros de log
```

**Sistema de Archivos:**
```
/app/outputs/fastflood/sc_25_folder/
├── AccessData.json
├── WI_10/
│   ├── in/
│   │   ├── watershed/watershed.shp
│   │   └── 06-FLOOD/Raster/
│   │       ├── DEM.tif
│   │       ├── Manning.tif
│   │       └── ...
│   └── out/
│       └── results/
```

#### Criterios de Aceptación
- [ ] JSON generado correctamente
- [ ] JSON enviado a servidor externo exitosamente
- [ ] Study case marcado como `is_run_analysis = True`
- [ ] Logs de ejecución registrados
- [ ] Resultados generados
- [ ] Usuario puede descargar resultados

#### Tiempo Estimado
Depends on model execution (5-60 minutos)

---

### CP-INT-004: Flujo Completo - Clonar Study Case

#### Descripción
Clonar un study case existente a otro país/ciudad.

#### Pre-condiciones
- Study case original completo
- Usuario autenticado
- País destino diferente

#### Flujo de Prueba

**1. Inicio**
```
Usuario → Click "Clone" en study case 25
Sistema → Redirect a /studyCase/clone/25/MEX
  (MEX = país destino, puede ser diferente del original)
```

**2. Cargar Datos Originales**
```
Backend → views.clone_study_case()
Backend → Obtiene Study Case 25
Backend → Obtiene portfolios originales
Backend → Obtiene NbS originales
Backend → GET MaxDamageCost para país destino (MEX)
Backend → Renderiza studycases_clone.html con datos precargados

Frontend → Muestra:
  - Name: "Copy of Test Study Case Integration" (sugerido)
  - Description: Original
  - Watershed: Original seleccionado
  - Portfolios: Originales marcados
  - NbS: Originales + personalizados del usuario actual
  - Max Damage: Según país destino (MEX)
```

**3. Modificar y Guardar**
```
Usuario → Modifica:
  - Name: "Test Study Case - Mexico Clone"
  - City: Cambia a ciudad de México
  - Watersheds: Selecciona watershed(s) en México
  - Max damage costs: Ajusta según valores de MEX

Usuario → Completa wizard (pasos 1-7)

Sistema → Ejecuta mismo flujo que CP-INT-002
Sistema → Crea NUEVO study case (no modifica original)
Sistema → added_by = usuario actual
```

#### Verificaciones

**Base de Datos:**
```sql
-- Original intacto
SELECT * FROM waterproof_fastflood_studycases WHERE id = 25;
-- name = "Test Study Case Integration"
-- added_by = <original_user>

-- Nuevo study case
SELECT * FROM waterproof_fastflood_studycases WHERE id = 30;
-- name = "Test Study Case - Mexico Clone"
-- added_by = <current_user>
-- city_id = <mexico_city_id>

-- Verifica que datos clave se copiaron
SELECT analysis_type FROM waterproof_fastflood_studycases WHERE id IN (25, 30);
-- Ambos deben tener mismo analysis_type

-- NbS copiados
SELECT nbs_id FROM waterproof_fastflood_studycases_nbs WHERE studycase_id = 30;
-- Debe incluir NbS del original que existan en país destino
```

#### Criterios de Aceptación
- [ ] Study case original NO modificado
- [ ] Nuevo study case creado con ID diferente
- [ ] `added_by` es usuario actual (no original)
- [ ] Datos copiados correctamente
- [ ] Max damage costs según país destino
- [ ] NbS disponibles según país destino
- [ ] Usuario puede editar el clon independientemente

---

### CP-INT-005: Flujo Completo - Editar Watershed

#### Descripción
Editar un watershed existente en múltiples pasos.

#### Pre-condiciones
- Watershed completo existente
- Usuario propietario

#### Flujo de Prueba

**1. Inicio**
```
Usuario → Click "Edit" en watershed 10
Sistema → GET /edit/10
Backend → Carga datos existentes
Frontend → Precarga formulario con datos
```

**2. Editar Paso 1**
```
Usuario → Modifica:
  - Name: "Test Watershed - Updated"
  - Description: "Descripción actualizada"

Usuario → Click "Next"

Frontend → POST /create/ (step=1, edit=true, watershedId=10)

Backend → views.createStepOne() (modo edit)
Backend → Actualiza Watershed existente (no crea nuevo)
Backend → updated_date se actualiza automáticamente
Backend → Response: {"status": "200", "watershedId": 10}
```

**3. Editar Paso 2**
```
Usuario → Cambia resolución DEM: 40m
Usuario → Click "Next"

Frontend → POST /create/ (step=2, watershedId=10, demValue=40)

Backend → views.createStepTwo()
Backend → Actualiza demvalue y resolution
Backend → Response: {"status": "200", "watershedId": 10}
```

**4. Editar Paso 3**
```
Usuario → Redibuja polígono de área
Usuario → Click "Finish"

Frontend → POST /create/ (step=3, watershedId=10, delimitArea=new_geojson)

Backend → views.createStepThree()
Backend → Actualiza Polygon.geom
Backend → Actualiza delimitation_date
Backend → Response: {"status": "200", "watershedId": 10}
```

#### Verificaciones

**Base de Datos:**
```sql
SELECT
  name,
  demvalue,
  updated_date > creation_date as was_updated
FROM waterproof_fastflood_watershed
WHERE id = 10;

-- name = "Test Watershed - Updated"
-- demvalue = 40
-- was_updated = TRUE
```

#### Criterios de Aceptación
- [ ] No se crea nuevo registro (mismo ID)
- [ ] Campos actualizados correctamente
- [ ] `updated_date` actualizado automáticamente
- [ ] Cambios visibles inmediatamente en lista

---

### CP-INT-006: Flujo de Visibilidad - Público/Privado

#### Descripción
Cambiar visibilidad de un study case y verificar permisos.

#### Pre-condiciones
- Study case privado existente
- Usuario propietario
- Otro usuario (no propietario)

#### Flujo de Prueba

**1. Estado Inicial - Privado**
```
Study Case 25:
  - is_public = False
  - added_by = user1

Usuario user2 (otro usuario) → GET /studyCase/
Sistema → Lista NO incluye study case 25
```

**2. Hacer Público**
```
Usuario user1 (propietario) → Click "Make Public"

Frontend → POST /studyCase/public/25

Backend → api.public()
Backend → Valida que request.user es propietario
Backend → Actualiza is_public = True
Backend → Actualiza edit_date
Backend → Response: {"status": "200"}

Frontend → Actualiza botón a "Make Private"
```

**3. Verificar Visibilidad**
```
Usuario user2 → GET /studyCase/
Sistema → Lista INCLUYE study case 25
Sistema → user2 puede VER pero NO editar/eliminar

Usuario user2 → Click "View" en study case 25
Sistema → GET /studyCase/view/25
Sistema → Muestra todos los datos en modo solo-lectura
Sistema → NO muestra botones Edit/Delete/Clone
```

**4. Usuario No Autenticado**
```
Usuario anónimo → GET /studyCase/
Sistema → Lista incluye solo study cases públicos
Sistema → Incluye study case 25
Sistema → Solo muestra botón "View"
```

**5. Hacer Privado**
```
Usuario user1 → Click "Make Private"

Frontend → POST /studyCase/private/25

Backend → api.private()
Backend → Actualiza is_public = False
Backend → Response: {"status": "200"}
```

**6. Verificar Ocultamiento**
```
Usuario user2 → Refresh /studyCase/
Sistema → Study case 25 ya NO visible

Usuario anónimo → GET /studyCase/
Sistema → Study case 25 ya NO visible
```

#### Verificaciones

**Base de Datos:**
```sql
SELECT
  is_public,
  edit_date
FROM waterproof_fastflood_studycases
WHERE id = 25;

-- Verificar cambios de estado y timestamps
```

**Permisos:**
| Usuario | Público | Privado | Puede Ver | Puede Editar |
|---------|---------|---------|-----------|--------------|
| Propietario | Sí | Sí | Sí | Sí |
| Otro autenticado | Sí | No | Sí si público | No |
| Admin | Sí | Sí | Sí | Sí |
| Anónimo | Sí | No | Sí si público | No |

#### Criterios de Aceptación
- [ ] Toggle público/privado funciona
- [ ] `edit_date` actualizado en cada cambio
- [ ] Visibilidad correcta según estado
- [ ] Permisos respetados por rol
- [ ] UI refleja estado actual
- [ ] Botones apropiados según permisos

---

### CP-INT-007: Flujo de Eliminación con Dependencias

#### Descripción
Intentar eliminar watershed que tiene study cases asociados.

#### Pre-condiciones
- Watershed con study cases asociados

#### Flujo de Prueba

**1. Verificar Dependencias**
```
Frontend → Antes de confirmar eliminación
Frontend → GET /watershedUsedByStudyCases/10

Backend → api.watershedUsedByStudyCases()
Backend → Consulta StudyCases.objects.filter(watershed=10).count()
Backend → Response: {"count": 2}

Frontend → Muestra advertencia:
  "This watershed is used by 2 study cases. Cannot delete."
Frontend → Deshabilita botón de confirmación
```

**2. Eliminar Study Cases Primero**
```
Usuario → Elimina study cases asociados
Usuario → DELETE study case 25
Usuario → DELETE study case 30

Frontend → Verificación:
Frontend → GET /watershedUsedByStudyCases/10
Backend → Response: {"count": 0}

Frontend → Habilita botón de eliminación
```

**3. Eliminar Watershed**
```
Usuario → Click "Delete Watershed"
Usuario → Confirma en modal

Frontend → POST /delete/10

Backend → views.deleteWatershed()
Backend → Verifica count de study cases
Backend → Elimina Watershed (cascade elimina Polygon)
Backend → Response: {"status": "200"}

Frontend → Remueve de lista
Frontend → Redirect a /
```

#### Verificaciones

**Base de Datos:**
```sql
-- Watershed eliminado
SELECT COUNT(*) FROM waterproof_fastflood_watershed WHERE id = 10;
-- count = 0

-- Polygon eliminado (cascade)
SELECT COUNT(*) FROM waterproof_fastflood_polygon WHERE watershed_id = 10;
-- count = 0
```

#### Criterios de Aceptación
- [ ] No permite eliminar con dependencias
- [ ] Muestra mensaje claro
- [ ] Permite eliminar después de limpiar dependencias
- [ ] Cascade delete funciona
- [ ] No deja registros huérfanos

---

## Matriz de Flujos de Integración

| ID | Flujo | Componentes | Duración | Complejidad | Prioridad |
|----|-------|-------------|----------|-------------|-----------|
| CP-INT-001 | Crear Watershed | Views, API, GIS | 5-10 min | Media | Alta |
| CP-INT-002 | Crear Study Case | Views, API, External | 20-30 min | Alta | Alta |
| CP-INT-003 | Ejecutar Análisis | API, External, FS | 5-60 min | Alta | Alta |
| CP-INT-004 | Clonar Study Case | Views, API, DB | 20-30 min | Media | Media |
| CP-INT-005 | Editar Watershed | Views, GIS | 5-10 min | Baja | Media |
| CP-INT-006 | Público/Privado | API, Permisos | 1-2 min | Baja | Media |
| CP-INT-007 | Eliminar con Deps | API, DB | 2-5 min | Media | Alta |

---

## Configuración de Ambiente de Pruebas

### Datos de Prueba Requeridos

**Usuarios:**
```python
# Admin
username: admin_test
role: ADMIN
country: USA

# Analyst 1
username: analyst1_test
role: ANALYS
country: USA

# Analyst 2
username: analyst2_test
role: ANALYS
country: MEX
```

**Ciudades:**
```python
# USA
{"id": 1, "name": "Los Angeles", "country": "USA"}
{"id": 2, "name": "New York", "country": "USA"}

# Mexico
{"id": 10, "name": "Ciudad de México", "country": "MEX"}
```

**Basins:**
```python
{"id": 1, "label": "Amazon"}
{"id": 2, "label": "Mississippi"}
```

**NbS:**
```python
# Admin NbS (global)
{"id": 1, "name": "Reforestation", "added_by": admin, "country": None}
{"id": 2, "name": "Wetland Restoration", "added_by": admin, "country": None}

# Country-specific
{"id": 10, "name": "Urban Green Roofs", "added_by": analyst1, "country": "USA"}
{"id": 20, "name": "Riparian Buffer", "added_by": analyst2, "country": "MEX"}
```

**Damage Data:**
```python
# Por cada país: USA, MEX, etc.
# Multiple records por flood_depth y damage_class
```

---

## Scripts de Prueba E2E

```python
# test_integration_flows.py
from django.test import TestCase, Client
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class IntegrationFlowTest(TestCase):
    """
    Pruebas end-to-end usando Selenium
    """

    def setUp(self):
        self.driver = webdriver.Chrome()
        self.driver.implicitly_wait(10)
        self.client = Client()

        # Crear datos de prueba
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.city = Cities.objects.create(name='Test City')

    def tearDown(self):
        self.driver.quit()

    def test_complete_watershed_creation(self):
        """CP-INT-001: Crear watershed completo"""

        # Login
        self.driver.get('http://localhost:8000/account/login/')
        self.driver.find_element(By.NAME, 'username').send_keys('testuser')
        self.driver.find_element(By.NAME, 'password').send_keys('testpass123')
        self.driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]').click()

        # Navegar a creación
        self.driver.get('http://localhost:8000/create/')

        # Paso 1
        self.driver.find_element(By.NAME, 'watershedName').send_keys('E2E Test Watershed')
        self.driver.find_element(By.NAME, 'watershedDesc').send_keys('Automated test')

        # Seleccionar ciudad
        city_select = Select(self.driver.find_element(By.NAME, 'watershedCity'))
        city_select.select_by_value(str(self.city.id))

        # Click Next
        self.driver.find_element(By.ID, 'next-step-1').click()

        # Esperar paso 2
        WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located((By.ID, 'step-2'))
        )

        # Paso 2 - Seleccionar DEM
        dem_radio = self.driver.find_element(By.CSS_SELECTOR, 'input[value="150"]')
        dem_radio.click()

        self.driver.find_element(By.ID, 'next-step-2').click()

        # Esperar paso 3
        WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located((By.ID, 'step-3'))
        )

        # Paso 3 - Subir GeoJSON (simulado)
        # En prueba real, interactuar con mapa
        self.driver.find_element(By.ID, 'finish-button').click()

        # Verificar redirect a lista
        WebDriverWait(self.driver, 10).until(
            EC.url_contains('/list')
        )

        # Verificar watershed en BD
        watershed = Watershed.objects.filter(
            name='E2E Test Watershed'
        ).first()

        self.assertIsNotNone(watershed)
        self.assertTrue(watershed.is_complete)
        self.assertEqual(watershed.demvalue, 150)
```

---

## Herramientas Recomendadas

### Para Pruebas de Integración

1. **Django Test Client**: Pruebas de vistas y APIs
2. **Selenium**: Pruebas E2E con navegador
3. **Factory Boy**: Generación de datos de prueba
4. **responses**: Mock de llamadas HTTP externas
5. **pytest-django**: Framework de pruebas
6. **coverage.py**: Cobertura de código

### Configuración

```python
# conftest.py
import pytest
from pytest_factoryboy import register
from tests.factories import UserFactory, WatershedFactory

register(UserFactory)
register(WatershedFactory)

@pytest.fixture
def authenticated_client(client, user):
    client.force_login(user)
    return client
```

---

## Referencias

- **Flujos de usuario**: `views.py`
- **APIs**: `api.py`
- **JavaScript**: `geonode/waterproof_fastflood/static/waterproof_fastflood/js/`
- **Templates**: `geonode/templates/waterproof_fastflood/`
