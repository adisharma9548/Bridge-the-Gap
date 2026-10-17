import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../core/config/api_config.dart';
import '../../core/services/storage_service.dart';

class SetuApiException implements Exception {
  final int statusCode;
  final String message;

  const SetuApiException(this.statusCode, this.message);

  @override
  String toString() => 'SetuApiException($statusCode): $message';
}

class SetuApiClient {
  final StorageService storageService;
  final http.Client _httpClient;

  SetuApiClient({
    required this.storageService,
    http.Client? httpClient,
  }) : _httpClient = httpClient ?? http.Client();

  Future<Map<String, String>> _buildHeaders() async {
    final token = await storageService.getAuthToken();
    final sessionId = await storageService.getOrCreateSessionId();

    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-session-id': sessionId,
    };

    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }

    return headers;
  }

  // 1. Health Check
  Future<bool> checkHealth() async {
    try {
      final uri = Uri.parse('${ApiConfig.baseUrl}/health');
      final response = await _httpClient.get(uri).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['status'] == 'healthy';
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  // 2. Authentication
  Future<Map<String, dynamic>> sendOtp({
    required String email,
    required String type, // 'login' or 'register'
    String? name,
  }) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}/auth/send-otp');
    final headers = await _buildHeaders();
    final body = jsonEncode({
      'email': email.trim().toLowerCase(),
      'type': type,
      if (name != null && name.trim().isNotEmpty) 'name': name.trim(),
    });

    final res = await _httpClient.post(uri, headers: headers, body: body).timeout(ApiConfig.defaultTimeout);
    final json = jsonDecode(res.body) as Map<String, dynamic>;

    if (res.statusCode >= 200 && res.statusCode < 300) {
      return json;
    }
    throw SetuApiException(res.statusCode, json['message'] as String? ?? 'Failed to send OTP');
  }

  Future<Map<String, dynamic>> verifyOtp({
    required String email,
    required String otp,
    required String type,
    String? name,
  }) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}/auth/verify-otp');
    final headers = await _buildHeaders();
    final body = jsonEncode({
      'email': email.trim().toLowerCase(),
      'otp': otp.trim(),
      'type': type,
      if (name != null && name.trim().isNotEmpty) 'name': name.trim(),
    });

    final res = await _httpClient.post(uri, headers: headers, body: body).timeout(ApiConfig.defaultTimeout);
    final json = jsonDecode(res.body) as Map<String, dynamic>;

    if (res.statusCode >= 200 && res.statusCode < 300) {
      return json;
    }
    throw SetuApiException(res.statusCode, json['message'] as String? ?? 'Verification failed');
  }

  Future<Map<String, dynamic>> getMe() async {
    final uri = Uri.parse('${ApiConfig.baseUrl}/auth/me');
    final headers = await _buildHeaders();

    final res = await _httpClient.get(uri, headers: headers).timeout(ApiConfig.defaultTimeout);
    if (res.statusCode == 401) {
      await storageService.clearAuth();
      throw const SetuApiException(401, 'Session expired. Please sign in again.');
    }
    final json = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode == 200) {
      return json;
    }
    throw SetuApiException(res.statusCode, json['message'] as String? ?? 'Failed to retrieve user session');
  }

  Future<void> logout() async {
    try {
      final uri = Uri.parse('${ApiConfig.baseUrl}/auth/logout');
      final headers = await _buildHeaders();
      await _httpClient.post(uri, headers: headers).timeout(const Duration(seconds: 5));
    } catch (_) {}
    await storageService.clearAuth();
  }

  // 3. Document Analysis & Dossier
  Future<Map<String, dynamic>> understandDocument({
    String? text,
    required String lang,
    Map<String, dynamic>? file,
    String aiProvider = 'auto',
  }) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}/understand');
    final headers = await _buildHeaders();
    final Map<String, dynamic> bodyMap = {
      'lang': lang,
      'aiProvider': aiProvider,
    };
    if (text != null && text.trim().isNotEmpty) {
      bodyMap['text'] = text.trim();
    }
    if (file != null) {
      bodyMap['file'] = file;
    }
    final body = jsonEncode(bodyMap);

    final res = await _httpClient.post(uri, headers: headers, body: body).timeout(ApiConfig.aiAnalysisTimeout);
    final json = jsonDecode(res.body) as Map<String, dynamic>;

    if (res.statusCode >= 200 && res.statusCode < 300 && json['success'] == true) {
      return json['data'] as Map<String, dynamic>;
    }
    throw SetuApiException(
      res.statusCode,
      json['error'] as String? ?? json['message'] as String? ?? 'Failed to analyze document',
    );
  }

  // 4. Public Data Explorer
  Future<List<dynamic>> getCatalogList() async {
    final uri = Uri.parse('${ApiConfig.baseUrl}/find/catalog');
    final headers = await _buildHeaders();

    final res = await _httpClient.get(uri, headers: headers).timeout(ApiConfig.defaultTimeout);
    final json = jsonDecode(res.body) as Map<String, dynamic>;

    if (res.statusCode == 200 && json['success'] == true) {
      return json['catalog'] as List<dynamic>? ?? [];
    }
    throw SetuApiException(res.statusCode, json['error'] as String? ?? 'Failed to fetch catalog');
  }

  Future<Map<String, dynamic>> queryPublicData({
    required String slug,
    required String filterValue,
    required String lang,
  }) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}/find/query');
    final headers = await _buildHeaders();
    final body = jsonEncode({
      'slug': slug,
      'filterValue': filterValue,
      'lang': lang,
    });

    final res = await _httpClient.post(uri, headers: headers, body: body).timeout(ApiConfig.defaultTimeout);
    final json = jsonDecode(res.body) as Map<String, dynamic>;

    if (res.statusCode == 200 && json['success'] == true) {
      return json['data'] as Map<String, dynamic>;
    }
    throw SetuApiException(res.statusCode, json['error'] as String? ?? 'Failed to fetch public data');
  }

  // 5. Civic Resources Directory
  Future<List<dynamic>> getResources({
    String? category,
    String? search,
    String? target,
  }) async {
    final queryParams = <String, String>{};
    if (category != null && category.isNotEmpty && category != 'all') {
      queryParams['category'] = category;
    }
    if (search != null && search.trim().isNotEmpty) {
      queryParams['search'] = search.trim();
    }
    if (target != null && target.isNotEmpty && target != 'all') {
      queryParams['target'] = target;
    }

    final uri = Uri.parse('${ApiConfig.baseUrl}/resources').replace(queryParameters: queryParams.isEmpty ? null : queryParams);
    final headers = await _buildHeaders();

    final res = await _httpClient.get(uri, headers: headers).timeout(ApiConfig.defaultTimeout);
    final json = jsonDecode(res.body) as Map<String, dynamic>;

    if (res.statusCode == 200 && json['success'] == true) {
      return json['data'] as List<dynamic>? ?? [];
    }
    throw SetuApiException(res.statusCode, json['error'] as String? ?? 'Failed to retrieve resources');
  }

  // 6. Saved Records
  Future<List<dynamic>> getSavedItems() async {
    final uri = Uri.parse('${ApiConfig.baseUrl}/saved');
    final headers = await _buildHeaders();

    final res = await _httpClient.get(uri, headers: headers).timeout(ApiConfig.defaultTimeout);
    final json = jsonDecode(res.body) as Map<String, dynamic>;

    if (res.statusCode == 200 && json['success'] == true) {
      return json['items'] as List<dynamic>? ?? [];
    }
    throw SetuApiException(res.statusCode, json['error'] as String? ?? 'Failed to fetch saved items');
  }

  Future<Map<String, dynamic>> saveItem({
    required String kind,
    required String title,
    required dynamic payload,
  }) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}/saved');
    final headers = await _buildHeaders();
    final body = jsonEncode({
      'kind': kind,
      'title': title,
      'payload': payload,
    });

    final res = await _httpClient.post(uri, headers: headers, body: body).timeout(ApiConfig.defaultTimeout);
    final json = jsonDecode(res.body) as Map<String, dynamic>;

    if (res.statusCode >= 200 && res.statusCode < 300 && json['success'] == true) {
      return json;
    }
    throw SetuApiException(res.statusCode, json['error'] as String? ?? 'Failed to save item');
  }

  Future<void> deleteSavedItem(String id) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}/saved/$id');
    final headers = await _buildHeaders();

    final res = await _httpClient.delete(uri, headers: headers).timeout(ApiConfig.defaultTimeout);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return;
    }
    final json = jsonDecode(res.body) as Map<String, dynamic>;
    throw SetuApiException(res.statusCode, json['error'] as String? ?? 'Failed to delete saved item');
  }
}
