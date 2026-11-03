/* =====================================
   DESKTOP SCROLL EXPANSION
===================================== */

const desktopSection = document.getElementById("desktopMorph");
const desktopDevice = document.getElementById("desktopDevice");

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function smooth(value) {
  return value * value * (3 - 2 * value);
}

function updateDesktop() {
  if (!desktopSection || !desktopDevice) return;

  const rect = desktopSection.getBoundingClientRect();
  const distance = desktopSection.offsetHeight - window.innerHeight;

  const progress = smooth(
    clamp(-rect.top / Math.max(distance, 1), 0, 1)
  );

  const startWidth = Math.min(window.innerWidth * 0.82, 1050);
  const startHeight = startWidth * 9 / 16;

  desktopDevice.style.width =
    `${startWidth + (window.innerWidth - startWidth) * progress}px`;

  desktopDevice.style.height =
    `${startHeight + (window.innerHeight - startHeight) * progress}px`;

  desktopDevice.style.borderRadius = `${16 * (1 - progress)}px`;
  desktopDevice.style.borderWidth = `${9 * (1 - progress)}px`;

  desktopDevice.querySelectorAll(
    ".desktop-top, .monitor-neck, .monitor-foot"
  ).forEach(element => {
    element.style.opacity = 1 - progress;
  });
}


/* =====================================
   PHONE FALLING ANIMATION
===================================== */

const phoneSection = document.getElementById("phoneMorph");
const phoneRotation = document.getElementById("phoneRotation");

let phoneHasFallen = false;

if (phoneSection && phoneRotation) {

  console.log("Phone animation elements found.");

  const phoneObserver = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

      if (entry.isIntersecting && !phoneHasFallen) {

        phoneHasFallen = true;

        console.log("Phone section detected. Starting countdown.");

        setTimeout(() => {

          phoneRotation.classList.add("fall-landscape");

          console.log("Phone falling animation started.");

        }, 3000);

      }

    });

  }, {
    threshold: 0
  });

  phoneObserver.observe(phoneSection);

} else {

  console.error(
    "Phone animation failed: check phoneMorph and phoneRotation IDs."
  );

}


/* =====================================
   LANDSCAPE SCREENSHOT CROSSFADE
===================================== */

if (phoneRotation) {

  const portrait = phoneRotation.querySelector(".phone-portrait");
  const landscape = phoneRotation.querySelector(".phone-landscape");

  phoneRotation.addEventListener("animationstart", () => {
    if (portrait) portrait.style.opacity = "0";
    if (landscape) landscape.style.opacity = "1";
  });

}


/* =====================================
   UPDATE DESKTOP ON SCROLL
===================================== */

window.addEventListener("scroll", updateDesktop, { passive: true });
window.addEventListener("resize", updateDesktop);

updateDesktop();
