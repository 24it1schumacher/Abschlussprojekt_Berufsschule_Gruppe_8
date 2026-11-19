package de.gruppe8.maschinenverleih.api;

import java.time.Instant;

public record Customer(
        long id,
        String customerNumber,
        String firstName,
        String lastName,
        String companyName,
        String email,
        String phone,
        String street,
        String postalCode,
        String city,
        String countryCode,
        Instant createdAt,
        boolean active
) {
}
