BEGIN;

CREATE TABLE customer_order (
    customer_order_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    rental_id BIGINT NOT NULL REFERENCES rental(rental_id) ON DELETE RESTRICT,
    order_number VARCHAR(40) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'REQUESTED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT customer_order_number_not_blank CHECK (btrim(order_number) <> ''),
    CONSTRAINT customer_order_status_valid CHECK (
        status IN ('REQUESTED', 'CONFIRMED', 'FULFILLED', 'CANCELLED')
    )
);

CREATE TABLE customer_order_material_line (
    customer_order_id BIGINT NOT NULL
        REFERENCES customer_order(customer_order_id) ON DELETE RESTRICT,
    material_id BIGINT NOT NULL
        REFERENCES consumable_material(material_id) ON DELETE RESTRICT,
    quantity NUMERIC(12, 3) NOT NULL,
    unit_price_at_order NUMERIC(12, 2) NOT NULL,
    PRIMARY KEY (customer_order_id, material_id),
    CONSTRAINT customer_order_material_quantity_positive CHECK (quantity > 0),
    CONSTRAINT customer_order_material_price_nonnegative CHECK (unit_price_at_order >= 0)
);

CREATE INDEX customer_order_rental_id_idx ON customer_order(rental_id);
CREATE INDEX customer_order_material_line_material_id_idx
    ON customer_order_material_line(material_id);

COMMIT;
