@extends('layouts.app')

@section('title', 'Register Information - Swiss Barber')

@section('content')

<style>
    /* =========================================================
       REGISTER INFORMATION PAGE
       Existing image paths preserved exactly
    ========================================================= */

    .kk-register-page {
        width: 100%;
        overflow: hidden;
        background: #ffffff;
        font-family: "DM Sans", Arial, sans-serif;
    }

    /* =========================================================
       HERO
    ========================================================= */

    .kk-register-hero {
        width: 100%;
        min-height: 535px;
        background: #000000;
        color: #ffffff;
        display: flex;
        align-items: center;
    }

    .kk-register-hero-inner {
        width: min(1078px, calc(100% - 48px));
        margin: 0 auto;
        display: grid;
        grid-template-columns: 1fr 1fr;
        align-items: center;
        gap: 70px;
        padding: 65px 0;
    }

    .kk-register-hero-copy {
        max-width: 510px;
    }

    .kk-register-hero-copy h1 {
        margin: 0 0 24px;
        font-size: 47px;
        line-height: 1.08;
        letter-spacing: -1.5px;
        font-weight: 500;
        color: #ffffff;
    }

    .kk-register-hero-copy p {
        margin: 0 0 28px;
        font-size: 15px;
        line-height: 1.65;
        color: #eeeeee;
        font-weight: 400;
    }

    .kk-register-hero-copy ul {
        list-style: none;
        margin: 0 0 34px;
        padding: 0;
    }

    .kk-register-hero-copy li {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 13px;
        color: #ffffff;
        font-size: 15px;
        line-height: 1.4;
    }

    .kk-register-hero-copy li span {
        width: 21px;
        height: 21px;
        border-radius: 50%;
        background: #3b9668;
        color: #ffffff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 700;
        flex-shrink: 0;
    }

    .kk-register-start-button {
        width: 390px;
        max-width: 100%;
        min-height: 57px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;

        background: #3b9668;
        color: #ffffff;
        border: 1px solid #3b9668;
        text-decoration: none;

        font-size: 15px;
        font-weight: 500;

        transition:
            background 0.25s ease,
            border-color 0.25s ease,
            transform 0.25s ease;
    }

    .kk-register-start-button:hover {
        background: #2d8056;
        border-color: #2d8056;
        color: #ffffff;
        transform: translateY(-2px);
    }

    .kk-register-hero-visual {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .kk-register-hero-visual img {
        display: block;
        width: 100%;
        max-width: 540px;
        height: auto;
        object-fit: contain;
    }


    /* =========================================================
       FEATURES
    ========================================================= */

    .kk-register-features {
        width: 100%;
        background:
            radial-gradient(
                circle at 50% 0%,
                rgba(59, 150, 104, 0.08),
                transparent 42%
            ),
            #f8fcfa;

        padding: 88px 0 96px;
    }

    .kk-register-features-inner {
        width: min(1078px, calc(100% - 48px));
        margin: 0 auto;
    }

    .kk-register-features-heading {
        text-align: center;
        margin-bottom: 60px;
    }

    .kk-register-features-label {
        margin: 0 0 12px;
        color: #3b9668;
        font-size: 12px;
        line-height: 1;
        font-weight: 700;
        letter-spacing: 2.5px;
        text-transform: uppercase;
    }

    .kk-register-features h2 {
        margin: 0;
        color: #162d45;
        font-size: 38px;
        line-height: 1.15;
        letter-spacing: -0.8px;
        font-weight: 500;
    }

    .kk-register-features h2 span {
        color: #3b9668;
    }

    .kk-register-features-subtitle {
        max-width: 650px;
        margin: 15px auto 0;
        color: #6c7d91;
        font-size: 15px;
        line-height: 1.7;
        text-align: center;
    }

    .kk-register-features-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
    }

    .kk-register-feature {
        position: relative;
        min-height: 278px;
        box-sizing: border-box;

        background: rgba(255, 255, 255, 0.96);
        border: 1px solid #d7ebe2;
        border-radius: 18px;

        padding: 28px 25px 27px;

        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;

        box-shadow: 0 12px 35px rgba(22, 45, 69, 0.045);

        transition:
            transform 0.3s ease,
            box-shadow 0.3s ease,
            border-color 0.3s ease;
    }

    .kk-register-feature::before {
        content: "";
        position: absolute;
        top: -1px;
        left: 50%;
        width: 43px;
        height: 3px;
        transform: translateX(-50%);
        background: #3b9668;
        border-radius: 0 0 4px 4px;
    }

    .kk-register-feature:hover {
        transform: translateY(-6px);
        border-color: #b8dfcf;
        box-shadow: 0 20px 45px rgba(22, 45, 69, 0.09);
    }

    /* IMAGE HOLDER */

    .kk-register-feature > img {
        width: 100px;
        height: 100px;
        object-fit: contain;
        object-position: center;
        display: block;

        padding: 9px;
        box-sizing: border-box;

        border-radius: 50%;
        border: 1px solid #cceee0;

        background:
            radial-gradient(
                circle,
                #ffffff 0%,
                #f7fcfa 63%,
                #eaf8f2 100%
            );

        box-shadow:
            0 0 0 7px rgba(59, 150, 104, 0.035),
            inset 0 0 0 1px rgba(59, 150, 104, 0.04);

        margin: 0 auto 21px;
    }

    .kk-register-feature > img {
    width: 100px !important;
    height: 100px !important;
    max-width: 100px !important;
    max-height: 100px !important;

    object-fit: contain !important;
    object-position: center center !important;

    display: block !important;
    box-sizing: border-box !important;

    padding: 9px !important;

    border-radius: 50% !important;
    border: 1px solid #cceee0 !important;

    background:
        radial-gradient(
            circle,
            #ffffff 0%,
            #f7fcfa 63%,
            #eaf8f2 100%
        ) !important;

    box-shadow:
        0 0 0 7px rgba(59, 150, 104, 0.035),
        inset 0 0 0 1px rgba(59, 150, 104, 0.04) !important;

    margin: 0 auto 21px !important;

    transform: none !important;
}

    .kk-register-feature h3 {
        margin: 0 0 11px;
        color: #172f49;
        font-size: 20px;
        line-height: 1.25;
        font-weight: 600;
        letter-spacing: -0.2px;
    }

    .kk-register-feature p {
        margin: 0;
        max-width: 295px;
        color: #687b91;
        font-size: 14px;
        line-height: 1.65;
        font-weight: 400;
    }

    .kk-register-feature::after {
        content: "";
        width: 43px;
        height: 4px;
        margin-top: auto;
        margin-bottom: 0;
        background: #3b9668;
        border-radius: 5px;
    }


    /* =========================================================
       OVERVIEW
    ========================================================= */

    .kk-register-overview {
        width: 100%;
        background: #ffffff;
        padding: 88px 0 100px;
    }

    .kk-register-overview-inner {
        width: min(1078px, calc(100% - 48px));
        margin: 0 auto;
    }

    .kk-register-overview-heading {
        text-align: center;
        margin-bottom: 52px;
    }

    .kk-register-overview h2 {
        margin: 0;
        color: #162d45;
        font-size: 38px;
        line-height: 1.15;
        font-weight: 500;
        letter-spacing: -0.8px;
    }

    .kk-register-overview-subtitle {
        margin: 13px 0 0;
        color: #7a8795;
        font-size: 15px;
        line-height: 1.6;
        text-align: center;
    }

    .kk-register-overview-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 25px;
    }

    .kk-register-overview-card {
        text-align: center;
    }

    .kk-register-overview-image {
        width: 100%;
        height: 248px;
        background: #f5f7f7;
        border: 1px solid #e1e7e5;
        overflow: hidden;
        margin-bottom: 24px;
    }

    .kk-register-overview-image img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
    }

    .kk-register-overview-card h3 {
        margin: 0 0 10px;
        color: #172f49;
        font-size: 20px;
        line-height: 1.3;
        font-weight: 600;
    }

    .kk-register-overview-card p {
        margin: 0;
        color: #6c7d91;
        font-size: 14px;
        line-height: 1.65;
    }


    /* =========================================================
       RESPONSIVE
    ========================================================= */

    @media (max-width: 1000px) {

        .kk-register-hero-inner {
            grid-template-columns: 1fr;
            gap: 45px;
            padding: 70px 0;
        }

        .kk-register-hero-copy {
            max-width: 650px;
            margin: 0 auto;
            text-align: center;
        }

        .kk-register-hero-copy ul {
            display: inline-block;
            text-align: left;
        }

        .kk-register-hero-visual {
            max-width: 650px;
            margin: 0 auto;
        }

        .kk-register-features-grid,
        .kk-register-overview-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }


    @media (max-width: 700px) {

        .kk-register-hero {
            min-height: auto;
        }

        .kk-register-hero-inner,
        .kk-register-features-inner,
        .kk-register-overview-inner {
            width: min(100% - 32px, 560px);
        }

        .kk-register-hero-inner {
            padding: 58px 0 65px;
        }

        .kk-register-hero-copy h1 {
            font-size: 38px;
            line-height: 1.1;
            letter-spacing: -0.8px;
        }

        .kk-register-hero-copy p {
            font-size: 14px;
        }

        .kk-register-start-button {
            width: 100%;
        }

        .kk-register-features,
        .kk-register-overview {
            padding: 65px 0 70px;
        }

        .kk-register-features h2,
        .kk-register-overview h2 {
            font-size: 31px;
        }

        .kk-register-features-grid,
        .kk-register-overview-grid {
            grid-template-columns: 1fr;
        }

        .kk-register-feature {
            min-height: 280px;
        }

        .kk-register-overview-image {
            height: auto;
            aspect-ratio: 1.45 / 1;
        }
    }


    @media (max-width: 480px) {

        .kk-register-hero-copy h1 {
            font-size: 32px;
        }

        .kk-register-features h2,
        .kk-register-overview h2 {
            font-size: 27px;
        }

        .kk-register-feature {
            padding: 27px 20px;
        }

        .kk-register-feature > img {
            width: 92px;
            height: 92px;
        }

    }

    .kk-register-video-section {
        width: 100%;
        background: #ffffff;
        padding: 82px 0 90px;
    }

    .kk-register-video-inner {
        width: min(1078px, calc(100% - 48px));
        margin: 0 auto;
    }

    .kk-register-video-inner h2 {
        max-width: 760px;
        margin: 0 auto 44px;
        color: #454545;
        font-size: 34px;
        line-height: 1.2;
        font-weight: 600;
        text-align: center;
    }

    .kk-register-video-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 24px;
    }

    .kk-register-video-card {
        min-width: 0;
        text-align: center;
    }

    .kk-register-video-media {
        position: relative;
        width: 100%;
        aspect-ratio: 16 / 9;
        margin-bottom: 22px;
        overflow: hidden;
        border-radius: 6px;
        background: #f3f6f4;
    }

    .kk-register-video-media img,
    .kk-register-video-media iframe {
        position: absolute;
        inset: 0;
        display: block;
        width: 100%;
        height: 100%;
        border: 0;
        object-fit: cover;
    }

    .kk-register-video-play {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        pointer-events: none;
    }

    .kk-register-video-play span {
        width: 64px;
        height: 64px;
        display: grid;
        place-items: center;
        padding-left: 4px;
        border-radius: 50%;
        background: #ffffff;
        color: #3b9668;
        font-size: 21px;
        line-height: 1;
        box-shadow: 0 5px 18px rgba(22, 45, 69, 0.18);
    }

    .kk-register-video-content h3 {
        margin: 0 0 10px;
        color: #172f49;
        font-size: 19px;
        line-height: 1.3;
        font-weight: 600;
    }

    .kk-register-video-content p {
        margin: 0;
        color: #687b91;
        font-size: 14px;
        line-height: 1.65;
    }

    @media (max-width: 1000px) {
        .kk-register-video-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
    }

    @media (max-width: 700px) {
        .kk-register-video-section {
            padding: 65px 0 70px;
        }

        .kk-register-video-inner {
            width: min(100% - 32px, 560px);
        }

        .kk-register-video-inner h2 {
            margin-bottom: 34px;
            font-size: 30px;
        }

        .kk-register-video-grid {
            grid-template-columns: 1fr;
            gap: 32px;
        }
    }
