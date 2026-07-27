// ==============================================================================
// APPLY PANNU BRO - JOB UPDATES DATA FILE
// ==============================================================================
// 
// ===== HOW TO USE THIS FILE =====
// 
// 1. To add a new job, copy the template below and paste it under "// ===== ADD NEW JOB HERE =====".
// 2. To edit an existing job, find the job and change its details.
// 3. To delete a job, just remove the entire block for that job.
// 4. To mark a job as closed, change the status to "Closed" instead of deleting it.
//
// ===== JOB CATEGORIES SUPPORTED =====
// Use exactly one of these: "Government Jobs", "Private Jobs", "IT Jobs", "Work From Home"
//
// ===== JOB TYPE SUPPORTED =====
// Use exactly one of these: "Government", "Private"
//
// ===== STATUS SUPPORTED =====
// Use exactly one of these: "Active", "Closed", "Coming Soon"
// ==============================================================================

const jobsData = [

  // ===== ADD NEW JOB HERE =====

  // ===== EDIT EXISTING JOB HERE =====
  {
    title: "Tamil Nadu Village Assistant Recruitment 2026",
    company: "Tamil Nadu Govt",
    jobType: "Government",
    category: "Government Jobs",
    location: "Tamil Nadu",
    qualification: "10th Pass",
    experience: "Fresher",
    salary: "₹11,100 - ₹35,100",
    lastDate: "Apply Soon",
    postedDate: "2026-07-27",
    status: "Active",
    applyLink: "https://wa.me/918525041700?text=Hi,%20I%20want%20to%20apply%20for%20Tamil%20Nadu%20Village%20Assistant%20Recruitment%202026.",
    image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop"
  },
  {
    title: "IT Support Engineer",
    company: "TCS",
    jobType: "Private",
    category: "IT Jobs",
    location: "Chennai / Bangalore",
    qualification: "B.E / B.Tech / BCA",
    experience: "0 - 2 Years",
    salary: "₹3,00,000 - ₹4,50,000 PA",
    lastDate: "Walk-in",
    postedDate: "2026-07-26",
    status: "Active",
    applyLink: "https://wa.me/918525041700?text=Hi,%20I%20want%20to%20apply%20for%20IT%20Support%20Engineer%20-%20TCS.",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=600&auto=format&fit=crop"
  },
  {
    title: "Customer Service Executive",
    company: "HDFC Bank",
    jobType: "Private",
    category: "Private Jobs",
    location: "Chennai / Coimbatore",
    qualification: "Any Degree",
    experience: "0 - 3 Years",
    salary: "₹2,50,000 PA",
    lastDate: "25-07-2026",
    postedDate: "2026-07-20",
    status: "Closed",
    applyLink: "https://wa.me/918525041700?text=Hi,%20I%20want%20to%20apply%20for%20HDFC%20Bank%20Customer%20Service%20Executive.",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=600&auto=format&fit=crop"
  },
  {
    title: "Data Entry Operator",
    company: "Tech Mahindra",
    jobType: "Private",
    category: "Work From Home",
    location: "Remote (Pan India)",
    qualification: "12th / Any Degree",
    experience: "Fresher",
    salary: "₹15,000 / month",
    lastDate: "30-08-2026",
    postedDate: "2026-07-25",
    status: "Active",
    applyLink: "https://wa.me/918525041700?text=Hi,%20I%20want%20to%20apply%20for%20Data%20Entry%20Operator%20-%20Tech%20Mahindra.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop"
  },
  {
    title: "TNPSC Group 4 Services",
    company: "TNPSC",
    jobType: "Government",
    category: "Government Jobs",
    location: "Tamil Nadu",
    qualification: "10th / 12th / Degree",
    experience: "Fresher",
    salary: "As per Govt Norms",
    lastDate: "15-08-2026",
    postedDate: "2026-07-22",
    status: "Active",
    applyLink: "https://wa.me/918525041700?text=Hi,%20I%20want%20to%20apply%20for%20TNPSC%20Group%204%20Services.",
    image: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=600&auto=format&fit=crop"
  }

  // ===== DELETE JOB HERE =====
  // Just remove the block {} for the job you want to delete
];

// Attach data to global window object so it can be accessed by other scripts
window.jobsData = jobsData;
