<?php

use Illuminate\Support\Facades\Route;

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