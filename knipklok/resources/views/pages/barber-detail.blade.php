@extends('layouts.app')

@section('title', 'Swiss Barber - Sudandebarber')

@section('content')

@php
    $barbers = [
        'sudandebarber' => [
            'name' => 'Sudandebarber',
            'city' => 'Zurich',
            'rating' => '4.8',
            'rating_count' => '859',
            'reviews' => '148',
            'image' => '/images/sudandebarber.jpg',
            'address' => 'Zurich, Switzerland',
            'description' => 'Professional barber services with a focus on quality, style and a great customer experience.',
        ],

        'barbershop-een-tweetje' => [
            'name' => 'Barbershop Één-tweetje',
            'city' => 'Basel',
            'rating' => '4.8',
            'rating_count' => '1355',
            'reviews' => '298',
            'image' => '/images/barbershop-een-tweetje.jpg',
            'address' => 'Basel, Switzerland',
            'description' => 'A modern barbershop offering professional grooming services in a comfortable environment.',
        ],

        'mister-cuts' => [
            'name' => 'Mister Cuts',
            'city' => 'Geneva',
            'rating' => '4.9',
            'rating_count' => '1910',
            'reviews' => '467',
            'image' => '/images/mister-cuts.jpg',
            'address' => 'Geneva, Switzerland',
            'description' => 'Professional cuts and grooming services with attention to detail and personal style.',
        ],

        'barbershop-ak' => [
            'name' => 'Barbershop Ak',
            'city' => 'Bern',
            'rating' => '4.9',
            'rating_count' => '603',
            'reviews' => '125',
            'image' => '/images/barbershop-ak.jpg',
            'address' => 'Bern, Switzerland',
            'description' => 'A trusted local barbershop providing clean cuts and modern grooming services.',
        ],
    ];

    $barber = $barbers[$slug] ?? $barbers['sudandebarber'];
@endphp

