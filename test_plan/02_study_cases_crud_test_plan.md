# Plan de Pruebas - Study Cases CRUD

## Información General

**Módulo**: WaterProof FastFlood - Study Cases Management
**Componente**: Gestión de Casos de Estudio de Inundaciones
**Archivo de referencia**: `geonode/waterproof_fastflood/views.py`, `api.py`
**URLs**: Definidas en `geonode/waterproof_fastflood/urls.py` (líneas 28-36)

## Descripción del Componente

El componente Study Cases gestiona casos de estudio para análisis de inundaciones rápidas con las siguientes características:
- Creación multi-paso (7 pasos)
- Integración con watersheds
- Análisis de inversión y mercado de carbono
- Parámetros biofísicos y de daño
- Ejecución de modelos de simulación
- Publicación pública/privada

## Modelo Principal

### StudyCases
```python
- name: CharField (max 100)
- description: CharField (max 500)
- city: ForeignKey a Cities
- studycase_type: CharField (FASTFLOOD)
- is_complete: BooleanField
- is_run_analysis: BooleanField
- is_public: BooleanField
- added_by: ForeignKey a User
- create_date: DateTimeField
- edit_date: DateTimeField
- watershed: ManyToManyField a Watershed
- portfolios: ManyToManyField a Portfolio
- analysis_type: CharField (FULL/INVESTMENT)
- analysis_currency: CharField (código moneda)
- analysis_period_value: IntegerField
- climate_scenario_id: IntegerField
- change_year: IntegerField (2030-2100)
- design_storm_duration: IntegerField
- quantile: IntegerField
- folder_name: CharField
```

## URLs a Probar

| URL | Método | Vista | Descripción |
|-----|--------|-------|-------------|
| `/studyCase/` | GET | `study_cases_list` | Lista de study cases |
| `/studyCase/create` | GET/POST | `create_study_case` | Crear study case |
| `/studyCase/edit/<int:idx>` | GET | `edit_study_case` | Editar study case |
| `/studyCase/clone/<int:idx>/<str:country_iso>` | GET | `clone_study_case` | Clonar study case |
| `/studyCase/view/<int:idx>` | GET | `view_study_case` | Ver detalles |
| `/studyCase/delete/<int:idx>` | POST | `api.delete` | Eliminar study case |
| `/studyCase/public/<int:idx>` | POST | `api.public` | Hacer público |
| `/studyCase/private/<int:idx>` | POST | `api.private` | Hacer privado |

## Casos de Prueba

### CP-SC-001: Listar Study Cases

#### Descripción
Verificar que la lista de study cases se muestre correctamente según permisos.

#### Pre-condiciones
- Study cases existentes en la base de datos
- Usuario autenticado con diferentes roles

#### Datos de Prueba

| Usuario | Rol | Study Cases Esperados |
|---------|-----|----------------------|
| admin_user | ADMIN | Todos los study cases |
| analyst_user | ANALYS | Propios + públicos |
| public_user | No autenticado | Solo públicos |

#### Pasos
1. Autenticar usuario según el caso
2. Navegar a `/studyCase/`
3. Verificar study cases mostrados

#### Resultado Esperado

**Admin:**
- Todos los study cases del sistema
- Opciones de editar/eliminar todos

**Analista:**
- Study cases propios (cualquier visibilidad)
- Study cases públicos de otros usuarios
- Solo puede editar/eliminar los propios

**Público:**
- Solo study cases marcados como `is_public=True`
- Sin opciones de edición

#### Criterios de Aceptación
- [ ] Filtros de permisos correctos
- [ ] Información mostrada: nombre, descripción, ciudad, watersheds, estado
- [ ] Geometrías de watersheds renderizadas en mapa
- [ ] Botones de acción según permisos
- [ ] Vista: `views.study_cases_list()` línea 597
- [ ] Template: `studycases_list.html`

---

### CP-SC-002: Crear Study Case - Paso 1 (Definición)

#### Descripción
Verificar la creación del paso 1 con información básica del study case.

#### Pre-condiciones
- Usuario autenticado
- Al menos 1 watershed completo disponible
- Ciudad seleccionada

#### Datos de Entrada

