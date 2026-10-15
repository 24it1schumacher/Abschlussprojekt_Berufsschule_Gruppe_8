package de.gruppe8.maschinenverleih.api;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "${app.frontend-origin:http://localhost:5173}")
public class DatabaseHealthController {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseHealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/api/health/database")
    public DatabaseHealthResponse databaseHealth() {
        jdbcTemplate.queryForObject("SELECT 1", Integer.class);
        return new DatabaseHealthResponse("ok");
    }

    public record DatabaseHealthResponse(String status) {
    }
}
