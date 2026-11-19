package de.gruppe8.maschinenverleih.api;

import de.gruppe8.maschinenverleih.data.ReservationRepository;
import de.gruppe8.maschinenverleih.security.AppUserDetails;
import java.util.List;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rentals")
public class RentalController {

    private final ReservationRepository reservations;

    public RentalController(ReservationRepository reservations) {
        this.reservations = reservations;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'EMPLOYEE', 'ADMIN')")
    public List<Rental> list(@AuthenticationPrincipal AppUserDetails user) {
        return reservations.findRentals(customerScope(user));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'EMPLOYEE', 'ADMIN')")
    public Rental get(@PathVariable long id, @AuthenticationPrincipal AppUserDetails user) {
        return reservations.findRentalById(id, customerScope(user));
    }

    private static Long customerScope(AppUserDetails user) {
        if (user.getAuthorities().stream().anyMatch(authority ->
                authority.getAuthority().equals("ROLE_CUSTOMER"))) {
            if (user.customerId() == null) {
                throw new AccessDeniedException("Das Kundenkonto ist keinem Kunden zugeordnet.");
            }
            return user.customerId();
        }
        return null;
    }
}
