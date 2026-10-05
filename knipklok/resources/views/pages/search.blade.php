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

    <div class="kk-shops-count">
        433 shops found
    </div>


    <div class="kk-shops-grid">

        <article class="kk-shop-card">
            <div class="kk-shop-image">
                <img src="/images/sudandebarber.jpg" alt="Barbershop">
            </div>

            <h3>Barbershop</h3>

            <div class="kk-shop-meta">
                <span class="rating">★ 4.8</span>
                <span class="rating-reviews">(5947)</span>
                <span class="reviews">1474 Reviews</span>
            </div>

            <div class="kk-shop-location">
                ● Zurich
            </div>
        </article>


        <article class="kk-shop-card">
            <div class="kk-shop-image">
                <img src="/images/barbershop-een-tweetje.jpg" alt="Barbershop">
            </div>

            <h3>Man Cave</h3>

            <div class="kk-shop-meta">
                <span class="rating">★ 4.9</span>
                <span class="rating-reviews">(3046)</span>
                <span class="reviews">742 Reviews</span>
            </div>

            <div class="kk-shop-location">
                ● Geneva
            </div>
        </article>


        <article class="kk-shop-card">
            <div class="kk-shop-image">
                <img src="/images/mister-cuts.jpg" alt="Barbershop">
            </div>

            <h3>Barber King</h3>

            <div class="kk-shop-meta">
                <span class="rating">★ 4.6</span>
                <span class="rating-reviews">(1433)</span>
                <span class="reviews">297 Reviews</span>
            </div>

            <div class="kk-shop-location">
                ● Basel
            </div>
        </article>


        <article class="kk-shop-card">
            <div class="kk-shop-image">
                <img src="/images/barbershop-ak.jpg" alt="Barbershop">
            </div>

            <h3>Weizigt</h3>

            <div class="kk-shop-meta">
                <span class="rating">★ 4.7</span>
                <span class="rating-reviews">(2362)</span>
                <span class="reviews">609 Reviews</span>
            </div>

            <div class="kk-shop-location">
                ● Lausanne
            </div>
        </article>

    </div>

</section>

@endsection