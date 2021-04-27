function NavTo(url) {
    window.location = url;
}

function startCarousel(id) {
    let el = document.querySelector(id);
    let carousel = new bootstrap.Carousel(el);
    carousel.cycle();
    console.log("Carousel Started");
}

function topFunction() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}