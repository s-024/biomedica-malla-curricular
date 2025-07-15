# Malla Curricular Interactiva - Ingeniería Biomédica

Visualización interactiva de la malla curricular con sistema de prerrequisitos basado en IDs.

## Características principales
- 10 semestres académicos (del 0 al 9)
- Sistema de desbloqueo de materias al completar prerrequisitos
- Visualización de relaciones académicas
- Información detallada por materia
- Diseño responsive

## Cómo usar
1. Las materias se desbloquean al hacer clic en sus prerrequisitos
2. Haz clic en cualquier materia desbloqueada para:
   - Ver su información detallada
   - Resaltar las materias que la requieren como prerrequisito
3. Las materias bloqueadas (grises) muestran qué prerrequisitos faltan

## Estructura de datos
- Cada materia tiene un ID único (#) que referencia los prerrequisitos
- Los prerrequisitos se definen por estos IDs (no por códigos)
- Datos completos en `data.json`

## Tecnologías
- HTML5, CSS3, JavaScript
- GitHub Pages (hosting)