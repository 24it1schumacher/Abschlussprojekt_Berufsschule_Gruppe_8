package de.gruppe8.maschinenverleih.api;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import de.gruppe8.maschinenverleih.data.MessageRepository;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(MessageController.class)
class MessageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MessageRepository repository;

    @Test
    void createMessageReturnsCreatedResource() throws Exception {
        when(repository.create(eq("Testnachricht")))
                .thenReturn(new Message(1L, "Testnachricht", Instant.parse("2026-10-08T07:00:00Z")));

        mockMvc.perform(post("/api/messages")
                        .contentType("application/json")
                        .content("{\"text\":\" Testnachricht \"}"))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/messages/1"))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.text").value("Testnachricht"));

        verify(repository).create("Testnachricht");
    }

    @Test
    void createMessageRejectsBlankText() throws Exception {
        mockMvc.perform(post("/api/messages")
                        .contentType("application/json")
                        .content("{\"text\":\"   \"}"))
                .andExpect(status().isBadRequest());
    }
}
