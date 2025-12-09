class User {
  final int id;
  final String email;
  final String fullName;
  final String? phoneNumber;

  User({
    required this.id,
    required this.email,
    required this.fullName,
    this.phoneNumber,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      email: json['email'],
      fullName: json['full_name'],
      phoneNumber: json['phone_number'],
    );
  }
}
