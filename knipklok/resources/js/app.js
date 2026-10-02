import './bootstrap';

document.addEventListener('DOMContentLoaded', () => {

    /* =====================================================
       MOBILE MENU
       ===================================================== */

    const menuButton = document.getElementById('kkMenuButton');
    const mobileNav = document.getElementById('kkMobileNav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', () => {
            mobileNav.classList.toggle('active');
        });
    }


    /* =====================================================
       BARBER REGION SLIDER
       ===================================================== */

    const regionSlider = document.getElementById('kkRegionSlider');
    const regionNext = document.getElementById('kkRegionNext');

    if (regionSlider && regionNext) {
        regionNext.addEventListener('click', () => {
            regionSlider.scrollBy({
                left: 340,
                behavior: 'smooth'
            });
        });
    }


    /* =====================================================
       REVIEWS SLIDER
       ===================================================== */

    const reviewSlider = document.getElementById('kkReviewsTrack');
    const reviewPrev = document.getElementById('kkReviewPrev');
    const reviewNext = document.getElementById('kkReviewNext');

    if (reviewSlider) {

        if (reviewNext) {
            reviewNext.addEventListener('click', () => {
                reviewSlider.scrollBy({
                    left: 420,
                    behavior: 'smooth'
                });
            });
        }

        if (reviewPrev) {
            reviewPrev.addEventListener('click', () => {
                reviewSlider.scrollBy({
                    left: -420,
                    behavior: 'smooth'
                });
            });
        }

    }

});