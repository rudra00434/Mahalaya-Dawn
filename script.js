"use strict";

/* ============================================================
   MAHALAYA — THE DAWN OF DEVI PAKSHA
   Interactive Experience Controller
   ============================================================ */


/* ============================================================
   1. DOM ELEMENTS
   ============================================================ */

const experience = document.querySelector(".experience");

const hero = document.getElementById("hero");
const revelation = document.getElementById("revelation");
const blessings = document.getElementById("blessings");

const beginButton = document.getElementById("begin-button");
const greetingButton = document.getElementById("greeting-button");
const restartButton = document.getElementById("restart-button");

const greetingElement = document.getElementById("greeting");

const flowerContainer = document.getElementById("flower-container");

const backgroundAudio = document.getElementById("background-audio");
const musicButton = document.getElementById("music-button");

const experienceStatus = document.getElementById("experience-status");

const navigationLinks = document.querySelectorAll(".nav-link");

const exploreButton = document.querySelector(
    '.secondary-button[href="#revelation"]'
);

const musicLabel = musicButton?.querySelector(".music-label");


/* ============================================================
   2. CONFIGURATION
   ============================================================ */

const CONFIG = {
    flowerInterval: 1100,
    initialFlowers: 8,
    maximumFlowers: 35,

    minimumFlowerDuration: 8,
    additionalFlowerDuration: 8,

    minimumFlowerSize: 12,
    additionalFlowerSize: 14,

    audioFadeDuration: 1200,
    maximumVolume: 0.45,

    scrollDelay: 150
};


/* ============================================================
   3. GREETINGS
   ============================================================ */

const greetings = [
    {
        language: "bengali",
        message: "শুভ মহালয়া! মা দুর্গা সবার জীবনে সুখ ও শান্তি নিয়ে আসুন।"
    },
    {
        language: "english",
        message: "May Maa Durga bless your life with happiness, courage, and peace."
    },
    {
        language: "bengali",
        message: "মা দুর্গার আগমনে সবার জীবন আনন্দে ভরে উঠুক। শুভ মহালয়া!"
    },
    {
        language: "english",
        message: "May this divine dawn bring hope, prosperity, and new beginnings."
    },
    {
        language: "bengali",
        message: "আলোর উৎসবে ভরে উঠুক প্রতিটি হৃদয়। শুভ মহালয়া!"
    },
    {
        language: "english",
        message: "May the divine light guide your path and fill your home with joy."
    },
    {
        language: "bengali",
        message: "মায়ের আশীর্বাদে সবার জীবন ভালোবাসা ও আনন্দে ভরে উঠুক।"
    },
    {
        language: "english",
        message: "May the blessings of Maa Durga bring strength, wisdom, and peace."
    }
];


/* ============================================================
   4. APPLICATION STATE
   ============================================================ */

const state = {
    hasAwakened: false,

    flowersEnabled: true,

    isMusicPlaying: false,

    flowerIntervalId: null,

    flowerTimeoutIds: new Set(),

    activeFlowers: 0,

    lastGreetingIndex: -1,

    audioFadeToken: 0,

    audioTargetVolume: CONFIG.maximumVolume
};


/* ============================================================
   5. UTILITY FUNCTIONS
   ============================================================ */

/**
 * Announces a message to assistive technologies.
 */
function announce(message) {
    if (experienceStatus) {
        experienceStatus.textContent = message;
    }
}


/**
 * Returns a random number between min and max.
 */
function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}


/**
 * Checks whether reduced motion is enabled.
 */
function prefersReducedMotion() {
    return window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;
}


/**
 * Scrolls to an element.
 */
function scrollToElement(element) {
    if (!element) {
        return;
    }

    element.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "start"
    });
}


/**
 * Changes the URL hash without creating an additional
 * browser history entry.
 */
function updateUrlHash(hash) {
    if (window.location.hash === hash) {
        return;
    }

    history.replaceState(null, "", hash);
}


/**
 * Updates the active navigation link.
 */
function setActiveNavigation(targetId) {
    navigationLinks.forEach((link) => {
        const isActive =
            link.getAttribute("href") === `#${targetId}`;

        link.classList.toggle("active", isActive);

        if (isActive) {
            link.setAttribute("aria-current", "location");
        } else {
            link.removeAttribute("aria-current");
        }
    });
}


/* ============================================================
   6. DAWN AWAKENING
   ============================================================ */

/**
 * Reveals the divine awakening section.
 */
