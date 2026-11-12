
/* =====================================
   SHARED UTILITIES
===================================== */

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function smooth(value) {
  return value * value * value *
    (value * (value * 6 - 15) + 10);
}


/* =====================================
   DESKTOP SCROLL MORPH
===================================== */

const desktopSection = document.getElementById("desktopMorph");

const desktopSticky = desktopSection?.querySelector(".morph-sticky");

const desktopDevice = document.getElementById("desktopDevice");

const desktopScreen = desktopDevice?.querySelector(".desktop-screen");

const desktopDetails = desktopDevice?.querySelectorAll(
  ".desktop-top, .monitor-neck, .monitor-foot"
);

const fullImage = desktopScreen?.querySelector(
  ".desktop-full-image"
);

const cleanImage = desktopScreen?.querySelector(
  ".desktop-clean-image"
);

const scrollHint = desktopSection?.querySelector(".scroll-hint");


/* DESKTOP ENTRANCE */

if (desktopSection && desktopSticky && desktopDevice) {

  if ("IntersectionObserver" in window) {

    const desktopObserver = new IntersectionObserver(
      (entries, observer) => {

        entries.forEach((entry) => {

          if (entry.isIntersecting) {

            desktopSticky.classList.add("is-visible");

            observer.unobserve(entry.target);

          }

        });

      },
      {
        threshold: 0.05
      }
    );

    desktopObserver.observe(desktopSection);

  } else {

    desktopSticky.classList.add("is-visible");

  }

}


/* DESKTOP EXPANSION AND RETURN */

function updateDesktop() {

  if (!desktopSection || !desktopDevice || !desktopScreen) {
    return;
  }

  const rect = desktopSection.getBoundingClientRect();

  const distance =
    desktopSection.offsetHeight - window.innerHeight;

  const scrollProgress = clamp(
    -rect.top / Math.max(distance, 1),
    0,
    1
  );

  let progress;

  // Desktop -> fullscreen

  if (scrollProgress <= 0.55) {

    progress = smooth(scrollProgress / 0.55);

  }

  // Fullscreen -> desktop

  else {

    progress = smooth((1 - scrollProgress) / 0.45);

  }


  const startWidth = Math.min(
    window.innerWidth * 0.82,
    1050
  );

  const startHeight = (startWidth * 9) / 16;


  const currentWidth =
    startWidth +
    (window.innerWidth - startWidth) * progress;

  const currentHeight =
    startHeight +
    (window.innerHeight - startHeight) * progress;


  /* DEVICE DIMENSIONS */

  desktopDevice.style.width = `${currentWidth}px`;

  desktopDevice.style.height = `${currentHeight}px`;

  desktopDevice.style.borderRadius =
    `${16 * (1 - progress)}px`;

  desktopDevice.style.borderWidth =
    `${9 * (1 - progress)}px`;


  /* SCREEN DIMENSIONS */

  desktopScreen.style.inset =
    `${25 * (1 - progress)}px ${8 * (1 - progress)}px ${8 * (1 - progress)}px`;


  /* HIDE MONITOR DETAILS */

  desktopDetails?.forEach((element) => {

    element.style.opacity = 1 - progress;

  });


  /* IMAGE TRANSITION */

  if (fullImage) {
    fullImage.style.opacity = 1 - progress;
  }

  if (cleanImage) {
    cleanImage.style.opacity = progress;
  }


  /* SCROLL HINT */

  if (scrollHint) {
    scrollHint.style.opacity = 1 - progress;
  }

}


/* DESKTOP SCROLL LISTENERS */

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

const phoneCaption = phoneSection?.querySelector(".morph-caption");

const landscapeImage = phoneDevice?.querySelector(
  ".phone-landscape"
);

const cleanLandscape = phoneDevice?.querySelector(
  ".phone-landscape-clean"
);


let phoneHasStarted = false;

let phoneHasRotated = false;

let phoneMorphStartScroll = null;

let phoneRotationTimer = null;


/* INITIAL PHONE DIMENSIONS */

const phoneStartWidth = phoneDevice?.offsetWidth || 245;

const phoneStartHeight = phoneDevice?.offsetHeight || 490;


/* =====================================
   PHONE ENTRANCE
===================================== */

function startPhoneAnimation() {

  if (
    !phoneSection ||
    !phoneStage ||
    !phoneRotation ||
    !phoneDevice ||
    phoneHasStarted
  ) {
    return;
  }

  phoneHasStarted = true;

  // Slide phone in from the right

  phoneStage.classList.add("phone-entered");


  // Wait until entrance finishes, then rotate

  phoneRotationTimer = setTimeout(() => {

    if (window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches) {

      phoneRotation.style.transform = "rotate(-90deg)";

      phoneHasRotated = true;

      phoneMorphStartScroll = window.scrollY;

      updatePhoneMorph();

    } else {

      phoneRotation.classList.add("fall-landscape");

    }

  }, 1500);

}


/* OBSERVE PHONE SECTION */

