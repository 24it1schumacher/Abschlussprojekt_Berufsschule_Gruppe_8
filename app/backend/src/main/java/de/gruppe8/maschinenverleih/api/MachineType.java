package de.gruppe8.maschinenverleih.api;

import java.math.BigDecimal;

public record MachineType(
        long id,
        String name,
        String description,
        BigDecimal dailyRentalRate,
        String currencyCode,
        boolean active
) {
}
