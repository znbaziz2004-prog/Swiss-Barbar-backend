@extends('layouts.app')

@section('title', 'Information - Knipklok')

@section('content')

<div class="kk-info-page">

    {{-- HERO --}}
    <section class="kk-info-hero-new">
        <div class="kk-info-hero-decoration kk-info-circle-one"></div>
        <div class="kk-info-hero-decoration kk-info-circle-two"></div>

        <div class="kk-info-hero-content">
            <span class="kk-info-eyebrow">KNIPKLOK INFORMATION</span>

            <h1>Everything you need<br>to know.</h1>

            <p>
                Find answers, learn more about Knipklok,
                and get started with your barber booking journey.
            </p>
        </div>
    </section>


    {{-- GENERAL --}}
    <section class="kk-info-general">
        <div class="kk-info-container">

            <div class="kk-info-general-card">

                <div class="kk-info-general-content">

                    <span class="kk-info-label">GENERAL</span>

                    <h2>Simple barber appointments,<br>made easy.</h2>

                    <p>
                        Knipklok ensures that you can quickly and easily
                        make an appointment at your local barber.
                        You can make an appointment whenever you like.
                        With a few clicks you can see all available dates
                        and times.
                    </p>

                    <div class="kk-info-general-contact">
                        <strong>Is your barber not among them?</strong>

                        <a href="{{ route('contact') }}">
                            Contact us
                            <span>→</span>
                        </a>

                        <p>
                            And we will arrange it!
                        </p>
                    </div>

                </div>

                <div class="kk-info-general-visual">

                    <div class="kk-info-visual-circle">
                        <div class="kk-info-calendar">
                            <span class="kk-calendar-top"></span>
                            <span class="kk-calendar-line"></span>
                            <span class="kk-calendar-line short"></span>

                            <div class="kk-calendar-grid">
                                <i></i>
                                <i></i>
                                <i></i>
                                <i></i>
                                <i></i>
                                <i></i>
                            </div>

                            <div class="kk-calendar-check">✓</div>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    </section>


    {{-- QUICK INFORMATION --}}
    <section class="kk-info-options">

        <div class="kk-info-container">

            <div class="kk-info-section-heading">
                <span>QUICK INFORMATION</span>
                <h2>Choose what you need.</h2>
            </div>


            <div class="kk-info-options-grid">

                {{-- BARBERS --}}
                <article class="kk-info-option-card">

                    <div class="kk-info-option-icon">
                        <span class="kk-info-icon-scissors">✂</span>
                    </div>

                    <span class="kk-info-option-number">01</span>

                    <h3>Barbers</h3>

                    <p>
                        Are you a barber and do you want
                        more information?
                    </p>

                    <a href="{{ route('register-info') }}">
                        Click here for more info
                        <span>→</span>
                    </a>

                </article>


                {{-- REGISTER --}}
                <article class="kk-info-option-card">

                    <div class="kk-info-option-icon">
                        <span class="kk-info-icon-plus">+</span>
                    </div>

                    <span class="kk-info-option-number">02</span>

                    <h3>Register</h3>

                    <p>
                        Do you want to register your
                        barbershop directly?
                    </p>

                    <a href="{{ route('register-info') }}">
                        Click here to register your shop
                        <span>→</span>
                    </a>

                </article>


                {{-- FAQ --}}
                <article class="kk-info-option-card">

                    <div class="kk-info-option-icon">
                        <span class="kk-info-icon-question">?</span>
                    </div>

                    <span class="kk-info-option-number">03</span>

                    <h3>FAQ</h3>

                    <p>
                        Do you have any question?
                    </p>

                    <a href="{{ route('contact') }}#faq">
                        Click here for the FAQ
                        <span>→</span>
                    </a>

                </article>

            </div>

        </div>

    </section>


    {{-- CTA --}}
    <section class="kk-info-cta">

        <div class="kk-info-cta-shape kk-info-cta-shape-one"></div>
        <div class="kk-info-cta-shape kk-info-cta-shape-two"></div>

        <div class="kk-info-cta-inner">

            <span class="kk-info-eyebrow">NEED HELP?</span>

            <h2>
                Still have a question?
            </h2>

            <p>
                We're happy to help. Get in touch with the Knipklok team.
            </p>

            <a href="{{ route('contact') }}" class="kk-info-cta-button">
                Contact us
                <span>→</span>
            </a>

        </div>

    </section>

</div>

@endsection