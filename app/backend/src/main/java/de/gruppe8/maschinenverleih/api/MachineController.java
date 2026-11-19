package de.gruppe8.maschinenverleih.api;

import de.gruppe8.maschinenverleih.data.MachineRepository;
import jakarta.validation.Valid;
import java.net.URI;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController
public class MachineController {

    private final MachineRepository machines;

    public MachineController(MachineRepository machines) {
        this.machines = machines;
    }

    @GetMapping("/api/machine-types")
    public List<MachineType> listTypes() {
        return machines.findTypes();
    }

    @PostMapping("/api/machine-types")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    public ResponseEntity<MachineType> createType(@Valid @RequestBody MachineTypeRequest request) {
        MachineType created = machines.createType(request);
        return ResponseEntity.created(URI.create("/api/machine-types/" + created.id())).body(created);
    }

    @GetMapping("/api/locations")
    public List<RentalLocation> listLocations() {
        return machines.findLocations();
    }

    @PostMapping("/api/locations")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    public ResponseEntity<RentalLocation> createLocation(@Valid @RequestBody RentalLocationRequest request) {
        RentalLocation created = machines.createLocation(request);
        return ResponseEntity.created(URI.create("/api/locations/" + created.id())).body(created);
    }

    @GetMapping("/api/machines")
    public List<Machine> search(
            @RequestParam(required = false) Long machineTypeId,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) OffsetDateTime availableFrom,
            @RequestParam(required = false) OffsetDateTime availableUntil
    ) {
        if (machineTypeId != null && machineTypeId <= 0 || locationId != null && locationId <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Typ- und Standort-ID müssen positiv sein.");
        }
        if ((availableFrom == null) != (availableUntil == null)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Verfügbarkeitsprüfung benötigt Start- und Endzeit."
            );
        }
        if (availableFrom != null && !availableUntil.isAfter(availableFrom)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Das Ende muss nach dem Start liegen.");
        }
        return machines.search(machineTypeId, locationId, availableFrom, availableUntil);
    }

    @GetMapping("/api/machines/{id}")
    public Machine getMachine(@PathVariable long id) {
        return machines.findById(id);
    }

    @PostMapping("/api/machines")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    public ResponseEntity<Machine> create(@Valid @RequestBody MachineRequest request) {
        Machine created = machines.create(request);
        return ResponseEntity.created(URI.create("/api/machines/" + created.id())).body(created);
    }

    @PutMapping("/api/machines/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    public Machine update(@PathVariable long id, @Valid @RequestBody MachineRequest request) {
        return machines.update(id, request);
    }
}
