package de.gruppe8.maschinenverleih.api;

import java.time.OffsetDateTime;

public record Rental(
        long id,
        long reservationId,
        long customerId,
        String orderNumber,
        String status,
        String machineTypeName,
        String serialNumber,
        OffsetDateTime startAt,
        OffsetDateTime endAt,
        OffsetDateTime createdAt
) {
}
