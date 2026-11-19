package de.gruppe8.maschinenverleih.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;
import java.util.Locale;

@Component
public class InitialAdminBootstrap implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;
    private final TransactionTemplate transactionTemplate;
    private final String email;
    private final String password;

    public InitialAdminBootstrap(
            JdbcTemplate jdbcTemplate,
            PasswordEncoder passwordEncoder,
            TransactionTemplate transactionTemplate,
            @Value("${BOOTSTRAP_ADMIN_EMAIL:}") String email,
            @Value("${BOOTSTRAP_ADMIN_PASSWORD:}") String password
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.passwordEncoder = passwordEncoder;
        this.transactionTemplate = transactionTemplate;
        this.email = email.trim().toLowerCase(Locale.ROOT);
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (email.isBlank() && password.isBlank()) {
            return;
        }
        if (email.isBlank() || !email.matches("[^\\s@]+@[^\\s@]+\\.[^\\s@]+")
                || password.isBlank() || password.length() < 12) {
            throw new IllegalStateException(
                    "BOOTSTRAP_ADMIN_EMAIL und BOOTSTRAP_ADMIN_PASSWORD müssen gesetzt sein; "
                            + "das Passwort muss mindestens 12 Zeichen haben."
            );
        }

        transactionTemplate.executeWithoutResult(status -> createAdminIfMissing());
    }

    private void createAdminIfMissing() {
        var existing = jdbcTemplate.query(
                "SELECT user_id FROM app_user WHERE lower(email) = lower(?)",
                (resultSet, rowNumber) -> resultSet.getLong("user_id"),
                email
        );
        if (!existing.isEmpty()) {
            Integer adminRoleCount = jdbcTemplate.queryForObject(
                    """
                    SELECT count(*)
                    FROM app_user_role ur
                    JOIN app_role r ON r.role_id = ur.role_id
                    WHERE ur.user_id = ? AND r.role_code = 'ADMIN'
                    """,
                    Integer.class,
                    existing.get(0)
            );
            if (adminRoleCount == null || adminRoleCount != 1) {
                throw new IllegalStateException(
                        "Die Bootstrap-E-Mail ist bereits vergeben und hat keine ADMIN-Rolle."
                );
            }
            return;
        }

        Long adminRoleId = jdbcTemplate.queryForObject(
                "SELECT role_id FROM app_role WHERE role_code = 'ADMIN'",
                Long.class
        );
        Long userId = jdbcTemplate.queryForObject(
                """
                INSERT INTO app_user (email, password_hash, password_change_required)
                VALUES (?, ?, TRUE)
                RETURNING user_id
                """,
                Long.class,
                email,
                passwordEncoder.encode(password)
        );
        jdbcTemplate.update(
                "INSERT INTO app_user_role (user_id, role_id) VALUES (?, ?)",
                userId,
                adminRoleId
        );
    }
}
