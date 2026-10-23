"use strict";

const TOTAL_SLOTS = 10;
const STORAGE_KEY = "parkwise.vehicles.v1";
const rates = { bike: 20, auto: 30, car: 40 };

const entryForm = document.querySelector("#entry-form");
const searchForm = document.querySelector("#search-form");
const notice = document.querySelector("#notice");
const vehicleList = document.querySelector("#vehicle-list");
const slotGrid = document.querySelector("#slot-grid");
const searchResult = document.querySelector("#search-result");

let vehicles = [];
let noticeTimer;

function showNotice(message, isError = false) {
  window.clearTimeout(noticeTimer);
  notice.textContent = message;
  notice.classList.toggle("error", isError);
  notice.hidden = false;
  noticeTimer = window.setTimeout(() => {
    notice.hidden = true;
  }, 5000);
}

function saveVehicles() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
    return true;
  } catch (error) {
    console.error("Unable to save parking data.", error);
    showNotice("Parking data could not be saved in this browser.", true);
    return false;
  }
}

function loadVehicles() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) throw new TypeError("Saved parking data is not a list.");
    return parsed.filter((vehicle) =>
      vehicle &&
      typeof vehicle.number === "string" &&
      Object.hasOwn(rates, String(vehicle.type).toLowerCase()) &&
      Number.isInteger(vehicle.slot) &&
      vehicle.slot >= 1 &&
      vehicle.slot <= TOTAL_SLOTS &&
      Number.isInteger(vehicle.hours) &&
      vehicle.hours > 0
    );
  } catch (error) {
    console.error("Unable to load parking data.", error);
    showNotice("Saved parking data could not be loaded. Check this browser's site data.", true);
    return [];
  }
}

function rateFor(type) {
  return rates[type.toLowerCase()];
}

function render() {
  document.querySelector("#parked-count").textContent = String(vehicles.length);
  document.querySelector("#available-count").textContent = String(TOTAL_SLOTS - vehicles.length);
  document.querySelector("#vehicle-list-count").textContent = String(vehicles.length);

  slotGrid.replaceChildren();
  for (let slot = 1; slot <= TOTAL_SLOTS; slot += 1) {
    const vehicle = vehicles.find((item) => item.slot === slot);
    const card = document.createElement("div");
    card.className = vehicle ? "slot occupied" : "slot";
    const number = document.createElement("span");
    number.className = "slot-number";
    number.textContent = `Slot ${slot}`;
    const status = document.createElement("span");
    status.className = "slot-status";
    status.textContent = vehicle ? vehicle.number : "Available";
    card.append(number, status);
    slotGrid.append(card);
  }

  vehicleList.replaceChildren();
  if (vehicles.length === 0) {
    const empty = document.createElement("p");
    empty.className = "list-empty";
    empty.textContent = "No vehicles are parked right now.";
    vehicleList.append(empty);
    return;
  }

  for (const vehicle of [...vehicles].sort((a, b) => a.slot - b.slot)) {
    const row = document.createElement("div");
    row.className = "vehicle-row";
    const icon = document.createElement("span");
    icon.className = "vehicle-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = vehicle.type.slice(0, 1).toUpperCase();
    const info = document.createElement("div");
    info.className = "vehicle-info";
    const number = document.createElement("span");
    number.className = "vehicle-number";
    number.textContent = vehicle.number;
    const meta = document.createElement("span");
    meta.className = "vehicle-meta";
    meta.textContent = `${vehicle.type} · Slot ${vehicle.slot} · ${vehicle.hours} hr${vehicle.hours === 1 ? "" : "s"}`;
    info.append(number, meta);
    const exit = document.createElement("button");
    exit.className = "exit-button";
    exit.type = "button";
    exit.textContent = "Check out";
    exit.setAttribute("aria-label", `Check out ${vehicle.number}`);
    exit.addEventListener("click", () => checkOut(vehicle.number));
    row.append(icon, info, exit);
    vehicleList.append(row);
  }
}

function checkOut(number) {
  const index = vehicles.findIndex((vehicle) => vehicle.number.toLowerCase() === number.toLowerCase());
  if (index < 0) {
    showNotice("Vehicle not found.", true);
    return;
  }

  const [vehicle] = vehicles.splice(index, 1);
  const fee = rateFor(vehicle.type) * vehicle.hours;
  const saved = saveVehicles();
  render();
  if (saved) showNotice(`${vehicle.number} checked out from Slot ${vehicle.slot}. Parking fee: Rs. ${fee}.`);
}

entryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(entryForm);
  const number = String(formData.get("number")).trim();
  const type = String(formData.get("type"));
  const hours = Number(formData.get("hours"));

  if (!number) {
    showNotice("Enter a vehicle number.", true);
    return;
  }
  if (vehicles.some((vehicle) => vehicle.number.toLowerCase() === number.toLowerCase())) {
    showNotice("This vehicle is already parked.", true);
    return;
  }
  if (!Number.isInteger(hours) || hours <= 0) {
    showNotice("Enter a positive whole number of parking hours.", true);
    return;
  }
  if (vehicles.length >= TOTAL_SLOTS) {
    showNotice("Parking is full. No slots are available.", true);
    return;
  }

  const occupiedSlots = new Set(vehicles.map((vehicle) => vehicle.slot));
  let slot = 1;
  while (occupiedSlots.has(slot)) slot += 1;
  vehicles.push({ number, type, slot, hours });
  const saved = saveVehicles();
  render();
  entryForm.reset();
  document.querySelector("#vehicle-hours").value = "1";
  if (saved) showNotice(`${number} parked successfully in Slot ${slot}.`);
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const number = document.querySelector("#search-number").value.trim();
  const vehicle = vehicles.find((item) => item.number.toLowerCase() === number.toLowerCase());
  searchResult.replaceChildren();

  if (!vehicle) {
    searchResult.className = "search-result empty-result";
    searchResult.textContent = "Vehicle not found. Check the number and try again.";
    return;
  }

  searchResult.className = "search-result result-card";
  const details = [
    ["Vehicle", vehicle.number],
    ["Type", vehicle.type],
    ["Slot", String(vehicle.slot)],
    ["Expected time", `${vehicle.hours} hr${vehicle.hours === 1 ? "" : "s"}`]
  ];
  for (const [label, value] of details) {
    const field = document.createElement("div");
    field.className = "result-field";
    const caption = document.createElement("span");
    caption.textContent = label;
    const content = document.createElement("strong");
    content.textContent = value;
    field.append(caption, content);
    searchResult.append(field);
  }
});

vehicles = loadVehicles();
render();
