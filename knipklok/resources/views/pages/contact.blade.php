@extends('layouts.app')

@section('title', 'Contact - Knipklok')

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
                <p>Click here to open the answer.</p>
            </div>
        </div>

        <div class="kk-contact-faq-item">
            <button type="button" class="kk-contact-faq-question">
                <span>I want to edit or cancel my appointment but it’s too late, what do I do?</span>
                <span class="kk-contact-faq-arrow">⌄</span>
            </button>
            <div class="kk-contact-faq-answer">
                <p>Click here to open the answer.</p>
            </div>
        </div>

        <div class="kk-contact-faq-item">
            <button type="button" class="kk-contact-faq-question">
                <span>Do I have to register to make an appointment?</span>
                <span class="kk-contact-faq-arrow">⌄</span>
            </button>
            <div class="kk-contact-faq-answer">
                <p>Click here to open the answer.</p>
            </div>
        </div>

        <div class="kk-contact-faq-item">
            <button type="button" class="kk-contact-faq-question">
                <span>Do I have to enter my name, phone number, and e-mail address when making an appointment?</span>
                <span class="kk-contact-faq-arrow">⌄</span>
            </button>
            <div class="kk-contact-faq-answer">
                <p>Click here to open the answer.</p>
            </div>
        </div>

        <div class="kk-contact-faq-item">
            <button type="button" class="kk-contact-faq-question">
                <span>How does the barber know that I made an appointment?</span>
                <span class="kk-contact-faq-arrow">⌄</span>
            </button>
            <div class="kk-contact-faq-answer">
                <p>Click here to open the answer.</p>
            </div>
        </div>

        <div class="kk-contact-faq-item">
            <button type="button" class="kk-contact-faq-question">
                <span>How do I register my own barber shop?</span>
                <span class="kk-contact-faq-arrow">⌄</span>
            </button>
            <div class="kk-contact-faq-answer">
                <p>Click here to open the answer.</p>
            </div>
        </div>

        <div class="kk-contact-faq-item">
            <button type="button" class="kk-contact-faq-question">
                <span>My IP address is blocked, what should I do?</span>
                <span class="kk-contact-faq-arrow">⌄</span>
            </button>
            <div class="kk-contact-faq-answer">
                <p>Click here to open the answer.</p>
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
            <span>Note: this sends a message to Knipklok and NOT to your barber!</span>
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
