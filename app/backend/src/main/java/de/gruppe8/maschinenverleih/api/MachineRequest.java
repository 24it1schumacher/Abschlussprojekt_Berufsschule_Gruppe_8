package de.gruppe8.maschinenverleih.api;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record MachineRequest(
        @Positive long machineTypeId,
        @Positive long locationId,
        @NotBlank @Size(max = 100) String serialNumber,
        @Min(1800) @Max(2200) int manufactureYear,
        @NotNull @PositiveOrZero BigDecimal operatingHours,
        @Positive BigDecimal serviceIntervalHours,
        @Positive Integer serviceIntervalMonths,
        @NotBlank @Pattern(regexp = "GOOD|NEEDS_SERVICE|OUT_OF_SERVICE") String conditionCode,
        boolean active
) {
    @jakarta.validation.constraints.AssertTrue(message = "Mindestens ein Wartungsintervall muss angegeben werden.")
    public boolean hasMaintenanceInterval() {
        return serviceIntervalHours != null || serviceIntervalMonths != null;
    }
}
