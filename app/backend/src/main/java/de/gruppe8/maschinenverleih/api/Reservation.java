package de.gruppe8.maschinenverleih.api;

import java.time.OffsetDateTime;

public record Reservation(
        long id,
        long customerId,
        long machineId,
        String machineTypeName,
        String serialNumber,
        OffsetDateTime startAt,
        OffsetDateTime endAt,
        String status,
        OffsetDateTime createdAt,
        Long rentalId,
        String orderNumber,
        String rentalStatus
) {
}
