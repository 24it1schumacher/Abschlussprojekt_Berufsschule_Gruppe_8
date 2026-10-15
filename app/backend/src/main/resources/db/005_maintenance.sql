BEGIN;

CREATE TABLE maintenance_plan (
    maintenance_plan_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    machine_id BIGINT NOT NULL UNIQUE
        REFERENCES machine(machine_id) ON DELETE RESTRICT,
    service_interval_hours NUMERIC(10, 2),
    service_interval_months INTEGER,
    warning_hours_before NUMERIC(10, 2) NOT NULL DEFAULT 0,
    warning_days_before INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    CONSTRAINT maintenance_plan_has_interval CHECK (
        (service_interval_hours IS NOT NULL AND service_interval_hours > 0)
        OR (service_interval_months IS NOT NULL AND service_interval_months > 0)
    ),
    CONSTRAINT maintenance_plan_warning_hours_nonnegative CHECK (warning_hours_before >= 0),
    CONSTRAINT maintenance_plan_warning_days_nonnegative CHECK (warning_days_before >= 0)
);

CREATE TABLE maintenance_plan_part (
    maintenance_plan_id BIGINT NOT NULL
        REFERENCES maintenance_plan(maintenance_plan_id) ON DELETE CASCADE,
    part_id BIGINT NOT NULL REFERENCES part(part_id) ON DELETE RESTRICT,
    quantity NUMERIC(12, 3) NOT NULL,
    PRIMARY KEY (maintenance_plan_id, part_id),
    CONSTRAINT maintenance_plan_part_quantity_positive CHECK (quantity > 0)
);

CREATE TABLE maintenance_plan_material (
    maintenance_plan_id BIGINT NOT NULL
        REFERENCES maintenance_plan(maintenance_plan_id) ON DELETE CASCADE,
    material_id BIGINT NOT NULL
        REFERENCES consumable_material(material_id) ON DELETE RESTRICT,
    quantity NUMERIC(12, 3) NOT NULL,
    PRIMARY KEY (maintenance_plan_id, material_id),
    CONSTRAINT maintenance_plan_material_quantity_positive CHECK (quantity > 0)
);

CREATE TABLE maintenance_record (
    maintenance_record_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    maintenance_plan_id BIGINT NOT NULL
        REFERENCES maintenance_plan(maintenance_plan_id) ON DELETE RESTRICT,
    serviced_at TIMESTAMPTZ NOT NULL,
    operating_hours_at_service NUMERIC(12, 2) NOT NULL,
    performed_by_user_id BIGINT
        REFERENCES app_user(user_id) ON DELETE SET NULL,
    notes TEXT,
    CONSTRAINT maintenance_record_hours_nonnegative CHECK (operating_hours_at_service >= 0)
);

CREATE TABLE maintenance_record_part (
    maintenance_record_id BIGINT NOT NULL
        REFERENCES maintenance_record(maintenance_record_id) ON DELETE CASCADE,
    part_id BIGINT NOT NULL REFERENCES part(part_id) ON DELETE RESTRICT,
    quantity NUMERIC(12, 3) NOT NULL,
    PRIMARY KEY (maintenance_record_id, part_id),
    CONSTRAINT maintenance_record_part_quantity_positive CHECK (quantity > 0)
);

CREATE TABLE maintenance_record_material (
    maintenance_record_id BIGINT NOT NULL
        REFERENCES maintenance_record(maintenance_record_id) ON DELETE CASCADE,
    material_id BIGINT NOT NULL
        REFERENCES consumable_material(material_id) ON DELETE RESTRICT,
    quantity NUMERIC(12, 3) NOT NULL,
    PRIMARY KEY (maintenance_record_id, material_id),
    CONSTRAINT maintenance_record_material_quantity_positive CHECK (quantity > 0)
);

CREATE INDEX maintenance_record_latest_idx
    ON maintenance_record(maintenance_plan_id, serviced_at DESC);

CREATE VIEW machine_maintenance_status AS
SELECT
    m.machine_id,
    mp.maintenance_plan_id,
    m.operating_hours,
    latest.serviced_at AS last_serviced_at,
    latest.operating_hours_at_service AS last_service_operating_hours,
    CASE
        WHEN mp.maintenance_plan_id IS NULL OR latest.maintenance_record_id IS NULL
            THEN 'NOT_CONFIGURED'
        WHEN (
            mp.service_interval_hours IS NOT NULL
            AND m.operating_hours >= latest.operating_hours_at_service + mp.service_interval_hours
        ) OR (
            mp.service_interval_months IS NOT NULL
            AND CURRENT_TIMESTAMP >= latest.serviced_at
                + make_interval(months => mp.service_interval_months)
        )
            THEN 'OVERDUE'
        WHEN (
            mp.service_interval_hours IS NOT NULL
            AND m.operating_hours >= latest.operating_hours_at_service
                + mp.service_interval_hours - mp.warning_hours_before
        ) OR (
            mp.service_interval_months IS NOT NULL
            AND CURRENT_TIMESTAMP >= latest.serviced_at
                + make_interval(months => mp.service_interval_months)
                - make_interval(days => mp.warning_days_before)
        )
            THEN 'DUE_SOON'
        ELSE 'OK'
    END AS maintenance_status
FROM machine m
LEFT JOIN maintenance_plan mp ON mp.machine_id = m.machine_id
LEFT JOIN LATERAL (
    SELECT mr.maintenance_record_id, mr.serviced_at, mr.operating_hours_at_service
    FROM maintenance_record mr
    WHERE mr.maintenance_plan_id = mp.maintenance_plan_id
    ORDER BY mr.serviced_at DESC, mr.maintenance_record_id DESC
    LIMIT 1
) latest ON TRUE;

COMMIT;
