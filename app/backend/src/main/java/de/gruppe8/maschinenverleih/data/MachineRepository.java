package de.gruppe8.maschinenverleih.data;

import de.gruppe8.maschinenverleih.api.Machine;
import de.gruppe8.maschinenverleih.api.MachineRequest;
import de.gruppe8.maschinenverleih.api.MachineType;
import de.gruppe8.maschinenverleih.api.MachineTypeRequest;
import de.gruppe8.maschinenverleih.api.RentalLocation;
import de.gruppe8.maschinenverleih.api.RentalLocationRequest;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class MachineRepository {

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<MachineType> typeMapper = (rs, row) -> new MachineType(
            rs.getLong("machine_type_id"),
            rs.getString("name"),
            rs.getString("description"),
            rs.getBigDecimal("daily_rental_rate"),
            rs.getString("currency_code").trim(),
            rs.getBoolean("is_active")
    );

    private final RowMapper<RentalLocation> locationMapper = (rs, row) -> new RentalLocation(
            rs.getLong("rental_location_id"),
            rs.getString("location_code"),
            rs.getString("name"),
            rs.getString("street"),
            rs.getString("postal_code"),
            rs.getString("city"),
            rs.getString("country_code").trim(),
            rs.getBoolean("is_active")
    );

    private final RowMapper<Machine> machineMapper = (rs, row) -> {
        Timestamp createdAt = rs.getTimestamp("created_at");
        return new Machine(
                rs.getLong("machine_id"),
                rs.getLong("machine_type_id"),
                rs.getString("machine_type_name"),
                rs.getString("description"),
                rs.getBigDecimal("daily_rental_rate"),
                rs.getString("currency_code").trim(),
                rs.getLong("rental_location_id"),
                rs.getString("location_name"),
                rs.getString("location_city"),
                rs.getString("serial_number"),
                rs.getInt("manufacture_year"),
                rs.getBigDecimal("operating_hours"),
                rs.getBigDecimal("service_interval_hours"),
                (Integer) rs.getObject("service_interval_months"),
                rs.getString("condition_code"),
                rs.getBoolean("is_active"),
                createdAt.toInstant()
        );
    };

    public MachineRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<MachineType> findTypes() {
        return jdbcTemplate.query(
                """
                SELECT machine_type_id, name, description, daily_rental_rate, currency_code, is_active
                FROM machine_type WHERE is_active ORDER BY name
                """,
                typeMapper
        );
    }

    public MachineType createType(MachineTypeRequest request) {
        Long id = jdbcTemplate.queryForObject(
                """
                INSERT INTO machine_type (name, description, daily_rental_rate, currency_code)
                VALUES (?, ?, ?, ?)
                RETURNING machine_type_id
                """,
                Long.class,
                request.name().trim(),
                clean(request.description()),
                request.dailyRentalRate(),
                request.currencyCode().trim().toUpperCase()
        );
        return jdbcTemplate.queryForObject(
                """
                SELECT machine_type_id, name, description, daily_rental_rate, currency_code, is_active
                FROM machine_type WHERE machine_type_id = ?
                """,
                typeMapper,
                id
        );
    }

    public List<RentalLocation> findLocations() {
        return jdbcTemplate.query(
                """
                SELECT rental_location_id, location_code, name, street, postal_code, city, country_code, is_active
                FROM rental_location WHERE is_active ORDER BY name
                """,
                locationMapper
        );
    }

    public RentalLocation createLocation(RentalLocationRequest request) {
        Long id = jdbcTemplate.queryForObject(
                """
                INSERT INTO rental_location (location_code, name, street, postal_code, city, country_code)
                VALUES (?, ?, ?, ?, ?, ?)
                RETURNING rental_location_id
                """,
                Long.class,
                request.code().trim(),
                request.name().trim(),
                request.street().trim(),
                request.postalCode().trim(),
                request.city().trim(),
                request.countryCode().trim().toUpperCase()
        );
        return jdbcTemplate.queryForObject(
                """
                SELECT rental_location_id, location_code, name, street, postal_code, city, country_code, is_active
                FROM rental_location WHERE rental_location_id = ?
                """,
                locationMapper,
                id
        );
    }

    public List<Machine> search(Long machineTypeId, Long locationId, OffsetDateTime from, OffsetDateTime until) {
        StringBuilder sql = new StringBuilder("""
                SELECT m.machine_id, m.machine_type_id, mt.name AS machine_type_name, mt.description,
                       mt.daily_rental_rate, mt.currency_code, m.rental_location_id,
                       l.name AS location_name, l.city AS location_city, m.serial_number,
                       m.manufacture_year, m.operating_hours, mp.service_interval_hours,
                       mp.service_interval_months, m.condition_code, m.is_active, m.created_at
                FROM machine m
                JOIN machine_type mt ON mt.machine_type_id = m.machine_type_id
                JOIN rental_location l ON l.rental_location_id = m.rental_location_id
                LEFT JOIN maintenance_plan mp ON mp.machine_id = m.machine_id
                WHERE m.is_active AND mt.is_active AND l.is_active AND m.condition_code = 'GOOD'
                """);
        List<Object> parameters = new ArrayList<>();
        if (machineTypeId != null) {
            sql.append(" AND m.machine_type_id = ?");
            parameters.add(machineTypeId);
        }
        if (locationId != null) {
            sql.append(" AND m.rental_location_id = ?");
            parameters.add(locationId);
        }
        if (from != null) {
            sql.append("""
                     AND NOT EXISTS (
                         SELECT 1 FROM reservation r
                         WHERE r.machine_id = m.machine_id
                           AND r.status IN ('REQUESTED', 'CONFIRMED')
                           AND r.start_at < ? AND r.end_at > ?
                     )
                    """);
            parameters.add(until);
            parameters.add(from);
        }
        sql.append(" ORDER BY mt.name, l.name, m.serial_number");
        return jdbcTemplate.query(sql.toString(), machineMapper, parameters.toArray());
    }

    public Machine findById(long id) {
        return jdbcTemplate.queryForObject(machineSelect() + " WHERE m.machine_id = ?", machineMapper, id);
    }

    public boolean isReservable(long id) {
        Integer count = jdbcTemplate.queryForObject(
                """
                SELECT count(*)
                FROM machine m
                JOIN machine_type mt ON mt.machine_type_id = m.machine_type_id
                JOIN rental_location l ON l.rental_location_id = m.rental_location_id
                WHERE m.machine_id = ?
                  AND m.is_active AND mt.is_active AND l.is_active
                  AND m.condition_code = 'GOOD'
                """,
                Integer.class,
                id
        );
        return count != null && count > 0;
    }

    @Transactional
    public Machine create(MachineRequest request) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(
                    """
                    INSERT INTO machine
                        (machine_type_id, rental_location_id, serial_number, manufacture_year,
                         operating_hours, condition_code, is_active)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    Statement.RETURN_GENERATED_KEYS
            );
            bindMachine(statement, request);
            return statement;
        }, keyHolder);
        long machineId = keyHolder.getKey().longValue();
        saveMaintenancePlan(machineId, request);
        return findById(machineId);
    }

    @Transactional
    public Machine update(long id, MachineRequest request) {
        findById(id);
        jdbcTemplate.update(
                """
                UPDATE machine
                SET machine_type_id = ?, rental_location_id = ?, serial_number = ?,
                    manufacture_year = ?, operating_hours = ?, condition_code = ?, is_active = ?
                WHERE machine_id = ?
                """,
                request.machineTypeId(),
                request.locationId(),
                request.serialNumber().trim(),
                request.manufactureYear(),
                request.operatingHours(),
                request.conditionCode(),
                request.active(),
                id
        );
        saveMaintenancePlan(id, request);
        return findById(id);
    }

    private static String machineSelect() {
        return """
                SELECT m.machine_id, m.machine_type_id, mt.name AS machine_type_name, mt.description,
                       mt.daily_rental_rate, mt.currency_code, m.rental_location_id,
                       l.name AS location_name, l.city AS location_city, m.serial_number,
                       m.manufacture_year, m.operating_hours, mp.service_interval_hours,
                       mp.service_interval_months, m.condition_code, m.is_active, m.created_at
                FROM machine m
                JOIN machine_type mt ON mt.machine_type_id = m.machine_type_id
                JOIN rental_location l ON l.rental_location_id = m.rental_location_id
                LEFT JOIN maintenance_plan mp ON mp.machine_id = m.machine_id
                """;
    }

    private void saveMaintenancePlan(long machineId, MachineRequest request) {
        jdbcTemplate.update(
                """
                INSERT INTO maintenance_plan
                    (machine_id, service_interval_hours, service_interval_months)
                VALUES (?, ?, ?)
                ON CONFLICT (machine_id) DO UPDATE
                SET service_interval_hours = EXCLUDED.service_interval_hours,
                    service_interval_months = EXCLUDED.service_interval_months
                """,
                machineId,
                request.serviceIntervalHours(),
                request.serviceIntervalMonths()
        );
    }

    private static void bindMachine(PreparedStatement statement, MachineRequest request) throws java.sql.SQLException {
        statement.setLong(1, request.machineTypeId());
        statement.setLong(2, request.locationId());
        statement.setString(3, request.serialNumber().trim());
        statement.setInt(4, request.manufactureYear());
        statement.setBigDecimal(5, request.operatingHours());
        statement.setString(6, request.conditionCode());
        statement.setBoolean(7, request.active());
    }

    private static String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
