package de.gruppe8.maschinenverleih.api;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CustomerRequest(
        @NotBlank @Size(max = 30) String customerNumber,
        @NotBlank @Size(max = 100) String firstName,
        @NotBlank @Size(max = 100) String lastName,
        @Size(max = 200) String companyName,
        @Email @Size(max = 254) String email,
        @Size(max = 40) String phone,
        @NotBlank @Size(max = 200) String street,
        @NotBlank @Size(max = 20) String postalCode,
        @NotBlank @Size(max = 100) String city,
        @NotBlank @Pattern(regexp = "[A-Za-z]{2}") String countryCode
) {
}
