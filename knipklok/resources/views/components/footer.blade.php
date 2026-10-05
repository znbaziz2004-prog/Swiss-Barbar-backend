<footer class="swiss-footer">

    <div class="swiss-footer-inner">

        {{-- Brand --}}
        <div class="swiss-footer-brand">

            <a href="{{ route('home') }}" class="swiss-footer-logo">
                Swiss Barber
            </a>

            <p>
                Smart appointment management for
                modern barbershops.
            </p>

            <a href="{{ route('contact') }}" class="swiss-footer-contact-link">
                Get in touch →
            </a>

        </div>


        {{-- Navigation --}}
        <div class="swiss-footer-column">

            <h3>Explore</h3>

            <a href="{{ route('home') }}">
                Home
            </a>

            <a href="{{ route('search') }}">
                Search
            </a>

            <a href="{{ route('info') }}">
                Information
            </a>

            <a href="{{ route('contact') }}">
                Contact
            </a>

        </div>


        {{-- Barbers --}}
        <div class="swiss-footer-column">

            <h3>For Barbers</h3>

            <a href="{{ route('register-info') }}">
                Register your barbershop
            </a>

            <a href="{{ route('login') }}">
                Log in as barber
            </a>

        </div>


        {{-- Legal --}}
        <div class="swiss-footer-column">

            <h3>Legal</h3>

            <a href="{{ route('terms-of-use') }}">
                Terms of Use
            </a>

            <a href="{{ route('privacy-policy') }}">
                Privacy Policy
            </a>

        </div>

    </div>


    {{-- Footer Bottom --}}
    <div class="swiss-footer-bottom">

        <p>
            © {{ date('Y') }} Swiss Barber. All rights reserved.
        </p>


        <div class="swiss-footer-bottom-links">

            <a href="{{ route('terms-of-use') }}">
                Terms of Use
            </a>

            <span></span>

            <a href="{{ route('privacy-policy') }}">
                Privacy Policy
            </a>

        </div>

    </div>

</footer>