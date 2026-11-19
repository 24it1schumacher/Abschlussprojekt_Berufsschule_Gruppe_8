package de.gruppe8.maschinenverleih.data;

import de.gruppe8.maschinenverleih.api.Rental;
import de.gruppe8.maschinenverleih.api.Reservation;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Repository
public class ReservationRepository {

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<Reservation> reservationMapper = (rs, row) -> new Reservation(
            rs.getLong("reservation_id"),
            rs.getLong("customer_id"),
            rs.getLong("machine_id"),
            rs.getString("machine_type_name"),
            rs.getString("serial_number"),
            rs.getObject("start_at", OffsetDateTime.class),
            rs.getObject("end_at", OffsetDateTime.class),
            rs.getString("reservation_status"),
            rs.getObject("reservation_created_at", OffsetDateTime.class),
            nullableLong(rs, "rental_id"),
            rs.getString("order_number"),
            rs.getString("rental_status")
    );

    private final RowMapper<Rental> rentalMapper = (rs, row) -> new Rental(
            rs.getLong("rental_id"),
            rs.getLong("reservation_id"),
            rs.getLong("customer_id"),
            rs.getString("order_number"),
            rs.getString("rental_status"),
            rs.getString("machine_type_name"),
            rs.getString("serial_number"),
            rs.getObject("start_at", OffsetDateTime.class),
            rs.getObject("end_at", OffsetDateTime.class),
            rs.getObject("rental_created_at", OffsetDateTime.class)
    );

    public ReservationRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public Reservation create(long customerId, long machineId, OffsetDateTime startAt, OffsetDateTime endAt, long actorUserId) {
        Long id = jdbcTemplate.queryForObject(
                """
                INSERT INTO reservation
                    (customer_id, machine_id, start_at, end_at, created_by_user_id)
                VALUES (?, ?, ?, ?, ?)
                RETURNING reservation_id
                """,
                Long.class,
                customerId,
                machineId,
                startAt,
                endAt,
                actorUserId
        );
        writeAudit(actorUserId, "RESERVATION", id, "CREATED", "{\"status\":\"REQUESTED\"}");
        return findById(id, null);
    }

    public List<Reservation> findAll(Long customerId) {
        String sql = reservationSelect();
        if (customerId != null) {
            sql += " WHERE r.customer_id = ?";
            return jdbcTemplate.query(sql + " ORDER BY r.created_at DESC, r.reservation_id DESC", reservationMapper, customerId);
        }
        return jdbcTemplate.query(sql + " ORDER BY r.created_at DESC, r.reservation_id DESC", reservationMapper);
    }

    public Reservation findById(long id, Long customerId) {
        String sql = reservationSelect() + " WHERE r.reservation_id = ?";
        if (customerId != null) {
            sql += " AND r.customer_id = ?";
            return jdbcTemplate.queryForObject(sql, reservationMapper, id, customerId);
        }
        return jdbcTemplate.queryForObject(sql, reservationMapper, id);
    }

    @Transactional
    public Reservation confirm(long id, long actorUserId) {
        String currentStatus = jdbcTemplate.queryForObject(
                "SELECT status FROM reservation WHERE reservation_id = ? FOR UPDATE",
                String.class,
                id
        );
        if (!"REQUESTED".equals(currentStatus)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Nur offene Reservierungsanfragen können bestätigt werden."
            );
        }

        jdbcTemplate.update("UPDATE reservation SET status = 'CONFIRMED' WHERE reservation_id = ?", id);
        writeAudit(actorUserId, "RESERVATION", id, "CONFIRMED", "{\"status\":\"CONFIRMED\"}");

        String orderNumber = "MV-" + UUID.randomUUID().toString().replace("-", "").substring(0, 20).toUpperCase();
        Long rentalId = jdbcTemplate.queryForObject(
                """
                INSERT INTO rental (reservation_id, order_number)
                VALUES (?, ?)
                RETURNING rental_id
                """,
                Long.class,
                id,
                orderNumber
        );
        writeAudit(actorUserId, "RENTAL", rentalId, "CREATED", "{\"status\":\"OPEN\"}");
        return findById(id, null);
    }

    public List<Rental> findRentals(Long customerId) {
        String sql = rentalSelect();
        if (customerId != null) {
            sql += " WHERE r.customer_id = ?";
            return jdbcTemplate.query(sql + " ORDER BY a.created_at DESC, a.rental_id DESC", rentalMapper, customerId);
        }
        return jdbcTemplate.query(sql + " ORDER BY a.created_at DESC, a.rental_id DESC", rentalMapper);
    }

    public Rental findRentalById(long id, Long customerId) {
        String sql = rentalSelect() + " WHERE a.rental_id = ?";
        if (customerId != null) {
            sql += " AND r.customer_id = ?";
            return jdbcTemplate.queryForObject(sql, rentalMapper, id, customerId);
        }
        return jdbcTemplate.queryForObject(sql, rentalMapper, id);
    }

    private void writeAudit(long actorUserId, String entityType, long entityId, String action, String details) {
        jdbcTemplate.update(
                """
                INSERT INTO audit_log (actor_user_id, entity_type, entity_id, action, details)
                VALUES (?, ?, ?, ?, ?::jsonb)
                """,
                actorUserId,
                entityType,
                entityId,
                action,
                details
        );
    }

    private static String reservationSelect() {
        return """
                SELECT r.reservation_id, r.customer_id, r.machine_id, mt.name AS machine_type_name,
                       m.serial_number, r.start_at, r.end_at, r.status AS reservation_status,
                       r.created_at AS reservation_created_at, a.rental_id, a.order_number,
                       a.status AS rental_status
                FROM reservation r
                JOIN machine m ON m.machine_id = r.machine_id
                JOIN machine_type mt ON mt.machine_type_id = m.machine_type_id
                LEFT JOIN rental a ON a.reservation_id = r.reservation_id
                """;
    }

    private static String rentalSelect() {
        return """
                SELECT a.rental_id, a.reservation_id, r.customer_id, a.order_number,
                       a.status AS rental_status, mt.name AS machine_type_name, m.serial_number,
                       r.start_at, r.end_at, a.created_at AS rental_created_at
                FROM rental a
                JOIN reservation r ON r.reservation_id = a.reservation_id
                JOIN machine m ON m.machine_id = r.machine_id
                JOIN machine_type mt ON mt.machine_type_id = m.machine_type_id
                """;
    }

    private static Long nullableLong(java.sql.ResultSet resultSet, String column) throws java.sql.SQLException {
        long value = resultSet.getLong(column);
        return resultSet.wasNull() ? null : value;
    }
}