<section class="swiss-barber-detail">

    {{-- HERO --}}
    <section class="swiss-barber-detail-hero">

        <div class="swiss-barber-detail-hero-image">
            <img
                src="{{ $barber['image'] }}"
                alt="{{ $barber['name'] }}"
            >
        </div>

        <div class="swiss-barber-detail-hero-overlay"></div>

        <div class="swiss-barber-detail-hero-content">

            <a href="{{ route('barbers.index') }}" class="swiss-barber-back">
                ← Back to barbers
            </a>

            <span class="swiss-barber-eyebrow">
                BARBERSHOP
            </span>

            <h1>{{ $barber['name'] }}</h1>

            <div class="swiss-barber-location">
                <span class="swiss-barber-location-icon">●</span>
                <span>{{ $barber['city'] }}, Switzerland</span>
            </div>

            <div class="swiss-barber-rating">

                <span class="swiss-barber-stars">
                    ★★★★★
                </span>

                <strong>{{ $barber['rating'] }}</strong>

                <span>
                    ({{ $barber['rating_count'] }})
                </span>

                <span class="swiss-barber-review-divider">•</span>

                <span>
                    {{ $barber['reviews'] }} Reviews
                </span>

            </div>

        </div>

    </section>


    {{-- MAIN CONTENT --}}
    <section class="swiss-barber-detail-main">

        <div class="swiss-barber-detail-container">

            <div class="swiss-barber-detail-grid">

                {{-- LEFT --}}
                <div class="swiss-barber-detail-left">

                    {{-- ABOUT --}}
                    <section class="swiss-barber-detail-card">

                        <span class="swiss-barber-section-label">
                            ABOUT
                        </span>

                        <h2>
                            About {{ $barber['name'] }}
                        </h2>

                        <p>
                            {{ $barber['description'] }}
                        </p>

                        <div class="swiss-barber-address">
                            <span class="swiss-barber-address-icon">●</span>

                            <div>
                                <strong>Location</strong>
                                <span>{{ $barber['address'] }}</span>
                            </div>
                        </div>

                    </section>


                    {{-- SERVICES --}}
                    <section class="swiss-barber-detail-card">

                        <div class="swiss-barber-card-heading">

                            <div>
                                <span class="swiss-barber-section-label">
                                    SERVICES
                                </span>

                                <h2>Services &amp; pricing</h2>
                            </div>

                        </div>


                        <div class="swiss-barber-services">

                            <article class="swiss-barber-service">

                                <div>
                                    <h3>Haircut</h3>

                                    <p>
                                        Professional haircut
                                    </p>
                                </div>

                                <div class="swiss-barber-service-right">
                                    <strong>CHF 30</strong>

                                    
                                </div>

                            </article>


                            <article class="swiss-barber-service">

                                <div>
                                    <h3>Beard Trim</h3>

                                    <p>
                                        Beard shaping and styling
                                    </p>
                                </div>

                                <div class="swiss-barber-service-right">
                                    <strong>CHF 20</strong>

                                    
                                </div>

                            </article>


                            <article class="swiss-barber-service">

                                <div>
                                    <h3>Haircut + Beard</h3>

                                    <p>
                                        Complete grooming service
                                    </p>
                                </div>

                                <div class="swiss-barber-service-right">
                                    <strong>CHF 45</strong>

                                    
                                </div>

                            </article>


                            <article class="swiss-barber-service">

                                <div>
                                    <h3>Kids Haircut</h3>

                                    <p>
                                        Haircut for children
                                    </p>
                                </div>

                                <div class="swiss-barber-service-right">
                                    <strong>CHF 25</strong>

                                    
                                </div>

                            </article>

                        </div>

                    </section>


                    {{-- REVIEWS --}}
                    <section class="swiss-barber-detail-card">

                        <div class="swiss-barber-card-heading">

                            <div>
                                <span class="swiss-barber-section-label">
                                    REVIEWS
                                </span>

                                <h2>
                                    What clients say
                                </h2>
                            </div>

                            <div class="swiss-barber-review-summary">
                                <span>★</span>
                                <strong>{{ $barber['rating'] }}</strong>
                            </div>

                        </div>


                        <div class="swiss-barber-reviews">

                            <article class="swiss-barber-review">

                                <div class="swiss-barber-review-top">

                                    <div class="swiss-barber-review-avatar">
                                        A
                                    </div>

                                    <div>
                                        <strong>Alex</strong>

                                        <div class="swiss-barber-review-stars">
                                            ★★★★★
                                        </div>
                                    </div>

                                </div>

                                <p>
                                    Great service and a very professional
                                    experience. I will definitely come back.
                                </p>

                            </article>


                            <article class="swiss-barber-review">

                                <div class="swiss-barber-review-top">

                                    <div class="swiss-barber-review-avatar">
                                        M
                                    </div>

                                    <div>
                                        <strong>Marco</strong>

                                        <div class="swiss-barber-review-stars">
                                            ★★★★★
                                        </div>
                                    </div>

                                </div>

                                <p>
                                    Very clean shop, friendly service and
                                    excellent haircut.
                                </p>

                            </article>


                            <article class="swiss-barber-review">

                                <div class="swiss-barber-review-top">

                                    <div class="swiss-barber-review-avatar">
                                        S
                                    </div>

                                    <div>
                                        <strong>Sam</strong>

                                        <div class="swiss-barber-review-stars">
                                            ★★★★★
                                        </div>
                                    </div>

                                </div>

                                <p>
                                    Easy booking and a great result. Highly
                                    recommended.
                                </p>

                            </article>

                        </div>

                    </section>

                </div>


                {{-- RIGHT BOOKING CARD --}}
                <aside class="swiss-barber-booking">

                    <div class="swiss-barber-booking-inner">

                        <span class="swiss-barber-section-label">
                            BOOK AN APPOINTMENT
                        </span>

                        <h2>
                            Make an appointment
                        </h2>

                        <p class="swiss-barber-booking-text">
                            Choose your preferred service and continue
                            to select an available time.
                        </p>


                        <div class="swiss-barber-booking-field">

                            <label for="booking-service">
                                Service
                            </label>

                            <select id="booking-service">
                                <option value="">
                                    Select a service
                                </option>

                                <option value="haircut">
                                    Haircut — CHF 30
                                </option>

                                <option value="beard">
                                    Beard Trim — CHF 20
                                </option>

                                <option value="haircut-beard">
                                    Haircut + Beard — CHF 45
                                </option>

                                <option value="kids">
                                    Kids Haircut — CHF 25
                                </option>
                            </select>

                        </div>


                        <div class="swiss-barber-booking-field">

                            <label for="booking-date">
                                Date
                            </label>

                            <input
                                type="date"
                                id="booking-date"
                            >

                        </div>


                        <div class="swiss-barber-booking-field">

                            <label for="booking-time">
                                Time
                            </label>

                            <select id="booking-time" name="booking_time">

                                <option value="">
                                    Select a time
                                </option>

                                <option value="09:00">09:00 AM</option>
                                <option value="09:30">09:30 AM</option>
                                <option value="10:00">10:00 AM</option>
                                <option value="10:30">10:30 AM</option>
                                <option value="11:00">11:00 AM</option>
                                <option value="11:30">11:30 AM</option>
                                <option value="12:00">12:00 PM</option>
                                <option value="12:30">12:30 PM</option>
                                <option value="13:00">01:00 PM</option>
                                <option value="13:30">01:30 PM</option>
                                <option value="14:00">02:00 PM</option>
                                <option value="14:30">02:30 PM</option>
                                <option value="15:00">03:00 PM</option>
                                <option value="15:30">03:30 PM</option>
                                <option value="16:00">04:00 PM</option>
                                <option value="16:30">04:30 PM</option>
                                <option value="17:00">05:00 PM</option>
                                <option value="17:30">05:30 PM</option>
                                <option value="18:00">06:00 PM</option>
                                <option value="18:30">06:30 PM</option>
                                <option value="19:00">07:00 PM</option>
                                <option value="19:30">07:30 PM</option>
                                <option value="20:00">08:00 PM</option>

                            </select>

                        </div>


                        <button
                            type="button"
                            class="swiss-barber-booking-button"
                        >
                            Continue booking
                            <span>→</span>
                        </button>


                        <p class="swiss-barber-booking-note">
                            No payment is required to request an appointment.
                        </p>

                    </div>

                </aside>

            </div>

        </div>

    </section>


    {{-- OTHER BARBERS --}}
    <section class="swiss-barber-other">

        <div class="swiss-barber-other-inner">

            <div class="swiss-barber-other-heading">

                <div>
                    <span class="swiss-barber-section-label">
                        DISCOVER MORE
                    </span>

                    <h2>
                        Other barbers
                    </h2>
                </div>

                <a href="{{ route('barbers.index') }}">
                    View all barbers →
                </a>

            </div>


            <div class="swiss-barber-other-grid">

                @foreach($barbers as $otherSlug => $otherBarber)

                    @if($otherSlug !== $slug)

                        <a
                            href="{{ route('barber.show', $otherSlug) }}"
                            class="swiss-barber-other-card"
                        >

                            <div class="swiss-barber-other-image">

                                <img
                                    src="{{ $otherBarber['image'] }}"
                                    alt="{{ $otherBarber['name'] }}"
                                >

                            </div>

                            <div class="swiss-barber-other-content">

                                <h3>
                                    {{ $otherBarber['name'] }}
                                </h3>

                                <p>
                                    {{ $otherBarber['city'] }}, Switzerland
                                </p>

                                <span>
                                    ★ {{ $otherBarber['rating'] }}
                                </span>

                            </div>

                        </a>

                    @endif

                @endforeach

            </div>

        </div>

    </section>

