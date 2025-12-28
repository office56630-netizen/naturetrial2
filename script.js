document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.getElementById('nav-toggle');
    const mainNav = document.getElementById('main-nav');

    navToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close mobile nav when a link is clicked (optional, but good UX)
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    });
});