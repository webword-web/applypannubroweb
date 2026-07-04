// Job Updates Carousel Logic
// Reads from window.jobsData

document.addEventListener('DOMContentLoaded', () => {
  // Inject CSS for Job Carousel Modal
  const style = document.createElement('style');
  style.innerHTML = `
    .jobs-modal-overlay {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.7);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      backdrop-filter: blur(5px);
    }
    .jobs-modal-overlay.active {
      opacity: 1;
      visibility: visible;
    }
    .jobs-modal-content {
      background: var(--bg-color, #ffffff);
      width: 90%;
      max-width: 1000px;
      border-radius: 20px;
      padding: 30px;
      position: relative;
      transform: translateY(20px) scale(0.95);
      transition: all 0.3s ease;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      overflow: hidden;
    }
    .jobs-modal-overlay.active .jobs-modal-content {
      transform: translateY(0) scale(1);
    }
    .jobs-modal-close {
      position: absolute;
      top: 15px;
      right: 20px;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--text-color, #333);
      background: rgba(0,0,0,0.05);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.3s;
      z-index: 10;
    }
    .jobs-modal-close:hover {
      background: rgba(0,0,0,0.1);
    }
    .jobs-modal-header {
      text-align: center;
      margin-bottom: 30px;
    }
    .jobs-modal-header h2 {
      font-size: 2rem;
      color: var(--primary-color, #2563eb);
      margin-bottom: 10px;
    }
    
    /* Carousel Styles */
    .jobs-carousel-container {
      position: relative;
      overflow: hidden;
      width: 100%;
      padding: 10px 0;
    }
    .jobs-carousel-track {
      display: flex;
      transition: transform 0.5s ease-in-out;
      gap: 20px;
    }
    .job-card {
      min-width: calc(33.333% - 13.333px);
      background: #fff;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
      border: 1px solid rgba(0,0,0,0.05);
      display: flex;
      flex-direction: column;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .job-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    }
    .job-card-img {
      width: 100%;
      height: 180px;
      object-fit: cover;
    }
    .job-card-body {
      padding: 20px;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }
    .job-card-title {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 10px;
      color: #1f2937;
    }
    .job-card-desc {
      font-size: 0.95rem;
      color: #4b5563;
      margin-bottom: 20px;
      flex-grow: 1;
    }
    .job-card-btn {
      width: 100%;
      padding: 12px;
      border: none;
      border-radius: 8px;
      background: #25d366;
      color: white;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: background 0.3s;
      text-decoration: none;
    }
    .job-card-btn:hover {
      background: #128c7e;
      color: white;
    }
    
    /* Responsive */
    @media (max-width: 992px) {
      .job-card {
        min-width: calc(50% - 10px);
      }
    }
    @media (max-width: 600px) {
      .job-card {
        min-width: 100%;
      }
      .jobs-modal-content {
        width: 95%;
        padding: 20px 15px;
      }
      .job-card-img {
        height: 150px;
      }
    }
  `;
  document.head.appendChild(style);

  // Create Modal HTML
  const modalHTML = \`
    <div id="jobs-modal" class="jobs-modal-overlay">
      <div class="jobs-modal-content">
        <div id="jobs-modal-close" class="jobs-modal-close">
          <i class="fa-solid fa-xmark"></i>
        </div>
        <div class="jobs-modal-header">
          <h2>Latest Job Updates</h2>
          <p>Find the best government and private sector jobs here.</p>
        </div>
        <div class="jobs-carousel-container">
          <div id="jobs-carousel-track" class="jobs-carousel-track">
            <!-- Jobs injected here -->
          </div>
        </div>
      </div>
    </div>
  \`;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const modal = document.getElementById('jobs-modal');
  const closeBtn = document.getElementById('jobs-modal-close');
  const track = document.getElementById('jobs-carousel-track');
  const jobUpdatesBtn = document.getElementById('btn-job-updates');

  // Inject jobs if data exists
  if (window.jobsData && window.jobsData.length > 0) {
    let html = '';
    window.jobsData.forEach(job => {
      // Get base whatsapp number from adminData or default
      const waNumber = window.adminData ? window.adminData.contacts.whatsappNumber : "918525041700";
      const waLink = \`https://wa.me/\${waNumber}?text=\${encodeURIComponent(job.whatsapp)}\`;
      
      html += \`
        <div class="job-card">
          <img src="\${job.image}" alt="\${job.title}" class="job-card-img">
          <div class="job-card-body">
            <h3 class="job-card-title">\${job.title}</h3>
            <p class="job-card-desc">\${job.description}</p>
            <a href="\${waLink}" target="_blank" class="job-card-btn">
              <i class="fa-brands fa-whatsapp"></i> Apply Now
            </a>
          </div>
        </div>
      \`;
    });
    track.innerHTML = html;
  }

  // Carousel Logic
  let currentIndex = 0;
  let intervalId = null;

  function getCardsPerView() {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 992) return 2;
    return 3;
  }

  function updateCarousel() {
    if (!window.jobsData || window.jobsData.length === 0) return;
    const cardsPerView = getCardsPerView();
    const maxIndex = window.jobsData.length - cardsPerView;
    
    // Auto loop
    if (currentIndex > maxIndex) {
      currentIndex = 0; // Reset to start
    }
    
    // Calculate transform percentage
    // card width + gap. If 3 cards, width is 33.33%, gap is 20px. 
    // It's easier to just translate by index * (100 / cardsPerView)% roughly, but with gap it's specific.
    // The gap is handled by the flex-basis/min-width in CSS.
    // Formula: index * (card width + gap)
    const cards = track.querySelectorAll('.job-card');
    if(cards.length > 0) {
      const cardWidth = cards[0].offsetWidth;
      const gap = 20;
      track.style.transform = \`translateX(-\${currentIndex * (cardWidth + gap)}px)\`;
    }
  }

  function startCarousel() {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => {
      currentIndex++;
      updateCarousel();
    }, 4000); // 4 seconds auto-slide
  }

  function stopCarousel() {
    if (intervalId) clearInterval(intervalId);
  }

  // Handle Resize
  window.addEventListener('resize', () => {
    currentIndex = 0;
    updateCarousel();
  });

  // Modal Events
  if (jobUpdatesBtn) {
    jobUpdatesBtn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('active');
      setTimeout(() => {
        updateCarousel(); // Ensure correct size after modal display
        startCarousel();
      }, 100);
    });
  }

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    stopCarousel();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      stopCarousel();
    }
  });
  
  // Pause on hover
  track.addEventListener('mouseenter', stopCarousel);
  track.addEventListener('mouseleave', () => {
    if (modal.classList.contains('active')) {
      startCarousel();
    }
  });

});
