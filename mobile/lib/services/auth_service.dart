import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user.dart';
import 'api_service.dart';

class AuthService with ChangeNotifier {
  final ApiService _api = ApiService();
  final _storage = const FlutterSecureStorage();
  User? _currentUser;
  bool _isAuthenticated = false;

  User? get currentUser => _currentUser;
  bool get isAuthenticated => _isAuthenticated;

  Future<bool> login(String email, String password) async {
    try {
      // Note: Login endpoint expects form data, not JSON usually with OAuth2PasswordRequestForm
      // But for simplicity in this demo we might have implemented it differently or need to adjust.
      // Let's assume standard JSON post for now, or adjust to form-urlencoded if needed.
      // Actually, OAuth2PasswordRequestForm expects form-data.
      
      final response = await http.post(
        Uri.parse('${ApiService.baseUrl}/auth/login'),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: {'username': email, 'password': password},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final token = data['access_token'];
        await _storage.write(key: 'jwt_token', value: token);
        _isAuthenticated = true;
        await fetchProfile();
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      print(e);
      return false;
    }
  }

  Future<void> fetchProfile() async {
    try {
      final data = await _api.get('/users/profile');
      _currentUser = User.fromJson(data);
      _isAuthenticated = true;
      notifyListeners();
    } catch (e) {
      print(e);
      logout();
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: 'jwt_token');
    _currentUser = null;
    _isAuthenticated = false;
    notifyListeners();
  }
  
  Future<bool> register(String email, String password, String fullName) async {
      try {
          await _api.post('/auth/register', {
              'email': email,
              'password': password,
              'full_name': fullName
          });
          return true;
      } catch (e) {
          print(e);
          return false;
      }
  }
}
