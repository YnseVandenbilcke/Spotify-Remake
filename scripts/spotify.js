let spotifyUserId, htmlModalwindow;
let fullDurationMs = 0;
let userID = ""; // userID variabele om te gebruiken bij POST om een nieuwe playlist te maken

let meName = "";
let meImage = "";
let meID = "";

let modal;
let modalTitle;
let modalSave;
let modalPlaylistTitle;
let modalPlaylistDescription;
let modalForm;

let authToken = "BQBaO9rgQ-Aioo67B8vphRr0-qfE7-iJAiu49xw3CnCd8ZbUo-VhOqbVxoHHBqdWNsR1Rpe8DRR7TaExqF-q8gDQkHUOSYmiUprDgS_Wsp7hM-SR7wMgTGZ1wdfuPSlThQOpS5k3Q-bgTRS3U5wl1kHRuiYi8ct7jMX1v0n_N0aDxxqsaXFE0ALWuRlqpDhVcwx8XIgBodmrYim_6b63cIcwoeIR8I83rw";

const millisToMinutesAndSeconds = function (millis) {
	const minutes = Math.floor(millis / 60000);
	const seconds = ((millis % 60000) / 1000).toFixed(0);
	return `${minutes} min ${seconds < 10 ? '0' : ''}${seconds} sec`;
};

const millisToHoursAndMinutes = function (millis) {
	let seconds = Math.floor(millis / 1000);
	let minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	seconds = seconds % 60;
	minutes = seconds >= 30 ? minutes + 1 : minutes;
	minutes = minutes % 60;
	return `${hours} hr ${minutes < 10 ? '0' : ''}${minutes} min`;
};

// #region ***  DOM references                           ***********

const hideAllWindows = function() {
	const htmlWindows = document.querySelectorAll('.js-window');
	for (const window of htmlWindows) {
		window.classList.add('u-hidden');
	}
}

// #endregion

// #region ***  Callback-Visualisation - show___         ***********

const showError = function (response) {
	console.error('Oeps, er is iets mis!');
	//als er een response terugkomt bij een error, zet dan ook deze response om naar een json object.

	if (response) {
		//opnieuw via een promise
		response.json().then(function (responseVanDeError) {
			console.log(responseVanDeError);
		});
	}
};

// De data uit het jsonObject halen en dynamisch verwerken naar de webpage
const showPersonalData = (jsonObject) => {
	let userImage;
	console.log(jsonObject.images[0].url)
	// Checken of de meegegeven array leeg is - leeg = person.png / niet leeg = profiel foto van gebruiker
	if(jsonObject.images.length === 0){
		userImage = "images/person.png";
	} else {
		userImage = jsonObject.images[0].url;
	}
	console.log(`**** 1. Tonen van de gegevens van de gebruiker ****\n${jsonObject.display_name}\n${userImage}`)
	document.querySelector('.js-username').innerHTML = jsonObject.display_name;
	document.querySelector('.js-userimg').src = userImage;
	userID = jsonObject.id;
}

// Data opvragen uit jsonObject en elke playlist naam en id plaatsen in een li element
const showPersonalPlaylists = (jsonObject) => {
	let htmlPlaylistsList = document.querySelector('.js-navplaylists');
	let htmlPlaylistCards = document.querySelector('.js-playlists');
	htmlPlaylistsList.innerHTML = "";
	htmlPlaylistCards.innerHTML = "";
	let playlistImage;
	console.log(`**** 2. Opvragen van alle playlists van de gebruiker ****`)
	for(const playlist of jsonObject.items){
		// Tonen van de data
		console.log(`Id: ${playlist.id} - Naam: ${playlist.name}`);
		// Controle of er een image is, anders gebruiken we de placeholder image
		if(playlist.images.length === 0){
			playlistImage = "images/placeholder.png";
		} else {
			playlistImage = playlist.images[0].url;
		}
		htmlPlaylistsList.innerHTML += `
			<li class="list-unstyled c-nav__item">
				<a class="c-nav__link js-navplaylist" href="#" data-playlistid=${playlist.id}>
					${playlist.name}
				</a>
			</li>
		`

		htmlPlaylistCards.innerHTML += `
			<div class="col-lg-2 col-md-3 col-sm-4 col-6 d-flex">
				<a class="c-playlists__item js-playlistitem" href="#" data-playlistid="${playlist.id}">
					<img src="${playlistImage}" alt="Playlist naam" class="img-fluid c-playlists__image js-playlistitem-image" width="163" height="163" />
					<h3 class="c-playlists__name js-playlistitem-name">${playlist.name}</h3>
					<p class="c-playlists__owner js-playlistitem-owner">By ${playlist.owner.display_name}</p>
				</a>
			</div>  
		`
	}
	// beide functies aanspreken om event listeners aan te maken
	listenToClickPlaylistCard();
	listenToClickPlaylistList();
}

