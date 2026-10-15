import { checkDatabase, checkHealth, createMessage, getMessages, type Message } from "./api";
import "./style.css";

const apiStatus = document.querySelector<HTMLParagraphElement>("#api-status");
const form = document.querySelector<HTMLFormElement>("#message-form");
const messageInput = document.querySelector<HTMLInputElement>("#message-text");
const formStatus = document.querySelector<HTMLParagraphElement>("#form-status");
const messageList = document.querySelector<HTMLUListElement>("#message-list");

if (!apiStatus || !form || !messageInput || !formStatus || !messageList) {
  throw new Error("Die benötigten Elemente der Seite wurden nicht gefunden.");
}

const elements = { apiStatus, form, messageInput, formStatus, messageList };

function renderMessages(messages: Message[]): void {
  const items = messages.map((message) => {
    const item = document.createElement("li");
    const timestamp = new Date(message.createdAt).toLocaleString("de-DE");
    item.textContent = `${message.text} (${timestamp})`;
    return item;
  });
  elements.messageList.replaceChildren(...items);
}

async function refreshMessages(): Promise<void> {
  renderMessages(await getMessages());
}

async function initialize(): Promise<void> {
  try {
    await checkHealth();
    await checkDatabase();
  } catch {
    elements.apiStatus.textContent =
      "Backend oder PostgreSQL ist nicht erreichbar. Prüfe Verbindung und Startanleitung.";
    return;
  }

  elements.apiStatus.textContent = "Backend und PostgreSQL sind erreichbar.";
  try {
    await refreshMessages();
  } catch {
    elements.formStatus.textContent =
      "Verbindung steht, aber Nachrichten konnten nicht geladen werden. Prüfe, ob SQL-Schritt 001 ausgeführt wurde.";
  }
}

elements.form.addEventListener("submit", async (event: SubmitEvent) => {
  event.preventDefault();
  elements.formStatus.textContent = "";

  try {
    await createMessage(elements.messageInput.value.trim());
    elements.messageInput.value = "";
    elements.formStatus.textContent = "Nachricht wurde gespeichert.";
    await refreshMessages();
  } catch {
    elements.formStatus.textContent =
      "Nachricht konnte nicht gespeichert werden. Prüfe Backend und Datenbank.";
  }
});

void initialize();
