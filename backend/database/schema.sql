USE swiss_barber;

-- =====================================================
-- 1. USERS
-- =====================================================

CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(150) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    phone VARCHAR(30),

    password_hash VARCHAR(255) NOT NULL,

    role ENUM(
        'super_admin',
        'owner',
        'manager',
        'receptionist',
        'barber'
    ) NOT NULL DEFAULT 'barber',

    status ENUM(
        'active',
        'inactive',
        'suspended'
    ) NOT NULL DEFAULT 'active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);


-- =====================================================
-- 2. BARBER SHOPS
-- =====================================================

CREATE TABLE barber_shops (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    owner_id INT UNSIGNED NOT NULL,

    name VARCHAR(200) NOT NULL,
    description TEXT,

    phone VARCHAR(30),
    email VARCHAR(191),

    website VARCHAR(255),

    address VARCHAR(255),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    canton VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Switzerland',

    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    currency CHAR(3) DEFAULT 'CHF',
    timezone VARCHAR(50) DEFAULT 'Europe/Zurich',

    tax_rate DECIMAL(5,2) DEFAULT 0.00,

    status ENUM(
        'pending',
        'active',
        'suspended',
        'inactive'
    ) NOT NULL DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_shop_owner
        FOREIGN KEY (owner_id)
        REFERENCES users(id)
        ON DELETE RESTRICT
);


-- =====================================================
-- 3. BRANCHES
-- =====================================================

CREATE TABLE branches (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    shop_id INT UNSIGNED NOT NULL,

    name VARCHAR(200) NOT NULL,

    phone VARCHAR(30),
    email VARCHAR(191),

    address VARCHAR(255),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    canton VARCHAR(100),

    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    status ENUM(
        'active',
        'inactive'
    ) NOT NULL DEFAULT 'active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_branch_shop
        FOREIGN KEY (shop_id)
        REFERENCES barber_shops(id)
        ON DELETE CASCADE
);


-- =====================================================
-- 4. STAFF
-- =====================================================