const showSpecificPlaylist = (jsonObject) => {
	let userImage, listOfTracks;
	hideAllWindows();
	let windowPlaylist = document.querySelector('.js-window-playlist');
	windowPlaylist.classList.remove('u-hidden');
	if(jsonObject.images.length === 0){
		userImage = "images/placeholder.png";
	} else {
		userImage = jsonObject.images[0].url;
	}

	let counter = 1;

	for(let track of jsonObject.tracks.items){
		let artists = [];
		let artistName;
		let trackDate = new Date(track.added_at);
		let day = trackDate.getDate()
		let month = trackDate.getMonth();
		let year = trackDate.getFullYear();
		let trackTime = millisToMinutesAndSeconds(track.track.duration_ms);
		fullDurationMs += track.track.duration_ms;
		for(let artist of track.track.artists){
			if(track.track.artists.length > 1){
				artists.push(artist.name);
				artistName = `${artists[0]} ft. ${artists[1]}`;
			} else if(track.track.artists.length === 1){
				artistName = artist.name;
			}
		}
		listOfTracks += `
			<tr>
				<td>${counter}</td>
				<td>${track.track.name}</td>
				<td>${artistName}</td>
				<td>${track.track.album.name}</td>
				<td>${day}/${month}/${year}</td>
				<td>${trackTime}</td>
			</tr>
		`
		counter++;
	}

	let fullDuration = millisToHoursAndMinutes(fullDurationMs);

	windowPlaylist.innerHTML = `
		<header class="col-12 c-playlist__header">
		<div class="d-flex align-items-baseline">
			<div class="d-none d-md-block me-4">
				<img src="${userImage}" alt="${userImage}" class="img-fluid c-playlist__image js-playlist-image" width="232" height="232" />
			</div>
			<div>
				<div class="c-playlist__type">Playlist</div>
				<h1 class="c-playlist__name js-playlist-edit" data-id="${jsonObject.id}"><span class="js-playlist-name">${jsonObject.name}</span> <i class="c-playlist__edit fa-solid fa-pen"></i></h1>
				<p class="js-playlist-description">${jsonObject.description}</p>
				<p>
					Created by
					<span class="c-playlist__author js-playlist-owner">${jsonObject.owner.display_name}</span>
					<i class="fas fa-circle"></i>
					<span class="js-playlist-followers">${jsonObject.followers.total}</span> likes
					<i class="fas fa-circle"></i>
					<span class="js-playlist-songs">${jsonObject.tracks.total}</span> songs,
					<span class="js-playlist-totallength">${fullDuration}</span>
				</p>
			</div>
		</div>
		<div class="row">
			<div class="col-sm-6 c-playlist__actions">
				<a class="btn c-playlist__button c-playlist__button--solid" href="#" role="button"><i class="fa-solid fa-play"></i></a>
				<a class="c-playlist__more" href="#"><em class="fas fa-ellipsis-h"></em></a>
			</div>
		</div>
		</header>
		<section class="col-12 c-bevat js-playlist-tracks">
			<div class="row">
				<div class="col-12">
					<table class="c-tabelview table">
						<thead class="c-tabelview__header">
							<tr>
								<th>#</th>
								<th>Title</th>
								<th>Artists</th>
								<th>Album</th>
								<th class="c-tabelview__head">Date added</th>
								<th class="c-tabelview__head"><em class="far fa-clock"></em></th>
							</tr>
						</thead>
						<tbody class="js-playlist-tracklist c-tabelview__body">
							<!-- Start track van een playlist -->
							${listOfTracks}
							<!-- Einde track van een playlist -->
						</tbody>
					</table>
				</div>
			</div>
		</section> 
	`;
	let tracksArray = [];
	let trackObject = {};
	for(track of jsonObject.tracks.items){
		trackObject = {
			"name": track.track.name,
			"artists": track.track.artists
		}
		tracksArray.push(trackObject);
	}
	console.log(tracksArray);

	let consoleData = "";
	for(data of tracksArray){
		console.log(data)
		if(data.artists.length > 1){
			consoleData += `Naam: ${data.name} - Artists: ${data.artists[0].name} ft. ${data.artists[1].name}\n`;
		} else if (data.artists.length === 1){
			consoleData += `Naam: ${data.name} - Artists: ${data.artists[0].name}\n`;
		}
	}

	console.log(`
		**** 3. Opvragen van een specifieke playlist van de gebruiker ****\nId: ${jsonObject.id} - Naam: ${jsonObject.name}\nTracks: \n${consoleData}
	`)

	getSpecificPlaylistByIdForEdit(jsonObject.id);
}



