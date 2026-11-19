package de.gruppe8.maschinenverleih.data;

import de.gruppe8.maschinenverleih.api.Customer;
import de.gruppe8.maschinenverleih.api.CustomerRequest;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class CustomerRepository {

    private static final String COLUMNS = """
            customer_id, customer_number, first_name, last_name, company_name, email, phone,
            street, postal_code, city, country_code, created_at, is_active
            """;

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<Customer> rowMapper = (resultSet, rowNumber) -> {
        Timestamp createdAt = resultSet.getTimestamp("created_at");
        return new Customer(
                resultSet.getLong("customer_id"),
                resultSet.getString("customer_number"),
                resultSet.getString("first_name"),
                resultSet.getString("last_name"),
                resultSet.getString("company_name"),
                resultSet.getString("email"),
                resultSet.getString("phone"),
                resultSet.getString("street"),
                resultSet.getString("postal_code"),
                resultSet.getString("city"),
                resultSet.getString("country_code").trim(),
                createdAt.toInstant(),
                resultSet.getBoolean("is_active")
        );
    };

    public CustomerRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Customer> findAll() {
        return jdbcTemplate.query(
                "SELECT " + COLUMNS + " FROM customer ORDER BY last_name, first_name, customer_id",
                rowMapper
        );
    }

    public Customer findById(long id) {
        return jdbcTemplate.queryForObject(
                "SELECT " + COLUMNS + " FROM customer WHERE customer_id = ?",
                rowMapper,
                id
        );
    }

    public Customer create(CustomerRequest request) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(
                    """
                    INSERT INTO customer
                        (customer_number, first_name, last_name, company_name, email, phone,
                         street, postal_code, city, country_code)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    Statement.RETURN_GENERATED_KEYS
            );
            bindRequest(statement, request);
            return statement;
        }, keyHolder);
        Number key = keyHolder.getKey();
        return findById(key.longValue());
    }

    public Customer update(long id, CustomerRequest request) {
        jdbcTemplate.update(
                """
                UPDATE customer
                SET customer_number = ?, first_name = ?, last_name = ?, company_name = ?,
                    email = ?, phone = ?, street = ?, postal_code = ?, city = ?, country_code = ?
                WHERE customer_id = ?
                """,
                request.customerNumber().trim(),
                request.firstName().trim(),
                request.lastName().trim(),
                clean(request.companyName()),
                clean(request.email()),
                clean(request.phone()),
                request.street().trim(),
                request.postalCode().trim(),
                request.city().trim(),
                request.countryCode().trim().toUpperCase(),
                id
        );
        return findById(id);
    }

    public boolean exists(long id) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT count(*) FROM customer WHERE customer_id = ? AND is_active",
                Integer.class,
                id
        );
        return count != null && count > 0;
    }

    public boolean hasAccount(long id) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT count(*) FROM app_user WHERE customer_id = ?",
                Integer.class,
                id
        );
        return count != null && count > 0;
    }

    public void deactivate(long id) {
        jdbcTemplate.update("UPDATE customer SET is_active = FALSE WHERE customer_id = ?", id);
    }

    private static void bindRequest(PreparedStatement statement, CustomerRequest request) throws java.sql.SQLException {
        statement.setString(1, request.customerNumber().trim());
        statement.setString(2, request.firstName().trim());
        statement.setString(3, request.lastName().trim());
        statement.setString(4, clean(request.companyName()));
        statement.setString(5, clean(request.email()));
        statement.setString(6, clean(request.phone()));
        statement.setString(7, request.street().trim());
        statement.setString(8, request.postalCode().trim());
        statement.setString(9, request.city().trim());
        statement.setString(10, request.countryCode().trim().toUpperCase());
    }

    private static String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
