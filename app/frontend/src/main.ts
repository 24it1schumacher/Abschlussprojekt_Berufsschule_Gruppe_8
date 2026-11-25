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
const machineSearch = document.querySelector<HTMLInputElement>("#machine-search");
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
  !apiStatus || !catalogStatus || !machineList || !machineSearch || !loginSection || !loginForm || !loginEmail || !loginPassword
  || !loginStatus || !passwordSection || !passwordForm || !currentPassword || !newPassword || !passwordStatus
  || !logoutButton || !accountSection || !reservationList || !rentalList || !accountStatus
) {
  throw new Error("Die benötigten Elemente der Seite wurden nicht gefunden.");
}

const elements = {
  apiStatus,
  catalogStatus,
  machineList,
  machineSearch,
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

let catalogMachines: Machine[] = [];

function formatDate(value: string): string {
  return new Date(value).toLocaleString("de-DE");
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(value);
}

function createTextElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

function replaceWithEmptyMessage(list: HTMLUListElement, message: string): void {
  const item = document.createElement("li");
  item.className = "empty-state";
  item.textContent = message;
  list.replaceChildren(item);
}

function renderMachines(machines: Machine[]): void {
  if (machines.length === 0) {
    replaceWithEmptyMessage(
      elements.machineList,
      catalogMachines.length === 0
        ? "Zurzeit sind keine mietbaren Maschinen eingetragen."
        : "Keine Treffer. Passe deinen Suchbegriff an.",
    );
    return;
  }

  const items = machines.map((machine, index) => {
    const item = document.createElement("li");
    item.className = `machine-card machine-card--${index % 5}`;

    const art = document.createElement("div");
    art.className = "machine-card__art";
    art.setAttribute("aria-hidden", "true");
    const artLabel = createTextElement("span", "machine-card__art-label", "GRUPPE 8 · MIETPARK");
    const artSerial = createTextElement("span", "machine-card__art-serial", machine.serialNumber);
    const illustration = document.createElement("span");
    illustration.className = "machine-illustration";
    for (const className of [
      "machine-illustration__arm",
      "machine-illustration__cab",
      "machine-illustration__body",
      "machine-illustration__track",
      "machine-illustration__wheel machine-illustration__wheel--left",
      "machine-illustration__wheel machine-illustration__wheel--right",
    ]) {
      const part = document.createElement("span");
      part.className = className;
      illustration.append(part);
    }
    art.append(artLabel, illustration, artSerial);

    const body = document.createElement("div");
    body.className = "machine-card__body";
    const eyebrow = createTextElement("p", "machine-card__eyebrow", "Mietmaschine");
    const title = createTextElement(
      "h3",
      "machine-card__title",
      machine.machineTypeName.replace(/^DEMO\s+/i, ""),
    );
    const description = createTextElement(
      "p",
      "machine-card__description",
      machine.description || "Ein zuverlässiger Helfer für dein nächstes Vorhaben.",
    );

    const facts = document.createElement("dl");
    facts.className = "machine-facts";
    const addFact = (label: string, value: string) => {
      const fact = document.createElement("div");
      fact.className = "machine-fact";
      fact.append(
        createTextElement("dt", "", label),
        createTextElement("dd", "", value),
      );
      facts.append(fact);
    };
    addFact("Standort", machine.locationCity);
    addFact("Baujahr", String(machine.manufactureYear));
    addFact("Betriebsstunden", `${formatNumber(machine.operatingHours)} h`);

    const price = new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: machine.currencyCode,
    }).format(machine.dailyRentalRate);
    const footer = document.createElement("div");
    footer.className = "machine-card__footer";
    const priceBlock = document.createElement("p");
    priceBlock.className = "machine-price";
    priceBlock.append(
      createTextElement("strong", "", price),
      createTextElement("span", "", " / Tag"),
    );
    const availability = createTextElement("span", "availability-badge", "Mietbar");
    const isDemoMachine = machine.machineTypeName.startsWith("DEMO ");
    const demoBadge = createTextElement("span", "demo-badge", "DEMO");
    footer.append(priceBlock, availability);
    body.append(eyebrow, title, description, facts, footer);
    item.append(art, body);
    if (isDemoMachine) item.append(demoBadge);
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
    item.className = "record-card";
    const copy = document.createElement("div");
    copy.className = "record-card__copy";
    copy.append(
      createTextElement("strong", "", reservation.machineTypeName),
      createTextElement(
        "span",
        "",
        `${reservation.serialNumber} · ${formatDate(reservation.startAt)} bis ${formatDate(reservation.endAt)}`,
      ),
    );
    const status = createTextElement(
      "span",
      `status-badge status-badge--${reservation.status.toLowerCase()}`,
      reservationLabels[reservation.status],
    );
    item.append(copy, status);
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
    item.className = "record-card";
    const copy = document.createElement("div");
    copy.className = "record-card__copy";
    copy.append(
      createTextElement("strong", "", rental.machineTypeName),
      createTextElement("span", "", `${rental.orderNumber} · ${rental.serialNumber}`),
    );
    const status = createTextElement(
      "span",
      `status-badge status-badge--${rental.status.toLowerCase()}`,
      rentalLabels[rental.status],
    );
    item.append(copy, status);
    return item;
  });
  elements.rentalList.replaceChildren(...items);
}

function filterMachines(): void {
  const query = elements.machineSearch.value.trim().toLocaleLowerCase("de-DE");
  const filtered = catalogMachines.filter((machine) => {
    const searchable = [
      machine.machineTypeName,
      machine.description ?? "",
      machine.serialNumber,
      machine.locationName,
      machine.locationCity,
    ].join(" ").toLocaleLowerCase("de-DE");
    return searchable.includes(query);
  });
  renderMachines(filtered);
  elements.catalogStatus.textContent = query
    ? `${filtered.length} von ${catalogMachines.length} Maschinen gefunden.`
    : `${catalogMachines.length} mietbare Maschinen gefunden.`;
}

async function refreshCatalog(): Promise<void> {
  try {
    catalogMachines = await searchMachines();
    filterMachines();
  } catch {
    catalogMachines = [];
    replaceWithEmptyMessage(elements.machineList, "Der Maschinenkatalog ist derzeit nicht verfügbar.");
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
  elements.apiStatus.textContent = `Angemeldet: ${session.email}`;
  elements.apiStatus.dataset.state = "connected";

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
  elements.apiStatus.textContent = message || "Backend und Datenbank verbunden";
  elements.apiStatus.dataset.state = "connected";
}

async function initialize(): Promise<void> {
  try {
    await checkHealth();
    await checkDatabase();
  } catch {
    elements.apiStatus.textContent =
      "Backend oder PostgreSQL ist nicht erreichbar. Prüfe Verbindung und Startanleitung.";
    elements.apiStatus.dataset.state = "error";
    elements.catalogStatus.textContent = "Der Maschinenkatalog ist derzeit nicht verfügbar.";
    return;
  }

  elements.apiStatus.textContent = "Backend und PostgreSQL sind erreichbar.";
  elements.apiStatus.dataset.state = "connected";
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

elements.machineSearch.addEventListener("input", filterMachines);

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
