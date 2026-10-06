@extends('layouts.app')

@section('title', 'Swiss Barber - Barbers')

@section('content')

<section class="swiss-barbers-page">

    <div class="swiss-barbers-hero">
        <div class="swiss-barbers-hero-inner">
            <span>SWISS BARBER</span>
            <h1>Find your barber</h1>
            <p>Discover trusted barbers in Switzerland and choose the right time for your appointment.</p>
        </div>
    </div>

    <section class="swiss-barbers-content">

        <div class="swiss-barbers-container">

            <div class="swiss-barbers-heading">
                <div>
                    <span>OUR BARBERS</span>
                    <h2>Popular barbershops</h2>
                </div>

                <a href="{{ route('search') }}">
                    Search barbers →
                </a>
            </div>

            <div class="swiss-barbers-grid">

                @php
                    $barbers = [
                        [
                            'slug' => 'sudandebarber',
                            'name' => 'Sudandebarber',
                            'city' => 'Zurich',
                            'rating' => '4.8',
                            'reviews' => '148',
                            'image' => '/images/sudandebarber.jpg',
                        ],
                        [
                            'slug' => 'barbershop-een-tweetje',
                            'name' => 'Barbershop Één-tweetje',
                            'city' => 'Basel',
                            'rating' => '4.8',
                            'reviews' => '298',
                            'image' => '/images/barbershop-een-tweetje.jpg',
                        ],
                        [
                            'slug' => 'mister-cuts',
                            'name' => 'Mister Cuts',
                            'city' => 'Geneva',
                            'rating' => '4.9',
                            'reviews' => '467',
                            'image' => '/images/mister-cuts.jpg',
                        ],
                        [
                            'slug' => 'barbershop-ak',
                            'name' => 'Barbershop Ak',
                            'city' => 'Bern',
                            'rating' => '4.9',
                            'reviews' => '125',
                            'image' => '/images/barbershop-ak.jpg',
                        ],
                    ];
                @endphp

                @foreach($barbers as $barber)

                    <a
                        href="{{ route('barber.show', $barber['slug']) }}"
                        class="swiss-barbers-card"
                    >

                        <div class="swiss-barbers-image">
                            <img
                                src="{{ $barber['image'] }}"
                                alt="{{ $barber['name'] }}"
                            >
                        </div>

                        <div class="swiss-barbers-card-content">

                            <h3>{{ $barber['name'] }}</h3>

                            <div class="swiss-barbers-meta">
                                <span class="swiss-barbers-rating">
                                    ★ {{ $barber['rating'] }}
                                </span>

                                <span>
                                    {{ $barber['reviews'] }} Reviews
                                </span>
                            </div>

                            <p>
                                ● {{ $barber['city'] }}, Switzerland
                            </p>

                            <span class="swiss-barbers-view">
                                View barbershop →
                            </span>

                        </div>

                    </a>

                @endforeach

            </div>

        </div>

    </section>

</section>

@endsection

@push('head')

<style>

.swiss-barbers-page {
    width: 100%;
    background: #ffffff;
    color: #171717;
}

.swiss-barbers-hero {
    min-height: 300px;
    display: flex;
    align-items: center;
    background: #000000;
    color: #ffffff;
}

.swiss-barbers-hero-inner {
    width: min(1180px, calc(100% - 48px));
    margin: 0 auto;
}

.swiss-barbers-hero span,
.swiss-barbers-heading > div > span {
    display: block;
    margin-bottom: 10px;
    color: #3b9668;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
}

.swiss-barbers-hero h1 {
    margin: 0;
    font-size: clamp(42px, 6vw, 68px);
    line-height: 1;
    letter-spacing: -2px;
}

.swiss-barbers-hero p {
    max-width: 620px;
    margin: 20px 0 0;
    color: #cfcfcf;
    font-size: 16px;
    line-height: 1.7;
}

.swiss-barbers-content {
    padding: 75px 24px 100px;
    background: #ffffff;
}

.swiss-barbers-container {
    width: min(1180px, 100%);
    margin: 0 auto;
}

.swiss-barbers-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 25px;
    margin-bottom: 35px;
}

.swiss-barbers-heading h2 {
    margin: 0;
    color: #171717;
    font-size: 34px;
    letter-spacing: -.8px;
}

.swiss-barbers-heading > a {
    color: #3b9668;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
}

.swiss-barbers-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 28px;
}

.swiss-barbers-card {
    display: block;
    overflow: hidden;
    border: 1px solid #dedede;
    background: #ffffff;
    color: inherit;
    text-decoration: none;
    transition: transform .2s ease, box-shadow .2s ease;
}

.swiss-barbers-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 30px rgba(0,0,0,.08);
}

.swiss-barbers-image {
    width: 100%;
    height: 310px;
    overflow: hidden;
    background: #eeeeee;
}

.swiss-barbers-image img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    object-position: center;
    transform: none !important;
}

.swiss-barbers-card-content {
    padding: 25px;
}

.swiss-barbers-card-content h3 {
    margin: 0 0 12px;
    color: #171717;
    font-size: 22px;
}

.swiss-barbers-meta {
    display: flex;
    align-items: center;
    gap: 15px;
    color: #777777;
    font-size: 13px;
}

.swiss-barbers-rating {
    color: #3b9668;
    font-weight: 700;
}

.swiss-barbers-card-content p {
    margin: 15px 0;
    color: #777777;
    font-size: 14px;
}

.swiss-barbers-view {
    color: #3b9668;
    font-size: 13px;
    font-weight: 600;
}

@media (max-width: 700px) {

    .swiss-barbers-hero {
        min-height: 260px;
    }

    .swiss-barbers-hero-inner {
        width: calc(100% - 32px);
    }

    .swiss-barbers-content {
        padding: 50px 16px 70px;
    }

    .swiss-barbers-heading {
        align-items: flex-start;
        flex-direction: column;
    }

    .swiss-barbers-grid {
        grid-template-columns: 1fr;
    }

    .swiss-barbers-image {
        height: 260px;
    }

}

</style>

@endpush
