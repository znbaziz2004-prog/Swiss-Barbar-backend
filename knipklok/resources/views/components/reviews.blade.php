<section class="kk-reviews" id="reviews">

    <div class="kk-reviews-inner">

        <div class="kk-reviews-heading">
            <p>WHAT OUR BARBERS SAY</p>
        </div>

        <div class="kk-reviews-slider">

            <button
                type="button"
                class="kk-reviews-arrow kk-reviews-prev"
                aria-label="Previous testimonials"
            >
                ‹
            </button>

            <div class="kk-reviews-viewport">
                <div class="kk-reviews-track">

                    <article class="kk-review-card">
                        <div class="kk-review-quote">“</div>

                        <p class="kk-review-text">
                            Fijn programma, klanten zijn er ook heel tevreden mee!
                        </p>

                        <div class="kk-review-author">
                            <div class="kk-review-avatar">
                                <img src="/images/mansor.jpg" alt="Mansor">
                            </div>

                            <div>
                                <strong>Mansor</strong>
                                <span>Kapsalon Royal</span>
                            </div>
                        </div>
                    </article>


                    <article class="kk-review-card">
                        <div class="kk-review-quote">“</div>

                        <p class="kk-review-text">
                            Het is heel handig voor mij omdat het tijd en moeite bespaard.
                            Voor mijn klanten is het ook heel makkelijk, zij bepalen zelf
                            hun dag en tijd.
                        </p>

                        <div class="kk-review-author">
                            <div class="kk-review-avatar">
                                <img src="/images/emre.jpg" alt="Emre">
                            </div>

                            <div>
                                <strong>Emre</strong>
                                <span>HairQuality By Emre</span>
                            </div>
                        </div>
                    </article>


                    <article class="kk-review-card">
                        <div class="kk-review-quote">“</div>

                        <p class="kk-review-text">
                            Swiss Barber is ideaal voor kappers. Je ziet vanzelf op het scherm
                            wie er hoelaat binnenkomt.
                        </p>

                        <div class="kk-review-author">
                            <div class="kk-review-avatar kk-review-initial">
                                Y
                            </div>

                            <div>
                                <strong>Yusuf</strong>
                                <span>Man Cave</span>
                            </div>
                        </div>
                    </article>


                    <article class="kk-review-card">
                        <div class="kk-review-quote">“</div>

                        <p class="kk-review-text">
                            Ik vind Swiss Barber heel handig. Mijn klanten kunnen eenvoudig
                            zelf hun afspraak maken.
                        </p>

                        <div class="kk-review-author">
                            <div class="kk-review-avatar kk-review-initial">
                                H
                            </div>

                            <div>
                                <strong>Hasan Aydin</strong>
                                <span>Barber Hasan</span>
                            </div>
                        </div>
                    </article>


                    <article class="kk-review-card">
                        <div class="kk-review-quote">“</div>

                        <p class="kk-review-text">
                            Heel makkelijk systeem en mijn klanten zijn er tevreden mee.
                        </p>

                        <div class="kk-review-author">
                            <div class="kk-review-avatar kk-review-initial">
                                J
                            </div>

                            <div>
                                <strong>jays</strong>
                                <span>Jays Barbershop</span>
                            </div>
                        </div>
                    </article>


                    <article class="kk-review-card">
                        <div class="kk-review-quote">“</div>

                        <p class="kk-review-text">
                            Een zeer handige manier om afspraken te beheren en overzicht
                            te houden.
                        </p>

                        <div class="kk-review-author">
                            <div class="kk-review-avatar kk-review-initial">
                                M
                            </div>

                            <div>
                                <strong>Mohammed</strong>
                                <span>Herenkapper Confiance</span>
                            </div>
                        </div>
                    </article>


                    <article class="kk-review-card">
                        <div class="kk-review-quote">“</div>

                        <p class="kk-review-text">
                            Swiss Barber maakt het plannen van afspraken veel eenvoudiger.
                        </p>

                        <div class="kk-review-author">
                            <div class="kk-review-avatar kk-review-initial">
                                H
                            </div>

                            <div>
                                <strong>Hassan</strong>
                                <span>Barbershop0318</span>
                            </div>
                        </div>
                    </article>

                </div>
            </div>

            <button
                type="button"
                class="kk-reviews-arrow kk-reviews-next"
                aria-label="Next testimonials"
            >
                ›
            </button>

        </div>

    </div>

</section>



@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function () {

    const track = document.querySelector('.kk-reviews-track');

    if (!track) {
        return;
    }

    /*
     * Original testimonial cards ko automatically duplicate karo.
     * Isse manually cards dobara likhne ki zaroorat nahi.
     */

    const originalCards = Array.from(
        track.querySelectorAll('.kk-review-card')
    );

    originalCards.forEach(function (card) {

        const clone = card.cloneNode(true);

        clone.setAttribute('aria-hidden', 'true');

        track.appendChild(clone);

    });

});
</script>

@endpush