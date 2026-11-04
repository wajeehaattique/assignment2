/* =====================================
   DESKTOP SCROLL MORPH
===================================== */

const desktopSection = document.getElementById("desktopMorph");
const desktopDevice = document.getElementById("desktopDevice");
const morphSticky = document.querySelector(".morph-sticky");

const desktopScreen = desktopDevice?.querySelector(".desktop-screen");

const desktopDetails = desktopDevice?.querySelectorAll(
  ".desktop-top, .monitor-neck, .monitor-foot"
);

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function smooth(value) {
  return value * value * value *
    (value * (value * 6 - 15) + 10);
}

/* DESKTOP ENTRANCE */

const desktopObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      morphSticky.classList.add("is-visible");
      desktopObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1
});

if (desktopSection && morphSticky) {
  desktopObserver.observe(desktopSection);
}


/* DESKTOP EXPANSION + RETURN */

function updateDesktop() {
  if (!desktopSection || !desktopDevice || !desktopScreen) return;

  const rect = desktopSection.getBoundingClientRect();
  const distance = desktopSection.offsetHeight - window.innerHeight;

  const scrollProgress = clamp(
    -rect.top / Math.max(distance, 1),
    0,
    1
  );

  // First half: desktop -> fullscreen
  // Second half: fullscreen -> desktop

  let progress;

 if (scrollProgress <= 0.55) {
  progress = smooth(scrollProgress / 0.55);
} else {
  progress = smooth(
    (1 - scrollProgress) / 0.45
  );
}

  const startWidth = Math.min(window.innerWidth * 0.82, 1050);
  const startHeight = startWidth * 9 / 16;

  const currentWidth =
    startWidth + (window.innerWidth - startWidth) * progress;

  const currentHeight =
    startHeight + (window.innerHeight - startHeight) * progress;

  desktopDevice.style.width = `${currentWidth}px`;
  desktopDevice.style.height = `${currentHeight}px`;

  desktopDevice.style.borderRadius = `${16 * (1 - progress)}px`;
  desktopDevice.style.borderWidth = `${9 * (1 - progress)}px`;

  desktopScreen.style.inset =
    `${25 * (1 - progress)}px ${8 * (1 - progress)}px ${8 * (1 - progress)}px`;

  desktopDetails.forEach(element => {
    element.style.opacity = 1 - progress;
  });

  const fullImage = desktopScreen.querySelector(".desktop-full-image");
const cleanImage = desktopScreen.querySelector(".desktop-clean-image");

fullImage.style.opacity = 1 - progress;
cleanImage.style.opacity = progress;

const scrollHint = document.querySelector("#desktopMorph .scroll-hint");
if (scrollHint) {
  scrollHint.style.opacity = 1 - progress;
}
}


window.addEventListener("scroll", updateDesktop, {
  passive: true
});

window.addEventListener("resize", updateDesktop);

updateDesktop();


/* =====================================
   PHONE ENTRANCE + ROTATION + MORPH
===================================== */

const phoneSection = document.getElementById("phoneMorph");
const phoneStage = phoneSection?.querySelector(".phone-stage");
const phoneRotation = document.getElementById("phoneRotation");
const phoneDevice = document.getElementById("phoneDevice");

const phoneScreen = phoneDevice?.querySelector(".phone-screen");

const phoneDetails = phoneDevice?.querySelectorAll(
  ".phone-camera, .phone-button"
);

let phoneHasStarted = false;
let phoneHasRotated = false;
let phoneMorphStartScroll = null;

const phoneStartWidth = phoneDevice?.offsetWidth || 263;
const phoneStartHeight = phoneDevice?.offsetHeight || 508;


/* =====================================
   START ENTRANCE AND AUTOMATIC ROTATION
===================================== */

if (phoneSection && phoneStage && phoneRotation && phoneDevice) {

  const phoneObserver = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

      if (entry.isIntersecting && !phoneHasStarted) {

        phoneHasStarted = true;

        // Slide phone in from the right
        phoneStage.classList.add("phone-entered");

        // Wait 2 seconds, then rotate
        setTimeout(() => {
          phoneRotation.classList.add("fall-landscape");
        }, 2000);

      }

    });

  }, {
    threshold: 0
  });

  phoneObserver.observe(phoneSection);


  /* Wait until the physical rotation finishes */

  phoneRotation.addEventListener("animationend", (event) => {
  if (event.animationName !== "phoneActuallyFalls") return;
  phoneHasRotated = true;
  phoneMorphStartScroll = window.scrollY;
  updatePhoneMorph();
});

/* =====================================
   LANDSCAPE EXPANSION + RETURN
===================================== */

function updatePhoneMorph() {

  if (
    !phoneSection ||
    !phoneRotation ||
    !phoneDevice ||
    !phoneScreen ||
    !phoneHasRotated ||
    phoneMorphStartScroll === null
  ) return;

  const sectionEnd =
    phoneSection.offsetTop +
    phoneSection.offsetHeight -
    window.innerHeight;

  const remainingDistance = Math.max(
    sectionEnd - phoneMorphStartScroll,
    1
  );

  const scrollProgress = clamp(
    (window.scrollY - phoneMorphStartScroll) / remainingDistance,
    0,
    1
  );

  let progress;

  // Expand: horizontal phone -> fullscreen
  if (scrollProgress <= 0.42) {

    progress = smooth(scrollProgress / 0.42);

  }

  // Brief fullscreen hold
  else if (scrollProgress <= 0.55) {

    progress = 1;

  }

  // Return: fullscreen -> horizontal phone
  else {

    progress = smooth(
      (1 - scrollProgress) / 0.45
    );

  }


  /* Target dimensions:
     The wrapper is rotated -90deg,
     so its unrotated dimensions are reversed.
  */

  const targetWidth = window.innerHeight;
  const targetHeight = window.innerWidth;

  const currentWidth =
    phoneStartWidth +
    (targetWidth - phoneStartWidth) * progress;

  const currentHeight =
    phoneStartHeight +
    (targetHeight - phoneStartHeight) * progress;

  /* Resize the rotation wrapper */

  phoneRotation.style.width = `${currentWidth}px`;
  phoneRotation.style.height = `${currentHeight}px`;

  /* Resize the physical phone */

  const currentBorder = 9 * (1 - progress);

phoneDevice.style.width = `${currentWidth}px`;
phoneDevice.style.height = `${currentHeight}px`;
phoneDevice.style.borderWidth = `${currentBorder}px`;

  phoneDevice.style.borderRadius =
    `${37 * (1 - progress)}px`;


  /* Expand the screenshot to the edges */

  phoneScreen.style.inset =
    `${7 * (1 - progress)}px`;

  phoneScreen.style.borderRadius =
    `${25 * (1 - progress)}px`;


  /* Hide camera and side button */

  phoneDetails.forEach(element => {

    element.style.opacity = 1 - progress;

  });

  const phoneCaption = phoneSection.querySelector(".morph-caption");

if (phoneCaption) {
  phoneCaption.style.opacity = 1 - progress;
}
}


/* =====================================
   SCROLL + RESIZE UPDATES
===================================== */

window.addEventListener("scroll", updatePhoneMorph, {
  passive: true
});

window.addEventListener("resize", updatePhoneMorph);
}
