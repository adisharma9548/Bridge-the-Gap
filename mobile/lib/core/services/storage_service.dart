import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../data/models/user_model.dart';

/// Secure token and session persistence service.
/// Uses FlutterSecureStorage with SharedPreferences fallback for maximum platform compatibility.
class StorageService {
  static const String _keyAuthToken = 'setu_auth_token';
  static const String _keyAuthUser = 'setu_auth_user';
  static const String _keySessionId = 'setu_session_id';

  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();

  /// Retrieve or generate persistent anonymous session UUID
  Future<String> getOrCreateSessionId() async {
    final prefs = await SharedPreferences.getInstance();
    String? sid = prefs.getString(_keySessionId);
    if (sid == null || sid.trim().isEmpty) {
      final rand = DateTime.now().millisecondsSinceEpoch.toRadixString(36);
      sid = 'session_$rand';
      await prefs.setString(_keySessionId, sid);
    }
    return sid;
  }

  /// Save session token securely
  Future<void> saveAuthToken(String token) async {
    try {
      await _secureStorage.write(key: _keyAuthToken, value: token);
    } catch (_) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_keyAuthToken, token);
    }
  }

  /// Retrieve stored session token
  Future<String?> getAuthToken() async {
    try {
      final val = await _secureStorage.read(key: _keyAuthToken);
      if (val != null && val.isNotEmpty) return val;
    } catch (_) {}
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyAuthToken);
  }

  /// Save authenticated user profile
  Future<void> saveAuthUser(UserModel user) async {
    final raw = jsonEncode(user.toJson());
    try {
      await _secureStorage.write(key: _keyAuthUser, value: raw);
    } catch (_) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_keyAuthUser, raw);
    }
  }

  /// Retrieve authenticated user profile
  Future<UserModel?> getAuthUser() async {
    String? raw;
    try {
      raw = await _secureStorage.read(key: _keyAuthUser);
    } catch (_) {}
    if (raw == null || raw.isEmpty) {
      final prefs = await SharedPreferences.getInstance();
      raw = prefs.getString(_keyAuthUser);
    }
    if (raw == null || raw.isEmpty) return null;
    try {
      return UserModel.fromJson(jsonDecode(raw) as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }

  /// Clear tokens on logout
  Future<void> clearAuth() async {
    try {
      await _secureStorage.delete(key: _keyAuthToken);
      await _secureStorage.delete(key: _keyAuthUser);
    } catch (_) {}
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyAuthToken);
    await prefs.remove(_keyAuthUser);
  }
}