| Campo | Valor Válido | Validación |
|-------|-------------|------------|
| name | "Study Case Test 001" | Único por usuario |
| description | "Descripción del caso" | Requerido, max 500 |
| city_id | ID válido | Debe existir |
| watersheds[] | [watershed_id1, watershed_id2] | Al menos 1 |

#### Pasos
1. Navegar a `/studyCase/create`
2. Completar formulario de definición
3. Enviar POST a `/save/` con datos del paso 1
4. Verificar respuesta JSON

#### Resultado Esperado - Éxito
```json
{
    "id_study_case": 123
}
```

#### Resultado Esperado - Nombre Duplicado
```json
{
    "id_study_case": ""
}
```

#### Criterios de Aceptación
- [ ] Validación de nombre único por usuario
- [ ] `studycase_type = 'FASTFLOOD'`
- [ ] `create_date` y `edit_date` establecidos
- [ ] Watersheds asociados correctamente (many-to-many)
- [ ] `added_by` asignado al usuario actual
- [ ] API: `api.save()` línea 78
- [ ] Template: `studycases_form.html`

---

### CP-SC-003: Crear Study Case - Paso 2 (Mercado de Carbono)

#### Descripción
Verificar la configuración del mercado de carbono.

#### Pre-condiciones
- Study case creado en paso 1
- ID de study case válido

#### Datos de Entrada

**Opción 1: Con Beneficio de Mercado de Carbono**
```json
{
    "carbon_market": "true",
    "carbon_market_value": "25.50",
    "carbon_market_currency": "USD"
}
```

**Opción 2: Sin Beneficio de Mercado de Carbono**
```json
{
    "carbon_market": "false"
}
```

#### Pasos
1. Completar paso 1
2. Enviar POST a `/save/` con datos de carbon market
3. Verificar actualización

#### Resultado Esperado
- Study case actualizado con valores de mercado de carbono
- `benefit_carbon_market = True/False`
- Si true: `cm_value` y `cm_currency` guardados

#### Criterios de Aceptación
- [ ] Campo `benefit_carbon_market` actualizado
- [ ] Si activado: `cm_value` y `cm_currency` guardados
- [ ] `edit_date` actualizado
- [ ] API: `api.save()` línea 130

---

### CP-SC-004: Crear Study Case - Paso 3 (Portafolios)

#### Descripción
Verificar la selección de portafolios NbS.

#### Pre-condiciones
- Study case en progreso
- Portafolios disponibles en sistema

#### Datos de Entrada

```json
{
    "id_study_case": 123,
    "portfolios[]": [1, 3, 5]
}
```

#### Pasos
1. Enviar POST a `/save/` con lista de portafolios
2. Verificar asociación many-to-many

#### Resultado Esperado
- Portafolios asociados al study case
- Relación many-to-many actualizada
- Portafolios anteriores limpiados y reemplazados

#### Criterios de Aceptación
- [ ] Relación `portfolios` actualizada
- [ ] `clear()` ejecutado antes de agregar nuevos
- [ ] Solo portafolios válidos asociados
- [ ] API: `api.save()` línea 148

---

### CP-SC-005: Crear Study Case - Paso 4 (Parámetros de Modelado)

#### Descripción
Verificar la configuración de parámetros oceanográficos y de daño.

#### Pre-condiciones
- Study case en progreso
- Datos de damage cost disponibles por país

#### Datos de Entrada

| Campo | Tipo | Ejemplo | Validación |
|-------|------|---------|------------|
| ocean_elevation | Decimal(4,2) | "1.50" | Requerido |
| commercial_value | Integer | 30 | 0-100 (%) |
| industrial_value | Integer | 20 | 0-100 (%) |
| exponential_parameters | Integer | 1 | 0 o 1 |
| width_mul | Decimal | "0.5" | >= 0 |
| width_exp | Decimal | "0.3" | >= 0 |
| depth_mul | Decimal | "0.4" | >= 0 |
| depth_exp | Decimal | "0.2" | >= 0 |
| min_cross | Decimal | "1.0" | >= 0 |
| channel_mannings | Decimal | "0.035" | > 0 |
| damage_currency | String | "USD" | Código válido |
| exchange_rate | Decimal | "1.0" | > 0 |

