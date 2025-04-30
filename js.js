// Instruction: 
// - The user can select any of the mood, then by clicking get movie, a movie suggestion will show.
// - The user can only just click shuffle for a movie suggestion
// - After thos, infos about the movie will appear (title, rating, genre, release date, and description)
// - There will also be list of cast or main actors via Wikipedia API
// - And a youtube trailer via Youtube API
// - The user can also add to watchlist, and can delete it, or if there are multiple, just simply click 'Clear Watchlist'
// - The user can als clear the results by 'Clear Search' button

// When the user clicked the ? button, an alert will show up
function showAlert() {
    alert("This is a Mood and Movie (Mood-vie) Matcher! Select a mood to get a movie suggestion.");
}

// Keys and URL
const apiKey = 'deef7727267bb526470490c3cb83e361'; // TMDB key
const youtubeApiKey = 'AIzaSyDSIxPymwbbRKHGxj4tTO7dBKQkDen8ZcM'; //Youtube key
const wikipediaApiUrl = 'https://en.wikipedia.org/w/api.php?'; // Wikipedia URL

// Genre IDs to filter the movies
const moodToGenre = {
happy: 35,
sad: 18,
scared: 27,
adventurous: 12,
romantic: 10749,
fighting: 28 
};

let currentMovie = null; // Store current movie data
let selectedMood = ''; // Store current mood

// When any of the mood button were clicked the mood chosen will be stored in selected mood
document.querySelectorAll('.moodBtn').forEach(btn => {
btn.addEventListener('click', () => {
    selectedMood = btn.getAttribute('data-mood');
    document.querySelectorAll('.moodBtn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
});
});

document.getElementById('getMovieBtn').addEventListener('click', () => getMovie(false)); // When the 'getMovieBtn' is clicked, the 'getMovie' function will be called
document.getElementById('shuffleBtn').addEventListener('click', () => getMovie(true)); // When the 'shuffleBtn' is clicked, the 'getMovie' function will be called
document.getElementById('clearSearchBtn').addEventListener('click', clearSearch); // When the 'clearSearchBtn' is clicked, the 'clearSearch' function will be called
document.getElementById('addWatchlistBtn').addEventListener('click', addToWatchlist); // When the 'clearWatchlistBtn' is clicked, the 'addToWatchlist' function will be called
document.getElementById('clearWatchlistBtn').addEventListener('click', () => {
localStorage.removeItem('watchlist'); // clear from local storage
renderWatchlist(); // refresh the view
}); // When the 'clearWatchlistBtn' is clicked the contents will be cleared in the 'watchlistItems'

// Fetches movie based on mood or in random
async function getMovie(forceRandom) {
const mood = selectedMood;
let url = '';
const page = Math.floor(Math.random() * 5) + 1;

// Conditional Statement
if (forceRandom) { // If true, will fetch random popular movie
    url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=${page}`;
} else {
    const genreId = moodToGenre[mood];
    if (!genreId) return alert('Please select a mood!');
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&language=en-US&page=${page}`;
}

try {
    const res = await fetch(url); // Waits for the response
    const data = await res.json(); // Parses as JSON
    const movie = data.results[Math.floor(Math.random() * data.results.length)]; // Returned by the API
    currentMovie = movie;
    displayMovie(movie); // For the selected movie details
    fetchActorBios(movie.id); // For the actors list
} catch (err) {
    alert('Error fetching movie.');
    console.error(err);
}
}

// Function for displaying movie
function displayMovie(movie) {
const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '';
const genreNames = movie.genre_ids.map(id => genreName(id)).join(', ');

// Contents or information of the movie
document.getElementById('moviePoster').src = poster;
document.getElementById('movieTitle').textContent = movie.title;
document.getElementById('movieDescription').textContent = movie.overview || 'No description available.';
document.getElementById('movieRating').textContent = movie.vote_average.toFixed(1);
document.getElementById('movieGenre').textContent = genreNames;
document.getElementById('movieDate').textContent = movie.release_date;
document.getElementById('movieResult').classList.add('show');
fetchTrailer(movie.id);
}

// Function for the actors or cast 
async function fetchActorBios(movieId) {
const url = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`;
try {
    const res = await fetch(url);
    const data = await res.json();
    const biosContainer = document.getElementById('actorBios');
    biosContainer.innerHTML = '';
    data.cast.slice(0, 3).forEach(actor => {
    const actorDiv = document.createElement('div');
    actorDiv.textContent = actor.name;
    biosContainer.appendChild(actorDiv);
    });
} catch (err) {
    console.error('Error fetching actor bios:', err);
}
}

// Function for fetching the trailer from the youtube
async function fetchTrailer(movieId) {
const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&key=${youtubeApiKey}&q=${currentMovie.title}+trailer&type=video`;
try {
    const res = await fetch(url);
    const data = await res.json();
    const videoId = data.items[0].id.videoId;
    document.getElementById('youtubeTrailer').src = `https://www.youtube.com/embed/${videoId}`;
    document.getElementById('trailerContainer').classList.add('show');
} catch (err) {
    console.error('Error fetching trailer:', err);
}
}

// Returns a movie based on the genre
function genreName(id) {
switch (id) {
    case 28: return 'Action';
    case 35: return 'Comedy';
    case 18: return 'Drama';
    case 27: return 'Horror';
    case 10749: return 'Romance';
    case 12: return 'Adventure';
    default: return 'Unknown';
}
}

// Clears the searches
function clearSearch() {
document.getElementById('movieResult').classList.remove('show');
document.getElementById('trailerContainer').classList.remove('show');
}

// Function for the Watchlist
function addToWatchlist() {
if (!currentMovie) return alert('No movie to add!');

let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

if (watchlist.some(item => item.id === currentMovie.id)) {
    return alert("Movie already in watchlist.");
}

watchlist.push(currentMovie);
localStorage.setItem('watchlist', JSON.stringify(watchlist));
renderWatchlist();
}

// Render the watchlist from local storage
function renderWatchlist() {
const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
const watchlistItems = document.getElementById('watchlistItems');
watchlistItems.innerHTML = '';

watchlist.forEach(movie => {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('watchlist-item');

    const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '';
    itemDiv.innerHTML = `
        <img src="${posterUrl}" alt="${movie.title}" width="50" height="75" style="object-fit: cover; border-radius: 8px; margin-right: 10px;">
        <strong>${movie.title}</strong><br>
        <em>${movie.overview.slice(0, 100)}...</em> 
        <button class="delete-btn">Delete</button>
    `;

    itemDiv.querySelector('.delete-btn').addEventListener('click', () => {
        removeFromWatchlist(movie.id);
    });

    watchlistItems.appendChild(itemDiv);
});
}

// Delete a movie from the watchlist
function removeFromWatchlist(id) {
let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
watchlist = watchlist.filter(movie => movie.id !== id);
localStorage.setItem('watchlist', JSON.stringify(watchlist));
renderWatchlist();
}

// Load watchlist on startup
window.addEventListener('DOMContentLoaded', () => {
renderWatchlist();
});
