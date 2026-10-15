BEGIN;

CREATE TABLE customer (
    customer_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_number VARCHAR(30) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    company_name VARCHAR(200),
    email VARCHAR(254),
    phone VARCHAR(40),
    street VARCHAR(200) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country_code CHAR(2) NOT NULL DEFAULT 'DE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT customer_number_not_blank CHECK (btrim(customer_number) <> ''),
    CONSTRAINT customer_name_not_blank CHECK (
        btrim(first_name) <> '' AND btrim(last_name) <> ''
    ),
    CONSTRAINT customer_country_code_format CHECK (country_code ~ '^[A-Z]{2}$')
);

CREATE TABLE app_user (
    user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(254) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    customer_id BIGINT UNIQUE REFERENCES customer(customer_id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT app_user_email_not_blank CHECK (btrim(email) <> ''),
    CONSTRAINT app_user_password_hash_not_blank CHECK (btrim(password_hash) <> '')
);

CREATE TABLE app_role (
    role_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    role_code VARCHAR(30) NOT NULL UNIQUE,
    display_name VARCHAR(80) NOT NULL,
    CONSTRAINT app_role_code_not_blank CHECK (btrim(role_code) <> ''),
    CONSTRAINT app_role_display_name_not_blank CHECK (btrim(display_name) <> '')
);

CREATE TABLE app_user_role (
    user_id BIGINT NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES app_role(role_id) ON DELETE RESTRICT,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

INSERT INTO app_role (role_code, display_name)
VALUES
    ('CUSTOMER', 'Kunde'),
    ('EMPLOYEE', 'Mitarbeiter'),
    ('ADMIN', 'Administration')
ON CONFLICT (role_code) DO NOTHING;

COMMIT;