#### Pasos
1. Completar formulario de parámetros
2. Enviar POST a `/save/`
3. Verificar actualización

#### Criterios de Aceptación
- [ ] Todos los parámetros numéricos guardados correctamente
- [ ] Valores decimales con comas reemplazadas por puntos
- [ ] `damage_currency_exchange` guardado
- [ ] API: `api.save()` línea 183

---

### CP-SC-006: Crear Study Case - Paso 5 (Parámetros Financieros)

#### Descripción
Verificar la configuración de parámetros financieros de la plataforma.

#### Pre-condiciones
- Study case en progreso

#### Datos de Entrada

| Campo | Tipo | Ejemplo |
|-------|------|---------|
| director | Decimal(20,2) | "5000.00" |
| implementation | Decimal(20,2) | "3000.00" |
| evaluation | Decimal(20,2) | "2500.00" |
| finance | Decimal(20,2) | "2000.00" |
| office | Decimal(20,2) | "1500.00" |
| overhead | Decimal(20,2) | "1000.00" |
| equipment | Decimal(20,2) | "5000.00" |
| discount | Decimal(5,2) | "5.5" |
| maximum | Decimal(5,2) | "7.0" |
| minimum | Decimal(5,2) | "3.0" |
| transaction | Decimal(20,2) | "500.00" |
| others | Decimal(20,2) | "300.00" |
| travel | Decimal(20,2) | "800.00" |
| contracts | Decimal(20,2) | "1200.00" |
| financial_currency | String | "USD" |

#### Resultado Esperado
- Todos los campos financieros guardados
- Moneda financiera establecida

#### Criterios de Aceptación
- [ ] Campos de costos guardados correctamente
- [ ] Tasas de descuento (discount, maximum, minimum) validadas
- [ ] Moneda financiera guardada
- [ ] API: `api.save()` línea 201

---

### CP-SC-007: Crear Study Case - Paso 6 (Actividades NbS)

#### Descripción
Verificar la selección y configuración de actividades NbS.

#### Pre-condiciones
- Study case en progreso
- NbS disponibles para el país/ciudad

#### Datos de Entrada

```json
{
    "id_study_case": 123,
    "nbs[]": [1, 2, 3]
}
```

#### Pasos
1. Enviar POST a `/save/` con lista de NbS
2. Verificar creación de relaciones en `StudyCases_NBS_Fastflood`

#### Resultado Esperado
- Registros creados en tabla intermedia
- NbS anteriores limpiados si ya no están seleccionados
- Asociación correcta studycase-nbs

#### Criterios de Aceptación
- [ ] Relación many-to-many vía tabla intermedia
- [ ] NbS agregados si no existían
- [ ] NbS eliminados si fueron deseleccionados
- [ ] API: `api.save()` línea 159

---

### CP-SC-008: Crear Study Case - Paso 7 (Parámetros de Análisis)

#### Descripción
Verificar la configuración final y completar el study case.

#### Pre-condiciones
- Todos los pasos anteriores completados
- Parámetros biofísicos guardados
- Datos de daño guardados

#### Datos de Entrada

| Campo | Tipo | Ejemplo | Opciones |
|-------|------|---------|----------|
| analysis_type | String | "1" o "2" | FULL / INVESTMENT |
| analysis_currency | String | "USD" | Código moneda |
| period_analysis | Integer | 20 | Años |
| period_nbs | Integer | 10 | Años implementación |
| analysis_nbs | Integer | 1 | ID escenario climático |
| annual_investment | Decimal | "100000.00" | Si INVESTMENT |
| rellocated_remainder | String | "true"/"false" | Si INVESTMENT |
| change_year | Integer | 2050 | 2030-2100 |
| analisys_storm | Decimal | "24.0" | Horas |
| storm_duration | Integer | 24 | Horas |
| quantile | Integer | 50 | 15, 50, 85, N/A |

#### Pasos
1. Completar formulario de análisis
2. Enviar POST a `/save/` con `analysis_type`
3. Verificar `is_complete = True`

#### Resultado Esperado

**Tipo FULL:**
```json
{
    "analysis_type": "FULL",
    "annual_investment": null,
    "rellocated_remainder": false
}
```

