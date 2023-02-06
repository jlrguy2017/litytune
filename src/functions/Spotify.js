import config from "@src/config.json";
import SpotifyWebApi from "spotify-web-api-node";
import { Firebase } from "@functions";

let api = null;

async function startCompile() {
    console.log("Starting to compile...");
    api = new SpotifyWebApi(
        {
            clientId: config.spotify.id,
            clientSecret: config.spotify.secret,
            redirectUri: "https://muspace.me/spotify-redirect"
        }
    );

    const user = Firebase.auth.currentUser;
    const uid = user.uid;

    const usersRef = Firebase.db.collection("users");
    const userDoc = await usersRef.doc(uid).get();
    const userData = userDoc.data();

    api.setAccessToken(userData.spotifyData.access_token);

    const topSongs = await loadTopSongs(api);
    const topArtists = await loadTopArtists(api);
    const recentSongs = []; //await loadRecentSongs(api);

    const doc = await Firebase.db.collection("users").doc(uid).get();
    const data = doc.data();
    data.spotifyData.topSongs = topSongs;
    data.spotifyData.topArtists = topArtists;
    data.spotifyData.recentSongs = recentSongs;

    await Firebase.db.collection("users").doc(uid).set(data);
    console.log("Finished compiling.");
}

async function loadTopSongs() {
    const data = await api.getMyTopTracks();
    const songs = Object.values(data.body.items);

    const arr = [];
    for (let i = 0; i < Math.min(10, songs.length); i++) {
        const element = songs[i];
        const data = {};
        data.name = element.name;
        data.album = element.album.name;
        data.artist = element.artists[0].name;
        data.image = element.album.images[0].url;
        data.score = element.popularity;
        data.link = element.external_urls.spotify;

        arr.push(data);
    }

    return arr;
}

async function loadTopArtists() {
    const data = await api.getMyTopArtists();
    const artists = Object.values(data.body.items);
    const arr = [];
    for (let i = 0; i < Math.min(10, artists.length); i++) {
        const element = artists[i];
        const data = {};
        data.name = element.name;
        data.image = element.images[0].url;
        data.score = element.popularity;
        data.link = element.external_urls.spotify;

        arr.push(data);
    }

    return arr;
}

// eslint-disable-next-line
async function loadRecentSongs() {
    const data = await api.getMyRecentlyPlayedTracks({ limit: 10 });
    const songs = Object.values(data.body.items);

    const arr = [];
    for (let i = 0; i < Math.min(10, songs.length); i++) {
        const element = songs[i].track;
        const data = {};
        data.name = element.name;
        data.album = element.album.name;
        data.artist = element.artists[0].name;
        data.image = element.album.images[0].url;
        data.score = element.popularity;
        data.link = element.external_urls.spotify;

        arr.push(data);
    }

    return arr;
}

async function getUser() {
    return (api ? await api.getMe() : null);

}

async function getTopSongs() {
    const doc = await Firebase.db.collection("users").doc(Firebase.auth.currentUser.uid).get();
    return doc.data().spotifyData.topSongs;

}

async function getTopArtists() {
    const doc = await Firebase.db.collection("users").doc(Firebase.auth.currentUser.uid).get();
    return doc.data().spotifyData.topArtists;

}

async function getRecentSongs() {
    const doc = await Firebase.db.collection("users").doc(Firebase.auth.currentUser.uid).get();
    return doc.data().spotifyData.recentSongs;

}

// eslint-disable-next-line
async function getCurrentSong() {

}

async function getLikedArtists() {
    // const data = await api.getFollowedArtists();
    // const artists = Object.values(data.body.items);

    const arr = [];
    // for (const artist of artists) {
    //     const data = {};
    //     data.name = artist.name;
    //     data.image = artist.images[0].url;
    //     data.score = artist.popularity;
    //     data.link = artist.external_urls.spotify;
    //     arr.push(data);
    // }

    return arr;
}

// eslint-disable-next-line
async function getLikedTracks() {


}

export default { startCompile, getUser, getTopSongs, getTopArtists, getRecentSongs, getLikedArtists };