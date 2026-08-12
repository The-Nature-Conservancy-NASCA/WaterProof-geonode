# Plan de Pruebas - API Endpoints

## Información General

**Módulo**: WaterProof FastFlood - API Endpoints
**Componente**: APIs REST para consultas y operaciones de datos
**Archivo de referencia**: `geonode/waterproof_fastflood/api.py`
**URLs**: Definidas en `geonode/waterproof_fastflood/urls.py`

## Descripción del Componente

El módulo API proporciona endpoints REST para:
- Consulta de datos de watersheds
- Obtención de parámetros por región/país
- Gestión de datos biofísicos
- Información de daños por inundación
- Operaciones de NbS (Nature-based Solutions)
- Conversión de monedas
- Generación de JSON para modelos

## Categorías de Endpoints

### 1. Consulta de Watersheds
- Obtener watersheds por ciudad
- Obtener información de watershed por ID
- Verificar uso en study cases
- Listar todos los watersheds

### 2. Parámetros y Configuración
- Parámetros biofísicos por macro región
- Parámetros por país
- Información de daño por país
- Costos máximos de daño

### 3. NbS y Portafolios
- Listar NbS disponibles
- Configuración de NbS por study case

### 4. Monedas y Exchange Rates
- Monedas de study case
- Tasas de cambio

### 5. Análisis y Ejecución
- Crear JSON para modelos
- Obtener logs de ejecución

---

## Casos de Prueba

### CP-API-001: Verificar Uso de Watershed en Study Cases

#### Endpoint
```
GET /watershedUsedByStudyCases/<int:idx>
```

#### Descripción
Verificar cuántos study cases usan un watershed específico.

#### Pre-condiciones
- Watershed existente con ID válido
- Study cases asociados (o no)

#### Request
```http
GET /watershedUsedByStudyCases/10
```

#### Response Esperado - Con Study Cases
```json
{
    "count": 3
}
```

#### Response Esperado - Sin Study Cases
```json
{
    "count": 0
}
```

#### Response Esperado - ID Inválido
```json
{
    "error": "value must be integer"
}
```

#### Criterios de Aceptación
- [ ] Retorna count correcto de study cases
- [ ] Maneja IDs inválidos con error
- [ ] Método: GET
- [ ] Decorador: @api_view(['GET'])
- [ ] Código: Línea 23 en `api.py`

---

### CP-API-002: Obtener Watersheds por Ciudad

#### Endpoint
```
GET /watershedbycity/<int:id_city>/
```

#### Descripción
Obtener lista de watersheds completos de una ciudad para el usuario actual.

#### Pre-condiciones
- Usuario autenticado
- Watersheds existentes en la ciudad
- Watersheds marcados como `is_complete=True`

#### Request
```http
GET /watershedbycity/1/
Authorization: Bearer <token>
```

#### Response Esperado - Éxito
```json
[
    {
        "id": 10,
        "name": "Watershed A",
        "description": "Description A",
        "ws_area": 1500.50,
        "demvalue": 150
    },
    {
        "id": 11,
        "name": "Watershed B",
        "description": "Description B",
        "ws_area": 2000.75,
        "demvalue": 40
    }
]
```

#### Response Esperado - Ciudad Sin Watersheds
```json
[]
```

#### Response Esperado - ID Inválido
```json
{
    "error": "invalid id"
}
```

#### Criterios de Aceptación
- [ ] Solo watersheds del usuario actual
- [ ] Solo watersheds con `is_complete=True`
- [ ] Filtrado por ciudad correcto
- [ ] Retorna campos: id, name, description, ws_area, demvalue
- [ ] Código: Línea 34 en `api.py`

---

### CP-API-003: Obtener Información de Watershed por ID

#### Endpoint
```
GET /infoWatershed/<int:idx>
```

#### Descripción
Obtener información detallada de un watershed incluyendo datos de polygon.

#### Request
```http
GET /infoWatershed/10
```

#### Response Esperado
```json
[
    {
        "id": 10,
        "name": "Test Watershed",
        "polygon__bbox": "[[-118.5, 33.5], [-118.0, 34.0]]",
        "polygon__resolution": 150,
        "polygon__id": 15
    }
]
```

#### Response Esperado - No Encontrado
```json
{
    "error": "invalid id"
}
```