**Tipo INVESTMENT:**
```json
{
    "analysis_type": "INVESTMENT",
    "annual_investment": "100000.00",
    "rellocated_remainder": true
}
```

#### Criterios de Aceptación
- [ ] `is_complete = True` al finalizar
- [ ] Tipo de análisis configurado correctamente
- [ ] Parámetros climáticos guardados
- [ ] Valores de NbS guardados en tabla intermedia
- [ ] Exchange rates guardados
- [ ] API: `api.save()` línea 222

---

### CP-SC-009: Ver Study Case

#### Descripción
Verificar la visualización completa de un study case.

#### Pre-condiciones
- Study case completo
- Usuario con permisos de lectura

#### Pasos
1. Navegar a `/studyCase/view/<id>`
2. Verificar información mostrada

#### Resultado Esperado
- Template `studycases_view.html` renderizado
- Información completa en 7 secciones:
  - Definición
  - Mercado de carbono
  - Portafolios
  - Parámetros de modelado
  - Parámetros financieros
  - Actividades NbS
  - Parámetros de análisis
- Watersheds asociados mostrados
- Geometrías en mapa

#### Criterios de Aceptación
- [ ] Todos los datos mostrados correctamente
- [ ] Datos biofísicos cargados
- [ ] Curvas de daño mostradas
- [ ] MaxDamage list mostrada
- [ ] Vista: `views.view_study_case()` línea 879
- [ ] Template: `studycases_view.html`

---

### CP-SC-010: Editar Study Case

#### Descripción
Verificar la edición de un study case existente.

#### Pre-condiciones
- Study case existente
- Usuario propietario o admin
- Study case NO ejecutado (`is_run_analysis = False`)

#### Pasos
1. Navegar a `/studyCase/edit/<id>`
2. Modificar cualquier paso
3. Guardar cambios
4. Verificar actualización

#### Resultado Esperado
- Formulario pre-poblado con datos existentes
- Permite modificar todos los pasos
- `edit_date` actualizado al guardar
- Datos anteriores preservados si no se modifican

#### Criterios de Aceptación
- [ ] Solo propietario o admin pueden editar
- [ ] Datos existentes cargados: watersheds, portfolios, NbS, etc.
- [ ] Damage curve list y invest data cargados
- [ ] MaxDamage list según moneda del análisis
- [ ] Vista: `views.edit_study_case()` línea 763
- [ ] Template: `studycases_edit.html`

---

### CP-SC-011: Clonar Study Case

#### Descripción
Verificar la clonación de un study case existente.

#### Pre-condiciones
- Study case fuente completo
- Usuario autenticado
- Especificar ISO del país destino

#### Pasos
1. Navegar a `/studyCase/clone/<id>/<country_iso>`
2. Verificar formulario pre-poblado
3. Modificar nombre (debe ser único)
4. Completar proceso de creación

#### Resultado Esperado
- Formulario con datos del study case original
- Max damage cost según país destino (country_iso)
- NbS del país origen + NbS personalizados del usuario
- Al guardar, crea nuevo study case

#### Criterios de Aceptación
- [ ] Datos originales cargados
- [ ] Watershed original seleccionado
- [ ] Portfolios originales seleccionados
- [ ] NbS disponibles incluyen originales + personalizados
- [ ] MaxDamage según país destino (parameter `country_iso`)
- [ ] `added_by` es usuario actual
- [ ] Vista: `views.clone_study_case()` línea 821
- [ ] Template: `studycases_clone.html`

---

### CP-SC-012: Eliminar Study Case

#### Descripción
Verificar la eliminación de un study case.

#### Pre-condiciones
- Study case existente
- Usuario propietario o admin

#### Pasos
1. Autenticar como propietario
2. Enviar POST a `/studyCase/delete/<id>`
3. Verificar eliminación

#### Resultado Esperado - Éxito
```json
{
    "status": "200",
    "reason": "success"
}
```

#### Resultado Esperado - No Encontrado
```json
{
    "status": "400",
    "reason": "Study Case not found"
}
```

#### Criterios de Aceptación
- [ ] Solo propietario o admin pueden eliminar
- [ ] Eliminación en cascada de relaciones:
  - `StudyCases_NBS_Fastflood`
  - `StudyCases_Currency_Fastflood`
  - `StudyCases_Parameters_Bio`
  - `StudyCase_damage_curve`
  - `StudyCase_depth_damage`
