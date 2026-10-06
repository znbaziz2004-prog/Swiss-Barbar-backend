@extends('layouts.app')

@section('title', 'Shop Details - Swiss Barber')

@section('content')

<section style="
    padding: 80px 20px;
    max-width: 1200px;
    margin: auto;
">

    <div id="shopDetails">

        <div style="text-align:center; padding:60px;">
            <h2>Loading shop...</h2>
        </div>

    </div>

</section>

<script>
document.addEventListener('DOMContentLoaded', async function () {

    const shopId = @json($shopId);
    const container = document.getElementById('shopDetails');

    try {

        const response = await window.api.get(
            `/public/shops/${shopId}`
        );

        console.log('Shop details:', response.data);

        const shop = response.data?.data;

        if (!shop) {
            container.innerHTML = `
                <div style="text-align:center; padding:60px;">
                    <h2>Shop not found</h2>
                    <p>This barber shop is not available.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `

            <div style="
                display:grid;
                grid-template-columns: 1fr 1fr;
                gap:50px;
                align-items:center;
            ">

                <!-- IMAGE -->

                <div style="
                    width:100%;
                    height:450px;
                    border-radius:20px;
                    overflow:hidden;
                    background:#eee;
                ">

                    <img
                        src="${shop.image || '/images/sudandebarber.jpg'}"
                        alt="${shop.name}"
                        style="
                            width:100%;
                            height:100%;
                            object-fit:cover;
                        "
                        onerror="this.src='/images/sudandebarber.jpg'"
                    >

                </div>


                <!-- DETAILS -->

                <div>

                    <span style="
                        display:inline-block;
                        padding:7px 14px;
                        border-radius:20px;
                        background:#f1f1f1;
                        font-size:13px;
                        margin-bottom:15px;
                    ">
                        ${shop.plan_name || 'Barbershop'}
                    </span>


                    <h1 style="
                        font-size:42px;
                        margin:0 0 15px;
                    ">
                        ${shop.name}
                    </h1>


                    <p style="
                        font-size:18px;
                        line-height:1.7;
                        color:#666;
                        margin-bottom:25px;
                    ">
                        ${shop.description || 'Professional barber services in Switzerland.'}
                    </p>


                    <div style="
                        display:flex;
                        flex-direction:column;
                        gap:14px;
                        margin-bottom:30px;
                    ">

                        <div>
                            <strong>📍 Address</strong><br>
                            ${shop.address || 'Not available'},
                            ${shop.city || ''}
                        </div>

                        <div>
                            <strong>📞 Phone</strong><br>
                            ${shop.phone || 'Not available'}
                        </div>

                        <div>
                            <strong>✉ Email</strong><br>
                            ${shop.email || 'Not available'}
                        </div>

                        <div>
                            <strong>🌍 Country</strong><br>
                            ${shop.country || 'Switzerland'}
                        </div>

                        <div>
                            <strong>💰 Currency</strong><br>
                            ${shop.currency || 'CHF'}
                        </div>

                    </div>


                    <button
                        onclick="window.location.href='/shop/${shop.id}/book'"
                        style="
                            border:none;
                            padding:15px 30px;
                            border-radius:8px;
                            background:#111;
                            color:white;
                            font-size:16px;
                            cursor:pointer;
                        "
                    >
                        Book Appointment
                    </button>

                </div>

            </div>

        `;

    } catch (error) {

        console.error('Shop details error:', error);

        container.innerHTML = `
            <div style="text-align:center; padding:60px;">
                <h2>Could not load shop</h2>
                <p>Please try again later.</p>
            </div>
        `;
    }

});
</script>

@endsection