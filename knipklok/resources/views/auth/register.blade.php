@extends('layouts.auth')

@section('title', 'Register your barbershop - Swiss Barber')
@section('auth_page_class', 'swiss-register-page')

@section('top_action')
    Already have an account? <a href="{{ route('login') }}">Log in →</a>
@endsection

@section('story')
    <p class="swiss-auth-eyebrow">Swiss Barber · For modern shops</p>
    <h1>Smart booking for modern barbershops.</h1>
    <p class="swiss-auth-story-copy">
        Manage appointments, clients and your daily schedule from one simple platform.
    </p>
    <ul class="swiss-auth-benefits">
        <li><span class="swiss-auth-benefit-mark">✓</span>Online appointments</li>
        <li><span class="swiss-auth-benefit-mark">✓</span>Automatic reminders</li>
        <li><span class="swiss-auth-benefit-mark">✓</span>Simple schedule management</li>
    </ul>
@endsection

@section('form_content')
    <div class="swiss-auth-card-heading">
        <h2>Register your barbershop</h2>
        <p>Start managing your appointments with Swiss Barber.</p>
    </div>

    <div class="swiss-auth-price">
        <div>
            <span class="swiss-auth-price-label">Swiss Barber Standard</span>
            <span class="swiss-auth-price-value">€29</span>
            <span class="swiss-auth-price-period"> / month</span>
        </div>
        <span class="swiss-auth-no-fee">€0.00 one-time fee</span>
    </div>

    @if ($errors->has('registration'))
        <div class="swiss-auth-alert" role="alert">{{ $errors->first('registration') }}</div>
    @endif

    <div class="swiss-auth-progress" aria-label="Registration progress">
        <div class="swiss-auth-progress-step is-active" data-register-indicator="1">
            <span class="swiss-auth-progress-step-number">01</span>
            <span>Enter details</span>
        </div>
        <span class="swiss-auth-progress-line" aria-hidden="true"></span>
        <div class="swiss-auth-progress-step" data-register-indicator="2">
            <span class="swiss-auth-progress-step-number">02</span>
            <span>Select packages</span>
        </div>
    </div>

    <form class="swiss-auth-form" action="{{ route('register.submit') }}" method="POST" id="swissRegisterForm">
        @csrf

        <div class="swiss-auth-step" data-register-step="1">
            <div class="swiss-auth-field-grid">
                <div class="swiss-auth-field swiss-auth-field--full">
                    <label for="shop_name">Barbershop name <span class="swiss-auth-required">*</span></label>
                    <input id="shop_name" name="shop_name" type="text" value="{{ old('shop_name') }}" required maxlength="200" autocomplete="organization" placeholder="Your barbershop">
                    @error('shop_name')<p class="swiss-auth-error">{{ $message }}</p>@enderror
                </div>

                <div class="swiss-auth-field">
                    <label for="default_language">Default language <span class="swiss-auth-required">*</span></label>
                    <select id="default_language" name="default_language" required>
                        <option value="en" @selected(old('default_language', 'en') === 'en')>English</option>
                        <option value="de" @selected(old('default_language') === 'de')>Deutsch</option>
                        <option value="fr" @selected(old('default_language') === 'fr')>Français</option>
                        <option value="it" @selected(old('default_language') === 'it')>Italiano</option>
                    </select>
                    @error('default_language')<p class="swiss-auth-error">{{ $message }}</p>@enderror
                </div>

                <div class="swiss-auth-field">
                    <label for="email">E-mail <span class="swiss-auth-required">*</span></label>
                    <input id="email" name="email" type="email" value="{{ old('email') }}" required maxlength="191" autocomplete="email" placeholder="you@example.com">
                    @error('email')<p class="swiss-auth-error">{{ $message }}</p>@enderror
                </div>

                <div class="swiss-auth-field">
                    <label for="first_name">First name <span class="swiss-auth-required">*</span></label>
                    <input id="first_name" name="first_name" type="text" value="{{ old('first_name') }}" required maxlength="100" autocomplete="given-name" placeholder="First name">
                    @error('first_name')<p class="swiss-auth-error">{{ $message }}</p>@enderror
                </div>

                <div class="swiss-auth-field">
                    <label for="last_name">Last name</label>
                    <input id="last_name" name="last_name" type="text" value="{{ old('last_name') }}" maxlength="100" autocomplete="family-name" placeholder="Last name">
                    @error('last_name')<p class="swiss-auth-error">{{ $message }}</p>@enderror
                </div>

                <div class="swiss-auth-field">
                    <label for="coc_number">COC number</label>
                    <input id="coc_number" name="coc_number" type="text" value="{{ old('coc_number') }}" maxlength="50" placeholder="COC number">
                    @error('coc_number')<p class="swiss-auth-error">{{ $message }}</p>@enderror
                </div>

                <div class="swiss-auth-field">
                    <label for="vat_id">VAT-ID number <span class="swiss-auth-price-period">(optional)</span></label>
                    <input id="vat_id" name="vat_id" type="text" value="{{ old('vat_id') }}" maxlength="50" placeholder="VAT-ID number">
                    @error('vat_id')<p class="swiss-auth-error">{{ $message }}</p>@enderror
                </div>

                <div class="swiss-auth-field swiss-auth-field--full">
                    <label for="country">Country <span class="swiss-auth-required">*</span></label>
                    <select id="country" name="country" required>
                        <option value="Switzerland" selected>🇨🇭 Switzerland</option>
                    </select>
                    @error('country')<p class="swiss-auth-error">{{ $message }}</p>@enderror
                </div>

                <div class="swiss-auth-field">
                    <label for="street_name">Street name <span class="swiss-auth-required">*</span></label>
                    <input id="street_name" name="street_name" type="text" value="{{ old('street_name') }}" required maxlength="150" autocomplete="address-line1" placeholder="Street name">
                    @error('street_name')<p class="swiss-auth-error">{{ $message }}</p>@enderror
                </div>

                <div class="swiss-auth-field">
                    <label for="building_number">Building number <span class="swiss-auth-required">*</span></label>
                    <input id="building_number" name="building_number" type="text" value="{{ old('building_number') }}" required maxlength="30" autocomplete="address-line2" placeholder="Number">
                    @error('building_number')<p class="swiss-auth-error">{{ $message }}</p>@enderror
                </div>

                <div class="swiss-auth-field">
                    <label for="postal_code">Postal code <span class="swiss-auth-required">*</span></label>
                    <input id="postal_code" name="postal_code" type="text" value="{{ old('postal_code') }}" required maxlength="20" autocomplete="postal-code" placeholder="8001">
                    @error('postal_code')<p class="swiss-auth-error">{{ $message }}</p>@enderror
                </div>

                <div class="swiss-auth-field">
                    <label for="city">City <span class="swiss-auth-required">*</span></label>
                    <input id="city" name="city" type="text" value="{{ old('city') }}" required maxlength="100" autocomplete="address-level2" placeholder="Zurich">
                    @error('city')<p class="swiss-auth-error">{{ $message }}</p>@enderror
                </div>

                <div class="swiss-auth-field swiss-auth-field--full">
                    <label for="company_phone">Company phone number <span class="swiss-auth-required">*</span></label>
                    <div class="swiss-auth-phone-control">
                        <span class="swiss-auth-phone-prefix" aria-hidden="true"><span>🇨🇭</span> +41 <span>⌄</span></span>
                        <input id="company_phone" name="company_phone" type="tel" value="{{ old('company_phone') }}" required maxlength="24" autocomplete="tel-national" placeholder="79 123 45 67">
                    </div>
                    @error('company_phone')<p class="swiss-auth-error">{{ $message }}</p>@enderror
                </div>

                <div class="swiss-auth-field swiss-auth-field--full">
                    <label for="private_phone">Private phone number <span class="swiss-auth-required">*</span></label>
                    <div class="swiss-auth-phone-control">
                        <span class="swiss-auth-phone-prefix" aria-hidden="true"><span>🇨🇭</span> +41 <span>⌄</span></span>
                        <input id="private_phone" name="private_phone" type="tel" value="{{ old('private_phone') }}" required maxlength="24" autocomplete="tel" placeholder="79 123 45 67">
                    </div>
                    @error('private_phone')<p class="swiss-auth-error">{{ $message }}</p>@enderror
                </div>

                <div class="swiss-auth-field swiss-auth-field--full">
                    <label for="instagram_username">Instagram username <span class="swiss-auth-price-period">(optional)</span></label>
                    <input id="instagram_username" name="instagram_username" type="text" value="{{ old('instagram_username') }}" maxlength="100" placeholder="@yourbarbershop">
                    @error('instagram_username')<p class="swiss-auth-error">{{ $message }}</p>@enderror
                </div>

                <div class="swiss-auth-field swiss-auth-field--full">
                    <label for="referral_source">How did you find us? <span class="swiss-auth-price-period">(optional)</span></label>
                    <input id="referral_source" name="referral_source" type="text" value="{{ old('referral_source') }}" maxlength="150" placeholder="A friend, online, ...">
                    @error('referral_source')<p class="swiss-auth-error">{{ $message }}</p>@enderror
                </div>

                <div class="swiss-auth-field">
                    <label for="password">Password <span class="swiss-auth-required">*</span></label>
                    <input id="password" name="password" type="password" required minlength="8" autocomplete="new-password" placeholder="At least 8 characters">
                    @error('password')<p class="swiss-auth-error">{{ $message }}</p>@enderror
                </div>

                <div class="swiss-auth-field">
                    <label for="password_confirmation">Confirm password <span class="swiss-auth-required">*</span></label>
                    <input id="password_confirmation" name="password_confirmation" type="password" required minlength="8" autocomplete="new-password" placeholder="Repeat your password">
                </div>
            </div>

            <button class="swiss-auth-button" type="button" data-register-next>
                Continue <span aria-hidden="true">→</span>
            </button>
        </div>

        <div class="swiss-auth-step" data-register-step="2" hidden>
            <div class="swiss-auth-card-heading">
                <h2>Select your package</h2>
                <p>One clear plan. You can review your selection before continuing.</p>
            </div>

            <label class="swiss-auth-package-card" for="package_standard">
                <input id="package_standard" name="package_code" type="radio" value="standard" checked required>
                <span>
                    <span class="swiss-auth-package-name">Standard</span>
                    <span class="swiss-auth-package-description">Online appointments, automatic reminders and schedule management.</span>
                </span>
                <span class="swiss-auth-package-price">€29<small>/ month · €0.00 setup</small></span>
            </label>
            @error('package_code')<p class="swiss-auth-error">{{ $message }}</p>@enderror

            <div class="swiss-auth-step-actions">
                <button class="swiss-auth-button swiss-auth-button--secondary" type="button" data-register-back>
                    <span aria-hidden="true">←</span> Back to details
                </button>
                <button class="swiss-auth-button" type="submit">
                    Create account <span aria-hidden="true">→</span>
                </button>
            </div>
        </div>
    </form>

    <p class="swiss-auth-card-footer">Already registered? <a class="swiss-auth-inline-link" href="{{ route('login') }}">Log in to your account</a></p>
