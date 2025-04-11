const Car = require("./car");
const ParkingTicket = require("./parking-ticket");

class ParkingLot {
  constructor(capacity) {
    this.capacity = capacity;
    this.parkedCars = [];
    this.ticketCounter = 1;
    this.subscribers = []; // yang mantau lot ini (attendant)
  }

  // Tambahkan subscriber (contoh: Attendant)
  subscribe(subscriber) {
    this.subscribers.push(subscriber);
  }

  // Notifikasi saat parkiran penuh
  notifyFull() {
    this.subscribers.forEach((sub) => {
      if (typeof sub.onLotFull === "function") {
        sub.onLotFull(this);
      }
    });
  }

  // Notifikasi saat parkiran jadi tersedia (ada space lagi)
  notifyAvailable() {
    this.subscribers.forEach((sub) => {
      if (typeof sub.onLotAvailable === "function") {
        sub.onLotAvailable(this);
      }
    });
  }

  park(car) {
    console.log(`Mencoba parkir mobil dengan plat: ${car.plate}`);

    if (!(car instanceof Car)) {
      throw new Error("Only objects of Car can be parked");
    }

    if (!this.isAvailable()) {
      console.log("Parkiran penuh!");
      return "Parkiran penuh!";
    }

    const ticket = new ParkingTicket(`TICKET-${this.ticketCounter++}`);
    car.ticket = ticket;
    this.parkedCars.push(car);

    // Kalau setelah parkir jadi penuh, langsung kasih notif
    if (!this.isAvailable()) {
      this.notifyFull();
    }

    console.log(
      `Mobil ${car.plate} parkir dengan tiket ${ticket.ticketNumber}`
    );
    return `Mobil ${car.plate} berhasil parkir dengan tiket ${ticket.ticketNumber}`;
  }

  keluar(ticketNumber) {
    console.log(`Mencoba mengeluarkan mobil dengan tiket: ${ticketNumber}`);

    const car = this.parkedCars.find(
      (car) => car.ticket && car.ticket.ticketNumber === ticketNumber
    );

    if (!car) {
      console.log("Mobil dengan tiket ini tidak ditemukan!");
      return "Mobil dengan tiket ini tidak ditemukan!";
    }

    const wasFull = !this.isAvailable(); // Simpan status sebelum keluar

    this.parkedCars = this.parkedCars.filter((parkedCar) => parkedCar !== car);
    console.log(`Mobil ${car.plate} berhasil keluar dari parkir!`);

    // Kalau sebelumnya penuh, dan sekarang ada space, kirim notif
    if (wasFull && this.isAvailable()) {
      this.notifyAvailable();
    }

    return `Mobil ${car.plate} berhasil keluar dari parkir!`;
  }

  totalParked() {
    console.log(`Jumlah mobil yang terparkir: ${this.parkedCars.length}`);
    return this.parkedCars.length;
  }

  isAvailable() {
    return this.parkedCars.length < this.capacity;
  }

  hasCar(car) {
    return this.parkedCars.includes(car);
  }
}

module.exports = ParkingLot;
