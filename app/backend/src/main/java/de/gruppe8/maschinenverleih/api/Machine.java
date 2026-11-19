package de.gruppe8.maschinenverleih.api;

import java.math.BigDecimal;
import java.time.Instant;

public record Machine(
        long id,
        long machineTypeId,
        String machineTypeName,
        String description,
        BigDecimal dailyRentalRate,
        String currencyCode,
        long locationId,
        String locationName,
        String locationCity,
        String serialNumber,
        int manufactureYear,
        BigDecimal operatingHours,
        BigDecimal serviceIntervalHours,
        Integer serviceIntervalMonths,
        String conditionCode,
        boolean active,
        Instant createdAt
) {
}
