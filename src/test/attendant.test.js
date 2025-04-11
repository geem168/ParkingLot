const Attendant = require("../domain/attendant");
const ParkingLot = require("../domain/parkingLot");
const Car = require("../domain/car");

// Mock 
jest.mock("../domain/parking-ticket", () =>
  jest.fn().mockImplementation((ticketNumber) => ({ ticketNumber }))
);

describe("Attendant", () => {
  it("should be able to park car if available", () => {
    const lot = new ParkingLot(2);
    const attendant = new Attendant(lot);

    const car = new Car("B 1234 ABC");
    const result = attendant.parkCar(car);

    expect(result).toBe(
      "Mobil B 1234 ABC berhasil parkir dengan tiket TICKET-1"
    );
  });

  it("should reject parking if car already parked", () => {
    const lot = new ParkingLot(2);
    const attendant = new Attendant(lot);

    const car = new Car("B 5678 DEF");
    attendant.parkCar(car);
    const result = attendant.parkCar(car);

    expect(result).toBe("Gagal parkir: Mobil B 5678 DEF sudah parkir!");
  });

  it("should return error if all lots are full", () => {
    const lot = new ParkingLot(1);
    const attendant = new Attendant(lot);

    attendant.parkCar(new Car("A 1 A"));
    const result = attendant.parkCar(new Car("B 2 B"));

    expect(result).toBe("Gagal parkir: Semua parkiran penuh!");
  });

  it("should retrieve car using valid ticket", () => {
    const lot = new ParkingLot(2);
    const attendant = new Attendant(lot);

    const car = new Car("X 9 X");
    attendant.parkCar(car);
    const result = attendant.retrieveCar("TICKET-1");

    expect(result).toBe("Mobil X 9 X berhasil keluar dari parkir!");
  });

  it("should return error when ticket is not found", () => {
    const lot = new ParkingLot(2);
    const attendant = new Attendant(lot);

    const result = attendant.retrieveCar("TIDAK-ADA");
    expect(result).toBe(
      "Gagal ambil: Tiket tidak valid atau mobil tidak ditemukan!"
    );
  });

  it("should handle multiple parking lots correctly", () => {
    const lot1 = new ParkingLot(1);
    const lot2 = new ParkingLot(1);

    const attendant = new Attendant([lot1, lot2]);

    const car1 = new Car("B 1");
    const car2 = new Car("B 2");

    const res1 = attendant.parkCar(car1);
    const res2 = attendant.parkCar(car2);

    expect(res1).toContain("berhasil parkir");
    expect(res2).toContain("berhasil parkir");
    expect(lot1.totalParked() + lot2.totalParked()).toBe(2);
  });

  it("should log notification when lot is full", () => {
    const lot = new ParkingLot(1);
    const attendant = new Attendant(lot);
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});

    attendant.parkCar(new Car("F 1 F")); // full trigger

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("Notifikasi: Parkiran kapasitas 1 sudah penuh.")
    );

    spy.mockRestore();
  });

  it("should log notification when lot becomes available", () => {
    const lot = new ParkingLot(1);
    const attendant = new Attendant(lot);
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});

    const car = new Car("F 2 F");
    attendant.parkCar(car);
    attendant.retrieveCar("TICKET-1"); // keluar → trigger available

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining(
        "Notifikasi: Parkiran kapasitas 1 sekarang tersedia."
      )
    );

    spy.mockRestore();
  });

  it("should auto-subscribe to all parking lots", () => {
    const lot1 = new ParkingLot(2);
    const lot2 = new ParkingLot(2);

    const spy1 = jest.spyOn(lot1, "subscribe");
    const spy2 = jest.spyOn(lot2, "subscribe");

    new Attendant([lot1, lot2]);

    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  });
});