</section>

@endsection


@push('head')

<style>

.swiss-barber-detail {
    width: 100%;
    background: #ffffff;
    color: #171717;
}


/* =========================================================
   HERO
========================================================= */

.swiss-barber-detail-hero {
    position: relative;
    min-height: 520px;
    display: flex;
    align-items: flex-end;
    overflow: hidden;
    background: #000000;
}

.swiss-barber-detail-hero-image {
    position: absolute;
    inset: 0;
}

.swiss-barber-detail-hero-image img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    object-position: center center;
}

.swiss-barber-detail-hero-overlay {
    position: absolute;
    inset: 0;
    background:
        linear-gradient(
            180deg,
            rgba(0,0,0,.08) 0%,
            rgba(0,0,0,.28) 45%,
            rgba(0,0,0,.88) 100%
        );
}

.swiss-barber-detail-hero-content {
    position: relative;
    z-index: 2;
    width: min(1180px, calc(100% - 48px));
    margin: 0 auto;
    padding: 0 0 62px;
}

.swiss-barber-back {
    display: inline-flex;
    align-items: center;
    margin-bottom: 35px;
    color: #ffffff;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    opacity: .9;
    transition: opacity .2s ease;
}

.swiss-barber-back:hover {
    opacity: 1;
}

.swiss-barber-eyebrow {
    display: block;
    margin-bottom: 13px;
    color: #3b9668;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 2.5px;
}

