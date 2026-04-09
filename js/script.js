
let currentsong = new Audio();
let songs = [];
let currFolder;

// Convert seconds → mm:ss
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

// Get songs from info.json
async function getsongs(folder) {
  currFolder = folder;

  let res = await fetch(`${folder}/info.json`);
  let data = await res.json();

  songs = data.songs;

  let songUL = document.querySelector(".songList ul");
  songUL.innerHTML = "";

  for (const song of songs) {
    songUL.innerHTML += `
      <li>
        <img class="invert" src="img/music.svg" alt="">
        <div class="info">
          <div>${song}</div>
          <div>${data.artist || "Unknown Artist"}</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img class="invert" src="img/play.svg" alt="Play" />
        </div>
      </li>`;
  }

  // Add click event
  Array.from(songUL.getElementsByTagName("li")).forEach((e) => {
    e.addEventListener("click", () => {
      let track = e.querySelector(".info div").innerText;
      playMusic(track);
    });
  });

  return songs;
}

// Play music
function playMusic(track, pause = false) {
  currentsong.src = `${currFolder}/${track}`;

  if (!pause) {
    currentsong.play().catch((err) => console.error(err));
    document.getElementById("play").src = "img/pause.svg";
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

// Display albums
async function displayAlbums() {
  let res = await fetch(`/song/`);
  let text = await res.text();

  let div = document.createElement("div");
  div.innerHTML = text;

  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");

  let array = Array.from(anchors);

  for (let e of array) {
    if (e.href.includes("/song") && !e.href.includes(".htaccess")) {
      let folder = e.href.split("/").slice(-2)[0];

      let res = await fetch(`/song/${folder}/info.json`);
      let data = await res.json();

      cardContainer.innerHTML += `
        <div data-folder="${folder}" class="card">
          <div class="play">
            ▶
          </div>
          <img src="/song/${folder}/cover.jpg" alt="">
          <h2>${data.title}</h2>
          <p>${data.description}</p>
        </div>`;
    }
  }

  // Click album
  Array.from(document.getElementsByClassName("card")).forEach((card) => {
    card.addEventListener("click", async () => {
      songs = await getsongs(`song/${card.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

// Main function
async function main() {
  // Default load
  await getsongs("song/ncs");
  playMusic(songs[0], true);

  displayAlbums();

  const playBtn = document.getElementById("play");
  const prevBtn = document.getElementById("Previous");
  const nextBtn = document.getElementById("next");

  // Play / Pause
  playBtn.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      playBtn.src = "img/pause.svg";
    } else {
      currentsong.pause();
      playBtn.src = "img/play.svg";
    }
  });

  // Time update
  currentsong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentsong.currentTime
    )} / ${secondsToMinutesSeconds(currentsong.duration)}`;

    document.querySelector(".circle").style.left =
      (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });

  // Seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.clientWidth) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = (currentsong.duration * percent) / 100;
  });

  // Previous
  prevBtn.addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").pop());
    if (index > 0) playMusic(songs[index - 1]);
  });

  // Next
  nextBtn.addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").pop());
    if (index < songs.length - 1) playMusic(songs[index + 1]);
  });

  // Volume
  let volumeSlider = document.querySelector(".range input");
  volumeSlider.addEventListener("input", (e) => {
    currentsong.volume = e.target.value / 100;
  });

  // Mute
  document.querySelector(".volume img").addEventListener("click", (e) => {
    if (currentsong.volume > 0) {
      currentsong.volume = 0;
      e.target.src = "img/mute.svg";
      volumeSlider.value = 0;
    } else {
      currentsong.volume = 0.5;
      e.target.src = "img/volume.svg";
      volumeSlider.value = 50;
    }
  });

  // Hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });
}

main();
