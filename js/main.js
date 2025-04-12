// Add smooth scrolling to all links
document.querySelectorAll('a.scrollto').forEach(link => {
    link.addEventListener('click', function(e) {
        if (document.querySelector(this.hash)) {
            e.preventDefault();
            
            let navbar = document.querySelector('#navbar');
            if (navbar.classList.contains('navbar-mobile')) {
                navbar.classList.remove('navbar-mobile');
                let navbarToggle = document.querySelector('.mobile-nav-toggle');
                navbarToggle.classList.toggle('bi-list');
                navbarToggle.classList.toggle('bi-x');
            }
            
            let section = document.querySelector(this.hash);
            window.scrollTo({
                top: section.offsetTop - 50,
                behavior: 'smooth'
            });
        }
    });
});

// Activate navbar links on scroll
function navbarLinkActive() {
    let position = window.scrollY + 200;
    document.querySelectorAll('section').forEach(section => {
        if (!section.getAttribute('id')) return;
        
        let navbarLink = document.querySelector(`#navbar a[href*=${section.getAttribute('id')}]`);
        if (!navbarLink) return;
        
        if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
            document.querySelectorAll('#navbar a').forEach(link => {
                link.classList.remove('active');
            });
            navbarLink.classList.add('active');
        }
    });
}

window.addEventListener('load', navbarLinkActive);
window.addEventListener('scroll', navbarLinkActive);