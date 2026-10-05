@extends('layouts.app')

@section('title', 'Swiss Barber - online kapper afspraak maken')

@section('content')

<div class="kk-home-page">

    <section class="kk-hero" id="search">
        <div class="kk-hero-inner">

            <div class="kk-hero-copy">

                <p class="kk-hero-kicker">Welcome to</p>

                <h1 class="kk-hero-title">SWISS BARBER</h1>

                <p class="kk-hero-subtitle">
                    Find and book your next barber appointment<br>
                    quickly and easily.
                </p>

                <form class="kk-search-box" id="barberSearchForm">

                    <label class="kk-search-control">
                        <span>Search</span>
                        <input
                            type="text"
                            name="search"
                            class="kk-search-field"
                            placeholder="Search..."
                            aria-label="Search for a barber or barbershop"
                        >
                    </label>

                    <label class="kk-search-control">
                        <span>Country</span>
                        <select name="country" class="kk-search-select" aria-label="Country">
                            <option value="ch" selected>Switzerland</option>
                        </select>
                    </label>

                    <label class="kk-search-control">
                        <span>City</span>
                        <select name="city" class="kk-search-select" aria-label="City">
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
                    </label>

                    <button type="submit" class="kk-search-submit" aria-label="Search">
                        <span class="kk-search-icon"></span>
                    </button>

                </form>

                <script>
                    console.log('Swiss Barber Home JS loaded');
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('barberSearchForm');

    if (!form) return;

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const search = document.querySelector('.kk-search-field')?.value.trim() || '';
        const country = document.querySelector('.kk-search-select[name="country"]')?.value || '';
        const city = document.querySelector('.kk-search-select[name="city"]')?.value || '';

        try {
            const params = new URLSearchParams();

            if (search) params.append('search', search);
            if (country) params.append('country', country);
            if (city) params.append('city', city);

            const response = await window.api.get(
                `/public/shops?${params.toString()}`
            );

            console.log('Barber search result:', response.data);

            // Temporary test
            alert(
                `Backend connected! Found ${
                    Array.isArray(response.data?.data)
                        ? response.data.data.length
                        : 0
                } barber shops.`
            );

        } catch (error) {
            console.error('Barber search error:', error);

            alert(
                error?.response?.data?.message ||
                'Could not connect to the barber service.'
            );
        }
    });
});

</script>

                <div class="kk-hero-testimonial">
                    <p>Fijn programma, klanten zijn er ook heel tevreden mee!</p>
                    <div class="kk-testimonial-author">
                        <strong>Mansor</strong>
                        <span>Kapsalon Royal</span>
                    </div>
                </div>

            </div>

            <div class="kk-hero-visual">
                <div class="kk-hero-image-frame">
                    <img
                       src="{{ asset('images/img.png') }}"
                        alt="Barber helping a client"
                    >
                </div>
            </div>

        </div>
    </section>

    @include('components.region-barbers')
    @include('components.how-it-works')
    @include('components.reviews')
    @include('components.app-download')
    @include('components.barber-login-bar')

</div>

@endsection
