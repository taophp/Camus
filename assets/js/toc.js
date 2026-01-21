/**
 * Automatic Table of Contents Generator with Active Section Highlighting
 * Compatible with Jekyll/GitHub Pages
 * Supports fixed sidebar layout and auto-numbering
 */
(function () {
  "use strict";

  let tocContainer;
  let headers;
  let tocLinks;
  let isScrolling = false;
  let currentActiveLink = null;

  function generateTOC() {
    // Find the TOC container
    tocContainer = document.getElementById("toc");
    if (!tocContainer) return;

    // Find all headers (h1-h6)
    headers = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    if (headers.length < 2) {
      tocContainer.style.display = "none";
      return;
    }

    // Generate unique IDs for headers without them
    const usedIds = new Set();
    headers.forEach((header) => {
      if (!header.id) {
        let baseId = header.textContent
          .toLowerCase()
          .replace(/^\d+\.?\s*/, "") // Remove leading numbers
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");

        let id = baseId;
        let counter = 1;
        while (usedIds.has(id) || id === "") {
          id = baseId + "-" + counter;
          counter++;
        }

        header.id = id;
        usedIds.add(id);
      } else {
        usedIds.add(header.id);
      }
    });

    // Build TOC HTML - only include H2 and below
    const tocHeaders = Array.from(headers).filter(
      (h) => parseInt(h.tagName.charAt(1)) >= 2,
    );
    if (tocHeaders.length === 0) {
      tocContainer.style.display = "none";
      return;
    }

    let tocHTML = '<nav class="toc-nav"><ul>';
    let currentLevel = 2; // Start at H2 level

    tocHeaders.forEach((header, index) => {
      const level = parseInt(header.tagName.charAt(1));
      const text = header.textContent.replace(/^\d+\.?\s*/, ""); // Remove existing numbers
      const id = header.id;
      const originalIndex = Array.from(headers).indexOf(header);

      if (level > currentLevel) {
        // Open nested lists for each level increase
        for (let i = currentLevel; i < level; i++) {
          tocHTML += "<ul>";
        }
      } else if (level < currentLevel) {
        // Close nested lists for each level decrease
        for (let i = currentLevel; i > level; i--) {
          tocHTML += "</ul></li>";
        }
      } else if (index > 0) {
        // Close previous item at same level
        tocHTML += "</li>";
      }

      tocHTML += `<li><a href="#${id}" data-header-index="${originalIndex}">${text}</a>`;
      currentLevel = level;
    });

    // Close any remaining open items and lists
    tocHTML += "</li>";
    while (currentLevel > 2) {
      tocHTML += "</ul></li>";
      currentLevel--;
    }

    tocHTML += "</ul></nav>";

    // Insert TOC
    tocContainer.innerHTML = tocHTML;

    // Get all TOC links
    tocLinks = tocContainer.querySelectorAll("a");

    // Add click handlers for smooth scrolling
    tocLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
          isScrolling = true;

          // Update active link immediately
          updateActiveLink(this);

          // Smooth scroll to target
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });

          // Update URL
          history.pushState(null, null, this.getAttribute("href"));

          // Reset scrolling flag after animation
          setTimeout(() => {
            isScrolling = false;
          }, 1000);
        }
      });
    });

    // Set up scroll listener for active section highlighting
    setupScrollListener();

    // Initial active section detection
    updateActiveSection();
  }

  function setupScrollListener() {
    let ticking = false;

    function updateOnScroll() {
      if (!isScrolling) {
        updateActiveSection();
      }
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        requestAnimationFrame(updateOnScroll);
        ticking = true;
      }
    });
  }

  function updateActiveSection() {
    if (!headers || !tocLinks) return;

    const scrollPosition = window.scrollY + 100; // Offset for better UX
    let activeIndex = -1;

    // Find the current active section - only consider H2 and below
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const headerLevel = parseInt(header.tagName.charAt(1));

      // Skip H1 headers for active section detection
      if (headerLevel === 1) continue;

      const headerTop = header.offsetTop;

      if (scrollPosition >= headerTop) {
        activeIndex = i;
      } else {
        break;
      }
    }

    // Update active link
    const activeLink =
      activeIndex >= 0
        ? tocContainer.querySelector(`a[data-header-index="${activeIndex}"]`)
        : null;

    if (activeLink !== currentActiveLink) {
      updateActiveLink(activeLink);
    }
  }

  function updateActiveLink(newActiveLink) {
    // Remove previous active class
    if (currentActiveLink) {
      currentActiveLink.classList.remove("active");
    }

    // Add active class to new link
    if (newActiveLink) {
      newActiveLink.classList.add("active");

      // Scroll TOC to show active link if needed
      scrollTocToActiveLink(newActiveLink);
    }

    currentActiveLink = newActiveLink;
  }

  function scrollTocToActiveLink(activeLink) {
    if (!tocContainer || !activeLink) return;

    const tocRect = tocContainer.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();

    // Check if link is visible in TOC container
    const linkTop = linkRect.top - tocRect.top;
    const linkBottom = linkRect.bottom - tocRect.top;

    if (linkTop < 0 || linkBottom > tocRect.height) {
      // Scroll to center the active link
      const scrollTop = tocContainer.scrollTop + linkTop - tocRect.height / 2;
      tocContainer.scrollTo({
        top: scrollTop,
        behavior: "smooth",
      });
    }
  }

  function setupResponsiveLayout() {
    const content = document.querySelector(".post-content");
    if (!content || !tocContainer) return;

    // Check if layout is already set up
    if (content.querySelector(".content-with-sidebar")) return;

    // Show the TOC now that it's generated
    tocContainer.style.display = "block";

    // Create wrapper for sidebar layout
    const wrapper = document.createElement("div");
    wrapper.className = "content-with-sidebar";

    // Create main content container
    const mainContent = document.createElement("div");
    mainContent.className = "main-content";

    // Move the content-body to main content container
    const contentBody = content.querySelector(".content-body");
    if (contentBody) {
      // Move content from content-body to main-content
      while (contentBody.firstChild) {
        mainContent.appendChild(contentBody.firstChild);
      }
      // Remove the now empty content-body
      contentBody.remove();
    }

    // Simple layout: TOC stays in place, CSS handles responsive
    wrapper.appendChild(mainContent);
    content.appendChild(wrapper);
  }

  function handleHashChange() {
    const hash = window.location.hash;
    if (hash) {
      const target = document.querySelector(hash);
      const tocLink = tocContainer
        ? tocContainer.querySelector(`a[href="${hash}"]`)
        : null;

      if (target && tocLink) {
        updateActiveLink(tocLink);
      }
    }
  }

  // Initialize when DOM is ready
  function init() {
    generateTOC();
    if (tocContainer) {
      setupResponsiveLayout();

      // Handle initial hash in URL
      if (window.location.hash) {
        setTimeout(handleHashChange, 100);
      }

      // Handle hash changes
      window.addEventListener("hashchange", handleHashChange);
    }
  }

  // Start initialization
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Handle page resize
  window.addEventListener("resize", function () {
    // Recalculate positions after resize
    setTimeout(updateActiveSection, 100);
  });
})();
