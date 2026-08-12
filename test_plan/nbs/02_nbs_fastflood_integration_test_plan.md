# Plan de Pruebas - Integración NbS con FastFlood

## Información General

**Módulo**: Integración WaterProof NbS CA - FastFlood
**Componente**: Uso de NbS en análisis de inundaciones FastFlood
**Archivos de referencia**: `geonode/waterproof_fastflood/api.py`, `geonode/waterproof_nbs_ca/models.py`

## Descripción

Este documento describe las pruebas de integración entre el módulo NbS y el módulo FastFlood, enfocándose específicamente en:
- Selección de NbS en Study Cases de FastFlood
- Generación de JSON con parámetros Manning e Infiltration
- Uso de parámetros en análisis de inundaciones
- Validación de integridad de datos entre módulos

## Flujo de Integración

### 1. Usuario Crea/Edita Study Case en FastFlood

```
[FastFlood: Study Case Creation Wizard]
    ↓
[Paso 6: Selección de NbS]
    ↓
[API Call: POST /nbs/]
    ← Returns: NbS disponibles según país/ciudad
    ↓
[Usuario selecciona NbS]
    ↓
[API Call: POST /save/ con nbs[]]
    → Crea relaciones en StudyCases_NBS_Fastflood
```

### 2. Ejecución de Análisis FastFlood

```
[Usuario ejecuta análisis]
    ↓
[API Call: POST /getjson/]
    ↓
[api.createJson() obtiene Study Case]
    ↓
[api.getNbsJson() consulta NbS asociados]
    ↓
[Para cada NbS: consulta WaterproofPrLulc]
    ↓
[Genera JSON con Manning e Infiltration]
    ↓
[Envía JSON a servidor de modelos]
    ↓
[Modelo FastFlood ejecuta análisis]
```

## Casos de Prueba

### CP-INT-NBS-001: Obtener NbS Disponibles para Study Case

#### Descripción
Verificar que el endpoint `/nbs/` retorna NbS correctos según contexto del Study Case.

#### Pre-condiciones
- Usuario autenticado
- Ciudad seleccionada en Study Case
- NbS de diferentes tipos:
  - NbS globales (added_by=ADMIN)
  - NbS específicos del usuario
  - NbS de otros usuarios del mismo país

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
        "name": "Reforestation Global",
        "unit_implementation_cost": 1500.00,
        "unit_maintenance_cost": 50.00,
        "periodicity_maitenance": 2,
        "unit_oportunity_cost": 200.00,
        "country": "USA",
        "currency": "USD",
        "country__global_multiplier_factor": 1.0
    },
    {
        "id": 10,
        "name": "Wetland Restoration User",
        "unit_implementation_cost": 2000.00,
        "unit_maintenance_cost": 75.00,
        "periodicity_maitenance": 1,
        "unit_oportunity_cost": 300.00,
        "country": "USA",
        "currency": "USD",
        "country__global_multiplier_factor": 1.0
    }
]
```

#### Criterios de Aceptación
- [ ] Retorna NbS de admin (globales)
- [ ] Retorna NbS del usuario del mismo país
- [ ] NO retorna NbS de otros países
- [ ] API: `api.getNBS()` en `fastflood/api.py` línea 379

---

### CP-INT-NBS-002: Asociar NbS a Study Case

#### Descripción
Verificar la asociación de NbS seleccionados a un Study Case.

#### Pre-condiciones
- Study Case en creación/edición
- NbS disponibles

#### Request
```http
POST /save/
Content-Type: application/x-www-form-urlencoded

id_study_case=25&nbs[]=1&nbs[]=10
```

#### Response Esperado
```json
{
    "id_study_case": 25
}
```

#### Verificaciones

**Base de Datos:**
```sql
SELECT
    nbs_id,
    studycase_id,
    value
FROM waterproof_fastflood_studycases_nbs
WHERE studycase_id = 25;