.swiss-barber-detail-hero-content h1 {
    margin: 0 0 14px;
    color: #ffffff;
    font-size: clamp(42px, 6vw, 76px);
    line-height: 1;
    font-weight: 700;
    letter-spacing: -2px;
}

.swiss-barber-location {
    display: flex;
    align-items: center;
    gap: 9px;
    color: rgba(255,255,255,.85);
    font-size: 16px;
}

.swiss-barber-location-icon {
    color: #3b9668;
    font-size: 10px;
}

.swiss-barber-rating {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 20px;
    color: rgba(255,255,255,.82);
    font-size: 14px;
}

.swiss-barber-stars {
    color: #3b9668;
    letter-spacing: 2px;
    font-size: 15px;
}

.swiss-barber-rating strong {
    color: #ffffff;
    font-size: 15px;
}

.swiss-barber-review-divider {
    opacity: .45;
}


/* =========================================================
   MAIN
========================================================= */

.swiss-barber-detail-main {
    padding: 75px 24px 90px;
    background: #ffffff;
}

.swiss-barber-detail-container {
    width: min(1180px, 100%);
    margin: 0 auto;
}

.swiss-barber-detail-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 380px;
    gap: 32px;
    align-items: start;
}

.swiss-barber-detail-left {
    display: flex;
    flex-direction: column;
    gap: 28px;
}


/* =========================================================
   CARDS
========================================================= */

.swiss-barber-detail-card {
    padding: 34px;
    border: 1px solid #dedede;
    background: #ffffff;
}

.swiss-barber-section-label {
    display: block;
    margin-bottom: 9px;
    color: #3b9668;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
}

.swiss-barber-detail-card h2,
.swiss-barber-card-heading h2 {
    margin: 0;
    color: #171717;
    font-size: 29px;
    line-height: 1.15;
    font-weight: 650;
    letter-spacing: -.6px;
}

.swiss-barber-detail-card > p {
    max-width: 700px;
    margin: 18px 0 0;
    color: #626262;
    font-size: 15px;
    line-height: 1.8;
}


/* =========================================================
   ADDRESS
========================================================= */

.swiss-barber-address {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-top: 27px;
    padding: 18px 20px;
    background: #f7faf8;
    border: 1px solid #e1ebe5;
}

.swiss-barber-address-icon {
    color: #3b9668;
    font-size: 10px;
    margin-top: 5px;
}

.swiss-barber-address div {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.swiss-barber-address strong {
    color: #222;
    font-size: 14px;
}

.swiss-barber-address span:last-child {
    color: #727272;
    font-size: 14px;
}


/* =========================================================
   CARD HEADING
========================================================= */

.swiss-barber-card-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 27px;
}