CREATE TABLE staff (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id INT UNSIGNED NOT NULL,
    shop_id INT UNSIGNED NOT NULL,
    branch_id INT UNSIGNED,

    display_name VARCHAR(150) NOT NULL,

    bio TEXT,

    profile_image VARCHAR(500),

    status ENUM(
        'active',
        'inactive'
    ) NOT NULL DEFAULT 'active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_staff_user (user_id),

    CONSTRAINT fk_staff_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_staff_shop
        FOREIGN KEY (shop_id)
        REFERENCES barber_shops(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_staff_branch
        FOREIGN KEY (branch_id)
        REFERENCES branches(id)
        ON DELETE SET NULL
);


-- =====================================================
-- 5. SERVICES
-- =====================================================

CREATE TABLE services (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    shop_id INT UNSIGNED NOT NULL,

    name VARCHAR(150) NOT NULL,
    description TEXT,

    duration_minutes INT UNSIGNED NOT NULL,

    price DECIMAL(10,2) NOT NULL,

    currency CHAR(3) DEFAULT 'CHF',

    status ENUM(
        'active',
        'inactive'
    ) NOT NULL DEFAULT 'active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_service_shop
        FOREIGN KEY (shop_id)
        REFERENCES barber_shops(id)
        ON DELETE CASCADE
);


-- =====================================================
-- 6. STAFF SERVICES
-- =====================================================

CREATE TABLE staff_services (
    staff_id INT UNSIGNED NOT NULL,
    service_id INT UNSIGNED NOT NULL,

    PRIMARY KEY (staff_id, service_id),

    CONSTRAINT fk_staff_service_staff
        FOREIGN KEY (staff_id)
        REFERENCES staff(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_staff_service_service
        FOREIGN KEY (service_id)
        REFERENCES services(id)
        ON DELETE CASCADE
);


-- =====================================================
-- 7. CUSTOMERS
-- =====================================================

CREATE TABLE customers (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    shop_id INT UNSIGNED NOT NULL,

    name VARCHAR(150) NOT NULL,

    phone VARCHAR(30) NOT NULL,
    email VARCHAR(191),

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_customer_shop
        FOREIGN KEY (shop_id)
        REFERENCES barber_shops(id)
        ON DELETE CASCADE,

    INDEX idx_customer_phone (phone),
    INDEX idx_customer_email (email)
);


-- =====================================================
-- 8. WORKING HOURS
-- =====================================================

CREATE TABLE working_hours (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    shop_id INT UNSIGNED NOT NULL,
    branch_id INT UNSIGNED,
    staff_id INT UNSIGNED,

    day_of_week TINYINT UNSIGNED NOT NULL,

    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    is_available BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_working_shop
        FOREIGN KEY (shop_id)
        REFERENCES barber_shops(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_working_branch
        FOREIGN KEY (branch_id)
        REFERENCES branches(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_working_staff
        FOREIGN KEY (staff_id)
        REFERENCES staff(id)
        ON DELETE CASCADE,

    INDEX idx_working_hours_day (day_of_week)
);


-- =====================================================
-- 9. BLOCKED TIMES
-- =====================================================

CREATE TABLE blocked_times (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    shop_id INT UNSIGNED NOT NULL,
    branch_id INT UNSIGNED,
    staff_id INT UNSIGNED,

    title VARCHAR(200),

    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,

    reason VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_blocked_shop
        FOREIGN KEY (shop_id)
        REFERENCES barber_shops(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_blocked_branch
        FOREIGN KEY (branch_id)
        REFERENCES branches(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_blocked_staff
        FOREIGN KEY (staff_id)
        REFERENCES staff(id)
        ON DELETE CASCADE,

    INDEX idx_blocked_dates (start_datetime, end_datetime)
);


-- =====================================================
-- 10. APPOINTMENTS
-- =====================================================

CREATE TABLE appointments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    shop_id INT UNSIGNED NOT NULL,
    branch_id INT UNSIGNED NOT NULL,

    customer_id INT UNSIGNED NOT NULL,
    staff_id INT UNSIGNED NOT NULL,

    appointment_date DATE NOT NULL,

    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    status ENUM(
        'pending',
        'confirmed',
        'completed',
        'cancelled',
        'no_show'
    ) NOT NULL DEFAULT 'pending',

    total_amount DECIMAL(10,2) DEFAULT 0.00,
    currency CHAR(3) DEFAULT 'CHF',

    customer_note TEXT,
    internal_note TEXT,

    management_token_hash VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_appointment_shop
        FOREIGN KEY (shop_id)
        REFERENCES barber_shops(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_appointment_branch
        FOREIGN KEY (branch_id)
        REFERENCES branches(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_appointment_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_appointment_staff
        FOREIGN KEY (staff_id)
        REFERENCES staff(id)
        ON DELETE RESTRICT,

    INDEX idx_appointment_date (appointment_date),
    INDEX idx_appointment_staff_date (staff_id, appointment_date),
    INDEX idx_appointment_branch_date (branch_id, appointment_date)
);


-- =====================================================
-- 11. APPOINTMENT SERVICES
-- =====================================================

CREATE TABLE appointment_services (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    appointment_id INT UNSIGNED NOT NULL,
    service_id INT UNSIGNED NOT NULL,

    service_name VARCHAR(150) NOT NULL,
    duration_minutes INT UNSIGNED NOT NULL,
    price DECIMAL(10,2) NOT NULL,

    CONSTRAINT fk_appointment_service_appointment
        FOREIGN KEY (appointment_id)
        REFERENCES appointments(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_appointment_service_service
        FOREIGN KEY (service_id)
        REFERENCES services(id)
        ON DELETE RESTRICT
);


-- =====================================================
-- 12. REVIEWS
-- =====================================================

CREATE TABLE reviews (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    shop_id INT UNSIGNED NOT NULL,
    branch_id INT UNSIGNED,
    customer_id INT UNSIGNED,
    appointment_id INT UNSIGNED,

    rating TINYINT UNSIGNED NOT NULL,

    comment TEXT,

    status ENUM(
        'pending',
        'approved',
        'rejected'
    ) NOT NULL DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_review_shop
        FOREIGN KEY (shop_id)
        REFERENCES barber_shops(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_review_branch
        FOREIGN KEY (branch_id)
        REFERENCES branches(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_review_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_review_appointment
        FOREIGN KEY (appointment_id)
        REFERENCES appointments(id)
        ON DELETE SET NULL
);


-- =====================================================
-- 13. NOTIFICATIONS
-- =====================================================

CREATE TABLE notifications (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id INT UNSIGNED,
    appointment_id INT UNSIGNED,

    type ENUM(
        'booking_confirmation',
        'booking_reminder',
        'booking_created',
        'rescheduled',
        'cancelled'
    ) NOT NULL,

    channel ENUM(
        'email',
        'sms'
    ) NOT NULL DEFAULT 'email',

    recipient VARCHAR(191) NOT NULL,

    subject VARCHAR(255),

    message TEXT,

    status ENUM(
        'pending',
        'sent',
        'failed'
    ) NOT NULL DEFAULT 'pending',

    sent_at DATETIME,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_notification_appointment
        FOREIGN KEY (appointment_id)
        REFERENCES appointments(id)
        ON DELETE SET NULL
);


-- =====================================================
-- 14. PAYMENTS
-- =====================================================

CREATE TABLE payments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    appointment_id INT UNSIGNED NOT NULL,

    amount DECIMAL(10,2) NOT NULL,
    currency CHAR(3) DEFAULT 'CHF',

    method VARCHAR(50),

    status ENUM(
        'pending',
        'paid',
        'failed',
        'refunded'
    ) NOT NULL DEFAULT 'pending',

    transaction_reference VARCHAR(255),

    paid_at DATETIME,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payment_appointment
        FOREIGN KEY (appointment_id)
        REFERENCES appointments(id)
        ON DELETE CASCADE
);


-- =====================================================
-- 15. INDEXES
-- =====================================================

CREATE INDEX idx_shops_city
ON barber_shops(city);

CREATE INDEX idx_shops_postal_code
ON barber_shops(postal_code);

CREATE INDEX idx_shops_canton
ON barber_shops(canton);

CREATE INDEX idx_branches_city
ON branches(city);

CREATE INDEX idx_services_shop_status
ON services(shop_id, status);