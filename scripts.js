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
   4. PHONE ELEMENTS
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


/* =====================================
   5. PHONE ROTATION
===================================== */

let phoneRotationStarted = false;
let phoneRotationStart = null;

const rotationDelay = 3000;
const rotationDuration = 1500;

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;


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

          requestAnimationFrame(animate);

        }, reducedMotion ? 0 : rotationDelay);

      }

    });

  },
  {
    threshold: .2
  }
);

phoneObserver.observe(phoneSection);


/* =====================================
   6. PHONE ROTATION PROGRESS
===================================== */

function getRotationProgress(now) {

  if (phoneRotationStart === null) {
    return 0;
  }

  const elapsed =
    now - phoneRotationStart;

  return smooth(
    clamp(elapsed / rotationDuration, 0, 1)
  );

}


/* =====================================
   7. PHONE PHYSICAL FALL + MORPH
===================================== */

function updatePhone(now) {

  const rotationProgress =
    getRotationProgress(now);

  const scrollProgress =
    smooth(getScrollProgress(phoneSection));

  /*
    The phone starts upright.
    It physically rotates through 90 degrees.
  */

  const angle =
    lerp(0, 90, rotationProgress);

  /*
    Portrait device dimensions.
  */

  const portraitWidth = 210;
  const portraitHeight = 420;

  /*
    The visual landscape bounding box
    after the phone has turned sideways.
  */

  const landscapeWidth = Math.min(
    window.innerWidth * .76,
    760
  );

  const landscapeHeight =
    landscapeWidth * 720 / 1600;

  /*
    Scale the phone from its original physical size
    to its landscape presentation size.
  */

  const scaleAtLandscape =
    landscapeWidth / portraitHeight;

  const scale = lerp(
    1,
    scaleAtLandscape,
    rotationProgress
  );

  /*
    As the phone turns, change the screenshot.
    Portrait screenshot fades out; landscape fades in.
  */

  portraitImage.style.opacity =
    1 - rotationProgress;

  landscapeImage.style.opacity =
    rotationProgress;

  /*
    Phone rotates and gently falls.
    The small tilt overshoot gives the turn
    a physical feeling rather than a rigid spin.
  */

  const overshoot =
    Math.sin(rotationProgress * Math.PI) * 5;

  const finalAngle =
    angle + overshoot;

  /*
    Expand the landscape phone into the viewport.
  */

  const expansionScale = lerp(
    1,
    Math.max(
      window.innerWidth / landscapeWidth,
      window.innerHeight / landscapeHeight
    ),
    scrollProgress
  );

  const finalScale =
    scale * expansionScale;

  phoneDevice.style.transform =
    `rotate(${finalAngle}deg) scale(${finalScale})`;

  /*
    Hide frame details as the phone expands.
  */

  const detailOpacity =
    1 - scrollProgress;

  phoneCamera.style.opacity =
    detailOpacity;

  phoneButton.style.opacity =
    detailOpacity;

  phoneDevice.style.borderRadius =
    `${lerp(37, 0, scrollProgress)}px`;

  phoneDevice.style.borderWidth =
    `${lerp(9, 0, scrollProgress)}px`;

  phoneDevice.style.boxShadow =
    `0 ${lerp(28, 0, scrollProgress)}px ${lerp(55, 0, scrollProgress)}px rgba(16,30,53,${.2 * (1 - scrollProgress)})`;

}


/* =====================================
   8. MAIN ANIMATION LOOP
===================================== */

let ticking = false;

function animate(now = performance.now()) {

  updateDesktop();
  updatePhone(now);

  ticking = false;

  /*
    Keep the animation running while the phone
    is rotating. Scroll events handle the morph.
  */

  if (
    phoneRotationStart !== null &&
    now - phoneRotationStart < rotationDuration
  ) {

    requestAnimationFrame(animate);

  }

}


function requestAnimation() {

  if (!ticking) {

    ticking = true;

    requestAnimationFrame(animate);

  }

}


window.addEventListener(
  "scroll",
  requestAnimation,
  { passive: true }
);

window.addEventListener(
  "resize",
  requestAnimation
);

requestAnimation();


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