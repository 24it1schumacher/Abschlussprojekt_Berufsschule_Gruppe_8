package de.gruppe8.maschinenverleih.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import de.gruppe8.maschinenverleih.api.ReservationRequest;
import de.gruppe8.maschinenverleih.data.CustomerRepository;
import de.gruppe8.maschinenverleih.data.MachineRepository;
import de.gruppe8.maschinenverleih.data.ReservationRepository;
import de.gruppe8.maschinenverleih.security.AppUserDetails;
import java.time.OffsetDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @Mock
    private CustomerRepository customers;

    @Mock
    private MachineRepository machines;

    @Mock
    private ReservationRepository reservations;

    @InjectMocks
    private ReservationService reservationService;

    @Test
    void customerCannotReserveForAnotherCustomer() {
        AppUserDetails customer = user(41, 12L, "ROLE_CUSTOMER");
        ReservationRequest request = request(4, 99L);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> reservationService.create(customer, request)
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        verify(customers, never()).exists(99L);
        verify(reservations, never()).create(
                99L,
                4,
                request.startAt(),
                request.endAt(),
                41
        );
    }

    @Test
    void customerCanOnlyCreateOwnReservationWhenMachineIsReservable() {
        AppUserDetails customer = user(41, 12L, "ROLE_CUSTOMER");
        ReservationRequest request = request(4, null);
        when(customers.exists(12L)).thenReturn(true);
        when(machines.isReservable(4)).thenReturn(true);

        reservationService.create(customer, request);

        verify(reservations).create(12L, 4, request.startAt(), request.endAt(), 41);
    }

    @Test
    void customerCannotReserveMachineThatIsNotAvailableForRental() {
        AppUserDetails customer = user(41, 12L, "ROLE_CUSTOMER");
        ReservationRequest request = request(4, null);
        when(customers.exists(12L)).thenReturn(true);
        when(machines.isReservable(4)).thenReturn(false);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> reservationService.create(customer, request)
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(reservations, never()).create(
                12L,
                4,
                request.startAt(),
                request.endAt(),
                41
        );
    }

    private static ReservationRequest request(long machineId, Long customerId) {
        return new ReservationRequest(
                machineId,
                OffsetDateTime.parse("2026-12-01T10:00:00Z"),
                OffsetDateTime.parse("2026-12-02T10:00:00Z"),
                customerId
        );
    }

    private static AppUserDetails user(long id, Long customerId, String role) {
        return new AppUserDetails(
                id,
                customerId,
                "user@example.test",
                "not-used",
                true,
                false,
                List.of(new SimpleGrantedAuthority(role))
        );
    }
}