#### Criterios de Aceptación
- [ ] Retorna datos del watershed con join a polygon
- [ ] Campos incluidos: id, name, bbox, resolution, polygon_id
- [ ] Maneja watersheds sin polygon asociado
- [ ] Código: Línea 67 en `api.py`

---

### CP-API-004: Listar Todos los Watersheds

#### Endpoint
```
GET /watersheds
```

#### Descripción
Obtener lista de todos los watersheds del sistema.

#### Request
```http
GET /watersheds
```

#### Response Esperado
```json
[
    {
        "id": 10,
        "name": "Watershed A",
        "polygon__bbox": "[[-10, 10], [10, -10]]",
        "polygon__resolution": 150,
        "polygon__id": 20
    },
    {
        "id": 11,
        "name": "Watershed B",
        "polygon__bbox": "[[-20, 20], [20, -20]]",
        "polygon__resolution": 40,
        "polygon__id": 21
    }
]
```

#### Criterios de Aceptación
- [ ] Retorna todos los watersheds del sistema
- [ ] No requiere autenticación
- [ ] Incluye información de polygon
- [ ] Código: Línea 58 en `api.py`

---

### CP-API-005: Obtener Parámetros Biofísicos por Macro Región

#### Endpoint
```
GET /bioByMacro/<int:watershed_id>
```

#### Descripción
Obtener parámetros biofísicos por defecto según la macro región del watershed.

#### Pre-condiciones
- Watershed con polygon asociado
- Polygon con basin_id válido
- Basin con label (macro región)

#### Request
```http
GET /bioByMacro/10
```

#### Response Esperado
```json
[
    {
        "code": 10,
        "macro_region": "Amazon",
        "lulc": "Forest",
        "c_above": 50.5,
        "c_below": 30.2,
        "c_soil": 20.1,
        "c_dead": 10.3
    },
    {
        "code": 20,
        "macro_region": "Amazon",
        "lulc": "Shrubs",
        "c_above": 40.5,
        "c_below": 25.2,
        "c_soil": 15.1,
        "c_dead": 8.3
    }
]
```

#### Response Esperado - Error
```json
{
    "error": <mensaje_error>
}
```

#### Criterios de Aceptación
- [ ] Obtiene basin_id del polygon del watershed
- [ ] Obtiene macro_region (label) del basin
- [ ] Filtra por macro_region y default='y'
- [ ] Ordena por lucode
- [ ] Retorna solo campos relevantes de carbono
- [ ] Código: Línea 286 en `api.py`

---

### CP-API-006: Obtener Parámetros Biofísicos por Study Case

#### Endpoint
```
GET /bioById/<int:study_case_id>
```

#### Descripción
Obtener parámetros biofísicos guardados en un study case.

#### Pre-condiciones
- Study case existente
- Parámetros biofísicos guardados

#### Request
```http
GET /bioById/25
```

#### Response Esperado
```json
[
    {
        "code": 10,
        "macro_region": "Amazon",
        "lulc": "Forest",
        "c_above": 55.0,
        "c_below": 32.0,
        "c_soil": 22.0,
        "c_dead": 11.0
    }
]
```

#### Criterios de Aceptación
- [ ] Obtiene datos de `StudyCases_Parameters_Bio`
- [ ] Filtra por study_case_id
- [ ] Ordena por lucode
- [ ] Retorna valores personalizados del study case
- [ ] Código: Línea 309 en `api.py`

---

### CP-API-007: Obtener Información de Daño por País

#### Endpoint
```
GET /damageInfo/<str:isoCountryValue>
```

#### Descripción
Obtener curvas de daño por profundidad de inundación para un país.

#### Pre-condiciones
- País con código ISO válido
- Datos de daño disponibles para el país

#### Request
```http
GET /damageInfo/USA
```

#### Response Esperado
```json
[
    {
        "iso": "USA",
        "flood_depth": 0.5,
        "country": "United States",
        "continent": "NA",
        "damage_class": "residential",
        "damage_factor": "0.10"
    },
    {
        "iso": "USA",
        "flood_depth": 1.0,
        "country": "United States",
        "continent": "NA",
        "damage_class": "residential",
        "damage_factor": "0.25"
    }
]
```

#### Criterios de Aceptación
- [ ] Filtra por código ISO del país
- [ ] Ordena por flood_depth
- [ ] Formatea damage_factor a 2 decimales
- [ ] Retorna todas las clases de daño
- [ ] Código: Línea 330 en `api.py`

