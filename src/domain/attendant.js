class Attendant {
  constructor(parkingLots) {
    // Biar bisa handle satu atau banyak parkiran
    this.parkingLots = Array.isArray(parkingLots) ? parkingLots : [parkingLots];

    // Langsung daftarin diri ke semua parkiran sebagai subscriber
    this.parkingLots.forEach((lot) => lot.subscribe(this));
  }

  // Dipanggil otomatis saat parkiran penuh
  onLotFull(parkingLot) {
    console.log(
      `Notifikasi: Parkiran kapasitas ${parkingLot.capacity} sudah penuh.`
    );
  }

  // Dipanggil otomatis saat parkiran tersedia lagi
  onLotAvailable(parkingLot) {
    console.log(
      `Notifikasi: Parkiran kapasitas ${parkingLot.capacity} sekarang tersedia.`
    );
  }

  // Cari satu lot yang masih ada slot kosong
  findAvailableLot() {
    return this.parkingLots.find((lot) => lot.isAvailable());
  }

  // Cek apakah mobil ini udah ada di salah satu parkiran
  isCarAlreadyParked(car) {
    return this.parkingLots.some((lot) => lot.hasCar(car));
  }

  // Coba parkir mobil
  parkCar(car) {
    if (this.isCarAlreadyParked(car)) {
      return `Gagal parkir: Mobil ${car.plate} sudah parkir!`;
    }

    const availableLot = this.findAvailableLot();
    if (!availableLot) {
      return "Gagal parkir: Semua parkiran penuh!";
    }

    return availableLot.park(car);
  }

  // Ambil mobil pakai tiket
  retrieveCar(ticketNumber) {
    for (const lot of this.parkingLots) {
      const result = lot.keluar(ticketNumber);
      if (result.includes("berhasil keluar")) return result;
    }

    return "Gagal ambil: Tiket tidak valid atau mobil tidak ditemukan!";
  }
}

module.exports = Attendant;
