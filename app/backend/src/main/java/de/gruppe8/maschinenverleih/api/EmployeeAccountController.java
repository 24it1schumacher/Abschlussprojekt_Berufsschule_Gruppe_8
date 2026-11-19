package de.gruppe8.maschinenverleih.api;

import de.gruppe8.maschinenverleih.data.AccountRepository;
import jakarta.validation.Valid;
import java.util.Locale;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/accounts")
public class EmployeeAccountController {

    private final AccountRepository accounts;
    private final PasswordEncoder passwordEncoder;

    public EmployeeAccountController(AccountRepository accounts, PasswordEncoder passwordEncoder) {
        this.accounts = accounts;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/employees")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CreatedEmployee> createEmployee(@Valid @RequestBody CreateAccountRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        long userId = accounts.createAccount(
                email,
                passwordEncoder.encode(request.temporaryPassword()),
                null,
                "EMPLOYEE"
        );
        return ResponseEntity.status(201)
                .body(new CreatedEmployee(userId, email, "EMPLOYEE"));
    }

    public record CreatedEmployee(long userId, String email, String role) {
    }
}