if (
  phoneSection &&
  phoneStage &&
  phoneRotation &&
  phoneDevice
) {

  if ("IntersectionObserver" in window) {

    const phoneObserver = new IntersectionObserver(
      (entries) => {

        entries.forEach((entry) => {

          if (entry.isIntersecting && !phoneHasStarted) {

            startPhoneAnimation();

          }

        });

      },
      {
        threshold: 0
      }
    );

    phoneObserver.observe(phoneSection);

  } else {

    startPhoneAnimation();

  }


  /* =====================================
     PHYSICAL PHONE ROTATION COMPLETE
  ===================================== */

  phoneRotation.addEventListener("animationend", (event) => {

    if (event.animationName !== "phoneActuallyFalls") {
      return;
    }

    phoneHasRotated = true;

    // Start the scroll morph from the current position

    phoneMorphStartScroll = window.scrollY;

    updatePhoneMorph();

  });


  /* =====================================
     PHONE LANDSCAPE EXPANSION + RETURN
  ===================================== */

  function updatePhoneMorph() {

    if (
      !phoneSection ||
      !phoneRotation ||
      !phoneDevice ||
      !phoneScreen ||
      !phoneHasRotated ||
      phoneMorphStartScroll === null
    ) {
      return;
    }


    const sectionEnd =
      phoneSection.offsetTop +
      phoneSection.offsetHeight -
      window.innerHeight;


    const remainingDistance = Math.max(
      sectionEnd - phoneMorphStartScroll,
      1
    );


    const scrollProgress = clamp(
      (window.scrollY - phoneMorphStartScroll) /
      remainingDistance,
      0,
      1
    );


    let progress;


    // Expand horizontal phone -> fullscreen

    if (scrollProgress <= 0.42) {

      progress = smooth(scrollProgress / 0.42);

    }

    // Hold fullscreen briefly

    else if (scrollProgress <= 0.55) {

      progress = 1;

    }

    // Return fullscreen -> horizontal phone

    else {

      progress = smooth(
        (1 - scrollProgress) / 0.45
      );

    }


    /* =====================================
       TARGET DIMENSIONS
    ===================================== */

    // The phone is rotated -90 degrees.
    // Its dimensions must be reversed.

    const targetWidth = window.innerHeight;

    const targetHeight = window.innerWidth;


    const currentWidth =
      phoneStartWidth +
      (targetWidth - phoneStartWidth) * progress;

    const currentHeight =
      phoneStartHeight +
      (targetHeight - phoneStartHeight) * progress;


    /* =====================================
       ROTATION WRAPPER
    ===================================== */

    phoneRotation.style.width =
      `${currentWidth}px`;

    phoneRotation.style.height =
      `${currentHeight}px`;


    /* =====================================
       PHONE DEVICE
    ===================================== */

    const currentBorder = 9 * (1 - progress);

    phoneDevice.style.width =
      `${currentWidth}px`;

    phoneDevice.style.height =
      `${currentHeight}px`;

    phoneDevice.style.borderWidth =
      `${currentBorder}px`;

    phoneDevice.style.borderRadius =
      `${37 * (1 - progress)}px`;


    /* =====================================
       PHONE SCREEN
    ===================================== */

    phoneScreen.style.inset =
      `${7 * (1 - progress)}px`;

    phoneScreen.style.borderRadius =
      `${25 * (1 - progress)}px`;


    /* =====================================
       HIDE PHONE DETAILS
    ===================================== */

    phoneDetails?.forEach((element) => {

      element.style.opacity = 1 - progress;

    });


    if (phoneCaption) {

      phoneCaption.style.opacity = 1 - progress;

    }


    /* =====================================
       LANDSCAPE IMAGE TRANSITION
    ===================================== */

    if (cleanLandscape && landscapeImage) {

      const cleanProgress = clamp(
        (progress - 0.78) / 0.17,
        0,
        1
      );

      cleanLandscape.style.opacity = cleanProgress;

      landscapeImage.style.opacity = 1 - cleanProgress;

    }

  }


  /* =====================================
     PHONE SCROLL + RESIZE LISTENERS
  ===================================== */

  window.addEventListener("scroll", updatePhoneMorph, {
    passive: true
  });

  window.addEventListener("resize", updatePhoneMorph);

}


/* =====================================
   CONTACT FORM
===================================== */

const contactForm = document.getElementById("contactForm");

if (contactForm) {

  contactForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const formData = new FormData(contactForm);

    const name = formData.get("name");

    const email = formData.get("email");

    const subject = formData.get("subject");

    const message = formData.get("message");


    const emailBody = `
Name: ${name}

Email: ${email}

Message:

${message}
`;


    const mailtoLink =
      `mailto:wajeehattique@gmail.com` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(emailBody)}`;


    window.location.href = mailtoLink;

  });

}


/* =====================================
   PAGE INITIALIZATION
===================================== */

window.addEventListener("load", () => {

  updateDesktop();

  if (phoneHasRotated) {
    updatePhoneMorph();
  }

});
