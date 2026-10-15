BEGIN;

CREATE TABLE machine_type (
    machine_type_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    daily_rental_rate NUMERIC(10, 2) NOT NULL,
    currency_code CHAR(3) NOT NULL DEFAULT 'EUR',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT machine_type_name_not_blank CHECK (btrim(name) <> ''),
    CONSTRAINT machine_type_daily_rate_nonnegative CHECK (daily_rental_rate >= 0),
    CONSTRAINT machine_type_currency_format CHECK (currency_code ~ '^[A-Z]{3}$')
);

CREATE TABLE rental_location (
    rental_location_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    location_code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    street VARCHAR(200) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country_code CHAR(2) NOT NULL DEFAULT 'DE',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT rental_location_code_not_blank CHECK (btrim(location_code) <> ''),
    CONSTRAINT rental_location_name_not_blank CHECK (btrim(name) <> ''),
    CONSTRAINT rental_location_country_code_format CHECK (country_code ~ '^[A-Z]{2}$')
);

CREATE TABLE machine (
    machine_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    machine_type_id BIGINT NOT NULL
        REFERENCES machine_type(machine_type_id) ON DELETE RESTRICT,
    rental_location_id BIGINT NOT NULL
        REFERENCES rental_location(rental_location_id) ON DELETE RESTRICT,
    serial_number VARCHAR(100) NOT NULL UNIQUE,
    manufacture_year SMALLINT NOT NULL,
    operating_hours NUMERIC(12, 2) NOT NULL DEFAULT 0,
    condition_code VARCHAR(30) NOT NULL DEFAULT 'GOOD',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT machine_serial_number_not_blank CHECK (btrim(serial_number) <> ''),
    CONSTRAINT machine_manufacture_year_valid CHECK (manufacture_year BETWEEN 1800 AND 2200),
    CONSTRAINT machine_operating_hours_nonnegative CHECK (operating_hours >= 0),
    CONSTRAINT machine_condition_code_valid CHECK (
        condition_code IN ('GOOD', 'NEEDS_SERVICE', 'OUT_OF_SERVICE')
    )
);

CREATE TABLE part (
    part_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    part_number VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    unit_code VARCHAR(20) NOT NULL DEFAULT 'piece',
    stock_quantity NUMERIC(14, 3) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT part_number_not_blank CHECK (btrim(part_number) <> ''),
    CONSTRAINT part_name_not_blank CHECK (btrim(name) <> ''),
    CONSTRAINT part_stock_nonnegative CHECK (stock_quantity >= 0)
);

CREATE TABLE consumable_material (
    material_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    material_number VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    unit_code VARCHAR(20) NOT NULL DEFAULT 'piece',
    stock_quantity NUMERIC(14, 3) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT material_number_not_blank CHECK (btrim(material_number) <> ''),
    CONSTRAINT material_name_not_blank CHECK (btrim(name) <> ''),
    CONSTRAINT material_stock_nonnegative CHECK (stock_quantity >= 0)
);

CREATE TABLE machine_type_material (
    machine_type_id BIGINT NOT NULL
        REFERENCES machine_type(machine_type_id) ON DELETE CASCADE,
    material_id BIGINT NOT NULL
        REFERENCES consumable_material(material_id) ON DELETE RESTRICT,
    PRIMARY KEY (machine_type_id, material_id)
);

CREATE INDEX machine_machine_type_id_idx ON machine(machine_type_id);
CREATE INDEX machine_rental_location_id_idx ON machine(rental_location_id);
CREATE INDEX machine_type_material_material_id_idx ON machine_type_material(material_id);

COMMIT;