---

### CP-API-008: Obtener Costo Máximo de Daño por País

#### Endpoint
```
GET /max-damage-cost/<str:countryIso>
```

#### Descripción
Obtener costos máximos de daño por clase para un país.

#### Request
```http
GET /max-damage-cost/USA
```

#### Response Esperado
```json
[
    {
        "iso": "USA",
        "damage_class": "residential",
        "max_damage_cost": "100000.00"
    },
    {
        "iso": "USA",
        "damage_class": "commercial",
        "max_damage_cost": "150000.00"
    },
    {
        "iso": "USA",
        "damage_class": "industrial",
        "max_damage_cost": "200000.00"
    },
    {
        "iso": "USA",
        "damage_class": "infraroad",
        "max_damage_cost": "80000.00"
    },
    {
        "iso": "USA",
        "damage_class": "agriculture",
        "max_damage_cost": "50000.00"
    }
]
```

#### Criterios de Aceptación
- [ ] Filtra por código ISO del país
- [ ] Ordena por damage_class
- [ ] Formatea max_damage_cost a 2 decimales
- [ ] Retorna todas las clases: residential, commercial, industrial, infraroad, agriculture
- [ ] Código: Línea 350 en `api.py`

---

### CP-API-009: Obtener Parámetros por País

#### Endpoint
```
GET /parametersbycountry/<int:id_city>/
```

#### Descripción
Obtener parámetros de costos de gestión y descuento por país de la ciudad.

#### Pre-condiciones
- Ciudad existente
- País con parámetros configurados

#### Request
```http
GET /parametersbycountry/1/
```

#### Response Esperado
```json
[
    {
        "id": 1,
        "country_id": 1,
        "program_director": 5000.00,
        "implementation_manager": 3000.00,
        "monitoring_manager": 2500.00,
        "discount_rate": 5.5
    }
]
```

#### Response Esperado - ID Inválido
```json
{
    "error": "invalid id"
}
```

#### Criterios de Aceptación
- [ ] Obtiene país desde ciudad
- [ ] Filtra parámetros por país
- [ ] Retorna datos de `ManagmentCosts_Discount`
- [ ] Código: Línea 366 en `api.py`

---

### CP-API-010: Obtener NbS Disponibles

#### Endpoint
```
POST /nbs/
```

#### Descripción
Obtener lista de NbS (Nature-based Solutions) disponibles según contexto.

#### Pre-condiciones
- Ciudad seleccionada
- Usuario autenticado

#### Request - Proceso Create
```http
POST /nbs/
Content-Type: application/x-www-form-urlencoded

city_id=1&process=Create&id_study_case=
```

#### Response Esperado
```json
[
    {
        "id": 1,
        "name": "Reforestation",
        "unit_implementation_cost": 1000.00,
        "unit_maintenance_cost": 50.00,
        "periodicity_maitenance": 1,
        "unit_oportunity_cost": 200.00,
        "country": "USA",
        "currency": "USD"
    },
    {
        "id": 2,
        "name": "Wetland Restoration",
        "unit_implementation_cost": 1500.00,
        "unit_maintenance_cost": 75.00,
        "periodicity_maitenance": 2,
        "unit_oportunity_cost": 300.00,
        "country": "USA",
        "currency": "USD"
    }
]
```

#### Request - Proceso Edit
```http
POST /nbs/
Content-Type: application/x-www-form-urlencoded

city_id=1&process=Edit&id_study_case=25
```

#### Response Esperado - Edit
```json
[
    {
        "id": 1,
        "id_nbssc": 50,
        "name": "Reforestation",
        "default": true,
        "value": 100.50,
        "unit_implementation_cost": 1000.00,
        "unit_maintenance_cost": 50.00,
        "periodicity_maitenance": 1,
        "unit_oportunity_cost": 200.00,
        "country__global_multiplier_factor": 1.2,
        "country": "USA",
        "currency": "USD"
    }
]
```

#### Criterios de Aceptación - Create
- [ ] Retorna NbS de admin
- [ ] Retorna NbS personalizados del usuario
- [ ] Filtra por país de la ciudad
- [ ] No incluye campo `default` o `value`

