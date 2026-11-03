/* =====================================
   1. SCROLL REVEAL ANIMATIONS
===================================== */

const revealObserver = new IntersectionObserver(
  (entries) => {

    entries.forEach((entry) => {

      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      } else {
        entry.target.classList.remove("visible");
      }

    });

  },
  {
    threshold: 0.12
  }
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});


/* =====================================
   2. GENERAL ANIMATION HELPERS
===================================== */

const clamp = (value, min, max) =>
  Math.min(Math.max(value, min), max);

const lerp = (start, end, progress) =>
  start + (end - start) * progress;

const smooth = (value) =>
  value * value * (3 - 2 * value);


/* =====================================
   3. MORPH SECTION ELEMENTS
===================================== */

const desktopSection =
  document.getElementById("desktopMorph");

const desktopVisual =
  document.getElementById("desktopMorphVisual");

const phoneSection =
  document.getElementById("phoneMorph");

const phoneVisual =
  document.getElementById("phoneMorphVisual");


/* =====================================
   4. GET SCROLL PROGRESS
===================================== */

function getScrollProgress(section) {

  const rect = section.getBoundingClientRect();

  const totalTravel =
    section.offsetHeight - window.innerHeight;

  if (totalTravel <= 0) {
    return 0;
  }

  return clamp(
    -rect.top / totalTravel,
    0,
    1
  );

}


/* =====================================
   5. APPLY DEVICE-TO-SCREEN MORPH
===================================== */

function applyMorph(
  element,
  progress,
  startWidth,
  startHeight
) {

  const p = smooth(progress);

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const width = lerp(
    startWidth,
    screenWidth,
    p
  );

  const height = lerp(
    startHeight,
    screenHeight,
    p
  );

  const border = lerp(9, 0, p);
  const radius = lerp(16, 0, p);

  /*
    Update device dimensions.
    The same image element expands with the frame.
  */

  element.style.setProperty(
    "--morph-progress",
    p
  );

  element.style.setProperty(
    "--morph-width",
    `${width}px`
  );

  element.style.setProperty(
    "--morph-height",
    `${height}px`
  );

  element.style.setProperty(
    "--morph-border",
    `${border}px`
  );

  element.style.setProperty(
    "--morph-radius",
    `${radius}px`
  );

  /*
    Fade the device details away.
  */

  element.style.setProperty(
    "--device-opacity",
    1 - p
  );

  element.style.setProperty(
    "--caption-opacity",
    1 - clamp(p * 2.5, 0, 1)
  );

  /*
    Gradually remove the inner image margins
    so the screenshot fills the viewport.
  */

  element.style.setProperty(
    "--image-inset-top",
    `${25 * (1 - p)}px`
  );

  element.style.setProperty(
    "--image-inset-side",
    `${8 * (1 - p)}px`
  );

  element.style.setProperty(
    "--image-inset-bottom",
    `${8 * (1 - p)}px`
  );

  element.classList.toggle(
    "is-fullscreen",
    p > 0.98
  );

}


/* =====================================
   6. DESKTOP MONITOR MORPH
===================================== */

function updateDesktopMorph() {

  const progress =
    getScrollProgress(desktopSection);

  const width = Math.min(
    window.innerWidth * 0.82,
    1050
  );

  const height = width * 9 / 16;

  applyMorph(
    desktopVisual,
    progress,
    width,
    height
  );

}


/* =====================================
   7. PHONE AUTOMATIC ROTATION
===================================== */

let phoneRotationStarted = false;
let phoneRotationStartTime = null;

const phoneWaitDuration = 3000;
const phoneRotationDuration = 1200;

let phoneRotationTimer = null;


/*
  Start the three-second countdown when
  the phone presentation enters the viewport.
*/

const phoneObserver = new IntersectionObserver(
  (entries) => {

    entries.forEach((entry) => {

      if (
        entry.isIntersecting &&
        !phoneRotationStarted
      ) {

        phoneRotationStarted = true;

        phoneRotationTimer = setTimeout(() => {

          phoneRotationStartTime =
            performance.now();

          requestAnimationFrame(animationLoop);

        }, phoneWaitDuration);

      }

    });

  },
  {
    threshold: 0.15
  }
);

phoneObserver.observe(phoneSection);


/* =====================================
   8. PHONE ROTATION PROGRESS
===================================== */

