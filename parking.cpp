#include <iostream>
#include <string>
#include <cmath>
#include <limits>
using namespace std;

struct Vehicle {
    string number;
    string type;
    int slot;
    int hours;
    Vehicle* next;

    Vehicle(string n, string t, int s, int h) {
        number = n;
        type = t;
        slot = s;
        hours = h;
        next = nullptr;
    }
};

const int TOTAL_SLOTS = 10;
bool occupied[TOTAL_SLOTS + 1] = {false};
Vehicle* head = nullptr;

int getRate(string type) {
    if (type == "Bike" || type == "bike") return 20;
    if (type == "Car" || type == "car") return 40;
    if (type == "Auto" || type == "auto") return 30;
    return 0;
}

int findFreeSlot() {
    for (int i = 1; i <= TOTAL_SLOTS; i++) {
        if (!occupied[i]) return i;
    }
    return -1;
}

Vehicle* searchVehicle(string number) {
    Vehicle* temp = head;
    while (temp != nullptr) {
        if (temp->number == number) return temp;
        temp = temp->next;
    }
    return nullptr;
}

void vehicleEntry() {
    string number, type;
    int hours;

    cout << "\nEnter vehicle number: ";
    cin >> number;

    if (searchVehicle(number) != nullptr) {
        cout << "Vehicle is already parked.\n";
        return;
    }

    cout << "Enter vehicle type (Bike/Car/Auto): ";
    cin >> type;

    if (getRate(type) == 0) {
        cout << "Invalid vehicle type. Please enter Bike, Car, or Auto.\n";
        return;
    }

    cout << "Expected parking hours: ";
    if (!(cin >> hours)) {
        if (cin.eof()) return;
        cin.clear();
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
        cout << "Invalid hours. Please enter a positive whole number.\n";
        return;
    }
    if (hours <= 0) {
        cout << "Invalid hours. Please enter a positive whole number.\n";
        return;
    }

    int slot = findFreeSlot();

    if (slot == -1) {
        cout << "Parking is full.\n";
        return;
    }

    Vehicle* newVehicle = new Vehicle(number, type, slot, hours);
    newVehicle->next = head;
    head = newVehicle;
    occupied[slot] = true;

    cout << "Vehicle parked successfully!\n";
    cout << "Assigned Slot: " << slot << "\n";
}

void vehicleExit() {
    string number;
    cout << "\nEnter vehicle number for exit: ";
    cin >> number;

    Vehicle* current = head;
    Vehicle* previous = nullptr;

    while (current != nullptr && current->number != number) {
        previous = current;
        current = current->next;
    }

    if (current == nullptr) {
        cout << "Vehicle not found.\n";
        return;
    }

    int rate = getRate(current->type);
    int fee = rate * current->hours;

    if (previous == nullptr)
        head = current->next;
    else
        previous->next = current->next;

    occupied[current->slot] = false;

    cout << "\nVehicle exited successfully.\n";
    cout << "Vehicle Number: " << current->number << "\n";
    cout << "Slot: " << current->slot << "\n";
    cout << "Parking Hours: " << current->hours << "\n";
    cout << "Parking Fee: Rs. " << fee << "\n";

    delete current;
}

void searchAndDisplay() {
    string number;
    cout << "\nEnter vehicle number to search: ";
    cin >> number;

    Vehicle* v = searchVehicle(number);

    if (v == nullptr) {
        cout << "Vehicle not found.\n";
        return;
    }

    cout << "\nVehicle Found!\n";
    cout << "Number: " << v->number << "\n";
    cout << "Type: " << v->type << "\n";
    cout << "Slot: " << v->slot << "\n";
    cout << "Hours: " << v->hours << "\n";
}

void displaySlots() {
    cout << "\nParking Slot Status:\n";
    for (int i = 1; i <= TOTAL_SLOTS; i++) {
        cout << "Slot " << i << ": "
             << (occupied[i] ? "Occupied" : "Available") << "\n";
    }
}

void displayVehicles() {
    if (head == nullptr) {
        cout << "\nNo vehicles are parked.\n";
        return;
    }

    cout << "\nParked Vehicles:\n";
    Vehicle* temp = head;

    while (temp != nullptr) {
        cout << "Number: " << temp->number
             << " | Type: " << temp->type
             << " | Slot: " << temp->slot
             << " | Hours: " << temp->hours << "\n";
        temp = temp->next;
    }
}

int main() {
    int choice;

    do {
        cout << "\n===== PARKING MANAGEMENT SYSTEM =====\n";
        cout << "1. Vehicle Entry\n";
        cout << "2. Vehicle Exit\n";
        cout << "3. Search Vehicle\n";
        cout << "4. Display Parking Slots\n";
        cout << "5. Display Parked Vehicles\n";
        cout << "6. Exit\n";
        cout << "Enter choice: ";
        if (!(cin >> choice)) {
            if (cin.eof()) break;
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            cout << "Invalid choice. Please enter a number from 1 to 6.\n";
            continue;
        }

        switch (choice) {
            case 1: vehicleEntry(); break;
            case 2: vehicleExit(); break;
            case 3: searchAndDisplay(); break;
            case 4: displaySlots(); break;
            case 5: displayVehicles(); break;
            case 6: cout << "Thank you!\n"; break;
            default: cout << "Invalid choice.\n";
        }
    } while (choice != 6);

    // Free remaining linked-list nodes
    while (head != nullptr) {
        Vehicle* temp = head;
        head = head->next;
        delete temp;
    }

    return 0;
}
