# Pokémon App

Una aplicación web interactiva que permite buscar, listar y marcar como favoritos a los Pokémon. También incluye un historial de búsquedas para acceder rápidamente a los últimos Pokémon consultados.

---

## Características

- Listado de los primeros 168 Pokémon con paginación.
- Búsqueda por ID o nombre.
- Modal con información detallada del Pokémon (altura, peso, habilidades, tipo).
- Guardar y quitar Pokémon como favoritos.
- Visualizar Pokémon favoritos en una lista paginada.
- Historial de búsquedas (hasta 10 últimas búsquedas) clickeable para acceder rápidamente.

---

## Tecnologías utilizadas

- HTML5 y CSS: Estructura y estilo de la página.
- JavaScript: Funcionalidad, fetch API y manejo del DOM.
- API externa: [PokéAPI](https://pokeapi.co/) para obtener los datos de Pokémon.
- LocalStorage: Para guardar favoritos y el historial de búsquedas.

---

## Estructura del proyecto

pokemon-app/
│
├── index.html # Página principal
├── styles.css # Estilos de la app
├── app.js # Lógica de la aplicación
├── logo.png # Logo de la app
└── README.md # Este archivo

---

## Cómo correr el proyecto

1. Clonar o descargar el repositorio.
2. Abrir `index.html` en cualquier navegador moderno (Chrome, Firefox, Edge).
3. Interactuar con la aplicación:
   - Buscar un Pokémon por nombre o ID.
   - Hacer clic en un Pokémon para ver más detalles.
   - Agregar o quitar Pokémon de favoritos.
   - Consultar el historial de búsquedas haciendo clic en los nombres.

 No es necesario instalar dependencias ni configurar un servidor, ya que la app funciona completamente con HTML/CSS/JS y fetch a la API pública.

---

## Decisiones de diseño y funcionalidad

1. **Paginación fija**: Se decidió limitar a los primeros 168 Pokémon para mantener tiempos de carga rápidos y no saturar la interfaz, sin embargo el usuario puede buscar el nombre de cualquier pokemon que este incluido en la api por ejemplo "Ralts" que corresponde al numero 268.
3. **Historial de búsqueda**: Guardado en `localStorage` y limitado a 10 ítems, con el más reciente primero.
4. **Favoritos**: Guardados también en `localStorage`, con opción de visualizarlos y removerlos.
5. **Modal para detalles**: Permite ver información relevante de cada Pokémon sin recargar la página.
6. **Responsive Design**: La aplicación se adapta a dispositivos móviles usando media queries, asegurando legibilidad y accesibilidad.
7. **JS**: Se decidió no usar frameworks externos para mantener el proyecto simple.

---

## Notas adicionales

- Para la visualización de imágenes se utiliza la propiedad `official-artwork` de PokéAPI.
- Los botones y tarjetas de Pokémon se generan dinámicamente con JavaScript.
- Se priorizó la experiencia del usuario con alertas y cambios visuales en botones de favoritos.

---

## Autor

- [Federico Martini]