function getPhoneRotationProgress(now) {

  if (phoneRotationStartTime === null) {
    return 0;
  }

  const elapsed =
    now - phoneRotationStartTime;

  return smooth(
    clamp(
      elapsed / phoneRotationDuration,
      0,
      1
    )
  );

}


/* =====================================
   9. PHONE MORPH
===================================== */

function updatePhoneMorph(now) {

  const scrollProgress =
    getScrollProgress(phoneSection);

  const rotationProgress =
    getPhoneRotationProgress(now);

  /*
    Portrait dimensions.
  */

  const portraitWidth =
    window.innerWidth <= 760 ? 190 : 230;

  const portraitHeight =
    window.innerWidth <= 760 ? 390 : 460;

  /*
    Landscape dimensions.
  */

  const landscapeWidth = Math.min(
    window.innerWidth * 0.76,
    760
  );

  const landscapeHeight =
    landscapeWidth / 2.15;

  /*
    Smoothly interpolate the device dimensions
    as the phone rotates.
  */

  const rotatedWidth = lerp(
    portraitWidth,
    landscapeWidth,
    rotationProgress
  );

  const rotatedHeight = lerp(
    portraitHeight,
    landscapeHeight,
    rotationProgress
  );

  /*
    Adjust phone corner radius during rotation.
  */

  const phoneRadius = lerp(
    37,
    28,
    rotationProgress
  );

  phoneVisual.style.setProperty(
    "--rotation-progress",
    rotationProgress
  );

  phoneVisual.style.setProperty(
    "--morph-radius",
    `${lerp(phoneRadius, 0, smooth(scrollProgress))}px`
  );

  applyMorph(
    phoneVisual,
    scrollProgress,
    rotatedWidth,
    rotatedHeight
  );

  /*
    Reapply phone-specific radius after the
    general morph settings.
  */

  phoneVisual.style.setProperty(
    "--morph-radius",
    `${lerp(phoneRadius, 0, smooth(scrollProgress))}px`
  );

}


/* =====================================
   10. ANIMATION LOOP
===================================== */

let animationFrameRequested = false;

function animationLoop(now = performance.now()) {

  updateDesktopMorph();
  updatePhoneMorph(now);

  /*
    Continue requesting frames only while
    the phone is in its rotation animation.
  */

  const rotationIsRunning =
    phoneRotationStartTime !== null &&
    now - phoneRotationStartTime < phoneRotationDuration;

  if (rotationIsRunning) {

    requestAnimationFrame(animationLoop);

  } else {

    animationFrameRequested = false;

  }

}


/* =====================================
   11. SCROLL AND RESIZE UPDATES
===================================== */

function requestMorphUpdate() {

  if (!animationFrameRequested) {

    animationFrameRequested = true;

    requestAnimationFrame(animationLoop);

  }

}

window.addEventListener(
  "scroll",
  requestMorphUpdate,
  { passive: true }
);

window.addEventListener(
  "resize",
  requestMorphUpdate
);

requestMorphUpdate();


/* =====================================
   12. ANOTHER PROJECT SLIDESHOW
===================================== */

const slides = [
  ...document.querySelectorAll(".cinema-slide")
];

const cinemaCounter =
  document.getElementById("cinemaCounter");

let currentSlide = 0;

const slideDuration = 4200;

function showNextSlide() {

  if (slides.length === 0) {
    return;
  }

  slides[currentSlide].classList.remove("active");

  currentSlide =
    (currentSlide + 1) % slides.length;

  slides[currentSlide].classList.add("active");

  if (cinemaCounter) {

    cinemaCounter.textContent =
      `0${currentSlide + 1} — 0${slides.length}`;

  }

}

if (slides.length > 1) {

  setInterval(
    showNextSlide,
    slideDuration
  );

}


/* =====================================
   13. CONTACT FORM
===================================== */

const contactForm =
  document.getElementById("contactForm");

contactForm.addEventListener(
  "submit",
  (event) => {

    event.preventDefault();

    const data = new FormData(contactForm);

    const name =
      data.get("name");

    const email =
      data.get("email");

    const subject =
      encodeURIComponent(
        data.get("subject")
      );

    const body =
      encodeURIComponent(

        `Name: ${name}\n` +
        `Email: ${email}\n\n` +
        `${data.get("message")}`

      );

    window.location.href =
      `mailto:meow@gmail.com?subject=${subject}&body=${body}`;

  }
);