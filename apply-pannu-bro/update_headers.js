const fs = require('fs');
const path = require('path');
const dir = '.';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
const newHeader = `  <!-- Header -->
  <header>
    <div class="header-container">
      <a href="index.html" class="logo">
        <h1>Apply Pannunga Bro</h1>
      </a>
      <button id="mobile-menu-btn" class="mobile-menu-btn" aria-label="Menu">
        <i class="fa-solid fa-bars"></i>
      </button>
    </div>
  </header>

  <!-- Side Drawer Menu -->
  <div id="mobile-nav" class="mobile-nav">
    <div class="menu-top">
      <button id="theme-toggle" class="theme-toggle" aria-label="Toggle Theme">
        <i class="fa-solid fa-moon"></i> Theme
      </button>
      <button id="close-menu-btn" class="close-menu-btn" aria-label="Close Menu">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
    <ul>
      <li><a href="index.html">Home</a></li>
      <li><a href="services.html">Services</a></li>
      <li><a href="about.html">About</a></li>
      <li><a href="index.html#why-us">Why Choose Us</a></li>
      <li><a href="contact.html">Contact</a></li>
    </ul>
    <div class="menu-bottom">
      <a href="admin.html" class="btn btn-primary admin-btn"><i class="fa-solid fa-lock"></i> Admin Login</a>
    </div>
  </div>`;

files.forEach(f => {
  let content = fs.readFileSync(path.join(dir, f), 'utf8');
  // Match the header block
  const regex = /<!-- Header -->[\s\S]*?<!-- Mobile Navigation -->[\s\S]*?<div id="mobile-nav"[\s\S]*?<\/ul>\s*<\/div>/;
  if (regex.test(content)) {
    content = content.replace(regex, newHeader);
    fs.writeFileSync(path.join(dir, f), content);
    console.log('Updated ' + f);
  } else {
    // try matching if they have slightly different formatting
    const regex2 = /<header>[\s\S]*?<\/header>[\s\S]*?<div id="mobile-nav"[\s\S]*?<\/div>/;
    if (regex2.test(content)) {
      content = content.replace(regex2, newHeader);
      fs.writeFileSync(path.join(dir, f), content);
      console.log('Updated ' + f);
    } else {
      console.log('Pattern not found in ' + f);
    }
  }
});
