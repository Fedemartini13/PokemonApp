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
const limit = 20;
const maxPokemon = 151; // Por ser 151 la primer generacion

// Inicializar la app
document.addEventListener('DOMContentLoaded', () => {
    cargarListaPokemon();
});

// Cargar lista inicial de Pokemones
function cargarListaPokemon() {
    fetch(`https://pokeapi.co/api/v2/pokemon?offset=${currentOffset}&limit=${limit}`)
        .then(response => response.json())
        .then(data => {
            data.results.forEach(pokemon => {
                fetchDetallePokemon(pokemon.url);
            });
        });
}



/*


// Paginacion 


const anteriorButton = document.getElementById('anterior-btn');
const siguienteButton = document.getElementById('siguiente-btn');




// siguiente
siguienteButton.addEventListener('click', () => {
  if (currentOffset + limit < maxPokemon) {
    currentOffset += limit;
     pokemonListElement.innerHTML = "";
    cargarListaPokemon();
  }
});

// anterior
anteriorButton.addEventListener('click', () => {
  if (currentOffset - limit >= 0) {
    currentOffset -= limit;
     pokemonListElement.innerHTML = "";
    cargarListaPokemon();
  }
});


*/



// Buscar Pokemon por ID o nombre
searchButton.addEventListener('click', () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm) {
        fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm}`)
            .then(response => response.json())
            .then(data => mostrarModal(data))
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
        <h3>${capitalize(pokemon.name)}</h3>
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





// Cargar automáticamente al scrollear
window.addEventListener('scroll', () => {
    if (!isViewingFavorites && window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        if (currentOffset + limit < maxPokemon) {
            currentOffset += limit;
            cargarListaPokemon();
        }
    }
});


// Mostrar favoritos en una lista
function mostrarFavoritos() {
    isViewingFavorites = true; // Establecer estado de favoritos
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (favorites.length === 0) {
        alert('No hay Pokémon favoritos agregados aún.');
    } else {
        pokemonListElement.innerHTML = ''; // Limpiar la lista actual
        favorites.forEach(pokemon => {
            if (pokemon.name) {
                const card = document.createElement('div');
                card.classList.add('pokemon-card');
                card.innerHTML = `
                    <img src="${pokemon.image}" alt="${pokemon.name}">
                    <h3>${capitalize(pokemon.name)}</h3>
                    <button class="favorite-btn">Quitar de Favoritos</button>
                `;
                
                // Obtener detalles del Pokémon al hacer clic en el nombre
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
    }
}



searchInput.addEventListener('keydown', (event) => {   // Buscar al presionar enter
    if (event.key === 'Enter') {
        searchButton.click(); 
    }
});