# Cache Busting para Archivos Estáticos

## Descripción

Este sistema previene problemas de caché en navegadores durante el desarrollo, asegurando que los cambios en archivos CSS y JavaScript se reflejen inmediatamente sin necesidad de limpiar el caché del navegador manualmente.

## Cómo Funciona

### Modo Desarrollo (DEBUG=True)
- Usa un timestamp actualizado en cada request
- Los archivos se recargan automáticamente con cada cambio
- Formato: `file.css?v=1234567890` (timestamp Unix)

### Modo Producción (DEBUG=False)
- Usa una versión fija definida en `settings.STATIC_VERSION`
- Se debe actualizar manualmente en cada deploy
- Formato: `file.css?v=1.0.0`

## Implementación

### Opción 1: Usando Context Processor (Recomendado para desarrollo rápido)

Ya está configurado en `settings.py`. Simplemente usa la variable en tus templates:

```html
<!-- CSS -->
<link rel="stylesheet" href="{{ STATIC_URL }}path/to/style.css?v={{ STATIC_VERSION }}"/>

<!-- JavaScript -->
<script src="{{ STATIC_URL }}path/to/script.js?v={{ STATIC_VERSION }}"></script>
```

### Opción 2: Usando Template Tag (Más limpio)

Para una sintaxis más limpia, usa el template tag personalizado:

```html
{% load static_cache_buster %}

<!-- CSS -->
<link rel="stylesheet" href="{% static_v 'path/to/style.css' %}"/>

<!-- JavaScript -->
<script src="{% static_v 'path/to/script.js' %}"></script>
```

## Archivos Modificados

1. **`context_processors.py`** - Context processor que provee `STATIC_VERSION`
2. **`templatetags/static_cache_buster.py`** - Template tags personalizados
3. **`settings.py`** - Registra el context processor
4. **Templates actualizados:**
   - `status_view.html`
   - `status_search.html`
   - `status_search_fastflood.html`

## Configuración de Producción

En producción, define la versión en tu archivo `settings.py` o variables de entorno:

```python
# settings.py
STATIC_VERSION = '2.1.0'  # Actualizar en cada deploy
```

O usar una variable de entorno:

```python
STATIC_VERSION = os.environ.get('APP_VERSION', '1.0.0')
```

## Ventajas

✅ **Desarrollo**: Cambios visibles inmediatamente sin Ctrl+F5
✅ **Producción**: Control de versiones centralizado
✅ **Performance**: Navegadores pueden cachear eficientemente
✅ **Mantenibilidad**: Una sola configuración para toda la aplicación

## Notas Importantes

- **CDN externos** (Bootstrap, jQuery, etc.) NO necesitan versión, ya tienen su propio versionado
- **Solo aplicar** a archivos estáticos locales (CSS, JS propios)
- En producción, actualizar `STATIC_VERSION` con cada deploy que incluya cambios en archivos estáticos

## Testing

Para verificar que funciona:

1. Abre el navegador en modo desarrollo (F12)
2. Ve a la pestaña Network
3. Recarga la página
4. Verifica que los archivos CSS/JS tienen el parámetro `?v=` con timestamp
5. Modifica un archivo CSS/JS
6. Recarga la página
7. El timestamp debe ser diferente y los cambios deben ser visibles