- [ ] API: `api.delete()` línea 614

---

### CP-SC-013: Hacer Study Case Público

#### Descripción
Verificar la publicación de un study case.

#### Pre-condiciones
- Study case completo
- Usuario propietario o admin
- `is_public = False`

#### Pasos
1. Autenticar como propietario
2. Enviar POST a `/studyCase/public/<id>`
3. Verificar cambio de estado

#### Resultado Esperado
```json
{
    "status": "200",
    "reason": "success"
}
```

#### Criterios de Aceptación
- [ ] `is_public = True`
- [ ] `edit_date` actualizado
- [ ] Study case visible para todos los usuarios
- [ ] API: `api.public()` línea 660

---

### CP-SC-014: Hacer Study Case Privado

#### Descripción
Verificar que un study case público se pueda hacer privado.

#### Pre-condiciones
- Study case completo
- Usuario propietario o admin
- `is_public = True`

#### Pasos
1. Autenticar como propietario
2. Enviar POST a `/studyCase/private/<id>`
3. Verificar cambio de estado

#### Resultado Esperado
```json
{
    "status": "200",
    "reason": "success"
}
```

#### Criterios de Aceptación
- [ ] `is_public = False`
- [ ] `edit_date` actualizado
- [ ] Study case solo visible para propietario y admin
- [ ] API: `api.private()` línea 635

---

### CP-SC-015: Ejecutar Análisis

#### Descripción
Verificar la ejecución del análisis de un study case.

#### Pre-condiciones
- Study case completo (`is_complete = True`)
- Todos los parámetros configurados
- Folder name asignado

#### Pasos
1. Enviar POST a `/fastflood/run/` con `run_analysis=true`
2. Verificar cambio de estado

#### Resultado Esperado
```json
{
    "id_study_case": 123
}
```

#### Criterios de Aceptación
- [ ] `is_run_analysis = True`
- [ ] `edit_date` actualizado
- [ ] API: `api.run()` línea 685

---

### CP-SC-016: Guardar Parámetros Biofísicos

#### Descripción
Verificar el guardado de parámetros biofísicos del study case.

#### Pre-condiciones
- Study case existente
- Watershed asociado
- Macro región identificada por basin

#### Datos de Entrada
```json
{
    "id_study_case": 123,
    "watershed_id": 10,
    "sc_bio": [
        {
            "lulcode": 10,
            "c_above": 50.5,
            "c_below": 30.2,
            "c_soil": 20.1,
            "c_dead": 10.3
        },
        {
            "lulcode": 20,
            "c_above": 40.5,
            "c_below": 25.2,
            "c_soil": 15.1,
            "c_dead": 8.3
        }
    ]
}
```

#### Pasos
1. Enviar POST a `/savebio/`
2. Verificar creación/actualización de registros

#### Resultado Esperado
- Registros creados/actualizados en `StudyCases_Parameters_Bio`
- Parámetros por defecto de macro región copiados
- Valores de carbono actualizados según input

#### Criterios de Aceptación
- [ ] Elimina parámetros anteriores del study case
- [ ] Copia parámetros base de macro región
- [ ] Actualiza valores de carbono (c_above, c_below, c_soil, c_dead)
- [ ] Mantiene otros parámetros de la región
- [ ] API: `api.saveBiophysicals()` línea 521

---

### CP-SC-017: Guardar Datos de Daño

#### Descripción
Verificar el guardado de curvas de daño y costos máximos.

#### Pre-condiciones
- Study case existente

#### Datos de Entrada
```json
{
    "id_study_case": 123,
    "damage_data": [
        {
            "flood_depth": 0.5,
            "residential": 0.1,
            "commercial": 0.15,
            "industrial": 0.12,
            "infraroad": 0.08,
            "agriculture": 0.05
        }
    ],
    "max_damage_data": [
        {
            "residential": 100000,
            "commercial": 150000,
            "industrial": 200000,
            "infraroad": 80000,
            "agriculture": 50000
        }
    ]
}
```

