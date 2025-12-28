let player;
let history = JSON.parse(localStorage.getItem("yt-history")) || [];
let historyIndex = parseInt(localStorage.getItem("yt-index")) || -1;
let currentVideo = JSON.parse(localStorage.getItem("yt-current")) || null;
let repeatMode = parseInt(localStorage.getItem("yt-repeat")) || 0;
let shuffle = JSON.parse(localStorage.getItem("yt-shuffle")) || false;
let videoMode = JSON.parse(localStorage.getItem("yt-video")) || false;
let updateSeek;

// DOM
const thumbnail = document.getElementById("thumbnail");
const currentTitle = document.getElementById("currentTitle");
const seekbar = document.getElementById("seekbar");
const volumeSlider = document.getElementById("volumeSlider");
const playPauseBtn = document.getElementById("playPauseBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");
const modeSwitchBtn = document.getElementById("modeSwitchBtn");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const historyEl = document.getElementById("historyList");

// Save state
function saveState() {
  localStorage.setItem("yt-history", JSON.stringify(history));
  localStorage.setItem("yt-index", historyIndex);
  localStorage.setItem("yt-current", JSON.stringify(currentVideo));
  localStorage.setItem("yt-repeat", repeatMode);
  localStorage.setItem("yt-shuffle", shuffle);
  localStorage.setItem("yt-video", videoMode);
  if (player && player.getCurrentTime)
    localStorage.setItem("yt-time", player.getCurrentTime());
}

// YouTube API
function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "100%",
    width: "100%",
    playerVars: {
      playsinline: 1,
      enablejsapi: 1,
      origin: window.location.origin
    },
    events: {
      onReady: () => {
        const vol = localStorage.getItem("yt-vol") || 80;
        volumeSlider.value = vol;
        player.setVolume(vol);
        if (currentVideo) {
          player.loadVideoById(currentVideo.videoId);
          const t = parseFloat(localStorage.getItem("yt-time")) || 0;
          setTimeout(() => player.seekTo(t, true), 1200);
        }
        if (videoMode) document.getElementById("player-wrapper").classList.add("active");
      },
      onStateChange: onPlayerStateChange
    }
  });
}

// Player events
function onPlayerStateChange(e) {
  if (e.data === YT.PlayerState.ENDED) nextTrack();
  if (e.data === YT.PlayerState.PLAYING) {
    playPauseBtn.textContent = "⏸";
    updateSeekbar();
  }
  if (e.data === YT.PlayerState.PAUSED) playPauseBtn.textContent = "▶️";
  saveState();
}

// Search
document.getElementById("searchBtn").onclick = async () => {
  const q = document.getElementById("searchInput").value.trim();
  if (!q) return;
  const res = await fetch(`/search?q=${encodeURIComponent(q)}`);
  const data = await res.json();
  const list = document.getElementById("resultsList");
  list.innerHTML = "";
  data.forEach(v => {
    const li = document.createElement("li");
    li.textContent = v.title;
    li.onclick = () => playVideo(v);
    list.appendChild(li);
  });
};

// Play
function playVideo(video, update = true) {
  currentVideo = video;
  if (update) {
    history.push(video);
    historyIndex = history.length - 1;
  }
  player.loadVideoById(video.videoId);
  player.playVideo();
  thumbnail.src = `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`;
  currentTitle.textContent = video.title;
  renderHistory();
  saveState();
}

// History
function renderHistory() {
  historyEl.innerHTML = "";
  history.forEach((v, i) => {
    const li = document.createElement("li");
    li.textContent = v.title;
    if (i === historyIndex) li.classList.add("playing");
    li.onclick = () => { historyIndex = i; playVideo(v, false); };
    historyEl.appendChild(li);
  });
}

// Next / Prev
function nextTrack() {
  if (!history.length) return;
  historyIndex = shuffle
    ? Math.floor(Math.random() * history.length)
    : (historyIndex + 1) % history.length;
  playVideo(history[historyIndex], false);
}
function prevTrack() {
  if (!history.length) return;
  historyIndex = (historyIndex - 1 + history.length) % history.length;
  playVideo(history[historyIndex], false);
}

nextBtn.onclick = nextTrack;
prevBtn.onclick = prevTrack;

// Controls
playPauseBtn.onclick = () => player.getPlayerState() === 1 ? player.pauseVideo() : player.playVideo();
volumeSlider.oninput = () => { player.setVolume(volumeSlider.value); localStorage.setItem("yt-vol", volumeSlider.value); };
shuffleBtn.onclick = () => shuffle = !shuffle;
repeatBtn.onclick = () => repeatMode = (repeatMode + 1) % 3;

// Seek
function updateSeekbar() {
  clearInterval(updateSeek);
  updateSeek = setInterval(() => {
    if (player.getDuration) seekbar.value = (player.getCurrentTime() / player.getDuration()) * 100 || 0;
  }, 500);
}
seekbar.oninput = () => player.seekTo((seekbar.value / 100) * player.getDuration(), true);

// Video Mode
modeSwitchBtn.onclick = () => {
  videoMode = !videoMode;
  document.getElementById("player-wrapper").classList.toggle("active", videoMode);
  saveState();
};

// Restore UI
if (currentVideo) {
  thumbnail.src = `https://img.youtube.com/vi/${currentVideo.videoId}/mqdefault.jpg`;
  currentTitle.textContent = currentVideo.title;
  renderHistory();
}