.swiss-barber-review-summary {
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    color: #222;
}

.swiss-barber-review-summary span {
    color: #3b9668;
}

.swiss-barber-review-summary strong {
    font-size: 15px;
}


/* =========================================================
   SERVICES
========================================================= */

.swiss-barber-services {
    display: flex;
    flex-direction: column;
}

.swiss-barber-service {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 20px 0;
    border-top: 1px solid #e9e9e9;
}

.swiss-barber-service:first-child {
    border-top: 0;
    padding-top: 0;
}

.swiss-barber-service:last-child {
    padding-bottom: 0;
}

.swiss-barber-service h3 {
    margin: 0 0 5px;
    color: #222;
    font-size: 16px;
    font-weight: 650;
}

.swiss-barber-service p {
    margin: 0;
    color: #858585;
    font-size: 13px;
}

.swiss-barber-service-right {
    display: flex;
    align-items: center;
    gap: 18px;
}

.swiss-barber-service-right strong {
    color: #222;
    font-size: 14px;
    white-space: nowrap;
}

.swiss-barber-service-button {
    min-width: 76px;
    height: 38px;
    padding: 0 15px;
    border: 1px solid #3b9668;
    background: #ffffff;
    color: #3b9668;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all .2s ease;
}

.swiss-barber-service-button:hover {
    background: #3b9668;
    color: #ffffff;
}


/* =========================================================
   REVIEWS
========================================================= */

.swiss-barber-reviews {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
}

.swiss-barber-review {
    padding: 20px;
    background: #f8f9f8;
    border: 1px solid #e7e9e8;
}

.swiss-barber-review-top {
    display: flex;
    align-items: center;
    gap: 11px;
}

.swiss-barber-review-avatar {
    width: 38px;
    height: 38px;
    flex: 0 0 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: #3b9668;
    color: #ffffff;
    font-size: 13px;
    font-weight: 700;
}

.swiss-barber-review-top strong {
    display: block;
    color: #252525;
    font-size: 14px;
}

.swiss-barber-review-stars {
    margin-top: 3px;
    color: #3b9668;
    font-size: 11px;
    letter-spacing: 1px;
}

.swiss-barber-review p {
    margin: 16px 0 0;
    color: #686868;
    font-size: 13px;
    line-height: 1.7;
}


/* =========================================================
   BOOKING SIDEBAR
========================================================= */

.swiss-barber-booking {
    position: sticky;
    top: 25px;
}

.swiss-barber-booking-inner {
    padding: 32px;
    border: 1px solid #dfe6e2;
    background: #f8fbf9;
}

.swiss-barber-booking h2 {
    margin: 0;
    color: #171717;
    font-size: 28px;
    line-height: 1.2;
    letter-spacing: -.5px;
}

.swiss-barber-booking-text {
    margin: 14px 0 27px;
    color: #707070;
    font-size: 14px;
    line-height: 1.7;
}

.swiss-barber-booking-field {
    margin-bottom: 18px;
}

.swiss-barber-booking-field label {
    display: block;
    margin-bottom: 8px;
    color: #252525;
    font-size: 13px;
    font-weight: 600;
}

.swiss-barber-booking-field input,
.swiss-barber-booking-field select {
    width: 100%;
    height: 48px;
    box-sizing: border-box;
    padding: 0 13px;
    border: 1px solid #d4ddd8;
    border-radius: 0;
    outline: none;
    background: #ffffff;
    color: #222;
    font-family: inherit;
    font-size: 14px;
}

.swiss-barber-booking-field input:focus,
.swiss-barber-booking-field select:focus {
    border-color: #3b9668;
    box-shadow: 0 0 0 3px rgba(59,150,104,.09);
}

.swiss-barber-booking-button {
    width: 100%;
    min-height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    margin-top: 7px;
    border: 1px solid #3b9668;
    background: #3b9668;
    color: #ffffff;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background .2s ease;
}