-- Debe retornar 2 registros (nbs 1 y 10)
```

#### Criterios de Aceptación
- [ ] Registros creados en `StudyCases_NBS_Fastflood`
- [ ] Relación studycase-nbs correcta
- [ ] Campo `value` inicializado (puede ser null)
- [ ] API: `api.save()` en `fastflood/api.py` línea 159

---

### CP-INT-NBS-003: Generar JSON con Parámetros NbS ⚡ CRÍTICO

#### Descripción
Verificar que el JSON generado para el modelo FastFlood contiene los parámetros correctos de Manning e Infiltration de los NbS.

#### Pre-condiciones
- Study Case completo con NbS asociados
- NbS tienen parámetros FastFlood (`WaterproofPrLulc`)

#### Setup de Datos

**NbS 1: Reforestation**
```sql
-- WaterproofPrLulc para NbS 1
INSERT INTO waterproof_nbs_ca_waterproof_pr_lulc VALUES
(1, 1, 10, 0.500, 0.85),  -- Forest
(2, 1, 20, 0.400, 0.70);  -- Shrubs
```

**NbS 2: Wetland Restoration**
```sql
-- WaterproofPrLulc para NbS 2
INSERT INTO waterproof_nbs_ca_waterproof_pr_lulc VALUES
(3, 2, 80, 0.035, 0.05),  -- Water
(4, 2, 90, 0.100, 0.60);  -- Wetland
```

#### Request
```http
POST /getjson/
Content-Type: application/json

{
    "id_study_case": 25
}
```

#### Response Esperado - Sección NbS del JSON

```json
{
    "NbS": {
        "0-Reforestation": {
            "10-Forest": {
                "Manning": 0.500,
                "Infiltration": 0.85
            },
            "20-Shrubs": {
                "Manning": 0.400,
                "Infiltration": 0.70
            }
        },
        "1-Wetland Restoration": {
            "80-Water": {
                "Manning": 0.035,
                "Infiltration": 0.05
            },
            "90-Wetland": {
                "Manning": 0.100,
                "Infiltration": 0.60
            }
        }
    }
}
```

#### Estructura Esperada

```
NbS
├── "<index>-<NbS.name>"
│   ├── "<lucode>-<LULC.name>"
│   │   ├── Manning: <WaterproofPrLulc.manning>
│   │   └── Infiltration: <WaterproofPrLulc.infiltration>
```

#### Verificaciones

**Código:**
```python
# api.createJson() llama a getNbsJson()
def getNbsJson(id_study_case):
    nbs_list = StudyCases_NBS_Fastflood.objects.select_related('nbs') \
        .filter(studycase=id_study_case).order_by('nbs')
    nbs_json = {}

    for index, n in enumerate(nbs_list):
        nb = n.nbs
        nb_key = f"{index}-{nb.name}"

        # Obtener parámetros LULC
        nbs_sc = WaterproofPrLulc.objects.filter(nbsid=nb.id)
        lulc_data = {}

        for lulc in nbs_sc:
            lulc_param = WaterproofPrLulcParameters.objects.get(pk=lulc.lucode.pk)
            lulc_name = lulc_param.LULC_desc

            key = f"{lulc.lucode.pk}-{lulc_name}"
            lulc_data[key] = {
                "Manning": float(lulc.manning),      # ⚡ CRÍTICO
                "Infiltration": float(lulc.infiltration)  # ⚡ CRÍTICO
            }

        nbs_json[nb_key] = lulc_data

    return nbs_json
