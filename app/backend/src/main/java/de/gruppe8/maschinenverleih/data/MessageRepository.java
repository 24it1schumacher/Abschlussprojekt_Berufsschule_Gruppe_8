package de.gruppe8.maschinenverleih.data;

import de.gruppe8.maschinenverleih.api.Message;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class MessageRepository {

    private final JdbcTemplate jdbcTemplate;

    public MessageRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Message> findAll() {
        return jdbcTemplate.query(
                "SELECT id, text, created_at FROM app_message ORDER BY id DESC",
                (resultSet, rowNumber) -> new Message(
                        resultSet.getLong("id"),
                        resultSet.getString("text"),
                        resultSet.getObject("created_at", OffsetDateTime.class).toInstant()
                )
        );
    }

    public Message create(String text) {
        return jdbcTemplate.queryForObject(
                "INSERT INTO app_message (text) VALUES (?) RETURNING id, text, created_at",
                (resultSet, rowNumber) -> new Message(
                        resultSet.getLong("id"),
                        resultSet.getString("text"),
                        resultSet.getObject("created_at", OffsetDateTime.class).toInstant()
                ),
                text
        );
    }
}
