<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\View\View;

class AuthController extends Controller
{
    public function showRegister(): View
    {
        return view('auth.register');
    }

    public function showLogin(): View
    {
        return view('auth.login');
    }

    public function register(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'shop_name' => ['required', 'string', 'max:200'],
            'default_language' => ['required', 'in:en,de,fr,it'],
            'email' => ['required', 'email', 'max:191'],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['nullable', 'string', 'max:100'],
            'coc_number' => ['nullable', 'string', 'max:50'],
            'vat_id' => ['nullable', 'string', 'max:50'],
            'country' => ['required', 'in:Switzerland'],
            'street_name' => ['required', 'string', 'max:150'],
            'building_number' => ['required', 'string', 'max:30'],
            'postal_code' => ['required', 'string', 'max:20'],
            'city' => ['required', 'string', 'max:100'],
            'company_phone' => ['required', 'regex:/^0?[1-9][0-9\s().-]{6,14}$/'],
            'private_phone' => ['required', 'regex:/^0?[1-9][0-9\s().-]{6,14}$/'],
            'instagram_username' => ['nullable', 'string', 'max:100'],
            'referral_source' => ['nullable', 'string', 'max:150'],
            'package_code' => ['required', 'in:standard'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'company_phone.regex' => 'Enter a valid Swiss phone number.',
            'private_phone.regex' => 'Enter a valid Swiss phone number.',
        ]);

        try {
            $response = Http::acceptJson()
                ->timeout(15)
                ->post($this->apiUrl('/api/shops/register'), [
                    'shopName' => $data['shop_name'],
                    'defaultLanguage' => $data['default_language'],
                    'firstName' => $data['first_name'],
                    'lastName' => $data['last_name'] ?? '',
                    'email' => $data['email'],
                    'cocNumber' => $data['coc_number'] ?? null,
                    'vatId' => $data['vat_id'] ?? null,
                    'country' => $data['country'],
                    'streetName' => $data['street_name'],
                    'buildingNumber' => $data['building_number'],
                    'postalCode' => $data['postal_code'],
                    'city' => $data['city'],
                    'companyPhone' => $this->formatSwissPhone($data['company_phone']),
                    'privatePhone' => $this->formatSwissPhone($data['private_phone']),
                    'instagramUsername' => $data['instagram_username'] ?? null,
                    'referralSource' => $data['referral_source'] ?? null,
                    'packageCode' => $data['package_code'],
                    'password' => $data['password'],
                ]);
        } catch (\Throwable $exception) {
            report($exception);

            return back()
                ->withInput($request->except(['password', 'password_confirmation']))
                ->withErrors(['registration' => 'Registration is temporarily unavailable. Please try again.']);
        }

        if (!$response->successful()) {
            $message = $response->json('message', 'Registration could not be completed. Please review your details.');
            $errorKey = $response->status() === 409 ? 'email' : 'registration';

            return back()
                ->withInput($request->except(['password', 'password_confirmation']))
                ->withErrors([$errorKey => $message]);
        }

        return redirect()
            ->route('login')
            ->with('status', 'Registration received. Your Swiss Barber account is ready to sign in.');
    }

    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email', 'max:191'],
            'password' => ['required', 'string'],
        ]);

        try {
            $response = Http::acceptJson()
                ->timeout(15)
                ->post($this->apiUrl('/api/auth/login'), $credentials);
        } catch (\Throwable $exception) {
            report($exception);

            return back()
                ->withInput($request->only('email'))
                ->withErrors(['login' => 'Sign in is temporarily unavailable. Please try again.']);
        }

        if (!$response->successful()) {
            return back()
                ->withInput($request->only('email'))
                ->withErrors(['login' => $response->json('message', 'The email or password is incorrect.')]);
        }

        $request->session()->regenerate();
        $request->session()->put('swiss_barber_auth', [
            'token' => $response->json('data.token'),
            'user' => $response->json('data.user'),
        ]);

        return redirect()->route('home');
    }

    private function apiUrl(string $path): string
    {
        return rtrim((string) config('services.swiss_barber_api.url'), '/') . $path;
    }

    private function formatSwissPhone(string $phone): string
    {
        $digits = preg_replace('/\D+/', '', $phone) ?? '';
        $digits = ltrim($digits, '0');

        return '+41' . $digits;
    }
}