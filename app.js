const pokemonListElement = document.getElementById('lista-pokemones');
const modalElement = document.getElementById('pokemon-modal');
const searchInput = document.getElementById('search');
const searchButton = document.getElementById('search-btn');
const loadMoreButton = document.getElementById('ver-mas-btn');
const closeModalButton = document.getElementById('close-modal');
document.getElementById('ver-favoritos-btn').addEventListener('click', mostrarFavoritos);

let pokemonList = [];
let currentOffset = 0;
let isViewingFavorites = false;
const limit = 24;
const maxPokemon = 168  ; // Limitar a los primeros 168 Pokemones

// Inicializar la app
document.addEventListener('DOMContentLoaded', () => {
    cargarListaPokemon();
    renderizarHistorial(); // Renderizar historial al cargar la página

    // Buscar al presionar en el input de busqueda
    searchInput.addEventListener('keydown', (event) => {   // Buscar al presionar enter
        if (event.key === 'Enter') {
            searchButton.click(); 
        }
    });
});


// Renderizar la paginación

function renderizarPaginacion() {
    let totalPokemones = maxPokemon;
    if (isViewingFavorites) {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        totalPokemones = favorites.length;
    }
    const totalPaginas = Math.ceil(totalPokemones / limit);
    const paginaActual = Math.floor(currentOffset / limit) + 1;

    function crearBoton(etiqueta, pagina, deshabilitado = false) {
        return `<button class="boton-pagina" data-pagina="${pagina}" ${deshabilitado ? 'disabled' : ''}>${etiqueta}</button>`;
    }

    let html = '';
    html += crearBoton('Primero', 1, paginaActual === 1);
    html += crearBoton('Anterior', paginaActual - 1, paginaActual === 1);

    // Números de página (máximo 5 visibles)
    let inicio = Math.max(1, paginaActual - 2);
    let fin = Math.min(totalPaginas, paginaActual + 2);
    if (paginaActual <= 3) fin = Math.min(5, totalPaginas);
    if (paginaActual >= totalPaginas - 2) inicio = Math.max(1, totalPaginas - 4);

    for (let i = inicio; i <= fin; i++) {
        html += `<button class="boton-pagina ${i === paginaActual ? 'activo' : ''}" data-pagina="${i}">${i}</button>`;
    }

    html += crearBoton('Siguiente', paginaActual + 1, paginaActual === totalPaginas);
    html += crearBoton('Último', totalPaginas, paginaActual === totalPaginas);

    document.getElementById('pagination-top').innerHTML = html;
    document.getElementById('pagination-bottom').innerHTML = html;

    // Eventos
    document.querySelectorAll('.boton-pagina').forEach(boton => {
        boton.onclick = (e) => {
            const pagina = Number(e.target.getAttribute('data-pagina'));
            if (pagina >= 1 && pagina <= totalPaginas && pagina !== paginaActual) {
                currentOffset = (pagina - 1) * limit;
                pokemonListElement.innerHTML = '';
                if (isViewingFavorites) {
                    mostrarFavoritos();
                } else {
                    cargarListaPokemon();
                }
            }
        };
    });
}







// Cargar lista inicial de Pokemones
function cargarListaPokemon() {
    fetch(`https://pokeapi.co/api/v2/pokemon?offset=${currentOffset}&limit=${limit}`)
        .then(response => response.json())
        .then(data => {
            data.results.forEach(pokemon => {
                fetchDetallePokemon(pokemon.url);
            });

            renderizarPaginacion();
        });
}