.swiss-barber-booking-button:hover {
    background: #2d8056;
    border-color: #2d8056;
}

.swiss-barber-booking-button span {
    font-size: 18px;
}

.swiss-barber-booking-note {
    margin: 15px 0 0;
    color: #8a8a8a;
    text-align: center;
    font-size: 11px;
    line-height: 1.6;
}


/* =========================================================
   OTHER BARBERS
========================================================= */

.swiss-barber-other {
    padding: 80px 24px 100px;
    background: #f6f7f6;
    border-top: 1px solid #e8e8e8;
}

.swiss-barber-other-inner {
    width: min(1180px, 100%);
    margin: 0 auto;
}

.swiss-barber-other-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 30px;
    margin-bottom: 30px;
}

.swiss-barber-other-heading h2 {
    margin: 0;
    color: #171717;
    font-size: 34px;
    line-height: 1.1;
    letter-spacing: -.8px;
}

.swiss-barber-other-heading > a {
    color: #3b9668;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
}

.swiss-barber-other-heading > a:hover {
    text-decoration: underline;
}

.swiss-barber-other-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 22px;
}

.swiss-barber-other-card {
    display: block;
    overflow: hidden;
    border: 1px solid #dedede;
    background: #ffffff;
    color: inherit;
    text-decoration: none;
    transition:
        transform .2s ease,
        box-shadow .2s ease;
}

.swiss-barber-other-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 30px rgba(0,0,0,.08);
}

.swiss-barber-other-image {
    height: 220px;
    overflow: hidden;
    background: #eeeeee;
}

.swiss-barber-other-image img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    object-position: center;
    transform: none;
}

.swiss-barber-other-content {
    padding: 20px;
}

.swiss-barber-other-content h3 {
    margin: 0 0 7px;
    color: #202020;
    font-size: 17px;
}

.swiss-barber-other-content p {
    margin: 0 0 10px;
    color: #7b7b7b;
    font-size: 13px;
}

.swiss-barber-other-content span {
    color: #3b9668;
    font-size: 13px;
    font-weight: 600;
}


/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 1000px) {

    .swiss-barber-detail-grid {
        grid-template-columns: 1fr;
    }

    .swiss-barber-booking {
        position: static;
    }

    .swiss-barber-booking-inner {
        max-width: 620px;
    }

    .swiss-barber-reviews {
        grid-template-columns: 1fr;
    }

}


@media (max-width: 760px) {

    .swiss-barber-detail-hero {
        min-height: 470px;
    }

    .swiss-barber-detail-hero-content {
        width: min(100% - 32px, 1180px);
        padding-bottom: 42px;
    }

    .swiss-barber-detail-hero-content h1 {
        font-size: 46px;
        letter-spacing: -1.5px;
    }

    .swiss-barber-detail-main {
        padding: 50px 16px 65px;
    }

    .swiss-barber-detail-card {
        padding: 25px 20px;
    }

    .swiss-barber-detail-card h2,
    .swiss-barber-card-heading h2 {
        font-size: 25px;
    }

    .swiss-barber-service {
        align-items: flex-start;
        flex-direction: column;
    }

    .swiss-barber-service-right {
        width: 100%;
        justify-content: space-between;
    }

    .swiss-barber-booking-inner {
        padding: 25px 20px;
    }

    .swiss-barber-other {
        padding: 60px 16px 70px;
    }

    .swiss-barber-other-heading {
        align-items: flex-start;
        flex-direction: column;
        gap: 15px;
    }

    .swiss-barber-other-heading h2 {
        font-size: 29px;
    }

    .swiss-barber-other-grid {
        grid-template-columns: 1fr;
    }

    .swiss-barber-other-image {
        height: 230px;
    }

}


