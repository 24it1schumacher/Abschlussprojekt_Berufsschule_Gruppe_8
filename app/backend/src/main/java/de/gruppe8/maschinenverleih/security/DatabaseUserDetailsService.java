package de.gruppe8.maschinenverleih.security;

import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class DatabaseUserDetailsService implements UserDetailsService {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseUserDetailsService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        List<UserRecord> users = jdbcTemplate.query(
                """
                SELECT user_id, customer_id, email, password_hash, is_active, password_change_required
                FROM app_user
                WHERE lower(email) = lower(?)
                """,
                (resultSet, rowNumber) -> {
                    long customerIdValue = resultSet.getLong("customer_id");
                    Long customerId = resultSet.wasNull() ? null : customerIdValue;
                    return new UserRecord(
                            resultSet.getLong("user_id"),
                            customerId,
                            resultSet.getString("email"),
                            resultSet.getString("password_hash"),
                            resultSet.getBoolean("is_active"),
                            resultSet.getBoolean("password_change_required")
                    );
                },
                email
        );

        if (users.isEmpty()) {
            throw new UsernameNotFoundException("User not found");
        }
        UserRecord user = users.get(0);
        List<SimpleGrantedAuthority> authorities = jdbcTemplate.query(
                """
                SELECT r.role_code
                FROM app_user_role ur
                JOIN app_role r ON r.role_id = ur.role_id
                WHERE ur.user_id = ?
                """,
                (resultSet, rowNumber) ->
                        new SimpleGrantedAuthority("ROLE_" + resultSet.getString("role_code")),
                user.userId()
        );
        return new AppUserDetails(
                user.userId(),
                user.customerId(),
                user.email(),
                user.passwordHash(),
                user.active(),
                user.passwordChangeRequired(),
                List.copyOf(authorities)
        );
    }

    private record UserRecord(
            long userId,
            Long customerId,
            String email,
            String passwordHash,
            boolean active,
            boolean passwordChangeRequired
    ) {
    }
}
