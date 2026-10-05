@extends('layouts.auth')

@section('title', 'Log in - Swiss Barber')

@section('top_action')
    New to Swiss Barber? <a href="{{ route('register') }}">Create account →</a>
@endsection

@section('story')
    <p class="swiss-auth-eyebrow">Swiss Barber · Your shop, in sync</p>
    <h1>A clear day starts with a clear schedule.</h1>
    <p class="swiss-auth-story-copy">
        Keep appointments, clients and your team together in one place.
    </p>
    <ul class="swiss-auth-benefits">
        <li><span class="swiss-auth-benefit-mark">✓</span>Your appointments at a glance</li>
        <li><span class="swiss-auth-benefit-mark">✓</span>Less admin between clients</li>
        <li><span class="swiss-auth-benefit-mark">✓</span>Access for your shop team</li>
    </ul>
@endsection

@section('form_content')
    <div class="swiss-auth-card-heading">
        <h2>Welcome back</h2>
        <p>Sign in to your account.</p>
    </div>

    @if (session('status'))
        <div class="swiss-auth-alert swiss-auth-alert--success" role="status">{{ session('status') }}</div>
    @endif

    @if ($errors->has('login'))
        <div class="swiss-auth-alert" role="alert">{{ $errors->first('login') }}</div>
    @endif

    <form class="swiss-auth-form" action="{{ route('login.submit') }}" method="POST">
        @csrf

        <div class="swiss-auth-field">
            <label for="email">E-mail address <span class="swiss-auth-required">*</span></label>
            <input id="email" name="email" type="email" value="{{ old('email') }}" required autocomplete="username" autofocus placeholder="you@example.com">
            @error('email')<p class="swiss-auth-error">{{ $message }}</p>@enderror
        </div>

        <div class="swiss-auth-field">
            <label for="password">Password <span class="swiss-auth-required">*</span></label>
            <input id="password" name="password" type="password" required autocomplete="current-password" placeholder="Your password">
            @error('password')<p class="swiss-auth-error">{{ $message }}</p>@enderror
        </div>

        @if ($errors->has('email') || $errors->has('password'))
            <div class="swiss-auth-alert" role="alert">{{ $errors->first('email') ?: $errors->first('password') }}</div>
        @endif

        <button class="swiss-auth-button" type="submit">
            Log in <span aria-hidden="true">→</span>
        </button>
    </form>

    <p class="swiss-auth-card-footer">Need an account? <a class="swiss-auth-inline-link" href="{{ route('register') }}">Register your barbershop</a></p>
@endsection