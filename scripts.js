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


/* PHONE FALLING ANIMATION */

const phoneSection = document.getElementById("phoneMorph");
const phoneRotation = document.getElementById("phoneRotation");

let phoneHasFallen = false;

const phoneObserver = new IntersectionObserver((entries) => {

  entries.forEach((entry) => {

    if (entry.isIntersecting && !phoneHasFallen) {

      phoneHasFallen = true;

      setTimeout(() => {
        phoneRotation.classList.add("fall-landscape");
      }, 3000);

    }

  });

}, {
  threshold: 0.15
});

phoneObserver.observe(phoneSection);


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