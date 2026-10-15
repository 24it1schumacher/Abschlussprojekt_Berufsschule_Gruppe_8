BEGIN;

CREATE TABLE supplier (
    supplier_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    supplier_number VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(254),
    phone VARCHAR(40),
    street VARCHAR(200),
    postal_code VARCHAR(20),
    city VARCHAR(100),
    country_code CHAR(2) NOT NULL DEFAULT 'DE',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT supplier_number_not_blank CHECK (btrim(supplier_number) <> ''),
    CONSTRAINT supplier_name_not_blank CHECK (btrim(name) <> ''),
    CONSTRAINT supplier_country_code_format CHECK (country_code ~ '^[A-Z]{2}$')
);

CREATE TABLE supplier_order (
    supplier_order_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    supplier_id BIGINT NOT NULL REFERENCES supplier(supplier_id) ON DELETE RESTRICT,
    order_number VARCHAR(40) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    ordered_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT supplier_order_number_not_blank CHECK (btrim(order_number) <> ''),
    CONSTRAINT supplier_order_status_valid CHECK (
        status IN ('DRAFT', 'ORDERED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED')
    ),
    CONSTRAINT supplier_order_received_after_ordered CHECK (
        received_at IS NULL OR ordered_at IS NULL OR received_at >= ordered_at
    )
);

CREATE TABLE supplier_order_line (
    supplier_order_id BIGINT NOT NULL
        REFERENCES supplier_order(supplier_order_id) ON DELETE RESTRICT,
    line_number INTEGER NOT NULL,
    part_id BIGINT REFERENCES part(part_id) ON DELETE RESTRICT,
    material_id BIGINT
        REFERENCES consumable_material(material_id) ON DELETE RESTRICT,
    quantity NUMERIC(12, 3) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    PRIMARY KEY (supplier_order_id, line_number),
    CONSTRAINT supplier_order_line_number_positive CHECK (line_number > 0),
    CONSTRAINT supplier_order_line_exactly_one_item CHECK (
        (part_id IS NOT NULL AND material_id IS NULL)
        OR (part_id IS NULL AND material_id IS NOT NULL)
    ),
    CONSTRAINT supplier_order_line_quantity_positive CHECK (quantity > 0),
    CONSTRAINT supplier_order_line_unit_price_nonnegative CHECK (unit_price >= 0)
);

CREATE INDEX supplier_order_supplier_id_idx ON supplier_order(supplier_id);
CREATE INDEX supplier_order_line_part_id_idx
    ON supplier_order_line(part_id)
    WHERE part_id IS NOT NULL;
CREATE INDEX supplier_order_line_material_id_idx
    ON supplier_order_line(material_id)
    WHERE material_id IS NOT NULL;

COMMIT;
