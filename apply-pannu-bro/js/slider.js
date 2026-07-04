/**
 * APPLY PANNU BRO - Customer Reviews Slider
 * Pure static version — uses hardcoded reviews with infinite scroll animation
 */

document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('dynamic-reviews-track');
  if (!track) return;

  // Static testimonials data
  const testimonials = [
    {
      name: 'Karthik R.',
      text: 'Apply Pannu Bro made my PAN card process so easy and fast! Very reliable service.',
      rating: 5,
      source: 'Google Review'
    },
    {
      name: 'Priya M.',
      text: 'Best service center for all government certificates. Transparent pricing and expert support.',
      rating: 5,
      source: 'Google Review'
    },
    {
      name: 'Suresh K.',
      text: 'Very quick response on WhatsApp. My FSSAI registration was done without any hassle.',
      rating: 5,
      source: 'Google Review'
    },
    {
      name: 'Lakshmi S.',
      text: 'Got my driving licence renewed through Apply Pannu Bro. Very professional and fast service!',
      rating: 5,
      source: 'Google Review'
    },
    {
      name: 'Ravi Kumar',
      text: 'Excellent service for Aadhaar update. The team guided me through the entire process.',
      rating: 5,
      source: 'Google Review'
    }
  ];

  let animationId = null;
  let pos = 0;
  const speed = 0.8; // Pixels per frame

  // Clear loading placeholder
  track.innerHTML = '';
  pos = 0;
  track.style.transform = 'translateX(0px)';

  // Render original cards
  testimonials.forEach(t => {
    const card = document.createElement('div');
    card.className = 'review-card';
    
    const starsHTML = '<i class="fa-solid fa-star"></i>'.repeat(t.rating || 5);
    
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
