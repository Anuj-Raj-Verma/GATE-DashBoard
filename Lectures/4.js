/* ======================================================
   LECTURE VIDEO CONTROLLER
====================================================== */

// Grab elements
const videoButtons = document.querySelectorAll(".video-btn");
const videoPlayer  = document.getElementById("videoPlayer");
const placeholder  = document.querySelector(".player-placeholder");

/*
Expected HTML for each button:
<button class="video-btn" data-video-id="YOUTUBE_VIDEO_ID">
    Lecture 1: Topic Name
</button>
*/


/* ======================================================
   LOAD VIDEO (FIXED FOR YOUTUBE ERROR 153)
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

        // Remove active state from all buttons
        videoButtons.forEach(b => b.classList.remove("active"));

        // Activate clicked button
        btn.classList.add("active");

        // Load video
        const videoId = btn.dataset.videoId;
        loadVideo(videoId);

        // Save last watched
        localStorage.setItem("last-lecture-video", videoId);
    });
});


/* ======================================================
   RESTORE LAST WATCHED VIDEO
====================================================== */

const LAST_VIDEO_KEY = "last-lecture-video";

if (lastVideo) {
    loadVideo(lastVideo);

    videoButtons.forEach(btn => {
        if (btn.dataset.videoId === lastVideo) {
            btn.classList.add("active");
        }
    });
}
