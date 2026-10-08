package de.gruppe8.maschinenverleih.api;

import java.time.Instant;

public record Message(long id, String text, Instant createdAt) {
}
