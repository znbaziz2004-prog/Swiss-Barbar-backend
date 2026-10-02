@extends('layouts.app')

@section('title', 'Knipklok - online kapper afspraak maken')

@section('content')

<div class="kk-home-page">

    <section class="kk-hero" id="search">
        <div class="kk-hero-inner">

            <div class="kk-hero-copy">

                <p class="kk-hero-kicker">Welcome to</p>

                <h1 class="kk-hero-title">KNIPKLOK</h1>

                <p class="kk-hero-subtitle">
                    Find and book your next barber appointment<br>
                    quickly and easily.
                </p>

                <form class="kk-search-box" action="#" method="GET">

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
