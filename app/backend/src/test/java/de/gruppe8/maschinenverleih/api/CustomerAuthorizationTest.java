package de.gruppe8.maschinenverleih.api;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import de.gruppe8.maschinenverleih.data.AccountRepository;
import de.gruppe8.maschinenverleih.data.CustomerRepository;
import de.gruppe8.maschinenverleih.security.AppUserDetails;
import de.gruppe8.maschinenverleih.security.DatabaseUserDetailsService;
import de.gruppe8.maschinenverleih.security.SecurityConfiguration;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest({CustomerController.class, AuthController.class})
@Import({ApiExceptionHandler.class, SecurityConfiguration.class})
class CustomerAuthorizationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CustomerRepository customerRepository;

    @MockitoBean
    private AccountRepository accountRepository;

    @MockitoBean
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private DatabaseUserDetailsService userDetailsService;

    @Test
    void customerCannotListOtherCustomers() throws Exception {
        mockMvc.perform(get("/api/customers")
                        .with(user(appUser(101, "customer@example.test", "ROLE_CUSTOMER", 8L))))
                .andExpect(status().isForbidden());

        verifyNoInteractions(customerRepository);
    }

    @Test
    void employeeCanListCustomers() throws Exception {
        when(customerRepository.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/customers")
                        .with(user(appUser(5, "employee@example.test", "ROLE_EMPLOYEE", null))))
                .andExpect(status().isOk());

        verify(customerRepository).findAll();
    }

    @Test
    void unauthenticatedRequestIsRejected() throws Exception {
        mockMvc.perform(get("/api/customers"))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(customerRepository);
    }

    @Test
    void unauthenticatedSessionLookupIsRejected() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    private static AppUserDetails appUser(long id, String email, String role, Long customerId) {
        return new AppUserDetails(
                id,
                customerId,
                email,
                "not-used",
                true,
                false,
                List.of(new SimpleGrantedAuthority(role))
        );
    }
}
