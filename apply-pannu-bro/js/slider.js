/**
 * APPLY PANNU BRO - Customer Reviews Real-time slider
 * Fetches reviews from Firestore in real-time and animates them inside infinite slider
 */

document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('dynamic-reviews-track');
  if (!track) return;

  if (typeof window.db === 'undefined') {
    track.innerHTML = '<div style="text-align:center;width:100%;color:var(--text-secondary);padding:20px;">Database connection issue.</div>';
    return;
  }

  let animationId = null;
  let pos = 0;
  const speed = 0.8; // Pixels per frame

  // Real-time listener for testimonials
  window.db.collection('testimonials').orderBy('orderIndex').onSnapshot((snapshot) => {
    // Stop previous animation loop
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    track.innerHTML = '';
    pos = 0;
    track.style.transform = 'translateX(0px)';

    const testimonials = [];
    snapshot.forEach(doc => {
      testimonials.push({ id: doc.id, ...doc.data() });
    });

    if (testimonials.length === 0) {
      track.innerHTML = '<div style="text-align:center;width:100%;color:var(--text-secondary);padding:20px;">No client reviews yet.</div>';
      return;
    }

    // Render original cards
    testimonials.forEach(t => {
      const card = document.createElement('div');
      card.className = 'review-card';
      
      const rating = t.rating || 5;
      const starsHTML = '<i class="fa-solid fa-star"></i>'.repeat(rating);
      
      card.innerHTML = `
        <div class="review-stars">${starsHTML}</div>
        <p>"${escapeSliderHTML(t.text)}"</p>
        <div style="margin-top: 15px; font-weight: 600;">- ${escapeSliderHTML(t.name)}</div>
        <div style="font-size: 0.8rem; color: var(--text-secondary);">${escapeSliderHTML(t.source || 'Google Review')}</div>
      `;
      track.appendChild(card);
    });

    // Clone cards for infinite scrolling loop
    const originalCards = [...track.querySelectorAll('.review-card')];
    originalCards.forEach(card => {
      const clone = card.cloneNode(true);
      track.appendChild(clone);
    });

    // Animation Loop
    function animate() {
      if (!track._paused) {
        pos -= speed;
        // When half of the track has scrolled (all original items), reset pos
        if (Math.abs(pos) >= track.scrollWidth / 2) {
          pos = 0;
        }
        track.style.transform = `translateX(${pos}px)`;
      }
      animationId = requestAnimationFrame(animate);
    }

    // Start animation
    animationId = requestAnimationFrame(animate);
  }, (err) => {
    console.error("Testimonials slider fetch error: ", err);
    track.innerHTML = '<div style="text-align:center;width:100%;color:var(--text-secondary);padding:20px;">Failed to load reviews.</div>';
  });

  // Pause scrolling on mouse hover
  const container = document.querySelector('.reviews-container');
  if (container) {
    container.addEventListener('mouseenter', () => {
      track._paused = true;
    });
    container.addEventListener('mouseleave', () => {
      track._paused = false;
    });
  }
});

function escapeSliderHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