#### Pasos
1. Enviar POST a `/savedamage/`
2. Verificar guardado

#### Resultado Esperado
- Datos guardados en `StudyCase_damage_curve`
- Datos guardados en `StudyCase_depth_damage`

#### Criterios de Aceptación
- [ ] Elimina curvas anteriores del study case
- [ ] Crea nuevos registros de damage curve
- [ ] Actualiza/crea registro de depth damage (OneToOne)
- [ ] Todos los valores numéricos guardados correctamente
- [ ] API: `api.saveDamageData()` línea 575

---

## Casos de Prueba de Integración

### CP-SC-I001: Creación Completa de Study Case

#### Descripción
Prueba end-to-end de creación de study case.

#### Pasos
1. Paso 1: Definición (nombre, descripción, watersheds)
2. Paso 2: Mercado de carbono
3. Paso 3: Portafolios
4. Paso 4: Parámetros de modelado
5. Paso 5: Parámetros financieros
6. Paso 6: Actividades NbS
7. Paso 7: Parámetros de análisis
8. Guardar parámetros biofísicos
9. Guardar datos de daño

#### Criterios de Aceptación
- [ ] Study case completo (`is_complete = True`)
- [ ] Todas las relaciones establecidas
- [ ] Parámetros guardados en tablas relacionadas
- [ ] Disponible en lista de study cases
- [ ] Listo para ejecutar análisis

---

### CP-SC-I002: Flujo de Edición y Ejecución

#### Descripción
Editar y ejecutar un study case.

#### Pasos
1. Editar study case existente
2. Modificar parámetros
3. Guardar cambios
4. Ejecutar análisis
5. Verificar logs de ejecución

#### Criterios de Aceptación
- [ ] Cambios guardados correctamente
- [ ] Análisis ejecutado
- [ ] Logs generados
- [ ] Estado actualizado

---

### CP-SC-I003: Clonar y Modificar

#### Descripción
Clonar un study case y modificarlo para otro país.

#### Pasos
1. Clonar study case existente
2. Cambiar país/ciudad
3. Actualizar max damage costs según nuevo país
4. Modificar parámetros según contexto local
5. Guardar nuevo study case

#### Criterios de Aceptación
- [ ] Nuevo study case independiente creado
- [ ] Max damage costs actualizados según país
- [ ] NbS disponibles según país destino
- [ ] Usuario actual como propietario

---

## Validaciones Especiales

### V-SC-001: Validación de Nombre Único
- El nombre debe ser único por usuario
- Permitir mismo nombre para diferentes usuarios
- API: `api.studycase_exist_by_name()` línea 881

### V-SC-002: Validación de Watershed Requerido
- Al menos 1 watershed debe estar asociado
- Watershed debe estar completo (`is_complete = True`)

### V-SC-003: Validación de Percentages
- `commercial_value + industrial_value <= 100`
- Valores individuales entre 0 y 100

### V-SC-004: Validación de Años
- `change_year`: 2030, 2040, 2050, 2060, 2070, 2080, 2090, 2100
- `storm_duration`: 3, 6, 12, 24, 48, 72, 120, 240 (horas)
- `quantile`: 15, 50, 85, N/A

### V-SC-005: Validación de Monedas
- Todas las monedas deben existir en tabla Countries
- Exchange rates deben ser > 0

---

## Datos de Prueba

### Study Cases de Ejemplo

```python
# Study Case Básico
{
    "name": "Test Study Case - Full Analysis",
    "description": "Case for testing full analysis",
    "city_id": 1,
    "watersheds": [1, 2],
    "analysis_type": "FULL",
    "analysis_currency": "USD",
    "analysis_period_value": 20,
    "change_year": 2050,
    "is_public": False
}

# Study Case con Inversión
{
    "name": "Test Study Case - Investment",
    "description": "Case for testing investment analysis",
    "city_id": 1,
    "watersheds": [3],
    "analysis_type": "INVESTMENT",
    "annual_investment": 100000.00,
    "rellocated_remainder": True,
    "benefit_carbon_market": True,
    "cm_value": 25.50,
    "cm_currency": "USD"
}
```

