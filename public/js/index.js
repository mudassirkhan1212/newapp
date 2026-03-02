$('.owl-carouse').owlCarousel({
    loop:true,
    margin:10,
    nav:true,
    autoplay:true,
    autoplaytimeout:2000,
    responsive:{
        0:{
            items:3
        },
        600:{
            items:3
        },
        1000:{
            items:3
        }
    }
})







  
  



    const words = [
      "Website.",
      "Portfolio.",
      "Project."
    ];

    const el = document.getElementById("typewriter");
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
      const current = words[wordIndex];
      if (isDeleting) {
        charIndex--;
      } else {
        charIndex++;
      }

      el.textContent = current.substring(0, charIndex);
      el.style.width = `${charIndex}ch`;

      let typeSpeed = isDeleting ? 50 : 100;

      if (!isDeleting && charIndex === current.length) {
        typeSpeed = 2000; // pause at end
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typeSpeed = 500;
      }

      setTimeout(type, typeSpeed);
    }

    type();



