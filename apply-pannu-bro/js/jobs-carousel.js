// Job Updates Carousel Logic
// Reads from window.jobsData and renders into #job-slider

document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('job-slider');
  if (!track) return; // If the container doesn't exist, do nothing

  // Inject CSS for Job Cards
  const style = document.createElement('style');
  style.innerHTML = `
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
    .job-card-img-wrapper {
      position: relative;
      width: 100%;
      height: 200px;
      overflow: hidden;
    }
    .job-card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s;
    }
    .job-card:hover .job-card-img {
      transform: scale(1.05);
    }
    .job-card-badge {
      position: absolute;
      top: 15px;
      left: 15px;
      background: var(--primary-color, #2563eb);
      color: white;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 2;
    }
    .job-card-body {
      padding: 20px;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }
    .job-card-title {
      font-size: 1.15rem;
      font-weight: 700;
      margin-bottom: 15px;
      color: #1f2937;
      line-height: 1.4;
    }
    .job-card-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 20px;
      font-size: 0.9rem;
      color: #4b5563;
      flex-grow: 1;
    }
    .job-card-detail-item {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .job-card-detail-item i {
      color: var(--primary-color, #2563eb);
      width: 16px;
      text-align: center;
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
      .job-card-img-wrapper {
        height: 150px;
      }
    }
  `;
  document.head.appendChild(style);

  // Inject jobs if data exists
  if (window.jobsData && window.jobsData.length > 0) {
    let html = '';
    window.jobsData.forEach(job => {
      // Get base whatsapp number from adminData or default
      const waNumber = window.adminData && window.adminData.contacts ? window.adminData.contacts.whatsappNumber : "918525041700";
      const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(job.whatsapp)}`;
      
      html += `
        <div class="job-card">
          <div class="job-card-img-wrapper">
            <span class="job-card-badge">${job.category || 'Job Updates'}</span>
            <img src="${job.image}" alt="${job.title}" class="job-card-img">
          </div>
          <div class="job-card-body">
            <h3 class="job-card-title">${job.title}</h3>
            <div class="job-card-details">
              <div class="job-card-detail-item"><i class="fa-solid fa-location-dot"></i> <span>${job.location || 'Not Specified'}</span></div>
              <div class="job-card-detail-item"><i class="fa-solid fa-graduation-cap"></i> <span>${job.qualification || 'Not Specified'}</span></div>
              <div class="job-card-detail-item"><i class="fa-solid fa-calendar-days"></i> <span>Last Date: ${job.lastDate || 'Apply Soon'}</span></div>
            </div>
            <a href="${waLink}" target="_blank" class="job-card-btn">
              <i class="fa-brands fa-whatsapp"></i> Apply Now
            </a>
          </div>
        </div>
      `;
    });
    track.innerHTML = html;
  } else {
    track.innerHTML = '<p style="text-align: center; width: 100%; padding: 20px;">No job updates available at the moment.</p>';
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
    const cards = track.querySelectorAll('.job-card');
    if(cards.length > 0) {
      const cardWidth = cards[0].offsetWidth;
      const gap = 20;
      track.style.transform = `translateX(-${currentIndex * (cardWidth + gap)}px)`;
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

  // Pause on hover
  track.addEventListener('mouseenter', stopCarousel);
  track.addEventListener('mouseleave', startCarousel);

  // Start initially
  setTimeout(() => {
    updateCarousel();
    startCarousel();
  }, 100);

  // Link the hero button to scroll to this section instead of opening a modal
  const jobUpdatesBtn = document.getElementById('btn-job-updates');
  if (jobUpdatesBtn) {
    jobUpdatesBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const section = document.querySelector('.job-updates-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
});