```

#### Criterios de Aceptación
- [ ] Función `getNbsJson()` existe en `api.py`
- [ ] Consulta correcta a `StudyCases_NBS_Fastflood`
- [ ] Consulta correcta a `WaterproofPrLulc`
- [ ] Estructura JSON correcta
- [ ] Claves con formato: `"<index>-<name>"`
- [ ] Sub-claves con formato: `"<lucode>-<LULC_desc>"`
- [ ] Valores `Manning` e `Infiltration` como float
- [ ] Valores decimales correctos (sin redondeo excesivo)
- [ ] API: `api.getNbsJson()` línea 842 en `fastflood/api.py`

---

### CP-INT-NBS-004: Validar Integridad NbS-StudyCase

#### Descripción
Verificar que no se pueden eliminar NbS que están en uso por Study Cases.

#### Pre-condiciones
- NbS asociado a uno o más Study Cases

#### Setup
```sql
-- NbS usado en 2 Study Cases
INSERT INTO waterproof_fastflood_studycases_nbs VALUES
(1, 25, 1, NULL),  -- Study Case 25 usa NbS 1
(2, 30, 1, NULL);  -- Study Case 30 usa NbS 1
```

#### Request
```http
POST /nbs/delete/1
```

#### Resultado Esperado

**Opción 1: Bloqueo en frontend**
```javascript
// Verificar antes de permitir delete
fetch('/watershedUsedByStudyCases/1')  // Adaptar endpoint para NbS
    .then(response => response.json())
    .then(data => {
        if (data.count > 0) {
            alert(`This NbS is used by ${data.count} study cases. Cannot delete.`);
            return;
        }
        // Proceder con delete
    });
```

**Opción 2: Bloqueo en backend**
```python
def deleteNbs(request, idx):
    # Verificar uso en Study Cases
    usage_count = StudyCases_NBS_Fastflood.objects.filter(nbs_id=idx).count()

    if usage_count > 0:
        return JsonResponse({
            'status': '400',
            'reason': f'NbS is used by {usage_count} study cases. Cannot delete.'
        }, status=400)

    # Proceder con delete
    nbs = WaterproofNbsCa.objects.get(id=idx)
    nbs.delete()
    return JsonResponse({'status': '200', 'reason': 'success'})
```

#### Criterios de Aceptación
- [ ] Endpoint de verificación existe (adaptar `watershedUsedByStudyCases`)
- [ ] Frontend verifica antes de delete
- [ ] Backend valida y bloquea si está en uso
- [ ] Mensaje claro al usuario

---

### CP-INT-NBS-005: Clonar Study Case Preserva NbS

#### Descripción
Verificar que al clonar un Study Case, los NbS asociados se preservan.

#### Pre-condiciones
- Study Case con NbS asociados

#### Request
```http
GET /studyCase/clone/25/USA
```

#### Resultado Esperado
- Formulario pre-poblado con NbS del Study Case original
- Al guardar, nuevo Study Case tiene mismos NbS

#### Verificaciones

**Original:**
```sql
SELECT nbs_id FROM waterproof_fastflood_studycases_nbs
WHERE studycase_id = 25;
-- [1, 10]
```

**Clon:**
```sql
SELECT nbs_id FROM waterproof_fastflood_studycases_nbs
WHERE studycase_id = 35;  -- ID del clon
-- [1, 10]  -- Mismos NbS
```

#### Criterios de Aceptación
- [ ] NbS originales cargados en formulario
- [ ] Usuario puede modificar selección
- [ ] Al guardar, se crean nuevas relaciones (no se comparten)
- [ ] Vista: `views.clone_study_case()` en FastFlood

---

### CP-INT-NBS-006: Cambiar País de Study Case Actualiza NbS Disponibles

#### Descripción
Verificar que al cambiar el país de un Study Case, los NbS disponibles se actualizan.

#### Setup
- NbS disponibles en USA: [1, 2, 10]
- NbS disponibles en MEX: [1, 15, 20]
- NbS 1 es global (admin)

#### Escenario 1: Crear Study Case en USA
```http
POST /nbs/
city_id=1&process=Create  # USA

Response: [1, 2, 10]
```

#### Escenario 2: Crear Study Case en MEX
```http
POST /nbs/
city_id=10&process=Create  # MEX