</style>


<div class="kk-register-page">

    {{-- =====================================================
         HERO
    ====================================================== --}}

    <section class="kk-register-hero">

        <div class="kk-register-hero-inner">

            <div class="kk-register-hero-copy">

                <h1>
                    You do the haircuts?<br>
                    We handle the<br>
                    appointments.
                </h1>

                <p>
                    Let clients book online 24/7, reduce no-shows, and save<br>
                    time with automatic reminders.
                </p>

                <ul>
                    <li>
                        <span>✓</span>
                        No commission fees
                    </li>

                    <li>
                        <span>✓</span>
                        Cancel anytime
                    </li>

                    <li>
                        <span>✓</span>
                        Set up in under 5 minutes
                    </li>
                </ul>

                <a href="{{ route('register') }}" class="kk-register-start-button">
                    Start today for EUR 29
                </a>

            </div>


            <div class="kk-register-hero-visual">

                <img
                    src="/images/register-info/hero-dashboard.png"
                    alt="Swiss Barber barber appointment dashboard"
                >

            </div>

        </div>

    </section>


    {{-- =====================================================
         FEATURES
    ====================================================== --}}

    <section class="kk-register-features">

        <div class="kk-register-features-inner">

            <div class="kk-register-features-heading">

                <p class="kk-register-features-label">
                    FEATURES
                </p>

                <h2>
                    Everything you need in <span>one system</span>
                </h2>

                <p class="kk-register-features-subtitle">
                    Swiss Barber gives you all the tools to run your
                    barbershop smoothly and professionally.
                </p>

            </div>


            <div class="kk-register-features-grid">


                {{-- 01 --}}

                <article class="kk-register-feature">

                    <img
                        src="/images/register-info/icon-reduce-noshow.png"
                        alt="Reduce no-shows"
                    >

                    <h3>
                        Reduce no-shows
                    </h3>

                    <p>
                        Clients automatically receive reminders,<br>
                        helping them remember their<br>
                        appointments.
                    </p>

                </article>


                {{-- 02 --}}

                <article class="kk-register-feature">

                    <img
                        src="/images/register-info/icon-recurring.png"
                        alt="Recurring appointments"
                    >

                    <h3>
                        Recurring appointments
                    </h3>

                    <p>
                        Set recurring appointments every 1, 2, 3, or<br>
                        4 weeks. They are scheduled automatically.
                    </p>

                </article>


                {{-- 03 --}}

                <article class="kk-register-feature">

                    <img
                        src="/images/register-info/icon-digibox.png"
                        alt="Digi-box"
                    >

                    <h3>
                        Digi-box
                    </h3>

                    <p>
                        Display clearly on your salon TV who is<br>
                        next.
                    </p>

                </article>


                {{-- 04 --}}

                <article class="kk-register-feature">

                    <img
                        src="/images/register-info/kiosk-fixed.png"
                        alt="Self-service kiosk"
                    >

                    <h3>
                        Self-service kiosk
                    </h3>

                    <p>
                        Let clients book their next appointment<br>
                        themselves using a touchscreen before<br>
                        leaving your salon.
                    </p>

                </article>


                {{-- 05 --}}

                <article class="kk-register-feature">

                    <img
                        src="/images/register-info/website-fixed.png"
                        alt="Your own website"
                    >

                    <h3>
                        Your own website
                    </h3>

                    <p>
                        Integrate Swiss Barber into your website or use<br>
                        your dedicated Swiss Barber booking page.
                    </p>

                </article>


                {{-- 06 --}}

                <article class="kk-register-feature">

                    <img
                        src="/images/register-info/security-fixed.png"
                        alt="Privacy and security"
                    >

                    <h3>
                        Privacy &amp; security
                    </h3>

                    <p>
                        Your data is encrypted, stored securely,<br>
                        and never shared with third parties.
                    </p>

                </article>


            </div>

        </div>

    </section>


    {{-- =====================================================
         SOUND FAMILIAR
    ====================================================== --}}

    <section class="kk-register-video-section">
        <div class="kk-register-video-inner">

            <h2>Sound familiar? These situations cost you time every day.</h2>

            <div class="kk-register-video-grid">

                <article class="kk-register-video-card">
                    <div class="kk-register-video-media">
                        <img
                            src="/images/register-info/overview-schedule.png"
                            alt="Barber schedule with appointments"
                        >
                        <div class="kk-register-video-play" aria-hidden="true">
                            <span>▶</span>
                        </div>
                    </div>
                    <div class="kk-register-video-content">
                        <h3>Phone calls during appointments</h3>
                        <p>You lose focus and your client notices.</p>
                    </div>
                </article>

                <article class="kk-register-video-card">
                    <div class="kk-register-video-media">
                        <img
                            src="/images/register-info/overview-booking.png"
                            alt="Online appointment booking screen"
                        >
                        <div class="kk-register-video-play" aria-hidden="true">
                            <span>▶</span>
                        </div>
                    </div>
                    <div class="kk-register-video-content">
                        <h3>Constant interruptions from messages</h3>
                        <p>Every interruption pulls you away from your work.</p>
                    </div>
                </article>

                <article class="kk-register-video-card">
                    <div class="kk-register-video-media">
                        <img
                            src="/images/register-info/overview-info.png"
                            alt="Appointment and client information screen"
                        >
                        <div class="kk-register-video-play" aria-hidden="true">
                            <span>▶</span>
                        </div>
                    </div>
                    <div class="kk-register-video-content">
                        <h3>A pile of messages after work</h3>
                        <p>Your work doesn’t stop when the last client leaves.</p>
                    </div>
                </article>

            </div>
        </div>
    </section>

    @include('components.reviews')


    {{-- =====================================================
         OVERVIEW
    ====================================================== --}}

    <section class="kk-register-overview">

        <div class="kk-register-overview-inner">

            <div class="kk-register-overview-heading">

                <h2>
                    Overview. Anytime, anywhere.
                </h2>

                <p class="kk-register-overview-subtitle">
                    Easy to use, powerful results.
                </p>

            </div>


            <div class="kk-register-overview-grid">


                {{-- Schedule --}}

                <article class="kk-register-overview-card">

                    <div class="kk-register-overview-image">

                        <img
                            src="/images/register-info/overview-schedule.png"
                            alt="Swiss Barber schedule overview"
                        >

                    </div>

                    <h3>
                        Always stay on top of your<br>
                        schedule
                    </h3>

                    <p>
                        See all your appointments, staff, and<br>
                        availability at a glance.
                    </p>

                </article>


                {{-- Booking --}}

                <article class="kk-register-overview-card">

                    <div class="kk-register-overview-image">

                        <img
                            src="/images/register-info/overview-booking.png"
                            alt="Swiss Barber online booking overview"
                        >

                    </div>

                    <h3>
                        Clients book online
                    </h3>

                    <p>
                        Clients can book online 24/7. Fewer phone<br>
                        calls, more appointments.
                    </p>

                </article>


                {{-- Client information --}}

                <article class="kk-register-overview-card">

                    <div class="kk-register-overview-image">

                        <img
                            src="/images/register-info/overview-info.png"
                            alt="Swiss Barber client information overview"
                        >

                    </div>

                    <h3>
                        All client information in one place
                    </h3>

                    <p>
                        View previous appointments, notes, and<br>
                        client preferences.
                    </p>

                </article>


            </div>

        </div>

    </section>

</div>

@endsection