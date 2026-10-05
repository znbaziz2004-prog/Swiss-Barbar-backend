ALTER TABLE users
    ADD COLUMN first_name VARCHAR(100) NULL AFTER name,
    ADD COLUMN last_name VARCHAR(100) NULL AFTER first_name,
    ADD COLUMN default_language VARCHAR(5) NOT NULL DEFAULT 'en' AFTER last_name;

ALTER TABLE barber_shops
    ADD COLUMN street_name VARCHAR(150) NULL AFTER address,
    ADD COLUMN building_number VARCHAR(30) NULL AFTER street_name,
    ADD COLUMN coc_number VARCHAR(50) NULL AFTER country,
    ADD COLUMN vat_id VARCHAR(50) NULL AFTER coc_number,
    ADD COLUMN instagram_username VARCHAR(100) NULL AFTER vat_id,
    ADD COLUMN referral_source VARCHAR(150) NULL AFTER instagram_username,
    ADD COLUMN subscription_package VARCHAR(50) NULL AFTER tax_rate,
    ADD COLUMN subscription_monthly_price DECIMAL(10,2) NULL AFTER subscription_package,
    ADD COLUMN subscription_currency CHAR(3) NULL AFTER subscription_monthly_price,
    ADD COLUMN subscription_one_time_fee DECIMAL(10,2) NULL AFTER subscription_currency;