// Buscar Pokemon por ID o nombre
searchButton.addEventListener('click', () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm) {
        fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm}`)
            .then(response => response.json())
            .then(data => {
                mostrarModal(data);
                guardarEnHistorial(searchTerm); // Guardar en historial
            })
            .catch(error => alert('Pokémon no encontrado'));
    }
});


// Obtener detalles de un Pokemon especifico
function fetchDetallePokemon(url) {
    fetch(url)
        .then(response => response.json())
        .then(pokemon => {
            displayCartaPokemon(pokemon);
            pokemonList.push(pokemon);
        });
}

// Mostrar una tarjeta con la informacion basica del Pokemon
function displayCartaPokemon(pokemon) {
    const card = document.createElement('div');
    card.classList.add('pokemon-card');


    const tipos = pokemon.types.map(typeInfo => capitalize(typeInfo.type.name)).join(', '); // Para agregar el tipo de pokemon agua/fuego etc


    card.innerHTML = `
        <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}">
        <h3>${capitalize(pokemon.name)} <span title="Ver más información" style="font-size:1em;cursor:pointer;">👁</span></h3>
        <button class="favorite-btn">${isFavorite(pokemon.name) ? 'Quitar de Favoritos' : 'Agregar a Favoritos'}</button>
    `;

    // Evento para abrir el modal con la información del Pokemon
    card.querySelector('h3').addEventListener('click', () => mostrarModal(pokemon));
    // Evento para agregar o quitar de favoritos
    card.querySelector('.favorite-btn').addEventListener('click', () => toggleFavorite(pokemon.name, pokemon.sprites.other['official-artwork'].front_default));
    pokemonListElement.appendChild(card);
}

// Modal de detalles del Pokemon
function mostrarModal(pokemon) {
    const modalImg = document.getElementById('pokemon-image');
    const modalName = document.getElementById('pokemon-name');
    const modalHeight = document.getElementById('pokemon-height');
    const modalWeight = document.getElementById('pokemon-weight');
    const modalAbilities = document.getElementById('pokemon-abilities');
    const modalTipo = document.getElementById('pokemon-tipo');
    const favoriteBtn = document.getElementById('favorite-btn');

    //Obtener los tipos de pokemon, ultimo cambio
    const tipos = pokemon.types.map(typeInfo => capitalize(typeInfo.type.name)).join(', ');

    modalElement.style.display = 'block';
    modalImg.src = pokemon.sprites.other['official-artwork'].front_default;
    modalName.textContent = capitalize(pokemon.name);
    modalHeight.textContent = `${pokemon.height / 10} m`;
    modalWeight.textContent = `${pokemon.weight / 10} kg`;
    modalAbilities.textContent = pokemon.abilities.map(ability => capitalize(ability.ability.name)).join(', ');
    modalTipo.textContent = tipos;

    // Actualizar el estado del boton de favoritos en el modal
    favoriteBtn.textContent = isFavorite(pokemon.name) ? 'Quitar de Favoritos' : 'Agregar a Favoritos';
    favoriteBtn.onclick = () => toggleFavorite(pokemon.name, pokemon.sprites.other['official-artwork'].front_default);
}

// Cerrar el modal
closeModalButton.onclick = () => {
    modalElement.style.display = 'none';
};

// Función para agregar o sacar un Pokemon de favoritos
function toggleFavorite(name, image) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const index = favorites.findIndex(fav => fav.name === name);

    if (index > -1) {
        // Si el Pokemon ya está en favoritos se elimina
        favorites.splice(index, 1);
        alert(`${capitalize(name)} se ha quitado de Favoritos`);
    } else {
        // Si no esta en favoritos agregarlo
        favorites.push({ name, image });
        alert(`${capitalize(name)} se ha agregado a Favoritos`);
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoriteButtons();
}

// Comprobar si un Pokémon está en favoritos
function isFavorite(name) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    return favorites.some(fav => fav.name === name);
}

// Actualizar los botones de favoritos en la lista de Pokémon
function updateFavoriteButtons() {
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    favoriteButtons.forEach(button => {
        const card = button.closest('.pokemon-card');
        const pokemonName = card.querySelector('h3').textContent.toLowerCase();
        button.textContent = isFavorite(pokemonName) ? 'Quitar de Favoritos' : 'Agregar a Favoritos';
    });
}

// Función para que la primera letra de un texto sea mayuscula
function capitalize(text) {
    
    return text.charAt(0).toUpperCase() + text.slice(1);
}

loadMoreButton.addEventListener('click', () => {
    if (!isViewingFavorites) { // Solo cargar más si no estás viendo favoritos
        if (currentOffset + limit < maxPokemon) {
            currentOffset += limit;
            cargarListaPokemon();
        } else {
            alert('No hay más Pokemones para mostrar');
        }
    }
});



/* Suplantado por la paginacion

// Cargar automáticamente al scrollear
window.addEventListener('scroll', () => {
    if (!isViewingFavorites && window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        if (currentOffset + limit < maxPokemon) {
            currentOffset += limit;
            cargarListaPokemon();
        }
    }
});
*/

// Mostrar favoritos en una lista
function mostrarFavoritos() {
    isViewingFavorites = true;
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const totalPaginas = Math.ceil(favorites.length / limit);

    // Ajustar currentOffset si es mayor al total de favoritos
    if (currentOffset >= favorites.length && favorites.length > 0) {
        currentOffset = (totalPaginas - 1) * limit;
    }

    if (favorites.length === 0) {
        pokemonListElement.innerHTML = '';
        alert('No hay Pokémon favoritos agregados aún.');
        renderizarPaginacion();
    } else {
        pokemonListElement.innerHTML = '';
        const paginaActual = Math.floor(currentOffset / limit);
        const favoritosPagina = favorites.slice(paginaActual * limit, (paginaActual + 1) * limit);

        favoritosPagina.forEach(pokemon => {
            if (pokemon.name) {
                const card = document.createElement('div');
                card.classList.add('pokemon-card');
                card.innerHTML = `
                    <img src="${pokemon.image}" alt="${pokemon.name}">
                    <h3>${capitalize(pokemon.name)} <span title="Ver más información" style="font-size:1em;cursor:pointer;">👁</span></h3>
                    <button class="favorite-btn">Quitar de Favoritos</button>
                `;
                card.querySelector('h3').addEventListener('click', () => {
                    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name.toLowerCase()}`)
                        .then(response => response.json())
                        .then(data => mostrarModal(data))
                        .catch(error => alert('No se pudo cargar la información del Pokémon'));
                });
                card.querySelector('.favorite-btn').addEventListener('click', () => toggleFavorite(pokemon.name, pokemon.image));
                pokemonListElement.appendChild(card);
            }
        });
        renderizarPaginacion();
    }
}

// ====== HISTORIAL DE BÚSQUEDAS ======
function guardarEnHistorial(searchTerm) {
    let historial = JSON.parse(localStorage.getItem('historial')) || [];
    
    // Evitar duplicados, poner busqueda ms reciente primero
    historial = historial.filter(item => item !== searchTerm);
    historial.unshift(searchTerm);

    // Guardar maximo 10 busquedas
    if (historial.length > 10) historial.pop();

    localStorage.setItem('historial', JSON.stringify(historial));
    renderizarHistorial();
}






function renderizarHistorial() {
    const historial = JSON.parse(localStorage.getItem('historial')) || [];
    const historialDiv = document.getElementById('historial');
    historialDiv.innerHTML = '';

    historial.forEach(item => {
        const span = document.createElement('span');
        span.classList.add('historial-item');
        span.textContent = capitalize(item);
        span.addEventListener('click', () => {
            searchInput.value = item;
            searchButton.click();
        });
        historialDiv.appendChild(span);
    });
}



