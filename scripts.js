/* =====================================
   1. SCROLL ANIMATION HELPERS
===================================== */

const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

const lerp = (start, end, progress) => {
  return start + (end - start) * progress;
};

const smooth = (value) => {
  return value * value * (3 - 2 * value);
};


/* =====================================
   2. SCROLL PROGRESS
===================================== */

function getScrollProgress(section) {

  const rect = section.getBoundingClientRect();

  const distance =
    section.offsetHeight - window.innerHeight;

  if (distance <= 0) return 0;

  return clamp(-rect.top / distance, 0, 1);

}


/* =====================================
   3. DESKTOP MONITOR MORPH
===================================== */

const desktopSection =
  document.getElementById("desktopMorph");

const desktopDevice =
  document.getElementById("desktopDevice");


function updateDesktop() {

  const progress =
    smooth(getScrollProgress(desktopSection));

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const startWidth = Math.min(
    screenWidth * .82,
    1050
  );

  const startHeight = startWidth * 9 / 16;

  const width = lerp(
    startWidth,
    screenWidth,
    progress
  );

  const height = lerp(
    startHeight,
    screenHeight,
    progress
  );

  desktopDevice.style.width = `${width}px`;
  desktopDevice.style.height = `${height}px`;

  desktopDevice.style.aspectRatio = "auto";

  desktopDevice.style.borderRadius =
    `${lerp(16, 0, progress)}px`;

  desktopDevice.style.borderWidth =
    `${lerp(9, 0, progress)}px`;

  desktopDevice.style.boxShadow =
    `0 ${lerp(25, 0, progress)}px ${lerp(55, 0, progress)}px rgba(16,30,53,${.16 * (1 - progress)})`;

  const deviceParts = desktopDevice.querySelectorAll(
    ".desktop-top, .monitor-neck, .monitor-foot"
  );

  deviceParts.forEach((part) => {
    part.style.opacity = 1 - progress;
  });

  const image = desktopDevice.querySelector("img");

  image.style.objectPosition = `50% ${lerp(59, 50, progress)}%`;

}


/* =====================================
   PHONE FALLING ANIMATION
===================================== */

const phoneSection =
  document.getElementById("phoneMorph");

const phoneDevice =
  document.getElementById("phoneDevice");

const portraitImage =
  document.querySelector(".phone-portrait");

const landscapeImage =
  document.querySelector(".phone-landscape");

const phoneCamera =
  document.querySelector(".phone-camera");

const phoneButton =
  document.querySelector(".phone-button");

let phoneRotationStarted = false;
let phoneRotationStart = null;

const rotationDelay = 3000;
const rotationDuration = 1800;


/* =====================================
   START WHEN PHONE ENTERS VIEW
===================================== */

const phoneObserver = new IntersectionObserver(
  (entries) => {

    entries.forEach((entry) => {

      if (
        entry.isIntersecting &&
        !phoneRotationStarted
      ) {

        phoneRotationStarted = true;

        setTimeout(() => {

          phoneRotationStart = performance.now();

          requestAnimationFrame(animatePhone);

        }, rotationDelay);

      }

    });

  },
  {
    threshold: 0.1
  }
);

phoneObserver.observe(phoneDevice);


/* =====================================
   ANIMATION HELPERS
===================================== */

function phoneClamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function phoneEase(value) {
  return value * value * (3 - 2 * value);
}


/* =====================================
   PHONE SCROLL PROGRESS
===================================== */

function getPhoneScrollProgress() {

  const rect = phoneSection.getBoundingClientRect();

  const distance =
    phoneSection.offsetHeight - window.innerHeight;

  if (distance <= 0) return 0;

  return phoneClamp(
    -rect.top / distance,
    0,
    1
  );

}


/* =====================================
   PHONE ROTATION PROGRESS
===================================== */

function getPhoneRotationProgress(now) {

  if (phoneRotationStart === null) {
    return 0;
  }

  return phoneClamp(
    (now - phoneRotationStart) / rotationDuration,
    0,
    1
  );

}


/* =====================================
   THE ACTUAL FALL
===================================== */

