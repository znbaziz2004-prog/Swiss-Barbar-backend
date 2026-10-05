<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <meta name="theme-color" content="#151515">

    <title>@yield('title', 'Swiss Barber')</title>

    @vite([
        'resources/css/app.css',
        'resources/js/app.js'
    ])

    @stack('head')

    <style>
        /* =========================================================
           SWISS BARBER AUTH / REGISTER
           ========================================================= */

        .swiss-auth-body {
            margin: 0;
            min-height: 100vh;
            background: #f5f4f1;
        }

        .swiss-auth-page {
            --swiss-red: #d71920;
            --swiss-red-dark: #b9151b;
            --swiss-black: #151515;
            --swiss-text: #202020;
            --swiss-muted: #707070;
            --swiss-border: #dededb;
            --swiss-soft: #f8f7f4;

            min-height: 100vh;
            background:
                radial-gradient(
                    circle at 8% 20%,
                    rgba(215, 25, 32, 0.045),
                    transparent 28%
                ),
                #f5f4f1;

            color: var(--swiss-text);

            font-family:
                "DM Sans",
                "Inter",
                Arial,
                sans-serif;

            -webkit-font-smoothing: antialiased;
        }

        .swiss-auth-page *,
        .swiss-auth-page *::before,
        .swiss-auth-page *::after {
            box-sizing: border-box;
        }

        .swiss-auth-page a {
            color: inherit;
            text-decoration: none;
        }


        /* =========================================================
           MAIN SHELL
           ========================================================= */

        .swiss-auth-shell {
            width: min(1380px, calc(100% - 56px));
            min-height: 100vh;

            margin: 0 auto;

            display: grid;

            grid-template-columns:
                minmax(0, 0.88fr)
                minmax(0, 1.12fr);

            grid-template-rows: auto 1fr;

            column-gap: clamp(50px, 6vw, 100px);

            padding: 24px 0 50px;
        }


        /* =========================================================
           TOP BAR
           ========================================================= */

        .swiss-auth-topbar {
            grid-column: 1 / -1;

            min-height: 58px;

            display: flex;
            align-items: center;
            justify-content: space-between;

            border-bottom: 1px solid rgba(21, 21, 21, 0.08);

            margin-bottom: 22px;
        }

        .swiss-auth-brand {
            display: inline-flex;
            align-items: center;
            gap: 11px;

            color: var(--swiss-black);

            font-size: 19px;
            font-weight: 800;
            letter-spacing: -0.4px;
        }

        .swiss-auth-brand-mark {
            position: relative;

            width: 34px;
            height: 34px;

            display: inline-flex;
            align-items: center;
            justify-content: center;

            flex: 0 0 34px;

            border-radius: 9px;

            background: var(--swiss-red);

            box-shadow:
                0 7px 20px rgba(215, 25, 32, 0.20);
        }

        .swiss-auth-brand-mark::before,
        .swiss-auth-brand-mark::after {
            content: "";

            position: absolute;

            top: 50%;
            left: 50%;

            background: #ffffff;

            transform: translate(-50%, -50%);
        }

        .swiss-auth-brand-mark::before {
            width: 17px;
            height: 5px;
            border-radius: 2px;
        }

        .swiss-auth-brand-mark::after {
            width: 5px;
            height: 17px;
            border-radius: 2px;
        }

        .swiss-auth-top-action {
            color: #666666;

            font-size: 13px;
            font-weight: 500;
        }

        .swiss-auth-top-action a {
            margin-left: 5px;

            color: var(--swiss-red);

            font-weight: 700;
        }

        .swiss-auth-top-action a:hover {
            color: var(--swiss-red-dark);
        }


        /* =========================================================
           LEFT STORY
           ========================================================= */

        .swiss-auth-story {
            position: relative;

            align-self: center;

            padding:
                45px
                0
                80px;
        }

        .swiss-auth-eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 11px;

            margin: 0 0 23px;

            color: var(--swiss-red);

            font-size: 11px;
            line-height: 1;
            font-weight: 800;

            text-transform: uppercase;
            letter-spacing: 1.3px;
        }

        .swiss-auth-eyebrow::before {
            content: "";

            width: 30px;
            height: 2px;

            flex: 0 0 30px;

            background: var(--swiss-red);
        }

        .swiss-auth-story h1 {
            max-width: 570px;

            margin: 0 0 22px;

            color: var(--swiss-black);

            font-size: clamp(43px, 4.2vw, 61px);

            line-height: 1.02;

            font-weight: 700;

            letter-spacing: -2.2px;
        }

        .swiss-auth-story-copy {
            max-width: 500px;

            margin: 0;

            color: #686868;

            font-size: 16px;

            line-height: 1.75;
        }


        /* =========================================================
           BENEFITS
           ========================================================= */

        .swiss-auth-benefits {
            display: grid;

            gap: 15px;

            margin: 34px 0 0;
            padding: 0;

            list-style: none;
        }

        .swiss-auth-benefits li {
            display: flex;
            align-items: center;

            gap: 12px;

            color: #292929;

            font-size: 14px;
            font-weight: 600;
        }

        .swiss-auth-benefit-mark {
            width: 25px;
            height: 25px;

            display: inline-grid;
            place-items: center;

            flex: 0 0 25px;

            border: 1px solid rgba(215, 25, 32, 0.35);

            border-radius: 50%;

            background: #fff7f7;

            color: var(--swiss-red);

            font-size: 12px;
            font-weight: 800;
        }

        .swiss-auth-story-rule {
            width: 82px;
            height: 5px;

            margin-top: 52px;

            background: var(--swiss-red);

            border-radius: 0;
        }


        /* =========================================================
           FORM CARD
           ========================================================= */

        .swiss-auth-card {
            width: 100%;
            max-width: 690px;

            justify-self: end;

            align-self: center;

            padding: 40px;

            border:
                1px solid
                rgba(21, 21, 21, 0.075);

            border-radius: 20px;

            background: #ffffff;

            box-shadow:
                0 25px 75px rgba(25, 25, 25, 0.085);
        }

        .swiss-auth-card-heading {
            margin-bottom: 22px;
        }

        .swiss-auth-card-heading h2 {
            margin: 0 0 7px;

            color: var(--swiss-black);

            font-size: 29px;
            line-height: 1.2;
            font-weight: 750;

            letter-spacing: -0.7px;
        }

        .swiss-auth-card-heading p {
            margin: 0;

            color: var(--swiss-muted);

            font-size: 14px;
            line-height: 1.6;
        }


        /* =========================================================
           PRICE
           ========================================================= */

        .swiss-auth-price {
            display: flex;

            align-items: flex-end;
            justify-content: space-between;

            gap: 20px;

            margin: 0 0 25px;

            padding: 19px 20px;

            border:
                1px solid
                #ebe5e0;

            border-radius: 13px;

            background: #faf9f7;
        }

        .swiss-auth-price-label {
            display: block;

            margin-bottom: 5px;

            color: #68635e;

            font-size: 11px;
            font-weight: 700;

            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .swiss-auth-price-value {
            color: var(--swiss-red);

            font-size: 38px;

            line-height: 1;

            font-weight: 800;

            letter-spacing: -1.2px;
        }

        .swiss-auth-price-period {
            color: #626262;

            font-size: 13px;
        }

        .swiss-auth-no-fee {
            padding-bottom: 3px;

            color: #555555;

            font-size: 12px;
            font-weight: 600;
        }


        /* =========================================================
           PROGRESS
           ========================================================= */

        .swiss-auth-progress {
            display: grid;

            grid-template-columns:
                auto
                minmax(30px, 1fr)
                auto;

            align-items: center;

            gap: 13px;

            margin: 0 0 27px;
        }

        .swiss-auth-progress-step {
            display: inline-flex;

            align-items: center;

            gap: 8px;

            color: #8a8a8a;

            font-size: 12px;
            font-weight: 600;
        }

        .swiss-auth-progress-step-number {
            width: 31px;
            height: 31px;

            display: inline-grid;

            place-items: center;

            flex: 0 0 31px;

            border: 1px solid #d8d8d8;

            border-radius: 50%;

            background: #ffffff;

            color: #858585;

            font-size: 11px;
            font-weight: 700;
        }

        .swiss-auth-progress-step.is-active {
            color: var(--swiss-black);
        }

        .swiss-auth-progress-step.is-active
        .swiss-auth-progress-step-number,

        .swiss-auth-progress-step.is-complete
        .swiss-auth-progress-step-number {
            border-color: var(--swiss-red);

            background: var(--swiss-red);

            color: #ffffff;

            box-shadow:
                0 0 0 4px rgba(215, 25, 32, 0.08);
        }

        .swiss-auth-progress-line {
            height: 1px;

            background: #e5e5e5;
        }


        /* =========================================================
           FORM
           ========================================================= */

        .swiss-auth-form {
            display: grid;

            gap: 17px;
        }

        .swiss-auth-field-grid {
            display: grid;

            grid-template-columns:
                repeat(2, minmax(0, 1fr));

            gap: 16px 14px;
        }

        .swiss-auth-field--full {
            grid-column: 1 / -1;
        }

        .swiss-auth-field label {
            display: block;

            margin: 0 0 7px;

            color: #282828;

            font-size: 12px;
            line-height: 1.4;

            font-weight: 700;
        }

        .swiss-auth-required {
            color: var(--swiss-red);
        }

        .swiss-auth-field input,
        .swiss-auth-field select {
            width: 100%;
            min-width: 0;

            height: 51px;

            padding: 0 14px;

            border:
                1px solid
                #d8d8d8;

            border-radius: 10px;

            outline: none;

            background: #ffffff;

            color: var(--swiss-text);

            font: inherit;
            font-size: 14px;

            transition:
                border-color 160ms ease,
                box-shadow 160ms ease,
                background 160ms ease;
        }

        .swiss-auth-field input::placeholder {
            color: #a1a1a1;
        }

        .swiss-auth-field input:hover,
        .swiss-auth-field select:hover {
            border-color: #bdbdbd;
        }

        .swiss-auth-field input:focus,
        .swiss-auth-field select:focus {
            border-color: var(--swiss-red);

            box-shadow:
                0 0 0 3px
                rgba(215, 25, 32, 0.09);
        }


        /* =========================================================
           PHONE
           ========================================================= */

        .swiss-auth-phone-control {
            min-width: 0;

            height: 51px;

            display: flex;

            overflow: hidden;

            border:
                1px solid
                #d8d8d8;

            border-radius: 10px;

            background: #ffffff;

            transition:
                border-color 160ms ease,
                box-shadow 160ms ease;
        }

        .swiss-auth-phone-control:focus-within {
            border-color: var(--swiss-red);

            box-shadow:
                0 0 0 3px
                rgba(215, 25, 32, 0.09);
        }

        .swiss-auth-phone-prefix {
            display: inline-flex;

            align-items: center;

            gap: 7px;

            flex: 0 0 auto;

            padding: 0 12px;

            border-right:
                1px solid
                #e7e7e7;

            color: #242424;

            font-size: 13px;
            font-weight: 700;

            white-space: nowrap;
        }

        .swiss-auth-phone-prefix span:last-child {
            color: #898989;

            font-size: 11px;
        }

        .swiss-auth-phone-control input {
            height: 49px;

            border: 0;
            border-radius: 0;

            box-shadow: none;
        }

        .swiss-auth-phone-control input:focus {
            border: 0;
            box-shadow: none;
        }


        /* =========================================================
           ERRORS / ALERTS
           ========================================================= */

        .swiss-auth-error {
            margin: 6px 0 0;

            color: #b21219;

            font-size: 12px;

            line-height: 1.45;
        }

        .swiss-auth-alert {
            margin: 0 0 18px;

            padding: 12px 14px;

            border:
                1px solid
                #efc4c6;

            border-radius: 10px;

            background: #fff4f4;

            color: #9f141a;

            font-size: 13px;

            line-height: 1.5;
        }

        .swiss-auth-alert--success {
            border-color: #cbe5d3;

            background: #f2faf4;

            color: #28623b;
        }


        /* =========================================================
           BUTTONS
           ========================================================= */

        .swiss-auth-button {
            width: 100%;

            min-height: 52px;

            display: inline-flex;

            align-items: center;
            justify-content: center;

            gap: 10px;

            padding: 0 18px;

            border:
                1px solid
                var(--swiss-red);

            border-radius: 10px;

            background: var(--swiss-red);

            color: #ffffff;

            font: inherit;

            font-size: 14px;

            font-weight: 700;

            cursor: pointer;

            transition:
                background 160ms ease,
                transform 160ms ease,
                box-shadow 160ms ease;
        }

        .swiss-auth-button:hover {
            background: var(--swiss-red-dark);

            transform: translateY(-1px);

            box-shadow:
                0 8px 20px
                rgba(215, 25, 32, 0.16);
        }

        .swiss-auth-button:active {
            transform: translateY(0);
        }

        .swiss-auth-button--secondary {
            border-color: #d6d6d6;

            background: #ffffff;

            color: #292929;
        }

        .swiss-auth-button--secondary:hover {
            background: #f7f7f7;

            color: #151515;

            box-shadow: none;
        }


        /* =========================================================
           LINKS
           ========================================================= */

        .swiss-auth-inline-link {
            color: var(--swiss-red) !important;

            font-size: 13px;

            font-weight: 700;
        }

        .swiss-auth-inline-link:hover {
            color: var(--swiss-red-dark) !important;

            text-decoration: underline;
        }

        .swiss-auth-card-footer {
            margin: 19px 0 0;

            color: #717171;

            font-size: 13px;

            line-height: 1.5;

            text-align: center;
        }


        /* =========================================================
           STEP VISIBILITY
           ========================================================= */

        .swiss-auth-step[hidden] {
            display: none !important;
        }

        .swiss-auth-page.swiss-register-page {
            background: #f5f4f1;
        }

        .swiss-auth-page.swiss-register-page .swiss-auth-shell {
            grid-template-columns: minmax(0, 0.84fr) minmax(0, 1.16fr);
        }

        .swiss-auth-page.swiss-register-page .swiss-auth-story {
            position: sticky;
            top: 32px;
            align-self: start;
            padding: 45px 0 80px;
        }

        .swiss-auth-page.swiss-register-page .swiss-auth-story h1 {
            max-width: 600px;
            font-size: 54px;
            line-height: 1.05;
            font-weight: 700;
            letter-spacing: -1.4px;
        }

        .swiss-auth-page.swiss-register-page .swiss-auth-card {
            max-width: 650px;
            padding: 40px 42px;
            border-color: #e4e4e4;
            border-radius: 18px;
            box-shadow: 0 18px 50px rgba(0, 0, 0, 0.06);
        }

        .swiss-auth-page.swiss-register-page .swiss-auth-card-heading h2 {
            font-size: 30px;
        }

        .swiss-auth-page.swiss-register-page .swiss-auth-field label {
            font-size: 13px;
        }

        .swiss-auth-page.swiss-register-page [data-register-step="1"] {
            display: flex;
            flex-direction: column;
            gap: 17px;
        }

        .swiss-auth-page.swiss-register-page [data-register-next] {
            width: 180px;
            align-self: flex-end;
        }


        /* =========================================================
           PACKAGE CARD
           ========================================================= */

        .swiss-auth-package-card {
            display: grid;

            grid-template-columns:
                auto
                1fr
                auto;

            align-items: start;

            gap: 14px;

            padding: 20px;

            border:
                1px solid
                #ead0d1;

            border-radius: 14px;

            background:
                linear-gradient(
                    135deg,
                    #fffafa,
                    #ffffff
                );

            cursor: pointer;

            transition:
                border-color 160ms ease,
                box-shadow 160ms ease,
                transform 160ms ease;
        }

        .swiss-auth-package-card:hover {
            border-color: #dba8aa;

            transform: translateY(-1px);

            box-shadow:
                0 10px 30px
                rgba(21, 21, 21, 0.06);
        }

        .swiss-auth-package-card input {
            width: 17px;
            height: 17px;

            margin: 2px 0 0;

            accent-color: var(--swiss-red);
        }

        .swiss-auth-package-name {
            display: block;

            margin-bottom: 5px;

            color: #202020;

            font-size: 15px;

            font-weight: 700;
        }

        .swiss-auth-package-description {
            display: block;

            margin: 0;

            color: #737373;

            font-size: 12px;

            line-height: 1.5;
        }

        .swiss-auth-package-price {
            color: #202020;

            font-size: 18px;

            font-weight: 800;

            white-space: nowrap;
        }

        .swiss-auth-package-price small {
            display: block;

            margin-top: 3px;

            color: #737373;

            font-size: 11px;

            font-weight: 500;

            text-align: right;
        }


        /* =========================================================
           STEP ACTIONS
           ========================================================= */

        .swiss-auth-step-actions {
            display: grid;

            grid-template-columns:
                1fr
                1fr;

            gap: 12px;

            margin-top: 22px;
        }


        /* =========================================================
           FOCUS
           ========================================================= */

        .swiss-auth-button:focus-visible,
        .swiss-auth-top-action a:focus-visible,
        .swiss-auth-inline-link:focus-visible {
            outline:
                3px solid
                rgba(215, 25, 32, 0.24);

            outline-offset: 3px;
        }


        /* =========================================================
           TABLET
           ========================================================= */

        @media (max-width: 1100px) {

            .swiss-auth-shell {
                width: min(100% - 44px, 960px);

                grid-template-columns:
                    minmax(0, 0.78fr)
                    minmax(0, 1.22fr);

                gap: 42px;
            }

            .swiss-auth-story h1 {
                font-size: 42px;
            }

            .swiss-auth-card {
                padding: 34px 30px;
            }

            .swiss-auth-page.swiss-register-page .swiss-auth-shell {
                grid-template-columns: minmax(0, 0.76fr) minmax(0, 1.24fr);
                gap: 32px;
            }

            .swiss-auth-page.swiss-register-page .swiss-auth-story h1 {
                font-size: 42px;
            }

            .swiss-auth-page.swiss-register-page .swiss-auth-card {
                padding: 32px 28px;
            }
        }


        /* =========================================================
           MOBILE / TABLET
           ========================================================= */

        @media (max-width: 820px) {

            .swiss-auth-shell {
                width: min(100% - 36px, 650px);

                min-height: auto;

                grid-template-columns: 1fr;

                grid-template-rows: auto;

                gap: 20px;

                padding:
                    16px 0
                    35px;
            }

            .swiss-auth-page.swiss-register-page .swiss-auth-shell {
                width: min(100% - 40px, 760px);
                grid-template-columns: minmax(0, 0.72fr) minmax(0, 1.28fr);
                gap: 26px;
            }

            .swiss-auth-topbar {
                margin-bottom: 0;
            }

            .swiss-auth-story {
                padding: 20px 0 5px;
            }

            .swiss-auth-story h1 {
                max-width: 650px;

                margin-bottom: 13px;

                font-size: 35px;

                letter-spacing: -1.2px;
            }

            .swiss-auth-page.swiss-register-page .swiss-auth-story h1 {
                font-size: 34px;
            }

            .swiss-auth-page.swiss-register-page .swiss-auth-story {
                position: static;
                top: auto;
                align-self: start;
                padding: 20px 0 5px;
            }

            .swiss-auth-story-copy {
                font-size: 14px;
            }

            .swiss-auth-benefits {
                grid-template-columns:
                    repeat(3, minmax(0, 1fr));

                gap: 10px;

                margin-top: 22px;
            }

            .swiss-auth-benefits li {
                align-items: flex-start;

                gap: 7px;

                font-size: 11px;
            }

            .swiss-auth-benefit-mark {
                width: 20px;
                height: 20px;

                flex-basis: 20px;

                font-size: 10px;
            }

            .swiss-auth-story-rule {
                display: none;
            }

            .swiss-auth-card {
                justify-self: stretch;

                max-width: none;
            }

            .swiss-auth-page.swiss-register-page .swiss-auth-card {
                padding: 28px 24px;
            }
        }


        /* =========================================================
           SMALL MOBILE
           ========================================================= */

        @media (max-width: 560px) {

            .swiss-auth-shell {
                width: calc(100% - 26px);

                gap: 14px;

                padding-top: 10px;
            }

            .swiss-auth-page.swiss-register-page .swiss-auth-shell {
                width: calc(100% - 28px);
                grid-template-columns: 1fr;
            }

            .swiss-auth-topbar {
                min-height: 50px;
            }

            .swiss-auth-brand {
                font-size: 17px;
            }

            .swiss-auth-brand-mark {
                width: 30px;
                height: 30px;

                flex-basis: 30px;
            }

            .swiss-auth-top-action {
                max-width: 170px;

                font-size: 11px;

                line-height: 1.4;

                text-align: right;
            }

            .swiss-auth-story {
                padding-top: 16px;
            }

            .swiss-auth-story h1 {
                font-size: 29px;

                letter-spacing: -0.8px;
            }

            .swiss-auth-page.swiss-register-page .swiss-auth-story h1 {
                font-size: 28px;
            }

            .swiss-auth-page.swiss-register-page .swiss-auth-story {
                padding: 16px 0 5px;
            }

            .swiss-auth-benefits {
                grid-template-columns: 1fr;

                gap: 8px;

                margin-top: 17px;
            }

            .swiss-auth-benefits li {
                align-items: center;

                font-size: 12px;
            }

            .swiss-auth-card {
                padding: 25px 18px;

                border-radius: 16px;
            }

            .swiss-auth-page.swiss-register-page .swiss-auth-card {
                padding: 25px 18px;
            }

            .swiss-auth-card-heading h2 {
                font-size: 24px;
            }

            .swiss-auth-price {
                align-items: flex-start;

                flex-direction: column;

                gap: 9px;

                padding: 16px;
            }

            .swiss-auth-price-value {
                font-size: 34px;
            }

            .swiss-auth-no-fee {
                padding-bottom: 0;
            }

            .swiss-auth-progress {
                gap: 7px;
            }

            .swiss-auth-progress-step {
                gap: 5px;

                font-size: 10px;
            }

            .swiss-auth-progress-step-number {
                width: 27px;
                height: 27px;

                flex-basis: 27px;
            }

            .swiss-auth-field-grid {
                grid-template-columns: 1fr;

                gap: 13px;
            }

            .swiss-auth-field--full {
                grid-column: auto;
            }

            .swiss-auth-step-actions {
                grid-template-columns: 1fr;
            }

            .swiss-auth-package-card {
                grid-template-columns:
                    auto
                    1fr;
            }

            .swiss-auth-package-price {
                grid-column: 2;

                font-size: 16px;
            }

            .swiss-auth-package-price small {
                text-align: left;
            }

        }

        /* Register-only Swiss red and responsive layout correction. */
        .swiss-auth-page.swiss-register-page .swiss-auth-shell {
            width: min(1380px, calc(100% - 56px)) !important;
            grid-template-columns: minmax(0, 0.84fr) minmax(0, 1.16fr) !important;
            column-gap: clamp(42px, 5vw, 72px) !important;
        }

        .swiss-auth-page.swiss-register-page .swiss-auth-card {
            width: 100% !important;
            max-width: 650px !important;
            padding: 40px 42px !important;
            border: 1px solid #e4e4e4 !important;
            border-radius: 18px !important;
            background: #ffffff !important;
            box-shadow: 0 18px 50px rgba(0, 0, 0, 0.06) !important;
        }

        .swiss-auth-page.swiss-register-page .swiss-auth-story {
            position: sticky !important;
            top: 32px !important;
            align-self: start !important;
            padding: 45px 0 80px !important;
        }

        .swiss-auth-page.swiss-register-page .swiss-auth-story h1 {
            font-size: 54px !important;
            font-weight: 700 !important;
            line-height: 1.05 !important;
            letter-spacing: -1.4px !important;
        }

        .swiss-auth-page.swiss-register-page .swiss-auth-brand-mark {
            background: #D71920 !important;
            box-shadow: 0 7px 20px rgba(215, 25, 32, 0.18) !important;
        }

        .swiss-auth-page.swiss-register-page .swiss-auth-top-action a,
        .swiss-auth-page.swiss-register-page .swiss-auth-inline-link {
            color: #D71920 !important;
        }

        .swiss-auth-page.swiss-register-page .swiss-auth-top-action a:hover,
        .swiss-auth-page.swiss-register-page .swiss-auth-inline-link:hover {
            color: #B9151B !important;
        }

        .swiss-auth-page.swiss-register-page .swiss-auth-card-heading h2 {
            color: #151515 !important;
            font-size: 30px !important;
            line-height: 1.2 !important;
            font-weight: 700 !important;
            letter-spacing: -0.6px !important;
        }

        .swiss-auth-page.swiss-register-page .swiss-auth-price {
            border-color: #E2E2E2 !important;
            background: #FFFFFF !important;
        }

        .swiss-auth-page.swiss-register-page .swiss-auth-price-value {
            color: #D71920 !important;
        }

        .swiss-auth-page.swiss-register-page .swiss-auth-progress-step.is-active
        .swiss-auth-progress-step-number,
        .swiss-auth-page.swiss-register-page .swiss-auth-progress-step.is-complete
        .swiss-auth-progress-step-number {
            border-color: #D71920 !important;
            background: #D71920 !important;
            color: #FFFFFF !important;
            box-shadow: 0 0 0 4px rgba(215, 25, 32, 0.08) !important;
        }

        .swiss-auth-page.swiss-register-page .swiss-auth-required {
            color: #D71920 !important;
        }

        .swiss-auth-page.swiss-register-page .swiss-auth-field input:focus,
        .swiss-auth-page.swiss-register-page .swiss-auth-field select:focus,
        .swiss-auth-page.swiss-register-page .swiss-auth-phone-control:focus-within {
            border-color: #D71920 !important;
            box-shadow: 0 0 0 3px rgba(215, 25, 32, 0.08) !important;
        }

        .swiss-auth-page.swiss-register-page button.swiss-auth-button:not(.swiss-auth-button--secondary) {
            width: 180px !important;
            min-height: 53px !important;
            border-color: #D71920 !important;
            background: #D71920 !important;
        }

        .swiss-auth-page.swiss-register-page button.swiss-auth-button:not(.swiss-auth-button--secondary):hover {
            border-color: #B9151B !important;
            background: #B9151B !important;
        }

        .swiss-auth-page.swiss-register-page .swiss-auth-package-card {
            border-color: #E2E2E2 !important;
            background: #FFFFFF !important;
        }

        .swiss-auth-page.swiss-register-page .swiss-auth-package-card input {
            accent-color: #D71920 !important;
        }

        .swiss-auth-page.swiss-register-page .swiss-auth-button:focus-visible,
        .swiss-auth-page.swiss-register-page .swiss-auth-top-action a:focus-visible,
        .swiss-auth-page.swiss-register-page .swiss-auth-inline-link:focus-visible {
            outline-color: rgba(215, 25, 32, 0.24) !important;
        }

        @media (max-width: 1050px) and (min-width: 821px) {
            .swiss-auth-page.swiss-register-page .swiss-auth-shell {
                width: min(100% - 48px, 1100px) !important;
                grid-template-columns: minmax(0, 0.84fr) minmax(0, 1.16fr) !important;
                column-gap: clamp(32px, 4vw, 48px) !important;
            }

            .swiss-auth-page.swiss-register-page .swiss-auth-story h1 {
                font-size: 40px !important;
            }

            .swiss-auth-page.swiss-register-page .swiss-auth-card {
                padding: 32px 28px !important;
            }
        }

        @media (max-width: 820px) and (min-width: 561px) {
            .swiss-auth-page.swiss-register-page .swiss-auth-shell {
                width: min(100% - 40px, 760px) !important;
                grid-template-columns: minmax(0, 0.84fr) minmax(0, 1.16fr) !important;
                column-gap: clamp(24px, 3.5vw, 34px) !important;
            }

            .swiss-auth-page.swiss-register-page .swiss-auth-story {
                position: static !important;
                padding: 20px 0 5px !important;
            }

            .swiss-auth-page.swiss-register-page .swiss-auth-story h1 {
                font-size: 32px !important;
                letter-spacing: -0.8px !important;
            }

            .swiss-auth-page.swiss-register-page .swiss-auth-card {
                padding: 28px 22px !important;
            }

            .swiss-auth-page.swiss-register-page button.swiss-auth-button:not(.swiss-auth-button--secondary) {
                width: 170px !important;
            }
        }

        @media (max-width: 560px) {
            .swiss-auth-page.swiss-register-page .swiss-auth-shell {
                width: calc(100% - 28px) !important;
                grid-template-columns: 1fr !important;
                row-gap: 14px !important;
            }

            .swiss-auth-page.swiss-register-page .swiss-auth-story {
                position: static !important;
                padding: 16px 0 5px !important;
            }

            .swiss-auth-page.swiss-register-page .swiss-auth-story h1 {
                font-size: 28px !important;
                letter-spacing: -0.6px !important;
            }

            .swiss-auth-page.swiss-register-page .swiss-auth-card {
                padding: 25px 18px !important;
            }

            .swiss-auth-page.swiss-register-page button.swiss-auth-button:not(.swiss-auth-button--secondary) {
                width: 100% !important;
            }
        }
        /* =========================================================
   FINAL SWISS BARBER REGISTER POSITION + THEME FIX
   ========================================================= */

/* Swiss Barber theme */
.swiss-auth-page {
    --swiss-auth-red: #3b9668 !important;
    --swiss-auth-red-dark: #2d8056 !important;
    --swiss-auth-dark: #111827;
    --swiss-auth-text: #202020;
    --swiss-auth-muted: #667085;
    --swiss-auth-border: #dde5e1;

    background: #f6f8f7 !important;
}


/* Remove vertical centering */
.swiss-auth-shell {
    align-items: start !important;
    align-content: start !important;

    grid-template-rows: auto auto !important;

    min-height: auto !important;

    padding-top: 24px !important;
    padding-bottom: 60px !important;
}


/* Top bar */
.swiss-auth-topbar {
    margin-bottom: 0 !important;
}


/* LEFT CONTENT — move upward */
.swiss-auth-story {
    align-self: start !important;

    padding-top: 48px !important;
    padding-bottom: 50px !important;

    margin: 0 !important;
}


/* Eyebrow */
.swiss-auth-eyebrow {
    color: #3b9668 !important;
}

.swiss-auth-eyebrow::before {
    background: #3b9668 !important;
}


/* Main heading */
.swiss-auth-story h1 {
    color: #111827 !important;

    margin-top: 0 !important;
    margin-bottom: 20px !important;
}


/* Story paragraph */
.swiss-auth-story-copy {
    color: #667085 !important;
}


/* Benefits */
.swiss-auth-benefits {
    margin-top: 30px !important;
}

.swiss-auth-benefits li {
    color: #202020 !important;
}


/* Benefit circles */
.swiss-auth-benefit-mark {
    border-color: rgba(59, 150, 104, 0.35) !important;
    background: rgba(59, 150, 104, 0.06) !important;
    color: #3b9668 !important;
}


/* Bottom accent line */
.swiss-auth-story-rule {
    background: #3b9668 !important;

    margin-top: 45px !important;
}


/* RIGHT FORM CARD — move upward */
.swiss-auth-card {
    align-self: start !important;

    margin-top: 22px !important;

    background: #ffffff !important;

    border-color: #e1e7e3 !important;

    box-shadow:
        0 20px 55px rgba(17, 24, 39, 0.07) !important;
}


/* Register heading */
.swiss-auth-card-heading h2 {
    color: #111827 !important;
}


/* Price */
.swiss-auth-price {
    background: #f7faf8 !important;
    border-color: #dce9e2 !important;
}

.swiss-auth-price-value {
    color: #3b9668 !important;
}


/* Progress */
.swiss-auth-progress-step.is-active {
    color: #111827 !important;
}

.swiss-auth-progress-step.is-active
.swiss-auth-progress-step-number,

.swiss-auth-progress-step.is-complete
.swiss-auth-progress-step-number {
    border-color: #3b9668 !important;
    background: #3b9668 !important;
    color: #ffffff !important;

    box-shadow:
        0 0 0 4px rgba(59, 150, 104, 0.10) !important;
}


/* Inputs */
.swiss-auth-field input:focus,
.swiss-auth-field select:focus {
    border-color: #3b9668 !important;

    box-shadow:
        0 0 0 3px rgba(59, 150, 104, 0.10) !important;
}


/* Required stars */
.swiss-auth-required {
    color: #3b9668 !important;
}


/* Phone fields */
.swiss-auth-phone-control:focus-within {
    border-color: #3b9668 !important;

    box-shadow:
        0 0 0 3px rgba(59, 150, 104, 0.10) !important;
}


/* Main button */
.swiss-auth-button {
    border-color: #3b9668 !important;
    background: #3b9668 !important;
}

.swiss-auth-button:hover {
    background: #2d8056 !important;
}


/* Inline links */
.swiss-auth-inline-link {
    color: #3b9668 !important;
}


/* Package selection */
.swiss-auth-package-card {
    border-color: #d7e7de !important;
    background: #f8fbf9 !important;
}

.swiss-auth-package-card input {
    accent-color: #3b9668 !important;
}


/* Focus outlines */
.swiss-auth-button:focus-visible,
.swiss-auth-top-action a:focus-visible,
.swiss-auth-inline-link:focus-visible {
    outline-color:
        rgba(59, 150, 104, 0.25) !important;
}


/* =========================================================
   DESKTOP POSITION
   ========================================================= */

@media (min-width: 821px) {

    .swiss-auth-shell {
        grid-template-columns:
            minmax(0, 1fr)
            minmax(0, 620px) !important;

        column-gap:
            clamp(55px, 6vw, 95px) !important;

        align-items: start !important;
        align-content: start !important;
    }

    .swiss-auth-story {
        padding-top: 45px !important;
    }

    .swiss-auth-card {
        margin-top: 20px !important;
    }
}


/* =========================================================
   TABLET
   ========================================================= */

@media (max-width: 1050px) and (min-width: 821px) {

    .swiss-auth-shell {
        width:
            min(100% - 48px, 920px) !important;

        column-gap: 40px !important;
    }

    .swiss-auth-story {
        padding-top: 35px !important;
    }

    .swiss-auth-story h1 {
        font-size: 39px !important;
    }
}


/* =========================================================
   MOBILE
   ========================================================= */

@media (max-width: 820px) {

    .swiss-auth-shell {
        min-height: auto !important;

        align-content: start !important;

        padding-top: 16px !important;
    }

    .swiss-auth-story {
        align-self: start !important;

        padding-top: 20px !important;
        padding-bottom: 5px !important;
    }

    .swiss-auth-card {
        align-self: start !important;

        margin-top: 0 !important;
    }
}
/* =========================================================
   FINAL REGISTER PAGE POLISH
   ========================================================= */

/* Swiss Barber brand mark */
.swiss-auth-brand-mark {
    background: #3B9668 !important;
    box-shadow: 0 7px 20px rgba(59, 150, 104, 0.18) !important;
}

/* Top login link */
.swiss-auth-top-action a {
    color: #3B9668 !important;
}

/* Form card */
.swiss-auth-card {
    border-color: #DDE5E1 !important;
}

/* Register heading */
.swiss-auth-card-heading h2 {
    font-size: 31px !important;
    line-height: 1.2 !important;
    font-weight: 700 !important;
    letter-spacing: -0.6px !important;
    color: #172033 !important;
}

/* Register subtitle */
.swiss-auth-card-heading p {
    font-size: 14px !important;
    line-height: 1.6 !important;
    color: #667085 !important;
}


/* =========================================================
   PRICE
   ========================================================= */

.swiss-auth-price-value {
    color: #3B9668 !important;
    font-size: 38px !important;
}

.swiss-auth-price-period {
    font-size: 14px !important;
}

.swiss-auth-no-fee {
    font-size: 13px !important;
}


/* =========================================================
   PROGRESS
   ========================================================= */

.swiss-auth-progress-step {
    font-size: 13px !important;
    color: #667085 !important;
}

.swiss-auth-progress-step.is-active {
    color: #172033 !important;
    font-weight: 600 !important;
}

.swiss-auth-progress-step-number {
    width: 32px !important;
    height: 32px !important;
    flex-basis: 32px !important;

    font-size: 12px !important;
}

.swiss-auth-progress-step.is-active
.swiss-auth-progress-step-number,

.swiss-auth-progress-step.is-complete
.swiss-auth-progress-step-number {
    background: #3B9668 !important;
    border-color: #3B9668 !important;
    box-shadow:
        0 0 0 4px rgba(59, 150, 104, 0.10) !important;
}


/* =========================================================
   FORM LABELS
   ========================================================= */

.swiss-auth-field label {
    margin-bottom: 8px !important;

    font-size: 13px !important;
    line-height: 1.4 !important;

    font-weight: 650 !important;

    color: #172033 !important;
}

.swiss-auth-required {
    color: #3B9668 !important;
}


/* =========================================================
   INPUTS
   ========================================================= */

.swiss-auth-field input,
.swiss-auth-field select {
    height: 52px !important;

    padding: 0 15px !important;

    font-size: 14px !important;

    color: #202020 !important;

    border-color: #D5DDD9 !important;

    border-radius: 9px !important;
}

.swiss-auth-field input::placeholder {
    color: #98A1AD !important;

    font-size: 14px !important;
}

.swiss-auth-field input:focus,
.swiss-auth-field select:focus {
    border-color: #3B9668 !important;

    box-shadow:
        0 0 0 3px rgba(59, 150, 104, 0.10) !important;
}


/* =========================================================
   PHONE
   ========================================================= */

.swiss-auth-phone-control {
    height: 52px !important;

    border-color: #D5DDD9 !important;
}

.swiss-auth-phone-control:focus-within {
    border-color: #3B9668 !important;

    box-shadow:
        0 0 0 3px rgba(59, 150, 104, 0.10) !important;
}

.swiss-auth-phone-prefix {
    font-size: 13px !important;
}

.swiss-auth-phone-control input {
    height: 50px !important;

    font-size: 14px !important;
}


/* =========================================================
   MAIN BUTTON
   ========================================================= */

.swiss-auth-button {
    min-height: 52px !important;

    background: #3B9668 !important;

    border-color: #3B9668 !important;

    font-size: 14px !important;
}

.swiss-auth-button:hover {
    background: #2D8056 !important;
    border-color: #2D8056 !important;
}


/* =========================================================
   LINKS
   ========================================================= */

.swiss-auth-inline-link {
    color: #3B9668 !important;
}


/* =========================================================
   PACKAGE SECTION
   ========================================================= */

.swiss-auth-package-card {
    border-color: #D5E6DD !important;
    background: #F8FBF9 !important;
}

.swiss-auth-package-card input {
    accent-color: #3B9668 !important;
}

.swiss-auth-package-name {
    font-size: 15px !important;
}

.swiss-auth-package-description {
    font-size: 13px !important;
    line-height: 1.55 !important;
}

.swiss-auth-package-price {
    font-size: 18px !important;
}


/* =========================================================
   DESKTOP FORM SPACING
   ========================================================= */

@media (min-width: 821px) {

    .swiss-auth-card {
        padding: 40px 38px !important;
    }

    .swiss-auth-form {
        gap: 18px !important;
    }

    .swiss-auth-field-grid {
        gap: 17px 14px !important;
    }
}
    </style>

</head>


<body class="swiss-auth-body">

    <div class="swiss-auth-page @yield('auth_page_class')">

        <div class="swiss-auth-shell">


            {{-- =====================================================
                 TOP BAR
                 ===================================================== --}}

            <header class="swiss-auth-topbar">

                <a
                    class="swiss-auth-brand"
                    href="{{ route('home') }}"
                >

                    <span
                        class="swiss-auth-brand-mark"
                        aria-hidden="true"
                    ></span>

                    <span>
                        Swiss Barber
                    </span>

                </a>


                <div class="swiss-auth-top-action">

                    @yield('top_action')

                </div>

            </header>


            {{-- =====================================================
                 LEFT STORY / MARKETING
                 ===================================================== --}}

            <section class="swiss-auth-story">

                @yield('story')

                <div
                    class="swiss-auth-story-rule"
                    aria-hidden="true"
                ></div>

            </section>


            {{-- =====================================================
                 FORM CARD
                 ===================================================== --}}

            <main class="swiss-auth-card">

                @yield('form_content')

            </main>


        </div>

    </div>


    @stack('scripts')

</body>

</html>