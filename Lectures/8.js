/* ======================================================
   CHAPTER IDENTIFIER (CHANGE PER PAGE)
====================================================== */
const CHAPTER_KEY = "electromagnetic-fields"; 
// e.g. "network-theory", "signals-systems", etc.


/* ======================================================
   LECTURE VIDEO CONTROLLER
====================================================== */

const videoButtons = document.querySelectorAll(".video-btn");
const videoPlayer  = document.getElementById("videoPlayer");
const placeholder  = document.querySelector(".player-placeholder");

/* 🔹 NEW: scroll container (the list wrapper) */
const videoListWrapper = document.querySelector(".video-list-wrapper");

const LAST_VIDEO_KEY = `last-video-${CHAPTER_KEY}`;


/* ======================================================
   LOAD VIDEO (YOUTUBE SAFE)
====================================================== */

function loadVideo(videoId) {
    if (!videoId) return;

    const embedURL =
        `https://www.youtube.com/embed/${videoId}` +
        `?rel=0&modestbranding=1&enablejsapi=1&origin=${location.origin}`;

    videoPlayer.src = embedURL;
    videoPlayer.style.display = "block";
    placeholder.style.display = "none";
}


/* ======================================================
   BUTTON CLICK HANDLING
====================================================== */

videoButtons.forEach(btn => {
    btn.addEventListener("click", () => {

        videoButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const videoId = btn.dataset.videoId;
        loadVideo(videoId);

        localStorage.setItem(LAST_VIDEO_KEY, videoId);
    });
});


/* ======================================================
   RESTORE LAST WATCHED + AUTO SCROLL
====================================================== */

const lastVideo = localStorage.getItem(LAST_VIDEO_KEY);

if (lastVideo) {
    let targetButton = null;

    videoButtons.forEach(btn => {
        if (btn.dataset.videoId === lastVideo) {
            btn.classList.add("active");
            targetButton = btn;
        }
    });

    if (targetButton) {
        loadVideo(lastVideo);

        /* 🔹 NEW: auto-scroll to last watched lecture */
        setTimeout(() => {
            targetButton.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }, 300);
    }
}
