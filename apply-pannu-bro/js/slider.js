document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.reviews-track');
  
  if (!track) return;
  
  // Clone the reviews for infinite scrolling effect
  const cards = document.querySelectorAll('.review-card');
  cards.forEach(card => {
    const clone = card.cloneNode(true);
    track.appendChild(clone);
  });
  
  let pos = 0;
  const speed = 1; // Pixels per frame
  
  function animate() {
    pos -= speed;
    
    // When half of the track has scrolled (original items), reset
    // This creates an infinite loop effect
    if (Math.abs(pos) >= track.scrollWidth / 2) {
      pos = 0;
    }
    
    track.style.transform = `translateX(${pos}px)`;
    requestAnimationFrame(animate);
  }
  
  // Start animation
  let animationId = requestAnimationFrame(animate);
  
  // Pause on hover
  const container = document.querySelector('.reviews-container');
  if (container) {
    container.addEventListener('mouseenter', () => {
      cancelAnimationFrame(animationId);
    });
    container.addEventListener('mouseleave', () => {
      animationId = requestAnimationFrame(animate);
    });
  }
});