@endsection

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('swissRegisterForm');

    if (!form) {
        return;
    }

    const steps = Array.from(form.querySelectorAll('[data-register-step]'));
    const indicators = Array.from(document.querySelectorAll('[data-register-indicator]'));
    const showStep = function (stepNumber) {
        steps.forEach(function (step) {
            step.hidden = Number(step.dataset.registerStep) !== stepNumber;
        });

        indicators.forEach(function (indicator) {
            const number = Number(indicator.dataset.registerIndicator);
            indicator.classList.toggle('is-active', number === stepNumber);
            indicator.classList.toggle('is-complete', number < stepNumber);
        });
    };

    form.querySelector('[data-register-next]').addEventListener('click', function () {
        const detailsStep = form.querySelector('[data-register-step="1"]');
        const fields = Array.from(detailsStep.querySelectorAll('input, select'));
        const firstInvalid = fields.find(function (field) {
            return !field.checkValidity();
        });

        if (firstInvalid) {
            firstInvalid.reportValidity();
            firstInvalid.focus();
            return;
        }

        const password = form.querySelector('#password');
        const confirmation = form.querySelector('#password_confirmation');

        if (password.value !== confirmation.value) {
            confirmation.setCustomValidity('The passwords do not match.');
            confirmation.reportValidity();
            confirmation.focus();
            return;
        }

        confirmation.setCustomValidity('');
        showStep(2);
    });

    form.querySelector('[data-register-back]').addEventListener('click', function () {
        showStep(1);
    });

    form.querySelector('#password_confirmation').addEventListener('input', function () {
        this.setCustomValidity('');
    });

    @if ($errors->any())
        showStep(1);
    @endif
});
</script>
@endpush
