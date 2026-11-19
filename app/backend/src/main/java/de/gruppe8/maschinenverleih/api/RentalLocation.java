package de.gruppe8.maschinenverleih.api;

public record RentalLocation(
        long id,
        String code,
        String name,
        String street,
        String postalCode,
        String city,
        String countryCode,
        boolean active
) {
}