const showPlaylistCreated = () => {
	let modalMessage = document.querySelector('.js-modal-message');
	modalMessage.innerHTML = "Playlist created!";
	getPersonalPlaylists();
}

const showEdit = () => {
	let modalMessage = document.querySelector('.js-modal-message');
	modalMessage.innerHTML = "Playlist edited!";
	console.log(`**** 5. Wijzigen van een bestaande playlist van de gebruiker ****\nResponse: success`)
	getPersonalPlaylists();
}

const showLikedSongs = () => {
	hideAllWindows();
	let windowPlaylist = document.querySelector('.js-window-playlist');
	windowPlaylist.classList.remove('u-hidden');
	windowPlaylist.innerHTML = `
		<header class="col-12 c-playlist__header">
			<div class="d-flex align-items-baseline">
				<div class="d-none d-md-block me-4">
					<img src="images/likedsongs.png" alt="images/likedsongs.png" class="img-fluid c-playlist__image js-playlist-image" width="232" height="232" />
				</div>
				<div>
					<div class="c-playlist__type">Playlist</div>
					<h1 class="c-playlist__name js-playlist-edit" data-id="${meID}"><span class="js-playlist-name">Liked Songs</span> <i class="c-playlist__edit fa-solid fa-pen"></i></h1>
					<p class="js-playlist-description"></p>
					<p>
						Created by
						<span class="c-playlist__author js-playlist-owner">${meName}</span>
						<i class="fas fa-circle"></i>
						<span class="js-playlist-songs">total amount of songs placeholder</span> songs
						<i class="fas fa-circle"></i>
						<span class="js-playlist-totallength">Total length placeholder</span>
					</p>
				</div>
				</div>
				<div class="row">
				<div class="col-sm-6 c-playlist__actions">
					<a class="btn c-playlist__button c-playlist__button--solid" href="#" role="button"><i class="fa-solid fa-play"></i></a>
					<a class="c-playlist__more" href="#"><em class="fas fa-ellipsis-h"></em></a>
				</div>
			</div>
		</header>
		<section class="col-12 c-bevat js-playlist-tracks">
		<div class="row">
			<div class="col-12">
				<table class="c-tabelview table">
					<thead class="c-tabelview__header">
						<tr>
							<th>#</th>
							<th>Title</th>
							<th>Artists</th>
							<th>Album</th>
							<th class="c-tabelview__head">Date added</th>
							<th class="c-tabelview__head"><em class="far fa-clock"></em></th>
						</tr>
					</thead>
					<tbody class="js-playlist-tracklist c-tabelview__body">
						<!-- Start track van een playlist -->
						<!-- Einde track van een playlist -->
					</tbody>
				</table>
			</div>
		</div>
	</section> 
	`
	handleData(`https://api.spotify.com/v1/me/tracks`, callbackLikedSongsList, showError, 'GET', null, authToken);
}

