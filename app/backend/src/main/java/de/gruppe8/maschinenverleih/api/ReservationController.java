package de.gruppe8.maschinenverleih.api;

import de.gruppe8.maschinenverleih.data.ReservationRepository;
import de.gruppe8.maschinenverleih.security.AppUserDetails;
import de.gruppe8.maschinenverleih.service.ReservationService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationRepository reservations;
    private final ReservationService reservationService;

    public ReservationController(ReservationRepository reservations, ReservationService reservationService) {
        this.reservations = reservations;
        this.reservationService = reservationService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'EMPLOYEE', 'ADMIN')")
    public List<Reservation> list(@AuthenticationPrincipal AppUserDetails user) {
        return reservations.findAll(customerScope(user));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'EMPLOYEE', 'ADMIN')")
    public Reservation get(@PathVariable long id, @AuthenticationPrincipal AppUserDetails user) {
        return reservations.findById(id, customerScope(user));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<Reservation> create(
            @Valid @RequestBody ReservationRequest request,
            @AuthenticationPrincipal AppUserDetails user
    ) {
        Reservation created = reservationService.create(user, request);
        return ResponseEntity.created(URI.create("/api/reservations/" + created.id())).body(created);
    }

    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    public Reservation confirm(@PathVariable long id, @AuthenticationPrincipal AppUserDetails user) {
        return reservations.confirm(id, user.userId());
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
