@extends('layouts.app')

@section('title', 'Terms of Use - Swiss Barber')

@section('content')

<section class="swiss-legal-hero">
    <div class="swiss-legal-hero-inner">

        <span class="swiss-legal-eyebrow">
            SWISS BARBER
        </span>

        <h1>Terms of Use</h1>

        <p>
            Please read these terms carefully before using Swiss Barber.
        </p>

    </div>
</section>


<section class="swiss-legal-content">

    <div class="swiss-legal-container">

        <div class="swiss-legal-intro">

            <p class="swiss-legal-updated">
                Last updated: October 2026
            </p>

            <p>
                These Terms of Use explain the general terms and conditions
                that apply when you use the Swiss Barber website and
                appointment management services.
            </p>

        </div>


        <article class="swiss-legal-section">

            <span class="swiss-legal-number">
                01
            </span>

            <div>

                <h2>Acceptance of these terms</h2>

                <p>
                    By accessing or using Swiss Barber, you agree to comply
                    with these Terms of Use. If you do not agree with these
                    terms, please do not use the service.
                </p>

            </div>

        </article>


        <article class="swiss-legal-section">

            <span class="swiss-legal-number">
                02
            </span>

            <div>

                <h2>Using Swiss Barber</h2>

                <p>
                    Swiss Barber provides online appointment and
                    barbershop management functionality. Users are responsible
                    for providing accurate information when using the service.
                </p>

                <p>
                    You agree to use the service only for lawful purposes and
                    in a way that does not interfere with the operation or
                    security of the platform.
                </p>

            </div>

        </article>


        <article class="swiss-legal-section">

            <span class="swiss-legal-number">
                03
            </span>

            <div>

                <h2>Barbershop accounts</h2>

                <p>
                    Barbershop users are responsible for maintaining the
                    accuracy of their business information and for keeping
                    their account credentials secure.
                </p>

                <p>
                    You should not share account credentials with unauthorized
                    persons or use another person's account without permission.
                </p>

            </div>

        </article>


        <article class="swiss-legal-section">

            <span class="swiss-legal-number">
                04
            </span>

            <div>

                <h2>Appointments</h2>

                <p>
                    Swiss Barber provides tools that allow clients to make
                    appointments with participating barbershops.
                </p>

                <p>
                    Appointment availability, services, opening hours,
                    cancellations and other appointment conditions may depend
                    on the individual barbershop.
                </p>

            </div>

        </article>


        <article class="swiss-legal-section">

            <span class="swiss-legal-number">
                05
            </span>

            <div>

                <h2>Payments and subscriptions</h2>

                <p>
                    Where paid services or subscriptions are offered to
                    barbershops, the applicable price and payment conditions
                    will be presented during the relevant registration or
                    purchase process.
                </p>

                <p>
                    Any applicable cancellation or subscription conditions
                    will be communicated before the service is purchased.
                </p>

            </div>

        </article>


        <article class="swiss-legal-section">

            <span class="swiss-legal-number">
                06
            </span>

            <div>

                <h2>Intellectual property</h2>

                <p>
                    The Swiss Barber website, branding, design, software,
                    content and related materials are protected by applicable
                    intellectual property laws.
                </p>

                <p>
                    You may not copy, reproduce, modify, distribute or use
                    these materials without appropriate authorization.
                </p>

            </div>

        </article>


        <article class="swiss-legal-section">

            <span class="swiss-legal-number">
                07
            </span>

            <div>

                <h2>Availability of the service</h2>

                <p>
                    We aim to keep Swiss Barber available and functioning
                    reliably. However, temporary interruptions may occur due
                    to maintenance, technical problems, updates or circumstances
                    outside our control.
                </p>

            </div>

        </article>


        <article class="swiss-legal-section">

            <span class="swiss-legal-number">
                08
            </span>

            <div>

                <h2>Prohibited use</h2>

                <p>
                    You must not use Swiss Barber to engage in unlawful,
                    fraudulent, abusive or harmful activity, interfere with
                    the platform, attempt unauthorized access, or compromise
                    the security of the service.
                </p>

            </div>

        </article>


        <article class="swiss-legal-section">

            <span class="swiss-legal-number">
                09
            </span>

            <div>

                <h2>Changes to these terms</h2>

                <p>
                    These Terms of Use may be updated from time to time.
                    Updated terms will be published on this page together
                    with the relevant update date.
                </p>

            </div>

        </article>


        <article class="swiss-legal-section">

            <span class="swiss-legal-number">
                10
            </span>

            <div>

                <h2>Contact</h2>

                <p>
                    If you have questions about these Terms of Use, please
                    contact Swiss Barber through the
                    <a href="{{ route('contact') }}">
                        Contact
                    </a>
                    page.
                </p>

            </div>

        </article>


        <div class="swiss-legal-back">

            <a href="{{ route('home') }}">
                ← Back to Swiss Barber
            </a>

        </div>

    </div>

</section>

@endsection