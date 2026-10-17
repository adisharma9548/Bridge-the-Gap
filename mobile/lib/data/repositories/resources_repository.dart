import 'package:flutter/foundation.dart';
import '../models/civic_resource_model.dart';
import '../services/setu_api_client.dart';

class ResourcesRepository extends ChangeNotifier {
  final SetuApiClient apiClient;
  bool _isLoading = false;
  List<CivicResource> _resources = [];

  bool get isLoading => _isLoading;
  List<CivicResource> get resources => _resources;

  ResourcesRepository({required this.apiClient});

  Future<List<CivicResource>> fetchResources({
    String? category,
    String? search,
    String? target,
  }) async {
    _isLoading = true;
    notifyListeners();
    try {
      final rawList = await apiClient.getResources(
        category: category,
        search: search,
        target: target,
      );
      _resources = rawList.map((e) => CivicResource.fromJson(e as Map<String, dynamic>)).toList();
      return _resources;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
