package de.gruppe8.maschinenverleih.service;

import de.gruppe8.maschinenverleih.api.Reservation;
import de.gruppe8.maschinenverleih.api.ReservationRequest;
import de.gruppe8.maschinenverleih.data.CustomerRepository;
import de.gruppe8.maschinenverleih.data.MachineRepository;
import de.gruppe8.maschinenverleih.data.ReservationRepository;
import de.gruppe8.maschinenverleih.security.AppUserDetails;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ReservationService {

    private final CustomerRepository customers;
    private final MachineRepository machines;
    private final ReservationRepository reservations;

    public ReservationService(
            CustomerRepository customers,
            MachineRepository machines,
            ReservationRepository reservations
    ) {
        this.customers = customers;
        this.machines = machines;
        this.reservations = reservations;
    }

    @Transactional
    public Reservation create(AppUserDetails user, ReservationRequest request) {
        if (!request.endAt().isAfter(request.startAt())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Das Ende muss nach dem Start liegen.");
        }
        long customerId;
        if (hasRole(user, "CUSTOMER")) {
            if (user.customerId() == null) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Das Kundenkonto ist keinem Kunden zugeordnet.");
            }
            if (request.customerId() != null && !request.customerId().equals(user.customerId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Du kannst nur für dein eigenes Kundenkonto reservieren.");
            }
            customerId = user.customerId();
        } else {
            if (request.customerId() == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Mitarbeitende müssen die Kunden-ID für die Reservierung angeben."
                );
            }
            customerId = request.customerId();
        }
        if (!customers.exists(customerId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Aktiver Kunde wurde nicht gefunden.");
        }
        if (!machines.isReservable(request.machineId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Die Maschine ist nicht zur Reservierung verfügbar.");
        }
        return reservations.create(
                customerId,
                request.machineId(),
                request.startAt(),
                request.endAt(),
                user.userId()
        );
    }

    private static boolean hasRole(AppUserDetails user, String role) {
        return user.getAuthorities().stream().anyMatch(authority -> authority.getAuthority().equals("ROLE_" + role));
    }
}
