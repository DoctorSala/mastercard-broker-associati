const lenis = new Lenis({
    duration: 1.2, // durata dello scroll (più alto = più lento)
    smooth: true,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easing fluido
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

requestAnimationFrame(raf);

