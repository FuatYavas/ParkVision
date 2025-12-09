class Reservation {
  final int id;
  final int userId;
  final String reservationCode;
  final String status;
  final int spotId;
  final DateTime startTime;
  final DateTime endTime;

  Reservation({
    required this.id,
    required this.userId,
    required this.reservationCode,
    required this.status,
    required this.spotId,
    required this.startTime,
    required this.endTime,
  });

  factory Reservation.fromJson(Map<String, dynamic> json) {
    return Reservation(
      id: json['id'],
      userId: json['user_id'],
      reservationCode: json['reservation_code'],
      status: json['status'],
      spotId: json['spot_id'],
      startTime: DateTime.parse(json['start_time']),
      endTime: DateTime.parse(json['end_time']),
    );
  }
}