#### Criterios de Aceptación - Edit
- [ ] Retorna NbS de admin
- [ ] Retorna NbS del usuario creador del study case
- [ ] Marca con `default=true` los ya seleccionados
- [ ] Incluye `id_nbssc` y `value` si ya están asociados
- [ ] Incluye global_multiplier_factor del país

#### Criterios de Aceptación - Clone
- [ ] Retorna NbS del study case original
- [ ] Retorna NbS personalizados del usuario actual
- [ ] Elimina duplicados

#### Código
- Línea 379 en `api.py`

---

### CP-API-011: Obtener Monedas de Study Case

#### Endpoint
```
GET /currencys/?id=<study_case_id>&currency=<currency_code>
```

#### Descripción
Obtener monedas y tasas de cambio necesarias para un study case.

#### Pre-condiciones
- Study case existente
- NbS con diferentes monedas seleccionados

#### Request
```http
GET /currencys/?id=25&currency=USD
```

#### Response Esperado
```json
[
    {
        "currency": "EUR",
        "value": "0.85"
    },
    {
        "currency": "MXN",
        "value": "18.50"
    }
]
```

#### Criterios de Aceptación
- [ ] Identifica monedas de NbS asociados
- [ ] Identifica moneda de carbon market si aplica
- [ ] Identifica moneda financiera si aplica
- [ ] Calcula exchange rate respecto a moneda de análisis
- [ ] Usa tasas guardadas si existen, sino calcula desde EUR
- [ ] Excluye la moneda de análisis del resultado
- [ ] No incluye duplicados
- [ ] Código: Línea 449 en `api.py`

---

### CP-API-012: Obtener Tasa de Cambio

#### Endpoint
```
GET /exchangeRate/?id=<study_case_id>&currency=<currency_code>
```

#### Descripción
Obtener tasa de cambio de USD respecto a moneda de análisis.

#### Request
```http
GET /exchangeRate/?id=25&currency=EUR
```

#### Response Esperado
```json
{
    "value": 0.85
}
```

#### Criterios de Aceptación
- [ ] Calcula rate basado en factores EUR
- [ ] Formula: `USD_to_EUR / target_to_EUR`
- [ ] Retorna valor numérico
- [ ] Código: Línea 868 en `api.py`

---

### CP-API-013: Crear JSON para Modelo

#### Endpoint
```
POST /getjson/
```

#### Descripción
Generar configuración JSON para ejecutar el modelo FastFlood.

#### Pre-condiciones
- Study case completo
- Watershed asociado
- Todos los parámetros configurados
- Folder name asignado

#### Request
```json
{
    "id_study_case": 25
}
```

#### Response Esperado - Éxito
```json
{
    "status": "ok",
    "response_data": {
        "message": "JSON saved successfully"
    }
}
```

#### Response Esperado - Error
```json
{
    "status": "error",
    "message": "API respondió con código 500",
    "response": "Error details..."
}
```

#### Estructura del JSON Generado
```json
{
    "ProjectPath": "/app/outputs/fastflood/folder_name",
    "NameBasinFolder": "WI_10",
    "AccessData": "/app/outputs/fastflood/folder_name/AccessData.json",
    "FastFloodPath": "/app/fastflood/fastflood",
    "CatchmentPath": "...",
    "DEMPath": "...",
    "ManningPath": "...",
    "InfiltrationPath": "...",
    "FastFloodLulcPath": "...",
    "CurrentLulcPath": "...",
    "BauLulcPath": "...",
    "PortfolioPath": "...",
    "DamagesDataBasePath": "/data/global_datasets",
    "DemResolution": 150,
    "DemDataBase": "cop",
    "SplitArea": {
        "Commercial": 0.30,
        "Industrial": 0.20
    },
    "NbS": {
        "0-Reforestation": {
            "10-Forest": {
                "Manning": 0.5,
                "Infiltration": 0.8
            }
        }
    },
    "LulcParams": {
        "Manning": { ... },
        "InfiltrationChange": { ... }
    },
    "DamagesExchangeRate": 1.0,
    "ClimateParams": {
        "ReturnPeriod": [1000, 500, 200, 100, 50, 40, 20, 10, 5, 2],
        "Scenario": "R45",
        "AnalysisStormDuration": 24.0,
        "DesignStormDuration_Historic": 24,
        "DesignStormDuration_ClimateChange": 3,
        "StormQuantile": 50,
        "Period": 2050
    },
    "FastFloodParams": {
        "BoundaryCondition": 0.5,
        "ChannelParams": {
            "Status": 1,
            "WidthMul": 0.5,
            "WidthExp": 0.3,
            "DepthMul": 0.4,
            "DepthExp": 0.2,
            "CrossSection": 1.0,
            "ChannelManning": 0.035
        }
    }
}
```

