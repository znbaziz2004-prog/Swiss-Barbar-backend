<section class="kk-region-section" id="barbers">

```
<div class="kk-region-shapes" aria-hidden="true">
    <span class="kk-shape kk-shape-1"></span>
    <span class="kk-shape kk-shape-2"></span>
    <span class="kk-shape kk-shape-3"></span>
    <span class="kk-shape kk-shape-4"></span>
    <span class="kk-shape kk-shape-5"></span>
    <span class="kk-shape kk-shape-6"></span>
</div>

<div class="kk-region-inner">

    <h2 class="kk-region-title">
        BEST IN THE REGION
    </h2>

    <div class="kk-region-carousel">

        <div class="kk-region-track" id="kkRegionSlider">
            <p id="kkRegionLoading">Loading barbers...</p>
        </div>

        <button
            type="button"
            class="kk-region-arrow"
            id="kkRegionNext"
            aria-label="Next"
        >
            ›
        </button>

    </div>

    <div class="kk-region-footer">

        <a href="{{ url('/search') }}" class="kk-region-all">
            Toon alle kappers
        </a>

    </div>

</div>
```

</section>

<script>
document.addEventListener('DOMContentLoaded', async function () {

    const slider = document.getElementById('kkRegionSlider');

    if (!slider) return;

    try {

        const response = await window.api.get('/public/shops/featured');

        const shops = Array.isArray(response.data?.data)
            ? response.data.data
            : [];

        if (!shops.length) {
            slider.innerHTML = `
                <p class="kk-region-empty">
                    No featured barbers available at the moment.
                </p>
            `;
            return;
        }

        slider.innerHTML = shops.map(shop => {

            const image = shop.image
                ? shop.image
                : '/images/img.png';

            return `
                <article class="kk-region-card">

                    <a
                        href="/shop/${shop.id}"
                        class="kk-region-image"
                    >
                        <img
                            src="${image}"
                            alt="${escapeHtml(shop.name || 'Barbershop')}"
                            onerror="this.src='/images/img.png'"
                        >
                    </a>

                    <div class="kk-region-card-content">

                        <h3>
                            ${escapeHtml(shop.name || 'Barbershop')}
                        </h3>

                        <div class="kk-region-details">

                            <span class="kk-region-rating">
                                <span class="kk-star">★</span>
                                <span>${shop.rating ?? 'New'}</span>
                                <span class="kk-rating-count">
                                    ${shop.review_count ? `(${shop.review_count})` : ''}
                                </span>
                            </span>

                            <span class="kk-review-count">
                                ${shop.review_count ?? 0} Reviews
                            </span>

                        </div>

                        <div class="kk-region-location">
                            <span class="kk-pin">●</span>
                            <span>
                                ${escapeHtml(shop.city || '')}
                            </span>
                        </div>

                    </div>

                </article>
            `;

        }).join('');

    } catch (error) {

        console.error('Featured barbers error:', error);

        slider.innerHTML = `
            <p class="kk-region-empty">
                Could not load featured barbers.
            </p>
        `;
    }

    function escapeHtml(value) {
        const div = document.createElement('div');
        div.textContent = value ?? '';
        return div.innerHTML;
    }

});
</script>
