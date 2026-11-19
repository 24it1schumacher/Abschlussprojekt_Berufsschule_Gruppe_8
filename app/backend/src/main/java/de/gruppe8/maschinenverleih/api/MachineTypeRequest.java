package de.gruppe8.maschinenverleih.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record MachineTypeRequest(
        @NotBlank @Size(max = 120) String name,
        @Size(max = 4000) String description,
        @NotNull @PositiveOrZero BigDecimal dailyRentalRate,
        @NotBlank @Pattern(regexp = "[A-Za-z]{3}") String currencyCode
) {
}
