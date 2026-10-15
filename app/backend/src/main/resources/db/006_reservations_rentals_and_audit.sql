BEGIN;

CREATE TABLE reservation (
    reservation_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customer(customer_id) ON DELETE RESTRICT,
    machine_id BIGINT NOT NULL REFERENCES machine(machine_id) ON DELETE RESTRICT,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'REQUESTED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id BIGINT REFERENCES app_user(user_id) ON DELETE SET NULL,
    CONSTRAINT reservation_period_valid CHECK (end_at > start_at),
    CONSTRAINT reservation_status_valid CHECK (
        status IN ('REQUESTED', 'CONFIRMED', 'CANCELLED', 'REJECTED', 'CLOSED')
    )
);

ALTER TABLE reservation
    ADD CONSTRAINT reservation_no_overlapping_active_machine
    EXCLUDE USING gist (
        machine_id WITH =,
        tstzrange(start_at, end_at, '[)') WITH &&
    )
    WHERE (status IN ('REQUESTED', 'CONFIRMED'));

CREATE TABLE rental (
    rental_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reservation_id BIGINT NOT NULL UNIQUE
        REFERENCES reservation(reservation_id) ON DELETE RESTRICT,
    order_number VARCHAR(40) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    actual_start_at TIMESTAMPTZ,
    actual_return_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT rental_order_number_not_blank CHECK (btrim(order_number) <> ''),
    CONSTRAINT rental_status_valid CHECK (
        status IN ('OPEN', 'ACTIVE', 'COMPLETED', 'CANCELLED')
    ),
    CONSTRAINT rental_actual_period_valid CHECK (
        actual_return_at IS NULL
        OR actual_start_at IS NULL
        OR actual_return_at >= actual_start_at
    ),
    CONSTRAINT rental_status_timestamps_valid CHECK (
        (status <> 'ACTIVE' OR (actual_start_at IS NOT NULL AND actual_return_at IS NULL))
        AND (
            status <> 'COMPLETED'
            OR (actual_start_at IS NOT NULL AND actual_return_at IS NOT NULL)
        )
    )
);

CREATE TABLE audit_log (
    audit_log_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actor_user_id BIGINT REFERENCES app_user(user_id) ON DELETE SET NULL,
    entity_type VARCHAR(80) NOT NULL,
    entity_id BIGINT NOT NULL,
    action VARCHAR(40) NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    CONSTRAINT audit_entity_type_not_blank CHECK (btrim(entity_type) <> ''),
    CONSTRAINT audit_action_not_blank CHECK (btrim(action) <> '')
);

CREATE FUNCTION prevent_audit_log_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION 'audit_log is append-only';
END;
$$;

CREATE TRIGGER audit_log_append_only
    BEFORE UPDATE OR DELETE ON audit_log
    FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_change();

CREATE INDEX reservation_customer_id_idx ON reservation(customer_id);
CREATE INDEX reservation_machine_id_idx ON reservation(machine_id);
CREATE INDEX rental_status_idx ON rental(status);
CREATE INDEX audit_log_entity_idx ON audit_log(entity_type, entity_id, occurred_at DESC);

COMMIT;
