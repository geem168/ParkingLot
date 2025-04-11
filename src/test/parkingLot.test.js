const ParkingLot = require("../domain/parkingLot");
const Car = require("../domain/car");

// Mock ParkingTicket
jest.mock("../domain/parking-ticket", () =>
  jest.fn().mockImplementation((ticketNumber) => ({
    ticketNumber,
  }))
);

describe("ParkingLot", () => {
  let parkingLot;

  beforeEach(() => {
    parkingLot = new ParkingLot(2);
  });

  it("should park a car and assign a ticket", () => {
    const car = new Car("B 1234 ABC");
    const result = parkingLot.park(car);

    expect(result).toBe(
      "Mobil B 1234 ABC berhasil parkir dengan tiket TICKET-1"
    );
    expect(car.ticket.ticketNumber).toBe("TICKET-1");
  });

  it("should not allow non-Car object to be parked", () => {
    expect(() => parkingLot.park("notACar")).toThrow(
      "Only objects of Car can be parked"
    );
  });

  it("should not park a car if lot is full", () => {
    parkingLot.park(new Car("A 1 A"));
    parkingLot.park(new Car("B 2 B"));

    const result = parkingLot.park(new Car("C 3 C"));
    expect(result).toBe("Parkiran penuh!");
  });

  it("should retrieve a car by ticket", () => {
    const car = new Car("D 4 D");
    parkingLot.park(car);

    const result = parkingLot.keluar("TICKET-1");
    expect(result).toBe("Mobil D 4 D berhasil keluar dari parkir!");
  });

  it("should return error if ticket not found or invalid", () => {
    expect(parkingLot.keluar("TIDAK-ADA")).toBe(
      "Mobil dengan tiket ini tidak ditemukan!"
    );

    const car = new Car("No Ticket");
    parkingLot.parkedCars.push(car); // bypass ticket
    expect(parkingLot.keluar("TICKET-99")).toBe(
      "Mobil dengan tiket ini tidak ditemukan!"
    );
  });

  it("should remove car and update total parked", () => {
    const car = new Car("B 1234 OUT");
    parkingLot.park(car);

    expect(parkingLot.totalParked()).toBe(1);
    parkingLot.keluar("TICKET-1");

    expect(parkingLot.totalParked()).toBe(0);
    expect(parkingLot.hasCar(car)).toBe(false);
  });

  it("should count totalParked correctly after multiple keluar", () => {
    const car1 = new Car("X");
    const car2 = new Car("Y");

    parkingLot.park(car1); // TICKET-1
    parkingLot.park(car2); // TICKET-2

    expect(parkingLot.totalParked()).toBe(2);

    parkingLot.keluar("TICKET-2");
    expect(parkingLot.totalParked()).toBe(1);

    parkingLot.keluar("TICKET-1");
    expect(parkingLot.totalParked()).toBe(0);
  });

  it("should tell if car is parked or not", () => {
    const car = new Car("Z");
    expect(parkingLot.hasCar(car)).toBe(false);

    parkingLot.park(car);
    expect(parkingLot.hasCar(car)).toBe(true);
  });

  it("should check availability status", () => {
    const car1 = new Car("A");
    const car2 = new Car("B");

    expect(parkingLot.isAvailable()).toBe(true);

    parkingLot.park(car1);
    expect(parkingLot.isAvailable()).toBe(true);

    parkingLot.park(car2);
    expect(parkingLot.isAvailable()).toBe(false);
  });

  it("should notify all subscribers when notifyFull is called", () => {
    const sub1 = { onLotFull: jest.fn() };
    const sub2 = { onLotFull: jest.fn() };

    parkingLot.subscribe(sub1);
    parkingLot.subscribe(sub2);
    parkingLot.notifyFull();

    expect(sub1.onLotFull).toHaveBeenCalledWith(parkingLot);
    expect(sub2.onLotFull).toHaveBeenCalledWith(parkingLot);
  });

  it("should not crash if no subscribers exist", () => {
    const car1 = new Car("N 14 N");
    const car2 = new Car("O 15 O");

    expect(() => {
      parkingLot.park(car1);
      parkingLot.park(car2);
    }).not.toThrow();
  });

  it("should notify subscribers when lot becomes available after being full", () => {
    const mockSubscriber = {
      onLotAvailable: jest.fn(),
      onLotFull: jest.fn(),
    };

    parkingLot.subscribe(mockSubscriber);

    // Penuh duluin parkiran
    const car1 = new Car("A 1 A");
    const car2 = new Car("B 2 B");

    parkingLot.park(car1); // TICKET-1
    parkingLot.park(car2); // TICKET-2 (penuh → trigger onLotFull)

    // Kosongin 1 slot
    const result = parkingLot.keluar("TICKET-1");

    // Harus trigger notifikasi available lagi
    expect(mockSubscriber.onLotAvailable).toHaveBeenCalledWith(parkingLot);
    expect(result).toBe("Mobil A 1 A berhasil keluar dari parkir!");
  });

  it("should not notify onLotAvailable if lot was not full before", () => {
    const mockSubscriber = {
      onLotAvailable: jest.fn(),
    };

    parkingLot.subscribe(mockSubscriber);

    const car = new Car("C 3 C");
    parkingLot.park(car); // belum penuh

    parkingLot.keluar("TICKET-1"); // keluar tanpa trigger notifikasi

    expect(mockSubscriber.onLotAvailable).not.toHaveBeenCalled();
  });
});