const showLikedSongsList = (jsonObject) => {
	let likedTotalSongs = document.querySelector('.js-playlist-songs');
	let likedTotalLength = document.querySelector('.js-playlist-totallength');
	let likedSongsTrackList = document.querySelector('.js-playlist-tracklist');
	let sumMs = 0;
	let listOfTracks = "";
	let counter = 1;

	for(let song of jsonObject.items){
		sumMs += song.track.duration_ms; 
	}
	likedTotalLength.innerHTML = millisToHoursAndMinutes(sumMs);
	likedTotalSongs.innerHTML = jsonObject.total;
	
	for(let track of jsonObject.items){
		let artists = [];
		let artistName;
		let trackDate = new Date(track.added_at);
		let day = trackDate.getDate()
		let month = trackDate.getMonth();
		let year = trackDate.getFullYear();
		let trackTime = millisToMinutesAndSeconds(track.track.duration_ms);
		fullDurationMs += track.track.duration_ms;
		for(let artist of track.track.artists){
			if(track.track.artists.length > 1){
				artists.push(artist.name);
				artistName = `${artists[0]} ft. ${artists[1]}`;
			} else if(track.track.artists.length === 1){
				artistName = artist.name;
			}
		}
		listOfTracks += `
			<tr>
				<td>${counter}</td>
				<td>${track.track.name}</td>
				<td>${artistName}</td>
				<td>${track.track.album.name}</td>
				<td>${day}/${month}/${year}</td>
				<td>${trackTime}</td>
			</tr>
		`
		counter++;
	}
	likedSongsTrackList.innerHTML = listOfTracks;

	let tracksArray = [];
	let trackObject = {};
	for(track of jsonObject.items){
		trackObject = {
			"name": track.track.name,
			"artists": track.track.artists
		}
		tracksArray.push(trackObject);
	}

	let consoleData = "";
	for(data of tracksArray){
		if(data.artists.length > 1){
			consoleData += `Naam: ${data.name} - Artists: ${data.artists[0].name} ft. ${data.artists[1].name}\n`;
		} else if (data.artists.length === 1){
			consoleData += `Naam: ${data.name} - Artists: ${data.artists[0].name}\n`;
		}
	}
	
	console.log(`**** 6. Opvragen van de opgeslagen tracks van de gebruikers ****\nTracks: \n${consoleData}`);
}

const showArtist = (jsonObject) => {
	hideAllWindows();
	let windowArtist = document.querySelector('.js-window-artists');
	windowArtist.classList.remove('u-hidden');
	let artists = document.querySelector('.js-artists');
	let listOfArtists = "";
	for(artist of jsonObject.artists.items){
		listOfArtists += `
			<div class="col-lg-2 col-md-3 col-sm-4 col-6 d-flex">
				<a class="c-playlists__item js-artistitem" href="#" data-artistid=${artist.id}>
					<img src="${artist.images[0].url}" alt=${artist.images[0].url} class="img-fluid c-playlists__image c-playlists__image--artist js-artistitem-image" width="163" height="163" />
					<h3 class="c-playlists__name js-artistitem-name">${artist.name}</h3>
				</a>
			</div>
		`
	}	
	artists.innerHTML = listOfArtists;

	let artistObjectList = [];
	let artistObject = {};
	for(artist of jsonObject.artists.items){
		artistObject = {
			"Id": artist.id,
			"Naam": artist.name
		}
		artistObjectList.push(artistObject)
	}
	let consoleData = "";
	for(data of artistObjectList){
		consoleData += `Id: ${data.Id} - Naam: ${data.Naam}\n`;
	}
	console.log(`**** 7. Zoeken van een artist ****\n${consoleData}`)
	listenToClickArtistCard();
}

const showArtistDetail = (jsonObject) => {
	hideAllWindows();
	let artistPage = document.querySelector('.js-window-artist');
	artistPage.classList.remove('u-hidden');
	artistPage.innerHTML = `
		<header class="col-12 c-playlist__header">
			<div class="d-flex align-items-baseline">
				<div class="d-none d-md-block me-4">
					<img src="${jsonObject.images[0].url}" alt="${jsonObject.images[0].url}" class="img-fluid c-playlist__image js-artist-image" width="232" height="232" />
				</div>
				<div>
					<div class="c-playlist__type">Artist</div>
					<h1 class="c-playlist__name js-artist-name" data-id="${jsonObject.id}">${jsonObject.name}</h1>
					<p>
						<span class="c-playlist__author js-artist-followers">${jsonObject.followers.total}</span>
						followers
					</p>
				</div>
			</div>
			<div class="row">
				<div class="col-sm-6 c-playlist__actions">
					<a class="btn c-playlist__button c-playlist__button--solid" href="#" role="button"><i class="fa-solid fa-play"></i></a>
					<a class="btn c-playlist__button c-playlist__button--outline js-artist-follow">Follow</a>
					<a class="c-playlist__more" href="#"><em class="fas fa-ellipsis-h"></em></a>
				</div>
			</div>
		</header>
	`

	console.log(`**** 8. Opvragen van details van een artiest ****\nId: ${jsonObject.id} - Naam: ${jsonObject.name}`);
	getIsUserFollowingArtist(jsonObject.id);
	listenToClickFollow();
}
// #endregion