async function awakenDawn() {
    if (!hero || !revelation || !experience) {
        console.error(
            "Cannot awaken the experience: required HTML elements are missing."
        );

        return;
    }

    // If the experience is already awakened, just navigate to it.
    if (state.hasAwakened) {
        updateUrlHash("#revelation");
        updateActiveNavigation();
        scrollToElement(revelation);

        return;
    }

    state.hasAwakened = true;

    experience.classList.add("dawn-awakened");

    hero.hidden = true;
    revelation.hidden = false;

    updateUrlHash("#revelation");
    updateActiveNavigation();

    announce("The dawn awakens. শুভ মহালয়া!");

    scrollToElement(revelation);

    // Audio playback is optional; the experience still works
    // if the music file is unavailable.
    await playMusic();
}


/**
 * Returns the experience to its initial state.
 */
function restartExperience() {
    if (!hero || !revelation || !experience) {
        return;
    }

    state.hasAwakened = false;

    experience.classList.remove("dawn-awakened");

    revelation.hidden = true;
    hero.hidden = false;

    if (greetingElement) {
        greetingElement.textContent = "";
        greetingElement.removeAttribute("lang");
    }

    updateUrlHash("#hero");
    updateActiveNavigation();

    announce("The Mahalaya experience has restarted.");

    scrollToElement(hero);
}


/* ============================================================
   7. GREETING GENERATOR
   ============================================================ */

/**
 * Selects a greeting without repeating the immediately
 * previous greeting.
 */
function generateGreeting() {
    if (greetings.length === 0) {
        return {
            language: "bengali",
            message: "শুভ মহালয়া!"
        };
    }

    if (greetings.length === 1) {
        return greetings[0];
    }

    let randomIndex;

    do {
        randomIndex = Math.floor(
            Math.random() * greetings.length
        );
    } while (randomIndex === state.lastGreetingIndex);

    state.lastGreetingIndex = randomIndex;

    return greetings[randomIndex];
}


/**
 * Displays a randomly selected greeting.
 */
function revealGreeting() {
    if (!greetingElement) {
        return;
    }

    const selectedGreeting = generateGreeting();

    greetingElement.textContent = selectedGreeting.message;

    greetingElement.lang =
        selectedGreeting.language === "bengali"
            ? "bn"
            : "en";

    announce("A new Mahalaya blessing has been revealed.");
}


/* ============================================================
   8. FALLING FLOWERS
   ============================================================ */

/**
 * Creates a decorative falling flower.
 */
function createFlower() {
    if (!flowerContainer) {
        return;
    }

    if (
        !state.flowersEnabled ||
        document.hidden ||
        prefersReducedMotion() ||
        state.activeFlowers >= CONFIG.maximumFlowers
    ) {
        return;
    }

    const flower = document.createElement("span");

    flower.className = "flower";
    flower.textContent = "✿";

    flower.setAttribute("aria-hidden", "true");

    const leftPosition = randomBetween(0, 100);

    const duration = randomBetween(
        CONFIG.minimumFlowerDuration,
        CONFIG.minimumFlowerDuration + CONFIG.additionalFlowerDuration
    );

    const size = randomBetween(
        CONFIG.minimumFlowerSize,
        CONFIG.minimumFlowerSize + CONFIG.additionalFlowerSize
    );

    const horizontalDrift = randomBetween(-90, 90);

    flower.style.left = `${leftPosition}%`;
    flower.style.fontSize = `${size}px`;
    flower.style.animationDuration = `${duration}s`;

    flower.style.setProperty(
        "--flower-drift",
        `${horizontalDrift}px`
    );

    state.activeFlowers += 1;

    flowerContainer.appendChild(flower);

    let removed = false;

    /**
     * Removes the flower and updates the active count.
     */
    function removeFlower() {
        if (removed) {
            return;
        }

        removed = true;

        flower.remove();

        state.activeFlowers = Math.max(
            0,
            state.activeFlowers - 1
        );
    }

    flower.addEventListener(
        "animationend",
        removeFlower,
        { once: true }
    );

    // Fallback cleanup if the animation is interrupted.
    window.setTimeout(
        removeFlower,
        (duration + 2) * 1000
    );
}


/**
 * Starts the flower animation system.
 */
