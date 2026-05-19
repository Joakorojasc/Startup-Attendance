# Reglas de trabajo

- Sé conciso en las respuestas. No expliques lo que ya hice o pedí.
- No repitas código que no cambiaste. Muestra solo los archivos modificados.
- Antes de escribir código, di en 1 línea qué vas a hacer y espera confirmación.
- No generes tests a menos que los pida explícitamente.
- No agregues comentarios al código a menos que sean críticos.
- Cuando edites un archivo, usa el mínimo de líneas necesarias, no reescribas el archivo completo.
- Si tengo un error, muestra solo la línea del fix, no el archivo entero.
- Responde en español.

# Archivo maestro del proyecto

Cada vez que crees, elimines o modifiques significativamente un 
archivo, actualiza el archivo PROJECT_MAP.md en la raíz del proyecto.

El formato de PROJECT_MAP.md debe ser:

## Estructura del proyecto
(árbol de carpetas actualizado)

## Qué hace cada archivo
(nombre del archivo → explicación en 1 línea, en español simple 
que alguien no técnico pueda entender)

## Últimos cambios
(fecha y qué se modificó, máximo los últimos 10 cambios)

Mantén las explicaciones simples. Ejemplo:
- src/App.tsx → "Página principal que decide qué vista mostrar"
- src/pages/AhoraMismo.tsx → "Pantalla de quién está adentro del local ahora"
- src/lib/supabase.ts → "Conexión con la base de datos en la nube"