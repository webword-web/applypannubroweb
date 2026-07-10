// Job Updates Carousel Logic
// Reads from window.jobsData and renders into #job-slider

document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('job-slider');
  if (!track) return; // If the container doesn't exist, do nothing

  // Inject CSS for Job Cards (maintained from original for exact style consistency)
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
    
    /* Responsive overrides (will be further customized for jobs page view) */
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
    const jobs = window.jobsData;
    const totalJobs = jobs.length;
    let html = '';

    // Get base whatsapp number from adminData or default
    const waNumber = window.adminData && window.adminData.contacts ? window.adminData.contacts.whatsappNumber : "918525041700";

    // Helper function to build job card HTML
    function buildCardHtml(job) {
      const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(job.whatsapp)}`;
      return `
        <div class="job-card">
          <div class="job-card-img-wrapper">
            <span class="job-card-badge">${job.category || 'Job Updates'}</span>
            <img src="${job.image}" alt="${job.title}" class="job-card-img" loading="lazy">
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
    }

    if (totalJobs > 1) {
      // Cloned last job (preposed)
      html += buildCardHtml(jobs[totalJobs - 1]);
      // Real jobs
      jobs.forEach(job => {
        html += buildCardHtml(job);
      });
      // Cloned first job (appended)
      html += buildCardHtml(jobs[0]);
    } else {
      // If only 1 job, render without cloning
      html += buildCardHtml(jobs[0]);
    }

    track.innerHTML = html;

    // If 1 or fewer jobs, hide carousel controls
    if (totalJobs <= 1) {
      const prevBtn = document.getElementById('carousel-prev-btn');
      const nextBtn = document.getElementById('carousel-next-btn');
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      return;
    }

    // Carousel Configuration
    let currentIndex = 1; // Start at the first real job card
    let isTransitioning = false;
    let autoSlideInterval = null;

    // Initialize track positioning
    track.style.transition = 'none';
    track.style.transform = `translateX(-100%)`;
    // Force layout reflow
    track.offsetHeight;
    track.style.transition = '';

    function moveToSlide(index) {
      if (isTransitioning) return;
      isTransitioning = true;
      track.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
      currentIndex = index;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    // Listen to transition end to handle loop resets
    track.addEventListener('transitionend', () => {
      isTransitioning = false;
      if (currentIndex === 0) {
        // Jump to last real job
        track.style.transition = 'none';
        currentIndex = totalJobs;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
      } else if (currentIndex === totalJobs + 1) {
        // Jump to first real job
        track.style.transition = 'none';
        currentIndex = 1;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
      }
    });

    function nextSlide() {
      if (isTransitioning) return;
      moveToSlide(currentIndex + 1);
    }

    function prevSlide() {
      if (isTransitioning) return;
      moveToSlide(currentIndex - 1);
    }

    // Button controls
    const prevBtn = document.getElementById('carousel-prev-btn');
    const nextBtn = document.getElementById('carousel-next-btn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoPlay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoPlay();
      });
    }

    // Touch Swipe Support
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
      touchEndX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', () => {
      const threshold = 50; // swipe length in pixels
      const swipeDistance = touchStartX - touchEndX;

      if (Math.abs(swipeDistance) > threshold) {
        if (swipeDistance > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
        resetAutoPlay();
      }
      touchStartX = 0;
      touchEndX = 0;
    });

    // Auto sliding timer (4 seconds interval)
    function startAutoPlay() {
      if (autoSlideInterval) clearInterval(autoSlideInterval);
      autoSlideInterval = setInterval(() => {
        nextSlide();
      }, 4000);
    }

    // Stop sliding timer
    function stopAutoPlay() {
      if (autoSlideInterval) clearInterval(autoSlideInterval);
    }

    function resetAutoPlay() {
      stopAutoPlay();
      startAutoPlay();
    }

    // Pause on hover
    track.addEventListener('mouseenter', stopAutoPlay);
    track.addEventListener('mouseleave', startAutoPlay);

    // Initial Start
    startAutoPlay();

    // Re-align on resize
    window.addEventListener('resize', () => {
      track.style.transition = 'none';
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
    });

  } else {
    track.innerHTML = '<p style="text-align: center; width: 100%; padding: 40px; color: var(--text-secondary);">No job updates available at the moment.</p>';
    const prevBtn = document.getElementById('carousel-prev-btn');
    const nextBtn = document.getElementById('carousel-next-btn');
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
  }
});
