import {
  changePassword,
  checkDatabase,
  checkHealth,
  getCurrentUser,
  getRentals,
  getReservations,
  login,
  logout,
  searchMachines,
  type Machine,
  type Rental,
  type Reservation,
  type UserSession,
} from "./api";
import "./style.css";

const apiStatus = document.querySelector<HTMLParagraphElement>("#api-status");
const catalogStatus = document.querySelector<HTMLParagraphElement>("#catalog-status");
const machineList = document.querySelector<HTMLUListElement>("#machine-list");
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
const accountSection = document.querySelector<HTMLElement>("#account-section");
const reservationList = document.querySelector<HTMLUListElement>("#reservation-list");
const rentalList = document.querySelector<HTMLUListElement>("#rental-list");
const accountStatus = document.querySelector<HTMLParagraphElement>("#account-status");

if (
  !apiStatus || !catalogStatus || !machineList || !loginSection || !loginForm || !loginEmail || !loginPassword
  || !loginStatus || !passwordSection || !passwordForm || !currentPassword || !newPassword || !passwordStatus
  || !logoutButton || !accountSection || !reservationList || !rentalList || !accountStatus
) {
  throw new Error("Die benötigten Elemente der Seite wurden nicht gefunden.");
}

const elements = {
  apiStatus,
  catalogStatus,
  machineList,
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
  accountSection,
  reservationList,
  rentalList,
  accountStatus,
};

const reservationLabels: Record<Reservation["status"], string> = {
  REQUESTED: "Angefragt",
  CONFIRMED: "Bestätigt",
  CANCELLED: "Storniert",
  REJECTED: "Abgelehnt",
  CLOSED: "Abgeschlossen",
};

const rentalLabels: Record<Rental["status"], string> = {
  OPEN: "Offen",
  ACTIVE: "Aktiv",
  COMPLETED: "Abgeschlossen",
  CANCELLED: "Storniert",
};

function formatDate(value: string): string {
  return new Date(value).toLocaleString("de-DE");
}

function replaceWithEmptyMessage(list: HTMLUListElement, message: string): void {
  const item = document.createElement("li");
  item.textContent = message;
  list.replaceChildren(item);
}

function renderMachines(machines: Machine[]): void {
  if (machines.length === 0) {
    replaceWithEmptyMessage(elements.machineList, "Zurzeit sind keine mietbaren Maschinen eingetragen.");
    return;
  }

  const items = machines.map((machine) => {
    const item = document.createElement("li");
    const price = new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: machine.currencyCode,
    }).format(machine.dailyRentalRate);
    item.textContent =
      `${machine.machineTypeName} (${machine.serialNumber}) – ${machine.locationCity}, ${price} pro Tag`;
    return item;
  });
  elements.machineList.replaceChildren(...items);
}

function renderReservations(reservations: Reservation[]): void {
  if (reservations.length === 0) {
    replaceWithEmptyMessage(elements.reservationList, "Du hast noch keine Reservierungen.");
    return;
  }

  const items = reservations.map((reservation) => {
    const item = document.createElement("li");
    item.textContent =
      `${reservation.machineTypeName} (${reservation.serialNumber}) – `
      + `${formatDate(reservation.startAt)} bis ${formatDate(reservation.endAt)} – `
      + reservationLabels[reservation.status];
    return item;
  });
  elements.reservationList.replaceChildren(...items);
}

function renderRentals(rentals: Rental[]): void {
  if (rentals.length === 0) {
    replaceWithEmptyMessage(elements.rentalList, "Es gibt noch keine Aufträge zu deinem Konto.");
    return;
  }

  const items = rentals.map((rental) => {
    const item = document.createElement("li");
    item.textContent =
      `${rental.orderNumber}: ${rental.machineTypeName} (${rental.serialNumber}) – `
      + rentalLabels[rental.status];
    return item;
  });
  elements.rentalList.replaceChildren(...items);
}

async function refreshCatalog(): Promise<void> {
  try {
    const machines = await searchMachines();
    renderMachines(machines);
    elements.catalogStatus.textContent = `${machines.length} mietbare Maschinen gefunden.`;
  } catch {
    elements.catalogStatus.textContent =
      "Der Maschinenkatalog konnte nicht geladen werden. Prüfe, ob die Datenbank-Schritte 003 bis 010 ausgeführt wurden.";
  }
}

async function refreshAccount(): Promise<void> {
  try {
    const [reservations, rentals] = await Promise.all([getReservations(), getRentals()]);
    renderReservations(reservations);
    renderRentals(rentals);
    elements.accountStatus.textContent = "";
  } catch (error) {
    elements.accountStatus.textContent =
      error instanceof Error ? error.message : "Kontodaten konnten nicht geladen werden.";
  }
}

async function showSession(session: UserSession): Promise<void> {
  elements.loginSection.hidden = true;
  elements.logoutButton.hidden = false;
  elements.apiStatus.textContent = `Angemeldet als ${session.email}.`;

  if (session.passwordChangeRequired) {
    elements.passwordSection.hidden = false;
    elements.accountSection.hidden = true;
    return;
  }

  elements.passwordSection.hidden = true;
  elements.accountSection.hidden = false;
  await refreshAccount();
}

function showLoggedOut(message = ""): void {
  elements.loginSection.hidden = false;
  elements.passwordSection.hidden = true;
  elements.accountSection.hidden = true;
  elements.logoutButton.hidden = true;
  elements.apiStatus.textContent = message || "Melde dich an, um deine Reservierungen und Aufträge zu sehen.";
}

async function initialize(): Promise<void> {
  try {
    await checkHealth();
    await checkDatabase();
  } catch {
    elements.apiStatus.textContent =
      "Backend oder PostgreSQL ist nicht erreichbar. Prüfe Verbindung und Startanleitung.";
    elements.catalogStatus.textContent = "Der Maschinenkatalog ist derzeit nicht verfügbar.";
    return;
  }

  elements.apiStatus.textContent = "Backend und PostgreSQL sind erreichbar.";
  await refreshCatalog();

  try {
    await showSession(await getCurrentUser());
  } catch {
    showLoggedOut();
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

void initialize();