### Escenarios Climáticos
```python
# Definidos en modelo Fastflood_investment_scenario
scenarios = [
    {"id": 1, "scenario": "Baseline", "code": "BL", "day": 1},
    {"id": 2, "scenario": "RCP 4.5", "code": "R45", "day": 3},
    {"id": 3, "scenario": "RCP 8.5", "code": "R85", "day": 5}
]
```

### Rangos de Valores

| Parámetro | Min | Max | Default |
|-----------|-----|-----|---------|
| ocean_elevation | -10.00 | 10.00 | 0.00 |
| commercial_value | 0 | 100 | 30 |
| industrial_value | 0 | 100 | 20 |
| channel_manning | 0.01 | 1.00 | 0.035 |
| discount_rate | 0.00 | 100.00 | 5.00 |

---

## Matriz de Trazabilidad

| ID Caso | Requisito | Vista/API | Template | Prioridad |
|---------|-----------|-----------|----------|-----------|
| CP-SC-001 | Listar | study_cases_list | studycases_list.html | Alta |
| CP-SC-002 | Crear paso 1 | api.save | studycases_form.html | Alta |
| CP-SC-003 | Crear paso 2 | api.save | studycases_form.html | Alta |
| CP-SC-004 | Crear paso 3 | api.save | studycases_form.html | Alta |
| CP-SC-005 | Crear paso 4 | api.save | studycases_form.html | Alta |
| CP-SC-006 | Crear paso 5 | api.save | studycases_form.html | Alta |
| CP-SC-007 | Crear paso 6 | api.save | studycases_form.html | Alta |
| CP-SC-008 | Crear paso 7 | api.save | studycases_form.html | Alta |
| CP-SC-009 | Ver | view_study_case | studycases_view.html | Media |
| CP-SC-010 | Editar | edit_study_case | studycases_edit.html | Alta |
| CP-SC-011 | Clonar | clone_study_case | studycases_clone.html | Media |
| CP-SC-012 | Eliminar | api.delete | - | Alta |
| CP-SC-013 | Publicar | api.public | - | Media |
| CP-SC-014 | Privatizar | api.private | - | Media |
| CP-SC-015 | Ejecutar | api.run | - | Alta |
| CP-SC-016 | Guardar bio | api.saveBiophysicals | - | Alta |
| CP-SC-017 | Guardar daño | api.saveDamageData | - | Alta |

---

## Scripts de Prueba Recomendados

```python
# test_study_cases_crud.py
from django.test import TestCase, Client
from geonode.waterproof_fastflood.models import StudyCases, Watershed
from geonode.waterproof_parameters.models import Cities
import json

class StudyCasesCRUDTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = get_user_model().objects.create_user(
            username='testuser',
            password='testpass',
            professional_role='ANALYS',
            country='USA'
        )
        self.city = Cities.objects.create(name='Test City')
        self.watershed = Watershed.objects.create(
            name='Test Watershed',
            city=self.city,
            added_by=self.user,
            is_complete=True,
            demvalue=150
        )

    def test_create_study_case_step1_success(self):
        self.client.login(username='testuser', password='testpass')
        response = self.client.post('/save/', {
            'name': 'Test Study Case',
            'description': 'Test Description',
            'city_id': self.city.id,
            'watersheds[]': [self.watershed.id],
            'id_study_case': ''
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('id_study_case', data)
        self.assertNotEqual(data['id_study_case'], '')

    def test_duplicate_name_validation(self):
        # Crear primer study case
        StudyCases.objects.create(
            name='Duplicate Test',
            description='First',
            city=self.city,
            added_by=self.user
        )

        # Intentar crear segundo con mismo nombre
        self.client.login(username='testuser', password='testpass')
        response = self.client.post('/save/', {
            'name': 'Duplicate Test',
            'description': 'Second',
            'city_id': self.city.id,
            'watersheds[]': [self.watershed.id],
            'id_study_case': ''
        })
        data = response.json()
        self.assertEqual(data['id_study_case'], '')
```

---

## Referencias

- **Modelos**: Líneas 95-169 en `models.py`
- **Vistas**: Líneas 597-953 en `views.py`
- **API**: `api.py`
- **URLs**: Líneas 28-36 en `urls.py`
- **Templates**: `geonode/templates/waterproof_fastflood/studycases_*.html`
