package de.gruppe8.maschinenverleih.api;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.OffsetDateTime;

public record ReservationRequest(
        @Positive long machineId,
        @NotNull OffsetDateTime startAt,
        @NotNull OffsetDateTime endAt,
        @Positive Long customerId
) {
}
