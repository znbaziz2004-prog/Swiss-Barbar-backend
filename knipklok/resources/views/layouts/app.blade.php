<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <meta
        name="description"
        content="Maak online een afspraak bij je kapper met Swiss Barber. Vind een lokale kapper, kies een tijd en voorkom wachten."
    >

    <meta
        name="theme-color"
        content="#000000"
    >

    <title>
        @yield('title', 'Swiss Barber')
    </title>

    @vite([
        'resources/css/app.css',
        'resources/js/app.js'
    ])

    @stack('head')

</head>


<body>

    <div class="kk-page{{ request()->routeIs('home') ? ' kk-home-page' : '' }}">

        @include('components.navbar')

        <main>
            @yield('content')
        </main>

        @include('components.footer')

    </div>


    @stack('scripts')

</body>

</html>
