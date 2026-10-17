import 'package:flutter/foundation.dart';
import '../../core/services/storage_service.dart';
import '../models/auth_response.dart';
import '../models/user_model.dart';
import '../services/setu_api_client.dart';

class AuthRepository extends ChangeNotifier {
  final SetuApiClient apiClient;
  final StorageService storageService;

  UserModel? _currentUser;
  String? _currentToken;
  bool _isLoading = false;

  UserModel? get currentUser => _currentUser;
  String? get currentToken => _currentToken;
  bool get isAuthenticated => _currentUser != null && _currentToken != null;
  bool get isLoading => _isLoading;

  AuthRepository({
    required this.apiClient,
    required this.storageService,
  });

  /// Restores session on app startup
  Future<bool> restoreSession() async {
    _isLoading = true;
    notifyListeners();

    try {
      final token = await storageService.getAuthToken();
      final cachedUser = await storageService.getAuthUser();

      if (token == null || token.isEmpty) {
        _isLoading = false;
        notifyListeners();
        return false;
      }

      _currentToken = token;
      _currentUser = cachedUser;
      notifyListeners();

      // Verify and refresh with backend
      try {
        final res = await apiClient.getMe();
        if (res['success'] == true && res['user'] != null) {
          _currentUser = UserModel.fromJson(res['user'] as Map<String, dynamic>);
          await storageService.saveAuthUser(_currentUser!);
        }
      } catch (e) {
        if (e is SetuApiException && e.statusCode == 401) {
          // Token expired or revoked
          await logout();
          return false;
        }
      }

      _isLoading = false;
      notifyListeners();
      return _currentUser != null;
    } catch (_) {
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<SendOtpResponse> sendOtp({
    required String email,
    required String type,
    String? name,
  }) async {
    _isLoading = true;
    notifyListeners();
    try {
      final res = await apiClient.sendOtp(email: email, type: type, name: name);
      return SendOtpResponse.fromJson(res);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<VerifyOtpResponse> verifyOtp({
    required String email,
    required String otp,
    required String type,
    String? name,
  }) async {
    _isLoading = true;
    notifyListeners();
    try {
      final res = await apiClient.verifyOtp(email: email, otp: otp, type: type, name: name);
      final response = VerifyOtpResponse.fromJson(res);

      if (response.success && response.token != null && response.user != null) {
        _currentToken = response.token;
        _currentUser = response.user;
        await storageService.saveAuthToken(response.token!);
        await storageService.saveAuthUser(response.user!);
      }

      return response;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();
    try {
      await apiClient.logout();
    } catch (_) {}
    _currentUser = null;
    _currentToken = null;
    await storageService.clearAuth();
    _isLoading = false;
    notifyListeners();
  }
}