@media (max-width: 480px) {

    .swiss-barber-detail-hero {
        min-height: 430px;
    }

    .swiss-barber-detail-hero-content h1 {
        font-size: 39px;
    }

    .swiss-barber-rating {
        gap: 6px;
        font-size: 13px;
    }

    .swiss-barber-review-divider {
        display: none;
    }

    .swiss-barber-card-heading {
        align-items: flex-start;
        flex-direction: column;
    }

    .swiss-barber-service-right {
        align-items: center;
    }

}

</style>

@endpush

@push('head')
<style>

.swiss-barber-detail-main {
    padding: 90px 28px 110px !important;
}

.swiss-barber-detail-container {
    width: min(1240px, 100%) !important;
}

.swiss-barber-detail-grid {
    grid-template-columns: minmax(0, 1fr) 430px !important;
    gap: 42px !important;
}

.swiss-barber-detail-left {
    gap: 34px !important;
}

.swiss-barber-detail-card {
    padding: 42px !important;
    border: 1px solid #dcdedc !important;
}

.swiss-barber-detail-card h2,
.swiss-barber-card-heading h2 {
    font-size: 32px !important;
    line-height: 1.2 !important;
    font-weight: 600 !important;
}

.swiss-barber-detail-card > p {
    max-width: 760px !important;
    margin-top: 20px !important;
    font-size: 16px !important;
    line-height: 1.8 !important;
    color: #5f6662 !important;
}

.swiss-barber-address {
    margin-top: 30px !important;
    padding: 21px 23px !important;
}

.swiss-barber-address strong {
    font-size: 15px !important;
}

.swiss-barber-address span:last-child {
    font-size: 14px !important;
}


/* SERVICES */

.swiss-barber-card-heading {
    margin-bottom: 32px !important;
}

.swiss-barber-service {
    min-height: 78px !important;
    padding: 23px 0 !important;
}

.swiss-barber-service h3 {
    font-size: 17px !important;
    margin-bottom: 7px !important;
}

.swiss-barber-service p {
    font-size: 14px !important;
}

.swiss-barber-service-right {
    gap: 22px !important;
}

.swiss-barber-service-right strong {
    font-size: 15px !important;
}

.swiss-barber-service-button {
    min-width: 88px !important;
    height: 42px !important;
    padding: 0 18px !important;
    font-size: 13px !important;
}


/* BOOKING */

.swiss-barber-booking {
    top: 30px !important;
}

.swiss-barber-booking-inner {
    padding: 38px !important;
    border: 1px solid #d5ded9 !important;
    background: #f7faf8 !important;
    box-shadow: 0 12px 35px rgba(25, 50, 38, .06) !important;
}

.swiss-barber-booking h2 {
    margin-top: 2px !important;
    font-size: 32px !important;
    line-height: 1.2 !important;
    font-weight: 600 !important;
}

.swiss-barber-booking-text {
    margin: 17px 0 31px !important;
    font-size: 15px !important;
    line-height: 1.75 !important;
    color: #68736d !important;
}

.swiss-barber-booking-field {
    margin-bottom: 22px !important;
}

.swiss-barber-booking-field label {
    margin-bottom: 9px !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    color: #222a26 !important;
}

.swiss-barber-booking-field input,
.swiss-barber-booking-field select {
    height: 54px !important;
    padding: 0 15px !important;
    border: 1px solid #cbd6d0 !important;
    background: #ffffff !important;
    font-size: 14px !important;
}

.swiss-barber-booking-field input:hover,
.swiss-barber-booking-field select:hover {
    border-color: #9eb7aa !important;
}

.swiss-barber-booking-button {
    min-height: 56px !important;
    margin-top: 10px !important;
    font-size: 15px !important;
    font-weight: 600 !important;
    letter-spacing: .1px !important;
}

.swiss-barber-booking-button span {
    font-size: 20px !important;
}

.swiss-barber-booking-note {
    margin-top: 17px !important;
    font-size: 12px !important;
}


/* REVIEWS */

.swiss-barber-reviews {
    gap: 20px !important;
}

.swiss-barber-review {
    padding: 24px !important;
}

.swiss-barber-review-top strong {
    font-size: 15px !important;
}