Response: [1, 15, 20]
```

#### Criterios de Aceptación
- [ ] NbS globales (admin) disponibles en todos los países
- [ ] NbS específicos solo del país correspondiente
- [ ] Filtrado correcto por `country` en NbS

---

### CP-INT-NBS-007: Ejecutar Análisis con Múltiples NbS

#### Descripción
Prueba end-to-end de ejecución de análisis con múltiples NbS.

#### Flujo Completo

**1. Crear 2 NbS con parámetros FastFlood**
```python
# NbS 1: Reforestation
nbs1 = create_nbs(name="Reforestation", ...)
create_fastflood_param(nbs=nbs1, lucode=10, manning=0.5, infiltration=0.85)

# NbS 2: Wetland
nbs2 = create_nbs(name="Wetland", ...)
create_fastflood_param(nbs=nbs2, lucode=80, manning=0.035, infiltration=0.05)
```

**2. Crear Study Case y asociar NbS**
```python
study_case = create_study_case(...)
associate_nbs(study_case, [nbs1, nbs2])
```

**3. Generar JSON**
```python
json_data = createJson(study_case_id)

# Verificar sección NbS
assert "0-Reforestation" in json_data["NbS"]
assert "1-Wetland" in json_data["NbS"]

assert json_data["NbS"]["0-Reforestation"]["10-Forest"]["Manning"] == 0.5
assert json_data["NbS"]["1-Wetland"]["80-Water"]["Infiltration"] == 0.05
```

**4. Enviar a servidor de modelos**
```python
response = requests.post(
    "https://dev.water-proof.org/wf-models/save_json",
    json={"case_folder": folder, "data": json_data}
)
assert response.status_code == 200
```

**5. Ejecutar análisis**
```python
run_analysis(study_case_id)
assert study_case.is_run_analysis == True
```

#### Criterios de Aceptación
- [ ] Múltiples NbS en JSON
- [ ] Parámetros correctos para cada NbS
- [ ] Servidor acepta JSON
- [ ] Análisis se ejecuta exitosamente

---

## Validaciones Específicas de Integración

### V-INT-001: Validación de Consistencia Manning/Infiltration

#### Descripción
Verificar que los valores de Manning e Infiltration sean coherentes entre sí.

#### Reglas de Negocio

| Cobertura | Manning Típico | Infiltration Típico | Relación |
|-----------|----------------|---------------------|----------|
| Forest | 0.400 - 0.800 | 0.70 - 0.95 | Alta rugosidad → Alta infiltración |
| Grass | 0.200 - 0.400 | 0.50 - 0.70 | Media rugosidad → Media infiltración |
| Water | 0.025 - 0.035 | 0.01 - 0.05 | Baja rugosidad → Baja infiltración |
| Urban | 0.012 - 0.020 | 0.10 - 0.30 | Muy baja rugosidad → Baja infiltración |

#### Validaciones
- [ ] Manning alto (>0.5) → Infiltration debería ser alto (>0.6)
- [ ] Manning bajo (<0.05) → Infiltration debería ser bajo (<0.3)
- [ ] Advertencias si valores son inconsistentes

---

### V-INT-002: Validación de Cobertura Completa

#### Descripción
Advertir si un NbS no tiene parámetros FastFlood para todas las coberturas relevantes.

#### Ejemplo

**NbS: Reforestation**
- Debería tener parámetros para: Forest (10), Shrubs (20)
- Puede tener: Grass (30)
- NO necesita: Water (80), Urban (50)

#### Validación
```python
# Verificar que NbS tiene parámetros
nbs_lulc_count = WaterproofPrLulc.objects.filter(nbsid=nbs_id).count()

if nbs_lulc_count == 0:
    warnings.append(f"NbS '{nbs.name}' has no FastFlood parameters")
