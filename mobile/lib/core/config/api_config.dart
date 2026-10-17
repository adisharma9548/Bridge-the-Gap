import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Centralized API configuration for the Setu mobile application.
/// Connects to the shared Setu backend server.
class ApiConfig {
  static const String _prefKeyBaseUrl = 'setu_custom_api_base_url';

  /// Compile-time base URL override passed via `--dart-define=SETU_API_BASE_URL=...`
  static const String _envBaseUrl = String.fromEnvironment('SETU_API_BASE_URL');

  /// Detect platform-appropriate default local address:
  /// - Android Emulator requires 10.0.2.2 to access host loopback
  /// - Windows / macOS / Web / iOS simulator connects to localhost:4000
  static String get defaultBaseUrl {
    if (_envBaseUrl.isNotEmpty) {
      return _envBaseUrl;
    }
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:4000/api';
    }
    return 'http://localhost:4000/api';
  }

  static String _activeBaseUrl = defaultBaseUrl;

  /// Returns current active base URL
  static String get baseUrl => _activeBaseUrl;

  /// Timeout for general API calls
  static const Duration defaultTimeout = Duration(seconds: 15);

  /// Timeout for AI-heavy document analysis calls
  static const Duration aiAnalysisTimeout = Duration(seconds: 35);

  /// Initialize configured base URL from storage
  static Future<void> initialize() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final customUrl = prefs.getString(_prefKeyBaseUrl);
      if (customUrl != null && customUrl.trim().isNotEmpty) {
        _activeBaseUrl = customUrl.trim();
      } else {
        _activeBaseUrl = defaultBaseUrl;
      }
    } catch (_) {
      _activeBaseUrl = defaultBaseUrl;
    }
  }

  /// Update the base URL at runtime (e.g. switching between emulator 10.0.2.2, localhost, or LAN IP)
  static Future<void> setBaseUrl(String newUrl) async {
    final sanitized = newUrl.trim().replaceAll(RegExp(r'/+$'), '');
    _activeBaseUrl = sanitized.isNotEmpty ? sanitized : defaultBaseUrl;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_prefKeyBaseUrl, _activeBaseUrl);
    } catch (_) {}
  }

  /// Reset to platform default
  static Future<void> resetToDefault() async {
    _activeBaseUrl = defaultBaseUrl;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_prefKeyBaseUrl);
    } catch (_) {}
  }
}
