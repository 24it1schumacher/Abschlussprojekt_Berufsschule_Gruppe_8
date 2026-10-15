BEGIN;

CREATE TABLE invoice (
    invoice_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    rental_id BIGINT NOT NULL REFERENCES rental(rental_id) ON DELETE RESTRICT,
    invoice_number VARCHAR(40) NOT NULL UNIQUE,
    status VARCHAR(12) NOT NULL DEFAULT 'DRAFT',
    issued_at TIMESTAMPTZ,
    due_date DATE,
    currency_code CHAR(3) NOT NULL DEFAULT 'EUR',
    bill_to_name VARCHAR(200) NOT NULL,
    bill_to_street VARCHAR(200) NOT NULL,
    bill_to_postal_code VARCHAR(20) NOT NULL,
    bill_to_city VARCHAR(100) NOT NULL,
    bill_to_country_code CHAR(2) NOT NULL DEFAULT 'DE',
    correction_of_invoice_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT invoice_number_not_blank CHECK (btrim(invoice_number) <> ''),
    CONSTRAINT invoice_status_valid CHECK (status IN ('DRAFT', 'ISSUED', 'VOID')),
    CONSTRAINT invoice_issue_state_valid CHECK (
        (status = 'DRAFT' AND issued_at IS NULL)
        OR (status IN ('ISSUED', 'VOID') AND issued_at IS NOT NULL)
    ),
    CONSTRAINT invoice_due_date_valid CHECK (
        due_date IS NULL OR issued_at IS NULL OR due_date >= issued_at::date
    ),
    CONSTRAINT invoice_bill_to_not_blank CHECK (btrim(bill_to_name) <> ''),
    CONSTRAINT invoice_currency_format CHECK (currency_code ~ '^[A-Z]{3}$'),
    CONSTRAINT invoice_country_code_format CHECK (bill_to_country_code ~ '^[A-Z]{2}$'),
    CONSTRAINT invoice_id_rental_unique UNIQUE (invoice_id, rental_id),
    CONSTRAINT invoice_correction_same_rental_fk
        FOREIGN KEY (correction_of_invoice_id, rental_id)
        REFERENCES invoice(invoice_id, rental_id)
        ON DELETE RESTRICT
);

CREATE UNIQUE INDEX invoice_one_original_per_rental
    ON invoice(rental_id)
    WHERE correction_of_invoice_id IS NULL;

CREATE TABLE invoice_line (
    invoice_id BIGINT NOT NULL
        REFERENCES invoice(invoice_id) ON DELETE RESTRICT,
    line_number INTEGER NOT NULL,
    description VARCHAR(500) NOT NULL,
    quantity NUMERIC(12, 3) NOT NULL,
    unit_code VARCHAR(20) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    tax_rate NUMERIC(5, 4) NOT NULL,
    net_amount NUMERIC(14, 2)
        GENERATED ALWAYS AS (round(quantity * unit_price, 2)) STORED,
    tax_amount NUMERIC(14, 2)
        GENERATED ALWAYS AS (round(quantity * unit_price * tax_rate, 2)) STORED,
    gross_amount NUMERIC(14, 2)
        GENERATED ALWAYS AS (
            round(quantity * unit_price, 2)
            + round(quantity * unit_price * tax_rate, 2)
        ) STORED,
    PRIMARY KEY (invoice_id, line_number),
    CONSTRAINT invoice_line_number_positive CHECK (line_number > 0),
    CONSTRAINT invoice_line_description_not_blank CHECK (btrim(description) <> ''),
    CONSTRAINT invoice_line_quantity_positive CHECK (quantity > 0),
    CONSTRAINT invoice_line_unit_price_nonnegative CHECK (unit_price >= 0),
    CONSTRAINT invoice_line_tax_rate_valid CHECK (tax_rate BETWEEN 0 AND 1)
);

CREATE TABLE payment (
    payment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    invoice_id BIGINT NOT NULL REFERENCES invoice(invoice_id) ON DELETE RESTRICT,
    amount NUMERIC(14, 2) NOT NULL,
    paid_at TIMESTAMPTZ NOT NULL,
    payment_reference VARCHAR(120),
    recorded_by_user_id BIGINT REFERENCES app_user(user_id) ON DELETE SET NULL,
    notes TEXT,
    CONSTRAINT payment_amount_positive CHECK (amount > 0)
);

CREATE UNIQUE INDEX payment_reference_unique
    ON payment(payment_reference)
    WHERE payment_reference IS NOT NULL;

CREATE INDEX payment_invoice_id_idx ON payment(invoice_id);

CREATE VIEW invoice_payment_status AS
WITH invoice_totals AS (
    SELECT
        i.invoice_id,
        i.status AS invoice_status,
        i.due_date,
        COALESCE(SUM(il.gross_amount), 0)::NUMERIC(14, 2) AS total_amount
    FROM invoice i
    LEFT JOIN invoice_line il ON il.invoice_id = i.invoice_id
    GROUP BY i.invoice_id, i.status, i.due_date
),
payment_totals AS (
    SELECT invoice_id, SUM(amount)::NUMERIC(14, 2) AS paid_amount
    FROM payment
    GROUP BY invoice_id
)
SELECT
    it.invoice_id,
    it.total_amount,
    COALESCE(pt.paid_amount, 0)::NUMERIC(14, 2) AS paid_amount,
    (it.total_amount - COALESCE(pt.paid_amount, 0))::NUMERIC(14, 2) AS outstanding_amount,
    CASE
        WHEN it.invoice_status = 'DRAFT' THEN 'DRAFT'
        WHEN it.invoice_status = 'VOID' THEN 'VOID'
        WHEN COALESCE(pt.paid_amount, 0) >= it.total_amount THEN 'PAID'
        WHEN COALESCE(pt.paid_amount, 0) > 0 THEN 'PARTIALLY_PAID'
        WHEN it.due_date < CURRENT_DATE THEN 'OVERDUE'
        ELSE 'OPEN'
    END AS payment_status
FROM invoice_totals it
LEFT JOIN payment_totals pt ON pt.invoice_id = it.invoice_id;

COMMIT;