```

---

## Scripts de Prueba de Integración

```python
# test_nbs_fastflood_integration.py
from django.test import TestCase
from geonode.waterproof_nbs_ca.models import WaterproofNbsCa, WaterproofPrLulc
from geonode.waterproof_fastflood.models import StudyCases, StudyCases_NBS_Fastflood
from geonode.waterproof_fastflood.api import getNbsJson
import json

class NbsFastfloodIntegrationTest(TestCase):
    def setUp(self):
        # Crear NbS con parámetros
        self.nbs1 = WaterproofNbsCa.objects.create(
            name="Test Reforestation",
            slug="test-reforestation",
            # ... otros campos
        )

        WaterproofPrLulc.objects.create(
            nbsid=self.nbs1,
            lucode_id=10,  # Forest
            manning=0.500,
            infiltration=0.85
        )

        WaterproofPrLulc.objects.create(
            nbsid=self.nbs1,
            lucode_id=20,  # Shrubs
            manning=0.400,
            infiltration=0.70
        )

        # Crear Study Case
        self.study_case = StudyCases.objects.create(
            name="Test SC",
            # ... otros campos
        )

        # Asociar NbS
        StudyCases_NBS_Fastflood.objects.create(
            studycase=self.study_case,
            nbs=self.nbs1
        )

    def test_generate_json_with_nbs_params(self):
        """CP-INT-NBS-003: Generar JSON con parámetros NbS"""
        # Generar JSON de NbS
        nbs_json = getNbsJson(self.study_case.id)

        # Verificar estructura
        self.assertIn("0-Test Reforestation", nbs_json)

        nbs_data = nbs_json["0-Test Reforestation"]

        # Verificar parámetros Forest
        self.assertIn("10-Forest", nbs_data)
        self.assertEqual(nbs_data["10-Forest"]["Manning"], 0.500)
        self.assertEqual(nbs_data["10-Forest"]["Infiltration"], 0.85)

        # Verificar parámetros Shrubs
        self.assertIn("20-Shrubs", nbs_data)
        self.assertEqual(nbs_data["20-Shrubs"]["Manning"], 0.400)
        self.assertEqual(nbs_data["20-Shrubs"]["Infiltration"], 0.70)

    def test_cannot_delete_nbs_in_use(self):
        """CP-INT-NBS-004: No eliminar NbS en uso"""
        # Verificar que NbS está en uso
        usage_count = StudyCases_NBS_Fastflood.objects.filter(
            nbs=self.nbs1
        ).count()
        self.assertGreater(usage_count, 0)

        # Intentar eliminar debería fallar o advertir
        # (Requiere implementación de validación)
```

---

## Matriz de Integración

| ID Caso | Componente NbS | Componente FastFlood | API/Vista | Prioridad |
|---------|---------------|---------------------|-----------|-----------|
| CP-INT-NBS-001 | WaterproofNbsCa | StudyCases | getNBS | Alta |
| CP-INT-NBS-002 | WaterproofNbsCa | StudyCases_NBS_Fastflood | save | Alta |
| CP-INT-NBS-003 | WaterproofPrLulc | JSON generation | getNbsJson | **Crítica** |
| CP-INT-NBS-004 | WaterproofNbsCa | StudyCases_NBS_Fastflood | delete | Alta |
| CP-INT-NBS-005 | WaterproofNbsCa | StudyCases | clone_study_case | Media |
| CP-INT-NBS-006 | WaterproofNbsCa | StudyCases | getNBS | Media |
| CP-INT-NBS-007 | WaterproofPrLulc | Modelo FastFlood | createJson | **Crítica** |

---

## Referencias

- **NbS Models**: `geonode/waterproof_nbs_ca/models.py`
- **FastFlood API**: `geonode/waterproof_fastflood/api.py`
- **Función clave**: `getNbsJson()` línea 842
- **Función clave**: `createJson()` línea 718
- **Tabla integración**: `waterproof_fastflood_studycases_nbs`
- **Tabla parámetros**: `waterproof_nbs_ca_waterproof_pr_lulc`