function animatePhone(now) {

  const rawProgress =
    getPhoneRotationProgress(now);

  const progress =
    phoneEase(rawProgress);

  const scrollProgress =
    phoneEase(getPhoneScrollProgress());

  /*
    Rotate from portrait to landscape.
    The extra 5 degrees create a small overshoot.
  */

  let angle = progress * 90;

  if (rawProgress >= 1) {
    angle = 90;
  } else {
    angle += Math.sin(progress * Math.PI) * 5;
  }

  /*
    Move the phone slightly down while it falls.
  */

  const fallingDistance =
    progress * 22;

  /*
    Change from portrait screenshot
    to the real landscape screenshot.
  */

  portraitImage.style.opacity =
    1 - progress;

  landscapeImage.style.opacity =
    progress;

  /*
    The phone's landscape bounding width.
  */

  const landscapeWidth = Math.min(
    window.innerWidth * 0.76,
    760
  );

  const landscapeHeight =
    landscapeWidth * 720 / 1600;

  /*
    Scale the physical phone to fit
    the landscape screenshot.
  */

  const landscapeScale =
    landscapeWidth / 420;

  const rotationScale =
    1 + (landscapeScale - 1) * progress;

  /*
    Expand the horizontal phone on scroll.
  */

  const expansionScale = 1 + (
    Math.max(
      window.innerWidth / landscapeWidth,
      window.innerHeight / landscapeHeight
    ) - 1
  ) * scrollProgress;

  const finalScale =
    rotationScale * expansionScale;

  /*
    Hide frame details during expansion.
  */

  const detailsOpacity =
    1 - scrollProgress;

  phoneCamera.style.opacity = detailsOpacity;
  phoneButton.style.opacity = detailsOpacity;

  phoneDevice.style.borderRadius =
    `${37 * (1 - scrollProgress)}px`;

  phoneDevice.style.borderWidth =
    `${9 * (1 - scrollProgress)}px`;

  /*
    FINAL TRANSFORM:
    translateY = falling movement
    rotate = physical phone turn
    scale = landscape sizing + expansion
  */

  phoneDevice.style.transform =
    `translateY(${fallingDistance}px)
     rotate(${angle}deg)
     scale(${finalScale})`;

  /*
    Continue frames while falling.
  */

  if (rawProgress < 1) {
    requestAnimationFrame(animatePhone);
  }

}


/* =====================================
   UPDATE EXPANSION WHEN SCROLLING
===================================== */

window.addEventListener(
  "scroll",
  () => {

    if (phoneRotationStart !== null) {
      animatePhone(performance.now());
    }

  },
  { passive: true }
);

window.addEventListener(
  "resize",
  () => {

    if (phoneRotationStart !== null) {
      animatePhone(performance.now());
    }

  }
);


/* =====================================
   9. CINEMATIC SLIDESHOW
===================================== */

const slides = [
  ...document.querySelectorAll(".cinema-slide")
];

const cinemaCounter =
  document.getElementById("cinemaCounter");

let currentSlide = 0;

const slideDuration = 4200;


function showNextSlide() {

  if (slides.length === 0) return;

  slides[currentSlide].classList.remove("active");

  currentSlide =
    (currentSlide + 1) % slides.length;

  slides[currentSlide].classList.add("active");

  cinemaCounter.textContent =
    `0${currentSlide + 1} — 0${slides.length}`;

}


if (slides.length > 1) {

  setInterval(
    showNextSlide,
    slideDuration
  );

}


/* =====================================
   10. CONTACT FORM
===================================== */

const contactForm =
  document.getElementById("contactForm");

contactForm.addEventListener(
  "submit",
  (event) => {

    event.preventDefault();

    const data =
      new FormData(contactForm);

    const name =
      data.get("name");

    const email =
      data.get("email");

    const subject =
      encodeURIComponent(data.get("subject"));

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


/* =====================================
   11. IMAGE ERROR CHECK
===================================== */

/*
  If an image filename or path is wrong,
  this gives a clear console message.
*/

document.querySelectorAll("img").forEach((image) => {

  image.addEventListener("error", () => {

    console.error(
      "IMAGE NOT FOUND:",
      image.getAttribute("src")
    );

  });

});