.swiss-barber-review p {
    margin-top: 18px !important;
    font-size: 14px !important;
}


/* OTHER BARBERS */

.swiss-barber-other {
    padding: 95px 28px 110px !important;
}

.swiss-barber-other-inner {
    width: min(1240px, 100%) !important;
}

.swiss-barber-other-heading {
    margin-bottom: 38px !important;
}

.swiss-barber-other-heading h2 {
    font-size: 38px !important;
    font-weight: 600 !important;
}

.swiss-barber-other-grid {
    gap: 28px !important;
}

.swiss-barber-other-image {
    height: 250px !important;
}

.swiss-barber-other-content {
    padding: 24px !important;
}

.swiss-barber-other-content h3 {
    font-size: 19px !important;
}


/* TABLET */

@media (max-width: 1000px) {

    .swiss-barber-detail-grid {
        grid-template-columns: 1fr !important;
    }

    .swiss-barber-booking {
        position: static !important;
    }

    .swiss-barber-booking-inner {
        max-width: none !important;
    }

}


/* MOBILE */

@media (max-width: 760px) {

    .swiss-barber-detail-main {
        padding: 55px 16px 70px !important;
    }

    .swiss-barber-detail-card {
        padding: 28px 22px !important;
    }

    .swiss-barber-detail-card h2,
    .swiss-barber-card-heading h2 {
        font-size: 27px !important;
    }

    .swiss-barber-booking-inner {
        padding: 30px 22px !important;
    }

    .swiss-barber-booking h2 {
        font-size: 28px !important;
    }

    .swiss-barber-booking-field input,
    .swiss-barber-booking-field select {
        height: 52px !important;
    }

    .swiss-barber-service {
        min-height: auto !important;
        padding: 22px 0 !important;
    }

    .swiss-barber-service-right {
        width: 100% !important;
    }

}

</style>
@endpush


<style>

.swiss-barber-booking-inner {
    padding: 32px !important;
    border: 1px solid #dce5e0 !important;
    background: #f9fbfa !important;
    box-shadow: 0 8px 24px rgba(20, 45, 32, 0.045) !important;
}

.swiss-barber-booking h2 {
    font-size: 28px !important;
    font-weight: 600 !important;
    color: #202522 !important;
    letter-spacing: -0.4px !important;
}

.swiss-barber-booking-text {
    color: #737b76 !important;
    font-size: 14px !important;
    line-height: 1.65 !important;
}

.swiss-barber-booking-field {
    margin-bottom: 17px !important;
}

.swiss-barber-booking-field label {
    color: #303632 !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    margin-bottom: 7px !important;
}

.swiss-barber-booking-field input,
.swiss-barber-booking-field select {
    height: 48px !important;
    border: 1px solid #d5ded9 !important;
    border-radius: 5px !important;
    background: #ffffff !important;
    color: #303632 !important;
    transition: border-color .2s ease, box-shadow .2s ease !important;
}

.swiss-barber-booking-field input:hover,
.swiss-barber-booking-field select:hover {
    border-color: #b6c9be !important;
}

.swiss-barber-booking-field input:focus,
.swiss-barber-booking-field select:focus {
    border-color: #3b9668 !important;
    box-shadow: 0 0 0 3px rgba(59,150,104,.08) !important;
}

.swiss-barber-booking-button {
    height: 50px !important;
    min-height: 50px !important;
    border-radius: 5px !important;
    background: #3b9668 !important;
    border-color: #3b9668 !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    box-shadow: 0 5px 12px rgba(59,150,104,.12) !important;
}

.swiss-barber-booking-button:hover {
    background: #32875d !important;
    border-color: #32875d !important;
}

.swiss-barber-booking-note {
    color: #8a918d !important;
    font-size: 11px !important;
}

</style>



<style>

.swiss-barber-service-right {
    gap: 0 !important;
}

.swiss-barber-service-right strong {
    min-width: 65px;
    text-align: right;
}

</style>


