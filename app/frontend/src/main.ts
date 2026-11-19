import {
  changePassword,
  checkDatabase,
  checkHealth,
  createMessage,
  getCurrentUser,
  getMessages,
  login,
  logout,
  type Message,
  type UserSession,
} from "./api";
import "./style.css";

const apiStatus = document.querySelector<HTMLParagraphElement>("#api-status");
const loginSection = document.querySelector<HTMLElement>("#login-section");
const loginForm = document.querySelector<HTMLFormElement>("#login-form");
const loginEmail = document.querySelector<HTMLInputElement>("#login-email");
const loginPassword = document.querySelector<HTMLInputElement>("#login-password");
const loginStatus = document.querySelector<HTMLParagraphElement>("#login-status");
const passwordSection = document.querySelector<HTMLElement>("#password-section");
const passwordForm = document.querySelector<HTMLFormElement>("#password-form");
const currentPassword = document.querySelector<HTMLInputElement>("#current-password");
const newPassword = document.querySelector<HTMLInputElement>("#new-password");
const passwordStatus = document.querySelector<HTMLParagraphElement>("#password-status");
const logoutButton = document.querySelector<HTMLButtonElement>("#logout-button");
const messagesSection = document.querySelector<HTMLElement>("#messages-section");
const messageForm = document.querySelector<HTMLFormElement>("#message-form");
const messageInput = document.querySelector<HTMLInputElement>("#message-text");
const formStatus = document.querySelector<HTMLParagraphElement>("#form-status");
const messageList = document.querySelector<HTMLUListElement>("#message-list");

if (
  !apiStatus || !loginSection || !loginForm || !loginEmail || !loginPassword || !loginStatus
  || !passwordSection || !passwordForm || !currentPassword || !newPassword || !passwordStatus
  || !logoutButton || !messagesSection || !messageForm || !messageInput || !formStatus || !messageList
) {
  throw new Error("Die benötigten Elemente der Seite wurden nicht gefunden.");
}

const elements = {
  apiStatus,
  loginSection,
  loginForm,
  loginEmail,
  loginPassword,
  loginStatus,
  passwordSection,
  passwordForm,
  currentPassword,
  newPassword,
  passwordStatus,
  logoutButton,
  messagesSection,
  messageForm,
  messageInput,
  formStatus,
  messageList,
};

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

async function showSession(session: UserSession): Promise<void> {
  elements.loginSection.hidden = true;
  elements.logoutButton.hidden = false;
  elements.apiStatus.textContent = `Angemeldet als ${session.email}.`;

  if (session.passwordChangeRequired) {
    elements.passwordSection.hidden = false;
    elements.messagesSection.hidden = true;
    return;
  }

  elements.passwordSection.hidden = true;
  elements.messagesSection.hidden = false;
  try {
    await refreshMessages();
  } catch {
    elements.formStatus.textContent =
      "Nachrichten konnten nicht geladen werden. Für den Beispielbereich muss SQL-Schritt 001 ausgeführt sein.";
  }
}

function showLoggedOut(message = ""): void {
  elements.loginSection.hidden = false;
  elements.passwordSection.hidden = true;
  elements.messagesSection.hidden = true;
  elements.logoutButton.hidden = true;
  elements.apiStatus.textContent = message || "Bitte melde dich an.";
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

  try {
    await showSession(await getCurrentUser());
  } catch {
    showLoggedOut("Backend und PostgreSQL sind erreichbar. Bitte melde dich an.");
  }
}

elements.loginForm.addEventListener("submit", async (event: SubmitEvent) => {
  event.preventDefault();
  elements.loginStatus.textContent = "";
  try {
    await showSession(await login(elements.loginEmail.value.trim(), elements.loginPassword.value));
    elements.loginPassword.value = "";
  } catch (error) {
    elements.loginStatus.textContent = error instanceof Error ? error.message : "Anmeldung fehlgeschlagen.";
  }
});

elements.passwordForm.addEventListener("submit", async (event: SubmitEvent) => {
  event.preventDefault();
  elements.passwordStatus.textContent = "";
  try {
    await changePassword(elements.currentPassword.value, elements.newPassword.value);
    elements.currentPassword.value = "";
    elements.newPassword.value = "";
    showLoggedOut("Passwort geändert. Bitte melde dich mit dem neuen Passwort erneut an.");
  } catch (error) {
    elements.passwordStatus.textContent =
      error instanceof Error ? error.message : "Das Passwort konnte nicht geändert werden.";
  }
});

elements.logoutButton.addEventListener("click", async () => {
  try {
    await logout();
    showLoggedOut("Du wurdest abgemeldet.");
  } catch (error) {
    elements.apiStatus.textContent = error instanceof Error ? error.message : "Abmelden fehlgeschlagen.";
  }
});

elements.messageForm.addEventListener("submit", async (event: SubmitEvent) => {
  event.preventDefault();
  elements.formStatus.textContent = "";

  try {
    await createMessage(elements.messageInput.value.trim());
    elements.messageInput.value = "";
    elements.formStatus.textContent = "Nachricht wurde gespeichert.";
    await refreshMessages();
  } catch (error) {
    elements.formStatus.textContent =
      error instanceof Error ? error.message : "Nachricht konnte nicht gespeichert werden.";
  }
});

void initialize();