function startFlowers() {
    if (
        !flowerContainer ||
        !state.flowersEnabled ||
        prefersReducedMotion() ||
        document.hidden ||
        state.flowerIntervalId !== null
    ) {
        return;
    }

    // Create initial flowers gradually.
    for (
        let index = 0;
        index < CONFIG.initialFlowers;
        index += 1
    ) {
        const timeoutId = window.setTimeout(() => {
            state.flowerTimeoutIds.delete(timeoutId);

            createFlower();
        }, index * 180);

        state.flowerTimeoutIds.add(timeoutId);
    }

    // Continue generating flowers periodically.
    state.flowerIntervalId = window.setInterval(
        createFlower,
        CONFIG.flowerInterval
    );
}


/**
 * Stops flower generation and clears pending timeouts.
 */
function stopFlowers() {
    if (state.flowerIntervalId !== null) {
        window.clearInterval(state.flowerIntervalId);

        state.flowerIntervalId = null;
    }

    state.flowerTimeoutIds.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
    });

    state.flowerTimeoutIds.clear();
}


/* ============================================================
   9. BACKGROUND MUSIC
   ============================================================ */

/**
 * Updates the music button's visible and accessible state.
 */
function updateMusicButton(isPlaying) {
    state.isMusicPlaying = isPlaying;

    if (!musicButton) {
        return;
    }

    musicButton.setAttribute(
        "aria-pressed",
        String(isPlaying)
    );

    musicButton.setAttribute(
        "aria-label",
        isPlaying
            ? "Pause background music"
            : "Enable background music"
    );

    if (musicLabel) {
        musicLabel.textContent = isPlaying
            ? "Pause Music"
            : "Enable Music";
    } else {
        musicButton.textContent = isPlaying
            ? "♫ Pause Music"
            : "♫ Enable Music";
    }
}


/**
 * Starts audio playback and fades the volume in.
 */
async function playMusic() {
    if (!backgroundAudio) {
        return;
    }

    if (!backgroundAudio.paused) {
        updateMusicButton(true);
        return;
    }

    const fadeToken = ++state.audioFadeToken;

    try {
        backgroundAudio.volume = 0;

        await backgroundAudio.play();

        updateMusicButton(true);

        fadeInMusic(fadeToken);
    } catch (error) {
        updateMusicButton(false);

        console.warn(
            "Background music could not be started. Check the audio file path and browser playback permissions.",
            error
        );

        announce(
            "Music could not be started. Please check the audio file and try again."
        );
    }
}


/**
 * Gradually increases the audio volume.
 */
function fadeInMusic(fadeToken) {
    if (!backgroundAudio) {
        return;
    }

    const startTime = performance.now();

    const duration = prefersReducedMotion()
        ? 0
        : CONFIG.audioFadeDuration;

    function animateVolume(currentTime) {
        if (fadeToken !== state.audioFadeToken) {
            return;
        }

        if (backgroundAudio.paused) {
            return;
        }

        const elapsed = currentTime - startTime;

        const progress = duration === 0
            ? 1
            : Math.min(elapsed / duration, 1);

        // Ease-out cubic.
        const easedProgress = 1 - Math.pow(1 - progress, 3);

        backgroundAudio.volume =
            state.audioTargetVolume * easedProgress;

        if (progress < 1) {
            requestAnimationFrame(animateVolume);
        }
    }

    requestAnimationFrame(animateVolume);
}


/**
 * Pauses music and cancels any active fade animation.
 */
function pauseMusic() {
    if (!backgroundAudio) {
        return;
    }

    state.audioFadeToken += 1;

    backgroundAudio.pause();
    backgroundAudio.volume = 0;

    updateMusicButton(false);
}


/**
 * Toggles music playback.
 */
async function toggleMusic() {
    if (!backgroundAudio) {
        return;
    }

    if (backgroundAudio.paused) {
        await playMusic();
    } else {
        pauseMusic();
    }
}


/**
 * Initializes audio event listeners.
 */
function initializeAudioEvents() {
    if (!backgroundAudio) {
        updateMusicButton(false);
        return;
    }

    backgroundAudio.addEventListener("play", () => {
        updateMusicButton(true);
    });

    backgroundAudio.addEventListener("pause", () => {
        updateMusicButton(false);
    });

    backgroundAudio.addEventListener("ended", () => {
        updateMusicButton(false);
    });

    backgroundAudio.addEventListener("error", () => {
        updateMusicButton(false);

        console.error(
            "The audio file could not be loaded. Verify ./assets/mahalaya-music.mp3."
        );
    });

    updateMusicButton(!backgroundAudio.paused);
}


