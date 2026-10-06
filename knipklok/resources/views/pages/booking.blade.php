@extends('layouts.app')

@section('title', 'Book Appointment - Swiss Barber')

@section('content')

<section style="
    padding: 70px 20px;
    max-width: 1100px;
    margin: auto;
">

    <div id="bookingPage">

        <div style="text-align:center; padding:60px;">
            <h2>Loading booking page...</h2>
        </div>

    </div>

</section>

<script>
document.addEventListener('DOMContentLoaded', async function () {

    const shopId = @json($shopId);
    const container = document.getElementById('bookingPage');

    let shop = null;
    let bookingData = null;
    let services = [];
    let selectedService = null;
    let bookingVerificationToken = null;
    let emailVerified = false;

    /*
    |--------------------------------------------------------------------------
    | LOAD BOOKING DATA
    |--------------------------------------------------------------------------
    */

    try {

        const response = await window.api.get(
            `/public/shops/${shopId}/booking-data`
        );

        if (!response.data?.success) {
            throw new Error('Failed to load booking data');
        }

        bookingData = response.data.data;
        shop = bookingData.shop;

        services = Array.isArray(bookingData.services)
            ? bookingData.services
            : [];

        if (!shop) {
            throw new Error('Shop not found');
        }

        /*
        |--------------------------------------------------------------------------
        | RENDER PAGE
        |--------------------------------------------------------------------------
        */

        container.innerHTML = `

            <div style="margin-bottom:40px;">

                <a
                    href="/shop/${shop.id}"
                    style="
                        text-decoration:none;
                        color:#666;
                    "
                >
                    ← Back to shop
                </a>

                <h1 style="
                    font-size:40px;
                    margin:20px 0 5px;
                ">
                    Book an appointment
                </h1>

                <p style="color:#666; margin:0;">
                    ${shop.name}
                </p>

            </div>

            <!-- EMAIL VERIFICATION -->

            <div style="
                padding:30px;
                border:1px solid #e5e5e5;
                border-radius:15px;
                margin-bottom:30px;
            ">

                <h2 style="margin-top:0;">
                    Verify your email
                </h2>

                <p style="
                    color:#666;
                    margin-top:0;
                ">
                    We will send a verification code to your email before
                    creating the booking.
                </p>

                <div style="
                    display:grid;
                    grid-template-columns:1fr auto;
                    gap:12px;
                    align-items:end;
                ">

                    <div>

                        <label>Email</label>

                        <input
                            id="customerEmail"
                            type="email"
                            placeholder="Enter your email"
                            style="
                                width:100%;
                                padding:13px;
                                margin-top:7px;
                                border:1px solid #ddd;
                                border-radius:7px;
                                box-sizing:border-box;
                            "
                        >

                    </div>

                    <button
                        id="sendCodeButton"
                        type="button"
                        style="
                            padding:14px 22px;
                            border:none;
                            border-radius:8px;
                            background:#111;
                            color:white;
                            cursor:pointer;
                            white-space:nowrap;
                        "
                    >
                        Send Code
                    </button>

                </div>

                <div
                    id="otpSection"
                    style="
                        display:none;
                        margin-top:25px;
                    "
                >

                    <div style="
                        display:grid;
                        grid-template-columns:1fr auto;
                        gap:12px;
                        align-items:end;
                    ">

                        <div>

                            <label>Verification Code</label>

                            <input
                                id="verificationCode"
                                type="text"
                                inputmode="numeric"
                                maxlength="6"
                                placeholder="Enter 6-digit code"
                                style="
                                    width:100%;
                                    padding:13px;
                                    margin-top:7px;
                                    border:1px solid #ddd;
                                    border-radius:7px;
                                    box-sizing:border-box;
                                "
                            >

                        </div>

                        <button
                            id="verifyCodeButton"
                            type="button"
                            style="
                                padding:14px 22px;
                                border:none;
                                border-radius:8px;
                                background:#111;
                                color:white;
                                cursor:pointer;
                                white-space:nowrap;
                            "
                        >
                            Verify Email
                        </button>

                    </div>

                </div>

                <div
                    id="verificationMessage"
                    style="
                        margin-top:15px;
                        font-size:14px;
                    "
                ></div>

            </div>

            <!-- BOOKING FORM -->

            <div
                id="bookingForm"
                style="
                    opacity:0.55;
                    pointer-events:none;
                "
            >

                <div style="
                    display:grid;
                    grid-template-columns:1fr 1fr;
                    gap:40px;
                ">

                    <!-- CUSTOMER -->

                    <div style="
                        padding:30px;
                        border:1px solid #e5e5e5;
                        border-radius:15px;
                    ">

                        <h2 style="margin-top:0;">
                            Your details
                        </h2>

                        <div style="margin-bottom:20px;">

                            <label>Name</label>

                            <input
                                id="customerName"
                                type="text"
                                placeholder="Enter your name"
                                style="
                                    width:100%;
                                    padding:13px;
                                    margin-top:7px;
                                    border:1px solid #ddd;
                                    border-radius:7px;
                                    box-sizing:border-box;
                                "
                            >

                        </div>

                        <div style="margin-bottom:20px;">

                            <label>Phone</label>

                            <input
                                id="customerPhone"
                                type="text"
                                placeholder="Enter your phone"
                                style="
                                    width:100%;
                                    padding:13px;
                                    margin-top:7px;
                                    border:1px solid #ddd;
                                    border-radius:7px;
                                    box-sizing:border-box;
                                "
                            >

                        </div>

                        <div style="margin-bottom:20px;">

                            <label>Branch</label>

                            <select
                                id="branch"
                                style="
                                    width:100%;
                                    padding:13px;
                                    margin-top:7px;
                                    border:1px solid #ddd;
                                    border-radius:7px;
                                    box-sizing:border-box;
                                "
                            >
                            </select>

                        </div>

                        <div style="margin-bottom:20px;">

                            <label>Barber</label>

                            <select
                                id="staff"
                                style="
                                    width:100%;
                                    padding:13px;
                                    margin-top:7px;
                                    border:1px solid #ddd;
                                    border-radius:7px;
                                    box-sizing:border-box;
                                "
                            >
                            </select>

                        </div>

                    </div>

                    <!-- APPOINTMENT -->

                    <div style="
                        padding:30px;
                        border:1px solid #e5e5e5;
                        border-radius:15px;
                    ">

                        <h2 style="margin-top:0;">
                            Appointment
                        </h2>

                        <div style="margin-bottom:20px;">

                            <label>Service</label>

                            <select
                                id="service"
                                style="
                                    width:100%;
                                    padding:13px;
                                    margin-top:7px;
                                    border:1px solid #ddd;
                                    border-radius:7px;
                                    box-sizing:border-box;
                                "
                            >

                                <option value="">
                                    Select service
                                </option>

                                ${services.map(service => `
                                    <option value="${service.id}">
                                        ${service.name} - CHF ${service.price} (${service.duration_minutes} min)
                                    </option>
                                `).join('')}

                            </select>

                        </div>

                        <div style="margin-bottom:20px;">

                            <label>Date</label>

                            <input
                                id="appointmentDate"
                                type="date"
                                min="${new Date().toISOString().split('T')[0]}"
                                style="
                                    width:100%;
                                    padding:13px;
                                    margin-top:7px;
                                    border:1px solid #ddd;
                                    border-radius:7px;
                                    box-sizing:border-box;
                                "
                            >

                        </div>

                        <div style="margin-bottom:25px;">

                            <label>Available Time</label>

                            <select
                                id="appointmentTime"
                                disabled
                                style="
                                    width:100%;
                                    padding:13px;
                                    margin-top:7px;
                                    border:1px solid #ddd;
                                    border-radius:7px;
                                    box-sizing:border-box;
                                "
                            >

                                <option value="">
                                    Select date and service first
                                </option>

                            </select>

                        </div>

                        <div
                            id="slotMessage"
                            style="
                                margin-bottom:20px;
                                color:#666;
                                font-size:14px;
                            "
                        ></div>

                        <button
                            id="continueBooking"
                            type="button"
                            style="
                                width:100%;
                                padding:15px;
                                border:none;
                                border-radius:8px;
                                background:#111;
                                color:white;
                                font-size:16px;
                                cursor:pointer;
                            "
                        >
                            Continue
                        </button>

                    </div>

                </div>

            </div>

            <!-- RESULT -->

            <div
                id="bookingResult"
                style="display:none;"
            ></div>

        `;

        /*
        |--------------------------------------------------------------------------
        | BRANCHES
        |--------------------------------------------------------------------------
        */

        const branchSelect =
            document.getElementById('branch');

        const branches = Array.isArray(bookingData.branches)
            ? bookingData.branches
            : [];

        if (branches.length === 0) {

            branchSelect.innerHTML = `
                <option value="">
                    No branches available
                </option>
            `;

        } else {

            branchSelect.innerHTML = `
                <option value="">
                    Select branch
                </option>

                ${branches.map(branch => `
                    <option value="${branch.id}">
                        ${branch.name} - ${branch.city}
                    </option>
                `).join('')}
            `;

        }

        /*
        |--------------------------------------------------------------------------
        | STAFF
        |--------------------------------------------------------------------------
        */

        const staffSelect =
            document.getElementById('staff');

        const staff = Array.isArray(bookingData.staff)
            ? bookingData.staff
            : [];

        function loadStaff() {

            const branchId =
                branchSelect.value;

            const branchStaff =
                staff.filter(member =>
                    String(member.branch_id) === String(branchId)
                );

            if (branchStaff.length === 0) {

                staffSelect.innerHTML = `
                    <option value="">
                        No barbers available
                    </option>
                `;

                return;
            }

            staffSelect.innerHTML = `
                <option value="">
                    Select barber
                </option>

                ${branchStaff.map(member => `
                    <option value="${member.id}">
                        ${member.display_name}
                    </option>
                `).join('')}
            `;

        }

        branchSelect.addEventListener(
            'change',
            loadStaff
        );

        if (branches.length === 1) {

            branchSelect.value =
                branches[0].id;

            loadStaff();

            if (staff.length === 1) {

                staffSelect.value =
                    staff[0].id;

            }

        }

        /*
        |--------------------------------------------------------------------------
        | SERVICE
        |--------------------------------------------------------------------------
        */

        const serviceSelect =
            document.getElementById('service');

        serviceSelect.addEventListener(
            'change',
            function () {

                selectedService =
                    services.find(
                        service =>
                            String(service.id) ===
                            String(serviceSelect.value)
                    ) || null;

                loadAvailableSlots();

            }
        );

        /*
        |--------------------------------------------------------------------------
        | DATE
        |--------------------------------------------------------------------------
        */

        const dateInput =
            document.getElementById('appointmentDate');

        dateInput.addEventListener(
            'change',
            loadAvailableSlots
        );

        /*
        |--------------------------------------------------------------------------
        | STAFF CHANGE
        |--------------------------------------------------------------------------
        */

        staffSelect.addEventListener(
            'change',
            loadAvailableSlots
        );

        /*
        |--------------------------------------------------------------------------
        | LOAD AVAILABLE SLOTS
        |--------------------------------------------------------------------------
        */

        async function loadAvailableSlots() {

            const branchId =
                branchSelect.value;

            const staffId =
                staffSelect.value;

            const serviceId =
                serviceSelect.value;

            const date =
                dateInput.value;

            const timeSelect =
                document.getElementById(
                    'appointmentTime'
                );

            const slotMessage =
                document.getElementById(
                    'slotMessage'
                );

            if (
                !branchId ||
                !staffId ||
                !serviceId ||
                !date
            ) {

                timeSelect.disabled = true;

                timeSelect.innerHTML = `
                    <option value="">
                        Select branch, barber, service and date
                    </option>
                `;

                slotMessage.innerHTML = '';

                return;
            }

            timeSelect.disabled = true;

            timeSelect.innerHTML = `
                <option value="">
                    Loading available times...
                </option>
            `;

            slotMessage.innerHTML = '';

            try {

                const response =
                    await window.api.get(
                        '/availability',
                        {
                            params: {
                                shopId: shopId,
                                branchId: branchId,
                                staffId: staffId,
                                serviceId: serviceId,
                                date: date
                            }
                        }
                    );

                const data =
                    response.data?.data;

                const slots =
                    Array.isArray(data?.slots)
                        ? data.slots
                        : [];

                if (slots.length === 0) {

                    timeSelect.innerHTML = `
                        <option value="">
                            No available times
                        </option>
                    `;

                    timeSelect.disabled = true;

                    slotMessage.innerHTML =
                        'No available appointments for this date.';

                    return;
                }

                timeSelect.innerHTML = `
                    <option value="">
                        Select available time
                    </option>

                    ${slots.map(slot => `
                        <option value="${slot.startTime}">
                            ${formatTime(slot.startTime)}
                            -
                            ${formatTime(slot.endTime)}
                        </option>
                    `).join('')}
                `;

                timeSelect.disabled = false;

                slotMessage.innerHTML =
                    `${slots.length} available time slots found.`;

            } catch (error) {

                console.error(
                    'Availability error:',
                    error
                );

                timeSelect.innerHTML = `
                    <option value="">
                        Could not load available times
                    </option>
                `;

                timeSelect.disabled = true;

                slotMessage.innerHTML =
                    'Could not load available times. Please try again.';

            }

        }

        /*
        |--------------------------------------------------------------------------
        | FORMAT TIME
        |--------------------------------------------------------------------------
        */

        function formatTime(time) {

            if (!time) {
                return '';
            }

            const parts =
                time.split(':');

            let hour =
                parseInt(parts[0], 10);

            const minute =
                parts[1];

            const suffix =
                hour >= 12
                    ? 'PM'
                    : 'AM';

            hour =
                hour % 12 || 12;

            return `${hour}:${minute} ${suffix}`;

        }

        /*
        |--------------------------------------------------------------------------
        | SEND OTP
        |--------------------------------------------------------------------------
        */

        document
            .getElementById('sendCodeButton')
            .addEventListener(
                'click',
                async function () {

                    const email =
                        document
                            .getElementById(
                                'customerEmail'
                            )
                            .value
                            .trim();

                    const message =
                        document.getElementById(
                            'verificationMessage'
                        );

                    if (!email) {

                        message.innerHTML = `
                            <span style="color:#c00;">
                                Please enter your email.
                            </span>
                        `;

                        return;
                    }

                    const button = this;

                    button.disabled = true;
                    button.innerText =
                        'Sending...';

                    message.innerHTML =
                        'Sending verification code...';

                    try {

                        const response =
                            await window.api.post(
                                '/customer-auth/send-code',
                                {
                                    email: email
                                }
                            );

                        if (
                            response.data?.success
                        ) {

                            document
                                .getElementById(
                                    'otpSection'
                                )
                                .style.display =
                                'block';

                            message.innerHTML = `
                                <span style="color:green;">
                                    Verification code sent to your email.
                                </span>
                            `;

                        } else {

                            throw new Error(
                                response.data?.message ||
                                'Failed to send code'
                            );

                        }

                    } catch (error) {

                        console.error(
                            'Send OTP error:',
                            error
                        );

                        message.innerHTML = `
                            <span style="color:#c00;">
                                ${
                                    error.response?.data?.message ||
                                    'Failed to send verification code.'
                                }
                            </span>
                        `;

                    } finally {

                        button.disabled = false;
                        button.innerText =
                            'Send Code';

                    }

                }
            );

        /*
        |--------------------------------------------------------------------------
        | VERIFY OTP
        |--------------------------------------------------------------------------
        */

        document
            .getElementById('verifyCodeButton')
            .addEventListener(
                'click',
                async function () {

                    const email =
                        document
                            .getElementById(
                                'customerEmail'
                            )
                            .value
                            .trim();

                    const code =
                        document
                            .getElementById(
                                'verificationCode'
                            )
                            .value
                            .trim();

                    const message =
                        document.getElementById(
                            'verificationMessage'
                        );

                    if (!email || !code) {

                        message.innerHTML = `
                            <span style="color:#c00;">
                                Enter your email and verification code.
                            </span>
                        `;

                        return;
                    }

                    const button = this;

                    button.disabled = true;
                    button.innerText =
                        'Verifying...';

                    try {

                        const response =
                            await window.api.post(
                                '/customer-auth/verify-code',
                                {
                                    email: email,
                                    code: code,
                                    shopId: shopId
                                }
                            );

                        if (
                            !response.data?.success
                        ) {

                            throw new Error(
                                response.data?.message ||
                                'Verification failed'
                            );

                        }

                        bookingVerificationToken =
                            response.data
                                .bookingVerificationToken;

                        if (!bookingVerificationToken) {

                            throw new Error(
                                'Booking verification token was not returned.'
                            );

                        }

                        emailVerified = true;

                        message.innerHTML = `
                            <span style="color:green; font-weight:bold;">
                                ✓ Email verified successfully.
                            </span>
                        `;

                        document
                            .getElementById(
                                'customerEmail'
                            )
                            .readOnly = true;

                        document
                            .getElementById(
                                'verificationCode'
                            )
                            .readOnly = true;

                        document
                            .getElementById(
                                'sendCodeButton'
                            )
                            .disabled = true;

                        button.innerText =
                            'Verified';

                        /*
                        Enable booking form
                        */

                        const bookingForm =
                            document.getElementById(
                                'bookingForm'
                            );

                        bookingForm.style.opacity =
                            '1';

                        bookingForm.style.pointerEvents =
                            'auto';

                    } catch (error) {

                        console.error(
                            'Verify OTP error:',
                            error
                        );

                        message.innerHTML = `
                            <span style="color:#c00;">
                                ${
                                    error.response?.data?.message ||
                                    error.message ||
                                    'Verification failed.'
                                }
                            </span>
                        `;

                        button.disabled = false;
                        button.innerText =
                            'Verify Email';

                    }

                }
            );

        /*
        |--------------------------------------------------------------------------
        | CONTINUE / CREATE BOOKING
        |--------------------------------------------------------------------------
        */

        document
            .getElementById('continueBooking')
            .addEventListener(
                'click',
                async function () {

                    if (!emailVerified) {

                        alert(
                            'Please verify your email first.'
                        );

                        return;
                    }

                    const name =
                        document
                            .getElementById(
                                'customerName'
                            )
                            .value
                            .trim();

                    const email =
                        document
                            .getElementById(
                                'customerEmail'
                            )
                            .value
                            .trim();

                    const phone =
                        document
                            .getElementById(
                                'customerPhone'
                            )
                            .value
                            .trim();

                    const branchId =
                        document
                            .getElementById(
                                'branch'
                            )
                            .value;

                    const staffId =
                        document
                            .getElementById(
                                'staff'
                            )
                            .value;

                    const serviceId =
                        document
                            .getElementById(
                                'service'
                            )
                            .value;

                    const appointmentDate =
                        document
                            .getElementById(
                                'appointmentDate'
                            )
                            .value;

                    const startTime =
                        document
                            .getElementById(
                                'appointmentTime'
                            )
                            .value;

                    if (
                        !name ||
                        !email ||
                        !phone ||
                        !branchId ||
                        !staffId ||
                        !serviceId ||
                        !appointmentDate ||
                        !startTime
                    ) {

                        alert(
                            'Please fill all booking details.'
                        );

                        return;
                    }

                    if (!bookingVerificationToken) {

                        alert(
                            'Please verify your email again.'
                        );

                        return;
                    }

                    const button = this;

                    button.disabled = true;
                    button.innerText =
                        'Creating booking...';

                    try {

                        const response =
                            await window.api.post(
                                '/appointments',
                                {
                                    shopId: shopId,
                                    branchId: branchId,
                                    staffId: staffId,
                                    serviceId: serviceId,
                                    appointmentDate:
                                        appointmentDate,
                                    startTime:
                                        startTime,
                                    customerName:
                                        name,
                                    customerPhone:
                                        phone,
                                    customerEmail:
                                        email,
                                    customerNote: '',
                                    bookingVerificationToken:
                                        bookingVerificationToken
                                }
                            );

                        if (
                            !response.data?.success
                        ) {

                            throw new Error(
                                response.data?.message ||
                                'Booking failed'
                            );

                        }

                        const appointment =
                            response.data?.data ||
                            response.data?.appointment ||
                            {};

                        /*
                        Show success
                        */

                        document.getElementById(
                            'bookingForm'
                        ).style.display =
                            'none';

                        document.getElementById(
                            'bookingResult'
                        ).style.display =
                            'block';

                        document.getElementById(
                            'bookingResult'
                        ).innerHTML = `

                            <div style="
                                max-width:700px;
                                margin:40px auto;
                                padding:40px;
                                border:1px solid #ddd;
                                border-radius:15px;
                                text-align:center;
                            ">

                                <div style="
                                    font-size:50px;
                                    margin-bottom:15px;
                                ">
                                    ✓
                                </div>

                                <h2>
                                    Booking Confirmed
                                </h2>

                                <p style="color:#666;">
                                    Your appointment at
                                    ${shop.name}
                                    has been created successfully.
                                </p>

                                <div style="
                                    margin-top:30px;
                                    text-align:left;
                                    background:#f7f7f7;
                                    padding:20px;
                                    border-radius:10px;
                                ">

                                    <p>
                                        <strong>Appointment:</strong>
                                        ${
                                            appointment.id ||
                                            'Confirmed'
                                        }
                                    </p>

                                    <p>
                                        <strong>Date:</strong>
                                        ${appointmentDate}
                                    </p>

                                    <p>
                                        <strong>Time:</strong>
                                        ${formatTime(startTime)}
                                    </p>

                                    <p>
                                        <strong>Service:</strong>
                                        ${
                                            selectedService?.name ||
                                            'Selected service'
                                        }
                                    </p>

                                    <p>
                                        <strong>Barber:</strong>
                                        ${
                                            staff.find(
                                                member =>
                                                    String(member.id) ===
                                                    String(staffId)
                                            )?.display_name ||
                                            'Selected barber'
                                        }
                                    </p>

                                    <p>
                                        <strong>Customer:</strong>
                                        ${name}
                                    </p>

                                </div>

                                <a
                                    href="/shop/${shop.id}"
                                    style="
                                        display:inline-block;
                                        margin-top:25px;
                                        padding:13px 25px;
                                        background:#111;
                                        color:white;
                                        text-decoration:none;
                                        border-radius:8px;
                                    "
                                >
                                    Back to shop
                                </a>

                            </div>

                        `;

                        window.scrollTo({
                            top: 0,
                            behavior: 'smooth'
                        });

                    } catch (error) {

                        console.error(
                            'Create booking error:',
                            error
                        );

                        alert(
                            error.response?.data?.message ||
                            error.message ||
                            'Failed to create booking.'
                        );

                        button.disabled = false;
                        button.innerText =
                            'Continue';

                    }

                }
            );

    } catch (error) {

        console.error(
            'Booking page error:',
            error
        );

        container.innerHTML = `
            <div style="
                text-align:center;
                padding:60px;
            ">

                <h2>
                    Could not load booking page
                </h2>

                <p>
                    ${
                        error.response?.data?.message ||
                        error.message ||
                        'Please try again later.'
                    }
                </p>

            </div>
        `;

    }

});
</script>

@endsection