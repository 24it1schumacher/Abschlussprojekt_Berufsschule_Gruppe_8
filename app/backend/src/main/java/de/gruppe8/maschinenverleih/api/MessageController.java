package de.gruppe8.maschinenverleih.api;

import de.gruppe8.maschinenverleih.data.MessageRepository;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "${app.frontend-origin:http://localhost:5173}")
public class MessageController {

    private final MessageRepository repository;

    public MessageController(MessageRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Message> list() {
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<Message> create(@Valid @RequestBody CreateMessageRequest request) {
        Message created = repository.create(request.text().trim());
        return ResponseEntity.created(URI.create("/api/messages/" + created.id())).body(created);
    }
}
