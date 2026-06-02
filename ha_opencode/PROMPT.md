# Prompt para consultar a OpenCode sobre la configuración

Copiá y pegá este prompt en OpenCode para que analice y mejore la configuración del addon:

---

```
Analiza la configuración del addon OpenCode para Home Assistant.

Contexto:
- El addon se instala desde: https://github.com/juanchula/ha-opencode
- Configuración actual en ha_opencode/config.yaml
- El addon expone un servidor MCP con 97 herramientas para Home Assistant
- Usa Supervisor API, HA Core API, y acceso al filesystem de configuración

Tareas:
1. Revisa ha_opencode/config.yaml y dime:
   - ¿Qué opciones están de más o se pueden agrupar?
   - ¿Falta alguna opción útil para integraciones comunes?
   - ¿Las descripciones son claras para el usuario?

2. Revisa ha_opencode/build.yaml y dime:
   - ¿Está bien configurado para builds reproducibles?
   - ¿Falta algo?

3. Revisa la documentación (DEPLOYMENT.md, DOCS.md) y dime:
   - ¿Las instrucciones son claras?
   - ¿Falta información importante?

4. Sugiere mejoras concretas con código YAML.

Consideraciones:
- Menos opciones es mejor si no son necesarias
- Las integraciones deben ser opt-in (disabled by default)
- La UI de HA debe mostrar descripciones útiles
- El addon debe ser seguro y tener permisos mínimos
```

---

## Problemas conocidos para mencionar:

1. **Clipboard**: Cuando selecciono texto en la terminal de OpenCode (ingress de HA), se deselecciona porque OpenCode intenta copiar al clipboard interno del iframe, pero no llega al clipboard del sistema operativo. Necesito que el copy funcione con el clipboard del navegador/OS.

2. **Versión de OpenCode**: Está en `latest` pero el usuario ve versión vieja (1.14.20). ¿Cómo actualizarla? ¿Hay un comando `opencode upgrade` o hay que rebuildear el addon?

3. **Configuración JSON de OpenCode**: Para editar el JSON de configuración de OpenCode (`opencode_config`), el usuario tiene que ir a una carpeta random con el explorador de archivos de HA. ¿Se puede mejorar el flujo?

4. **Auto-detección de addons**: ¿Se puede detectar qué addons están instalados en HA (HACS, Grafana, Node-RED, etc.) y habilitar automáticamente las integraciones correspondientes?

5. **Opciones innecesarias**: El usuario cree que hay opciones de más o que no tienen sentido estar ahí. ¿Cuáles se pueden eliminar o agrupar?