/* ============================================================
   10. NAVIGATION
   ============================================================ */

/**
 * Handles Home, The Awakening, Blessings, and the
 * Explore the Experience link.
 */
function handleNavigation(event) {
    const link = event.currentTarget;

    if (!(link instanceof HTMLAnchorElement)) {
        return;
    }

    const targetId = link.getAttribute("href");

    if (!targetId || !targetId.startsWith("#")) {
        return;
    }

    const target = document.querySelector(targetId);

    if (!target) {
        console.warn(
            `Navigation target not found: ${targetId}`
        );

        return;
    }

    // Prevent default anchor behavior because some sections
    // are hidden until the awakening experience begins.
    event.preventDefault();

    /* HOME */

    if (targetId === "#hero") {
        if (hero?.hidden) {
            restartExperience();
        } else {
            updateUrlHash("#hero");
            updateActiveNavigation();
            scrollToElement(hero);
        }

        return;
    }

    /* THE AWAKENING / EXPLORE THE EXPERIENCE */

    if (targetId === "#revelation") {
        if (revelation?.hidden) {
            awakenDawn();
        } else {
            updateUrlHash("#revelation");
            updateActiveNavigation();
            scrollToElement(revelation);
        }

        return;
    }

    /* BLESSINGS */

    if (targetId === "#blessings") {
        const navigateToBlessings = () => {
            updateUrlHash("#blessings");
            updateActiveNavigation();
            scrollToElement(blessings);
        };

        if (revelation?.hidden) {
            // Reveal the experience first, then navigate.
            awakenDawn().then(() => {
                window.setTimeout(
                    navigateToBlessings,
                    CONFIG.scrollDelay
                );
            });
        } else {
            navigateToBlessings();
        }
    }
}


/**
 * Updates the active navbar link according to the URL hash.
 */
function updateActiveNavigation() {
    const currentHash = window.location.hash || "#hero";

    // Use let because the target may need to be changed
    // when a section is hidden or the hash is invalid.
    let targetId = currentHash.slice(1);

    // Do not mark a hidden section as active.
    if (targetId === "revelation" && revelation?.hidden) {
        targetId = "hero";
    }

    if (targetId === "hero" && hero?.hidden) {
        targetId = "revelation";
    }

    const validTargets = [
        "hero",
        "revelation",
        "blessings"
    ];

    if (!validTargets.includes(targetId)) {
        targetId = hero?.hidden
            ? "revelation"
            : "hero";
    }

    setActiveNavigation(targetId);
}


/* ============================================================
   11. PAGE VISIBILITY
   ============================================================ */

/**
 * Pauses music and flower generation while the tab is hidden.
 */
function handleVisibilityChange() {
    if (document.hidden) {
        stopFlowers();
        pauseMusic();

        return;
    }

    startFlowers();
}


/* ============================================================
   12. EVENT LISTENERS
   ============================================================ */

/**
 * Registers all user interaction events.
 */
function initializeEventListeners() {
    beginButton?.addEventListener(
        "click",
        awakenDawn
    );

    greetingButton?.addEventListener(
        "click",
        revealGreeting
    );

    restartButton?.addEventListener(
        "click",
        restartExperience
    );

    musicButton?.addEventListener(
        "click",
        toggleMusic
    );

    // Main navbar links.
    navigationLinks.forEach((link) => {
        link.addEventListener(
            "click",
            handleNavigation
        );
    });

    // The Explore button is outside .nav-links, so it needs
    // its own event listener.
    exploreButton?.addEventListener(
        "click",
        handleNavigation
    );

    // Synchronize navigation when the URL hash changes.
    window.addEventListener(
        "hashchange",
        updateActiveNavigation
    );

    // Synchronize navigation when browser history changes.
    window.addEventListener(
        "popstate",
        updateActiveNavigation
    );

    document.addEventListener(
        "visibilitychange",
        handleVisibilityChange
    );
}


/* ============================================================
   13. INITIALIZATION
   ============================================================ */

/**
 * Initializes the complete Mahalaya experience.
 */
function initializeExperience() {
    if (!experience) {
        console.error(
            "The .experience element is missing from index.html."
        );

        return;
    }

    initializeAudioEvents();

    initializeEventListeners();

    startFlowers();

    updateActiveNavigation();

    console.info(
        "Mahalaya experience initialized successfully."
    );
}


/* ============================================================
   14. START APPLICATION
   ============================================================ */

initializeExperience();