#### Criterios de Aceptación
- [ ] Genera JSON completo con todos los parámetros
- [ ] Incluye paths correctos según folder_name
- [ ] Incluye configuración de NbS con manning e infiltration
- [ ] Incluye parámetros climáticos del escenario
- [ ] Envía JSON al servidor de modelos
- [ ] Maneja timeout de 5 segundos
- [ ] Retorna response del servidor externo
- [ ] Código: Línea 718 en `api.py`

---

### CP-API-014: Obtener Logs de Ejecución

#### Endpoint
```
GET /logsinfobyid/<int:id_study_case>/
```

#### Descripción
Obtener logs de ejecución del análisis de un study case.

#### Pre-condiciones
- Study case con análisis ejecutado
- Logs generados en tabla `log_fastflood`

#### Request
```http
GET /logsinfobyid/25/
```

#### Response Esperado
```json
[
    {
        "id": 1,
        "study_case_id": 25,
        "step_id": 1,
        "step_name": "Preprocessing",
        "status": "completed",
        "message": "Data preprocessed successfully",
        "timestamp": "2025-12-11T10:30:00Z"
    },
    {
        "id": 2,
        "study_case_id": 25,
        "step_id": 2,
        "step_name": "Model Execution",
        "status": "running",
        "message": "Running flood model...",
        "timestamp": "2025-12-11T10:35:00Z"
    }
]
```

#### Response Esperado - Sin Logs
```json
[]
```

#### Criterios de Aceptación
- [ ] Filtra logs por study_case_id
- [ ] Ordena por step_id
- [ ] Usa LogSerializer para serialización
- [ ] Retorna todos los campos del modelo
- [ ] Código: Línea 702 en `api.py`

---

### CP-API-015: Verificar Existencia de Study Case por Nombre

#### Endpoint
```
POST /studycase-exist-by-name/
```

#### Descripción
Verificar si ya existe un study case con el mismo nombre para el usuario.

#### Pre-condiciones
- Usuario autenticado

#### Request
```json
{
    "name": "Test Study Case"
}
```

#### Response Esperado - Existe
```json
true
```

#### Response Esperado - No Existe
```json
false
```

#### Response Esperado - Nombre Vacío
```json
{
    "error": "Name is required"
}
```

#### Criterios de Aceptación
- [ ] Validación case-insensitive (`name__iexact`)
- [ ] Filtra por usuario actual
- [ ] Retorna boolean
- [ ] Maneja request.data y request.body
- [ ] Código: Línea 881 en `api.py`

---

### CP-API-016: Verificar Existencia de Watershed por Nombre

#### Endpoint
```
POST /watershed-exist-by-name/
```

#### Descripción
Verificar si ya existe un watershed con el mismo nombre para el usuario.

#### Pre-condiciones
- Usuario autenticado

#### Request
```json
{
    "name": "Test Watershed"
}
```

#### Response Esperado - Existe
```json
true
```

#### Response Esperado - No Existe
```json
false
```

#### Criterios de Aceptación
- [ ] Validación case-insensitive (`name__iexact`)
- [ ] Filtra por usuario actual
- [ ] Retorna boolean
- [ ] Código: Línea 905 en `api.py`

---

## Casos de Prueba de Integración

### CP-API-I001: Flujo Completo de Configuración de Study Case

#### Descripción
Prueba integrada de configuración usando múltiples endpoints.

#### Pasos
1. Obtener watersheds por ciudad (`/watershedbycity/<id>/`)
2. Obtener parámetros biofísicos (`/bioByMacro/<watershed_id>`)
3. Obtener información de daño (`/damageInfo/<iso>`)
4. Obtener max damage cost (`/max-damage-cost/<iso>`)
5. Obtener NbS disponibles (`/nbs/`)
6. Guardar parámetros biofísicos (`/savebio/`)
7. Guardar datos de daño (`/savedamage/`)
8. Obtener monedas necesarias (`/currencys/`)
9. Crear JSON para modelo (`/getjson/`)

