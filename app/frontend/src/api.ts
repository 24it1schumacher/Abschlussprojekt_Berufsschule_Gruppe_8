export interface ApiError {
  error: string;
  fieldErrors?: Record<string, string>;
}

export interface UserSession {
  userId: number;
  customerId: number | null;
  email: string;
  passwordChangeRequired: boolean;
}

export interface Message {
  id: number;
  text: string;
  createdAt: string;
}

export interface Customer {
  id: number;
  customerNumber: string;
  firstName: string;
  lastName: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  street: string;
  postalCode: string;
  city: string;
  countryCode: string;
  createdAt: string;
  active: boolean;
}

export interface CustomerInput {
  customerNumber: string;
  firstName: string;
  lastName: string;
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
  street: string;
  postalCode: string;
  city: string;
  countryCode: string;
}

export interface MachineType {
  id: number;
  name: string;
  description: string | null;
  dailyRentalRate: number;
  currencyCode: string;
  active: boolean;
}

export interface MachineTypeInput {
  name: string;
  description?: string | null;
  dailyRentalRate: number;
  currencyCode: string;
}

export interface RentalLocation {
  id: number;
  code: string;
  name: string;
  street: string;
  postalCode: string;
  city: string;
  countryCode: string;
  active: boolean;
}

export interface RentalLocationInput {
  code: string;
  name: string;
  street: string;
  postalCode: string;
  city: string;
  countryCode: string;
}

export interface Machine {
  id: number;
  machineTypeId: number;
  machineTypeName: string;
  description: string | null;
  dailyRentalRate: number;
  currencyCode: string;
  locationId: number;
  locationName: string;
  locationCity: string;
  serialNumber: string;
  manufactureYear: number;
  operatingHours: number;
  serviceIntervalHours: number | null;
  serviceIntervalMonths: number | null;
  conditionCode: "GOOD" | "NEEDS_SERVICE" | "OUT_OF_SERVICE";
  active: boolean;
  createdAt: string;
}

export interface MachineInput {
  machineTypeId: number;
  locationId: number;
  serialNumber: string;
  manufactureYear: number;
  operatingHours: number;
  serviceIntervalHours: number | null;
  serviceIntervalMonths: number | null;
  conditionCode: Machine["conditionCode"];
  active: boolean;
}

export interface Reservation {
  id: number;
  customerId: number;
  machineId: number;
  machineTypeName: string;
  serialNumber: string;
  startAt: string;
  endAt: string;
  status: "REQUESTED" | "CONFIRMED" | "CANCELLED" | "REJECTED" | "CLOSED";
  createdAt: string;
  rentalId: number | null;
  orderNumber: string | null;
  rentalStatus: "OPEN" | "ACTIVE" | "COMPLETED" | "CANCELLED" | null;
}

export interface ReservationInput {
  machineId: number;
  startAt: string;
  endAt: string;
  customerId?: number;
}

export interface Rental {
  id: number;
  reservationId: number;
  customerId: number;
  orderNumber: string;
  status: "OPEN" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  machineTypeName: string;
  serialNumber: string;
  startAt: string;
  endAt: string;
  createdAt: string;
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
let csrfToken: string | undefined;

async function getCsrfToken(): Promise<string> {
  const response = await fetch(`${apiBaseUrl}/api/auth/csrf`, { credentials: "include" });
  if (!response.ok) {
    throw new Error(`CSRF-Token konnte nicht geladen werden (HTTP ${response.status}).`);
  }
  const result = (await response.json()) as { token: string };
  csrfToken = result.token;
  return csrfToken;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method ?? "GET").toUpperCase();
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    headers.set("X-XSRF-TOKEN", csrfToken ?? (await getCsrfToken()));
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    method,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    let message = `Anfrage fehlgeschlagen (HTTP ${response.status}).`;
    try {
      const body = (await response.json()) as Partial<ApiError>;
      if (body.error) message = body.error;
    } catch {
      // Some HTTP errors have no JSON response body.
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function checkHealth(): Promise<{ status: string }> {
  return request("/api/health");
}

export function checkDatabase(): Promise<{ status: string }> {
  return request("/api/health/database");
}

export async function login(email: string, password: string): Promise<UserSession> {
  const session = await request<UserSession>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  csrfToken = undefined;
  await getCsrfToken();
  return session;
}

export function getCurrentUser(): Promise<UserSession> {
  return request("/api/auth/me");
}

export async function logout(): Promise<void> {
  await request<void>("/api/auth/logout", { method: "POST" });
  csrfToken = undefined;
}

export function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  return request("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export function getMessages(): Promise<Message[]> {
  return request("/api/messages");
}

export function createMessage(text: string): Promise<Message> {
  return request("/api/messages", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export function getCustomers(): Promise<Customer[]> {
  return request("/api/customers");
}

export function getMyCustomer(): Promise<Customer> {
  return request("/api/customers/me");
}

export function createCustomer(input: CustomerInput): Promise<Customer> {
  return request("/api/customers", { method: "POST", body: JSON.stringify(input) });
}

export function updateCustomer(id: number, input: CustomerInput): Promise<Customer> {
  return request(`/api/customers/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

export function createCustomerAccount(
  customerId: number,
  email: string,
  temporaryPassword: string,
): Promise<{ userId: number; customerId: number; email: string; role: string }> {
  return request(`/api/customers/${customerId}/account`, {
    method: "POST",
    body: JSON.stringify({ email, temporaryPassword }),
  });
}

export function createEmployeeAccount(
  email: string,
  temporaryPassword: string,
): Promise<{ userId: number; email: string; role: string }> {
  return request("/api/accounts/employees", {
    method: "POST",
    body: JSON.stringify({ email, temporaryPassword }),
  });
}

export function getMachineTypes(): Promise<MachineType[]> {
  return request("/api/machine-types");
}

export function createMachineType(input: MachineTypeInput): Promise<MachineType> {
  return request("/api/machine-types", { method: "POST", body: JSON.stringify(input) });
}

export function getRentalLocations(): Promise<RentalLocation[]> {
  return request("/api/locations");
}

export function createRentalLocation(input: RentalLocationInput): Promise<RentalLocation> {
  return request("/api/locations", { method: "POST", body: JSON.stringify(input) });
}

export function searchMachines(filters: {
  machineTypeId?: number;
  locationId?: number;
  availableFrom?: string;
  availableUntil?: string;
} = {}): Promise<Machine[]> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined) query.set(key, String(value));
  }
  return request(`/api/machines${query.size ? `?${query.toString()}` : ""}`);
}

export function getMachine(id: number): Promise<Machine> {
  return request(`/api/machines/${id}`);
}

export function createMachine(input: MachineInput): Promise<Machine> {
  return request("/api/machines", { method: "POST", body: JSON.stringify(input) });
}

export function updateMachine(id: number, input: MachineInput): Promise<Machine> {
  return request(`/api/machines/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

export function getReservations(): Promise<Reservation[]> {
  return request("/api/reservations");
}

export function getReservation(id: number): Promise<Reservation> {
  return request(`/api/reservations/${id}`);
}

export function createReservation(input: ReservationInput): Promise<Reservation> {
  return request("/api/reservations", { method: "POST", body: JSON.stringify(input) });
}

export function confirmReservation(id: number): Promise<Reservation> {
  return request(`/api/reservations/${id}/confirm`, { method: "POST" });
}

export function getRentals(): Promise<Rental[]> {
  return request("/api/rentals");
}

export function getRental(id: number): Promise<Rental> {
  return request(`/api/rentals/${id}`);
}