// #region ***  Callback-No Visualisation - callback___  ***********
const callbackCreateModal = () => {
	modal = document.querySelector('.js-modal-window');
	modalTitle = document.querySelector('.js-modal-title');
	modalSave = document.querySelector('.js-modal-save');
	modalPlaylistTitle = document.querySelector('.js-modal-name');
	modalPlaylistDescription = document.querySelector('.js-modal-description');
	modalForm = document.querySelector('.js-modal-form');

	modal.dataset.type = "create";
	modalTitle.innerHTML = "Create Playlist";
	modalSave.innerHTML = "Create";
	document.querySelector('.js-modal').classList.remove('u-hidden');

	modalSave.addEventListener('click', function(){
		let payload = JSON.stringify({
			"name": `${modalPlaylistTitle.value}`,
			"description": `${modalPlaylistDescription.value}`,
			"public": true
		})
		handleData(`https://api.spotify.com/v1/users/${userID}/playlists`, showPlaylistCreated, showError, 'POST', payload, authToken);
		modalForm.reset();
		console.log(`**** 4. Maken van een nieuwe playlist voor de gebruiker ****\nNaam: ${modalPlaylistTitle.value}`);
	})
}

const callbackEdit = (jsonObject) => {
	modalPlaylistTitle = document.querySelector('.js-modal-name');
	modalPlaylistDescription = document.querySelector('.js-modal-description');
	modalTitle = document.querySelector('.js-modal-title');
	modalSave = document.querySelector('.js-modal-save');
	modal = document.querySelector('.js-modal-window');
	modalImage = document.querySelector('.js-modal-img');
	modalForm = document.querySelector('.js-modal-form');

	let playlistName = document.querySelector('.js-playlist-edit');
	playlistName.addEventListener('click', function(){
		document.querySelector('.js-modal').classList.remove('u-hidden');
		modalTitle.innerHTML = "Edit details";
		modal.dataset.type = "edit";
		modalPlaylistTitle.value = jsonObject.name;
		modalPlaylistDescription.innerHTML = jsonObject.description;
		modalImage.src = jsonObject.images[0].url;
		modalSave.innerHTML = "Edit";

		modalSave.addEventListener('click', function(){
			let payload = JSON.stringify({
				"name": `${modalPlaylistTitle.value}`,
				"description": `${modalPlaylistDescription.value}`,
				"public": true
			})
			handleData(`https://api.spotify.com/v1/playlists/${jsonObject.id}`, showEdit, showError, 'PUT', payload, authToken);
		})
	})
}

const callbackPersonalData = (jsonObject) => {
	showPersonalData(jsonObject);
	meID = jsonObject.id;
	meName = jsonObject.display_name;
	meImage = jsonObject.images[0].url;
}

const callbackLikedSongsList = (jsonObject) => {
	showLikedSongsList(jsonObject);
}

const callbackChangeSearch = (jsonObject) => {
	showArtist(jsonObject);
}

const callbackArtistDetail = (jsonObject) => {
	showArtistDetail(jsonObject);
}

const callbackArtistFollow = (jsonObject) => {
	console.log(`Response: ${jsonObject}`);
}

const callbackArtistUnfollow = (jsonObject) => {
	console.log(`Response: ${jsonObject}`);
}

const callbackIsFollowingArtist = (jsonObject) => {
	let followButton = document.querySelector('.js-artist-follow');
	if(jsonObject[0] === true){
		followButton.innerHTML = 'Following';
	} else {
		followButton.innerHTML = 'Follow';
	}
}

// #endregion

// #region ***  Data Access - get___                     ***********

const getPersonalData = () => {
	handleData(`https://api.spotify.com/v1/me`, callbackPersonalData, showError, 'GET', null, authToken);
}

