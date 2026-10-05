<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
Route::post('/register', [AuthController::class, 'register'])->name('register.submit');
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.submit');

Route::get('/', function () {
    return view('pages.home');
})->name('home');

Route::get('/search', function () {
    return view('pages.search');
})->name('search');
Route::get('/info', function () {
    return view('pages.info');
})->name('info');
Route::get('/contact', function () {
    return view('pages.contact');
})->name('contact');

Route::get('/register-info', function () {
    return view('pages.register-info');
})->name('register-info');

Route::get('/terms-of-use', function () {
    return view('pages.terms-of-use');
})->name('terms-of-use');

Route::get('/privacy-policy', function () {
    return view('pages.privacy-policy');
})->name('privacy-policy');