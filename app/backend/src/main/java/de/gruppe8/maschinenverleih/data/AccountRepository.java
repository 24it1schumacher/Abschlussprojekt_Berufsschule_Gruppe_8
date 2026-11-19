package de.gruppe8.maschinenverleih.data;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class AccountRepository {

    private final JdbcTemplate jdbcTemplate;

    public AccountRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public long createAccount(String email, String passwordHash, Long customerId, String roleCode) {
        Long roleId = jdbcTemplate.queryForObject(
                "SELECT role_id FROM app_role WHERE role_code = ?",
                Long.class,
                roleCode
        );
        Long userId = jdbcTemplate.queryForObject(
                """
                INSERT INTO app_user (email, password_hash, customer_id, password_change_required)
                VALUES (?, ?, ?, TRUE)
                RETURNING user_id
                """,
                Long.class,
                email,
                passwordHash,
                customerId
        );
        jdbcTemplate.update(
                "INSERT INTO app_user_role (user_id, role_id) VALUES (?, ?)",
                userId,
                roleId
        );
        return userId;
    }

    public void changePassword(long userId, String passwordHash) {
        jdbcTemplate.update(
                """
                UPDATE app_user
                SET password_hash = ?, password_change_required = FALSE
                WHERE user_id = ?
                """,
                passwordHash,
                userId
        );
    }
}
