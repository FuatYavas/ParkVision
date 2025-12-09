class ParkingLot {
  final int id;
  final String name;
  final String address;
  final double latitude;
  final double longitude;
  final int capacity;
  final double hourlyRate;
  final bool isActive;

  ParkingLot({
    required this.id,
    required this.name,
    required this.address,
    required this.latitude,
    required this.longitude,
    required this.capacity,
    required this.hourlyRate,
    required this.isActive,
  });

  factory ParkingLot.fromJson(Map<String, dynamic> json) {
    return ParkingLot(
      id: json['id'],
      name: json['name'],
      address: json['address'],
      latitude: json['latitude'],
      longitude: json['longitude'],
      capacity: json['capacity'],
      hourlyRate: json['hourly_rate'],
      isActive: json['is_active'],
    );
  }
}
