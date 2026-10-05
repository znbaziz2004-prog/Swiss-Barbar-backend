@extends('layouts.app')

@section('title', 'Contact - Swiss Barber')

@section('content')

<section class="kk-contact-hero">
    <div class="kk-contact-shapes" aria-hidden="true">
        <span class="kk-contact-shape kk-contact-shape-1"></span>
        <span class="kk-contact-shape kk-contact-shape-2"></span>
        <span class="kk-contact-shape kk-contact-shape-3"></span>
        <span class="kk-contact-shape kk-contact-shape-4"></span>
        <span class="kk-contact-shape kk-contact-shape-5"></span>
        <span class="kk-contact-shape kk-contact-shape-6"></span>
        <span class="kk-contact-shape kk-contact-shape-7"></span>
        <span class="kk-contact-shape kk-contact-shape-8"></span>
    </div>

    <h1>Contact</h1>
</section>

<section class="kk-contact-faq">
    <div class="kk-contact-faq-inner">

        <div class="kk-contact-faq-item">
            <button type="button" class="kk-contact-faq-question">
                <span>How do I edit or cancel my appointment?</span>
                <span class="kk-contact-faq-arrow">⌄</span>
            </button>
            <div class="kk-contact-faq-answer">
                <p>You can edit or cancel your appointment using the confirmation message you received after booking. Open your appointment details and follow the available edit or cancel option.</p>
            </div>
        </div>

        <div class="kk-contact-faq-item">
            <button type="button" class="kk-contact-faq-question">
                <span>I want to edit or cancel my appointment but it’s too late, what do I do?</span>
                <span class="kk-contact-faq-arrow">⌄</span>
            </button>
            <div class="kk-contact-faq-answer">
                <p>If it is no longer possible to edit or cancel your appointment online, please contact the barber directly. The barber can tell you whether anything can still be changed.</p>
            </div>
        </div>

        <div class="kk-contact-faq-item">
            <button type="button" class="kk-contact-faq-question">
                <span>Do I have to register to make an appointment?</span>
                <span class="kk-contact-faq-arrow">⌄</span>
            </button>
            <div class="kk-contact-faq-answer">
                <p>No. You do not have to create an account to make an appointment. You can simply choose your barber, select an available date and time, and complete the booking.</p>
            </div>
        </div>

        <div class="kk-contact-faq-item">
            <button type="button" class="kk-contact-faq-question">
                <span>Do I have to enter my name, phone number, and e-mail address when making an appointment?</span>
                <span class="kk-contact-faq-arrow">⌄</span>
            </button>
            <div class="kk-contact-faq-answer">
                <p>Yes. Your name, phone number, and e-mail address are required so the barber can identify your appointment and you can receive the appointment confirmation and reminders.</p>
            </div>
        </div>

        <div class="kk-contact-faq-item">
            <button type="button" class="kk-contact-faq-question">
                <span>How does the barber know that I made an appointment?</span>
                <span class="kk-contact-faq-arrow">⌄</span>
            </button>
            <div class="kk-contact-faq-answer">
                <p>After you complete your booking, the appointment is automatically added to the barber's schedule. The barber can see the appointment and the associated booking information.</p>
            </div>
        </div>

        <div class="kk-contact-faq-item">
            <button type="button" class="kk-contact-faq-question">
                <span>How do I register my own barber shop?</span>
                <span class="kk-contact-faq-arrow">⌄</span>
            </button>
            <div class="kk-contact-faq-answer">
                <p>Go to the Register barbershop page and follow the registration steps. You can start the registration process directly from the Register barbershop button in the navigation.</p>
            </div>
        </div>

        <div class="kk-contact-faq-item">
            <button type="button" class="kk-contact-faq-question">
                <span>My IP address is blocked, what should I do?</span>
                <span class="kk-contact-faq-arrow">⌄</span>
            </button>
            <div class="kk-contact-faq-answer">
                <p>If your IP address has been blocked, please contact Swiss Barber support so they can help you resolve the issue.</p>
            </div>
        </div>

    </div>
</section>

<section class="kk-contact-form-section">
    <div class="kk-contact-form-inner">

        <p class="kk-contact-kicker">Is your question not listed?</p>

        <h2>Send us a message</h2>

        <div class="kk-contact-note">
            <span class="kk-contact-note-icon">!</span>
            <span>Note: this sends a message to Swiss Barber and NOT to your barber!</span>
        </div>

        <form action="#" method="POST" class="kk-contact-form">
            @csrf

            <div class="kk-contact-form-row">
                <div class="kk-contact-field">
                    <label for="contact-name">Name *</label>
                    <input
                        id="contact-name"
                        type="text"
                        name="name"
                        placeholder="Your name"
                    >
                </div>

                <div class="kk-contact-field">
                    <label for="contact-phone">Phone number *</label>
                    <input
                        id="contact-phone"
                        type="text"
                        name="phone"
                        placeholder="Your phone number"
                    >
                </div>
            </div>

            <div class="kk-contact-field">
                <label for="contact-email">E-mail address *</label>
                <input
                    id="contact-email"
                    type="email"
                    name="email"
                    placeholder="Your e-mail address"
                >
            </div>

            <div class="kk-contact-field">
                <label for="contact-message">Message *</label>
                <textarea
                    id="contact-message"
                    name="message"
                    placeholder="Send us a message"
                ></textarea>
            </div>

            <button type="submit" class="kk-contact-submit">
                Send message
            </button>
        </form>

    </div>
</section>

@include('components.app-download')

@include('components.barber-login-bar')

@endsection

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function () {
    const questions = document.querySelectorAll('.kk-contact-faq-question');

    questions.forEach(function (button) {
        button.addEventListener('click', function () {
            const item = button.closest('.kk-contact-faq-item');
            const wasActive = item.classList.contains('active');

            document.querySelectorAll('.kk-contact-faq-item').forEach(function (faqItem) {
                faqItem.classList.remove('active');
            });

            if (!wasActive) {
                item.classList.add('active');
            }
        });
    });
});
</script>
@endpush