// Playlists opvragen van de eigen gebruiker
const getPersonalPlaylists = () => {
	handleData(`https://api.spotify.com/v1/me/playlists`, showPersonalPlaylists, showError, 'GET', null, authToken);
}
// Specifieke playlist opvragen met behulp van de id van de playlist
const getSpecificPlaylistById = (playlistId) => {
	handleData(`https://api.spotify.com/v1/playlists/${playlistId}`, showSpecificPlaylist, showError, 'GET', null, authToken);
}

const getSpecificPlaylistByIdForEdit = (playlistId) => {
	handleData(`https://api.spotify.com/v1/playlists/${playlistId}`, callbackEdit, showError, 'GET', null, authToken);
}

const getArtistDetail = (artistId) => {
	handleData(`https://api.spotify.com/v1/artists/${artistId}`, callbackArtistDetail, showError, 'GET', null, authToken);
}

const getIsUserFollowingArtist = (artistId) => {
	handleData(`https://api.spotify.com/v1/me/following/contains?type=artist&ids=${artistId}`, callbackIsFollowingArtist, showError, 'GET', null, authToken);
}
// #endregion

// #region ***  Event Listeners - listenTo___            ***********

const listenToModalClose = function () {
	htmlModalwindow.classList.toggle('u-hidden');

	htmlModalwindow.querySelector('.js-modal-close').addEventListener('click', function () {
		htmlModalwindow.classList.toggle('u-hidden');
	});
};

// listenToClickPlaylistCard en listenToClickPlaylistList zijn dezelfde functie, de ene is voor de navigatie
// en de andere is voor de card layout
const listenToClickPlaylistCard = () => {
	let playlistCards = document.querySelectorAll('.js-playlistitem');
	for(let playlistCard of playlistCards){
		playlistCard.addEventListener('click', function() {
			getSpecificPlaylistById(playlistCard.dataset.playlistid); 
		})
	}
}

const listenToClickPlaylistList = () => {
	let playlistLists = document.querySelectorAll('.js-navplaylist');
	for(let playlist of playlistLists) {
		playlist.addEventListener('click', function(){
			getSpecificPlaylistById(playlist.dataset.playlistid);
		})
	}
}

const listenToClickCreatePlaylist = () => {
	let createPlaylist = document.querySelector('.js-create');
	createPlaylist.addEventListener('click', function() {
		callbackCreateModal();
		document.querySelector('.js-modal').classList.remove('u-hidden');
	});
}

const listenToClickLikedSongs = () => {
	let likedSongs = document.querySelector('.js-likedsongs');
	likedSongs.addEventListener('click', function(){
		showLikedSongs();
	})
}

const listenToChangeSearch = () => {
	let search = document.querySelector('.js-search');
	search.addEventListener('change', function(){
		console.log(search.value);
		handleData(`https://api.spotify.com/v1/search?query=${search.value}&type=artist`, callbackChangeSearch, showError, 'GET', null, authToken);
	})
}

const listenToClickArtistCard = () => {
	let artistCards = document.querySelectorAll('.js-artistitem');
	artistCards.forEach(artist => artist.addEventListener('click', function(){
		getArtistDetail(artist.dataset.artistid);
	}))
}

const listenToClickFollow = () => {
	let follow = document.querySelector('.js-artist-follow');
	let artist = document.querySelector('.js-artist-name');
	follow.addEventListener('click', function(){
		console.log(follow.textContent);
		if(follow.textContent === "Follow"){
			follow.innerHTML = "Following";
			handleData(`https://api.spotify.com/v1/me/following?type=artist&ids=${artist.dataset.id}`, callbackArtistFollow, showError, 'PUT', null, authToken);
		} else if(follow.textContent === "Following"){
			follow.innerHTML = "Follow";
			handleData(`https://api.spotify.com/v1/me/following?type=artist&ids=${artist.dataset.id}`, callbackArtistUnfollow, showError, 'DELETE', null, authToken);
		}

	});
}
// #endregion

// #region ***  Init / DOMContentLoaded                  ***********

const init = function () {
	console.log('🔥 loaded');
	htmlModalwindow = document.querySelector('.js-modal');
	listenToModalClose();
	getPersonalData();
	getPersonalPlaylists();
	listenToClickCreatePlaylist();
	listenToClickLikedSongs();
	listenToChangeSearch();
};

document.addEventListener('DOMContentLoaded', init);

// #endregion
