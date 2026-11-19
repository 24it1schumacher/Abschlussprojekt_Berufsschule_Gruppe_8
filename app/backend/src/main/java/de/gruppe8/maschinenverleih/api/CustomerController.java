package de.gruppe8.maschinenverleih.api;

import de.gruppe8.maschinenverleih.data.AccountRepository;
import de.gruppe8.maschinenverleih.data.CustomerRepository;
import de.gruppe8.maschinenverleih.security.AppUserDetails;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.Locale;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerRepository customers;
    private final AccountRepository accounts;
    private final PasswordEncoder passwordEncoder;

    public CustomerController(
            CustomerRepository customers,
            AccountRepository accounts,
            PasswordEncoder passwordEncoder
    ) {
        this.customers = customers;
        this.accounts = accounts;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    public List<Customer> list() {
        return customers.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    public Customer get(@PathVariable long id) {
        return customers.findById(id);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public Customer me(@AuthenticationPrincipal AppUserDetails user) {
        if (user.customerId() == null) {
            throw new AccessDeniedException("Das Konto ist keinem Kunden zugeordnet.");
        }
        return customers.findById(user.customerId());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    public ResponseEntity<Customer> create(@Valid @RequestBody CustomerRequest request) {
        Customer created = customers.create(request);
        return ResponseEntity.created(URI.create("/api/customers/" + created.id())).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    public Customer update(@PathVariable long id, @Valid @RequestBody CustomerRequest request) {
        return customers.update(id, request);
    }

    @PostMapping("/{id}/account")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    public ResponseEntity<CreatedAccount> createAccount(
            @PathVariable long id,
            @Valid @RequestBody CreateAccountRequest request
    ) {
        if (!customers.exists(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Kunde wurde nicht gefunden.");
        }
        if (customers.hasAccount(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Für diesen Kunden existiert bereits ein Konto.");
        }
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        long userId = accounts.createAccount(
                email,
                passwordEncoder.encode(request.temporaryPassword()),
                id,
                "CUSTOMER"
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new CreatedAccount(userId, id, email, "CUSTOMER"));
    }

    public record CreatedAccount(long userId, Long customerId, String email, String role) {
    }
}