#### Criterios de Aceptación
- [ ] Todos los endpoints responden correctamente
- [ ] Datos consistentes entre llamadas
- [ ] Study case configurado completamente

---

### CP-API-I002: Validación de Permisos en APIs

#### Descripción
Verificar que los endpoints respetan permisos de usuario.

#### Casos
1. Usuario no autenticado intenta acceder a endpoints protegidos
2. Usuario intenta acceder a watersheds de otro usuario
3. Admin accede a todos los recursos

#### Criterios de Aceptación
- [ ] Endpoints protegidos requieren autenticación
- [ ] Filtros de usuario aplicados correctamente
- [ ] Admin tiene acceso completo

---

## Matriz de Endpoints

| Endpoint | Método | Auth | Filtrado Usuario | Paginación |
|----------|--------|------|-----------------|------------|
| `/watershedUsedByStudyCases/<idx>` | GET | No | No | No |
| `/watershedbycity/<id>/` | GET | Sí | Sí | No |
| `/infoWatershed/<idx>` | GET | No | No | No |
| `/watersheds` | GET | No | No | No |
| `/bioByMacro/<id>` | GET | No | No | No |
| `/bioById/<id>` | GET | No | No | No |
| `/damageInfo/<iso>` | GET | No | No | No |
| `/max-damage-cost/<iso>` | GET | No | No | No |
| `/parametersbycountry/<id>/` | GET | No | No | No |
| `/nbs/` | POST | Sí | Sí | No |
| `/currencys/` | GET | No | No | No |
| `/exchangeRate/` | GET | No | No | No |
| `/savebio/` | POST | Sí | Sí | No |
| `/savedamage/` | POST | Sí | Sí | No |
| `/getjson/` | POST | Sí | Sí | No |
| `/logsinfobyid/<id>/` | GET | No | No | No |
| `/studycase-exist-by-name/` | POST | Sí | Sí | No |
| `/watershed-exist-by-name/` | POST | Sí | Sí | No |

---

## Scripts de Prueba Recomendados

```python
# test_api_endpoints.py
from django.test import TestCase
from rest_framework.test import APIClient
from geonode.waterproof_fastflood.models import Watershed, StudyCases
from geonode.waterproof_parameters.models import Cities

class APIEndpointsTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            username='testuser',
            password='testpass'
        )
        self.city = Cities.objects.create(name='Test City')
        self.watershed = Watershed.objects.create(
            name='Test Watershed',
            city=self.city,
            added_by=self.user,
            is_complete=True,
            demvalue=150
        )

    def test_get_watersheds_by_city(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(f'/watershedbycity/{self.city.id}/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)
        self.assertEqual(data[0]['name'], 'Test Watershed')

    def test_check_watershed_used_by_studycases(self):
        # Sin study cases
        response = self.client.get(f'/watershedUsedByStudyCases/{self.watershed.id}')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['count'], 0)

        # Con study case
        study_case = StudyCases.objects.create(
            name='Test SC',
            description='Test',
            city=self.city,
            added_by=self.user
        )
        study_case.watershed.add(self.watershed)

        response = self.client.get(f'/watershedUsedByStudyCases/{self.watershed.id}')
        data = response.json()
        self.assertEqual(data['count'], 1)

    def test_get_damage_info_by_country(self):
        response = self.client.get('/damageInfo/USA')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        if len(data) > 0:
            self.assertIn('iso', data[0])
            self.assertIn('flood_depth', data[0])
            self.assertIn('damage_class', data[0])
            self.assertIn('damage_factor', data[0])
```

---

## Consideraciones de Performance

### Optimizaciones Recomendadas

1. **Caching**
   - Cachear parámetros biofísicos por macro región
   - Cachear información de daño por país
   - Cachear max damage costs por país
   - TTL recomendado: 1 hora

2. **Indexing**
   - Índice en `StudyCases.watershed`
   - Índice en `Watershed.city`
   - Índice en `Damage.iso`
   - Índice en `Parameters_Biophysical.macro_region`

3. **Query Optimization**
   - Usar `select_related()` para ForeignKeys
   - Usar `prefetch_related()` para ManyToMany
   - Limitar campos con `.values()`

---

## Referencias

- **Código**: `geonode/waterproof_fastflood/api.py`
- **URLs**: Líneas 14-42 en `urls.py`
- **Modelos**: `models.py`
