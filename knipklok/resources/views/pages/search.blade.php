@extends('layouts.app')

@section('title', 'Search - Swiss Barber')

@section('content')

<section class="kk-shops-hero">

    <div class="kk-shops-shapes" aria-hidden="true">
        <span class="shape shape-1"></span>
        <span class="shape shape-2"></span>
        <span class="shape shape-3"></span>
        <span class="shape shape-4"></span>
        <span class="shape shape-5"></span>
        <span class="shape shape-6"></span>
        <span class="shape shape-7"></span>
        <span class="shape shape-8"></span>
    </div>

    <h1>All shops</h1>

</section>

<section class="kk-shops-search">

    <form action="{{ route('search') }}" method="GET" class="kk-shops-search-box">

        <div class="kk-shops-search-input">
            <input
                type="text"
                name="search"
                value="{{ request('search') }}"
                placeholder="Search..."
            >
        </div>

        <div class="kk-shops-select">
            <select name="country">
                <option value="ch" selected>Switzerland</option>
            </select>
        </div>

        <div class="kk-shops-select">
            <select name="city">
                <option value="">All cities</option>
                <option value="zurich">Zurich</option>
                <option value="geneva">Geneva</option>
                <option value="basel">Basel</option>
                <option value="lausanne">Lausanne</option>
                <option value="bern">Bern</option>
                <option value="winterthur">Winterthur</option>
                <option value="lucerne">Lucerne</option>
                <option value="st-gallen">St. Gallen</option>
                <option value="lugano">Lugano</option>
                <option value="biel">Biel/Bienne</option>
                <option value="thun">Thun</option>
                <option value="zug">Zug</option>
                <option value="fribourg">Fribourg</option>
                <option value="chur">Chur</option>
                <option value="neuchatel">Neuchâtel</option>
                <option value="schaffhausen">Schaffhausen</option>
            </select>
        </div>

        <button type="submit" class="kk-shops-search-button">
            <span></span>
        </button>

    </form>

    <div class="kk-shops-count" id="shopsCount">
        Loading shops...
    </div>

    <div class="kk-shops-grid" id="shopsGrid"></div>

</section>

<script>
document.addEventListener('DOMContentLoaded', async function () {

    const shopsGrid = document.getElementById('shopsGrid');
    const shopsCount = document.getElementById('shopsCount');

    const search = @json(request('search', ''));
    const country = @json(request('country', 'ch'));
    const city = @json(request('city', ''));

    try {

        const params = new URLSearchParams();

        if (search) params.append('search', search);
        if (country) params.append('country', country);
        if (city) params.append('city', city);

        const response = await window.api.get(
            `/public/shops?${params.toString()}`
        );

        console.log('Shops API response:', response.data);

        const shops = Array.isArray(response.data?.data)
            ? response.data.data
            : [];

        shopsCount.textContent =
            `${shops.length} shops found`;

        if (shops.length === 0) {

            shopsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 50px;">
                    <h3>No barber shops found</h3>
                    <p>Try another search or city.</p>
                </div>
            `;

            return;
        }

        shopsGrid.innerHTML = shops.map(shop => {

            const image = shop.image ||
                shop.logo ||
                '/images/sudandebarber.jpg';

            const name = shop.name ||
                shop.shop_name ||
                'Barbershop';

            const cityName = shop.city ||
                shop.location ||
                'Switzerland';

            const rating = shop.rating ??
                shop.average_rating ??
                '0';

            const reviews = shop.reviews_count ??
                shop.review_count ??
                0;

            return `
                <article
                    class="kk-shop-card"
                    onclick="window.location.href='/shop/${shop.id}'"
                    style="cursor: pointer;"
                >

                    <div class="kk-shop-image">
                        <img
                            src="${image}"
                            alt="${name}"
                            onerror="this.src='/images/sudandebarber.jpg'"
                        >
                    </div>

                    <h3>${name}</h3>

                    <div class="kk-shop-meta">
                        <span class="rating">
                            ★ ${rating}
                        </span>

                        <span class="reviews">
                            ${reviews} Reviews
                        </span>
                    </div>

                    <div class="kk-shop-location">
                        ● ${cityName}
                    </div>

                </article>
            `;

        }).join('');

    } catch (error) {

        console.error('Shops loading error:', error);

        shopsCount.textContent = 'Unable to load shops';

        shopsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 50px;">
                <h3>Could not load barber shops</h3>
                <p>Please try again.</p>
            </div>
        `;
    }

});
</script>

@endsection