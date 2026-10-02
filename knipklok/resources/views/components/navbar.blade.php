<header class="kk-header">
    <div class="kk-header-inner">

        <a href="{{ route('home') }}" class="kk-brand">
            <span class="kk-brand-script">Knipklok</span>
        </a>

        <nav class="kk-main-nav">
         <a href="{{ route('search') }}">Search</a>
            <a href="{{ route('info') }}">Info</a>
            <a href="#contact">Contact</a>
        </nav>

        <a href="{{ route('register-info') }}" class="kk-register">
    Register barbershop
</a>
            <a href="#" class="kk-login">
                Log in as barber
                <span>→</span>
            </a>

            <button class="kk-language" type="button">
                <span class="kk-flag">🇬🇧</span>
                <span class="kk-chevron">⌄</span>
            </button>
        </div>

        <button class="kk-menu-button" id="kkMenuButton" type="button">
            <span></span>
            <span></span>
            <span></span>
        </button>

    </div>

    <div class="kk-mobile-nav" id="kkMobileNav">
       <a href="{{ route('search') }}">Search</a>
        <a href="{{ route('info') }}">Info</a>
        <a href="#contact">Contact</a>
        <a href="{{ route('register-info') }}" class="kk-register">
    Register barbershop
</a>
        <a href="#">Log in as barber →</a>
    </div>
</header>