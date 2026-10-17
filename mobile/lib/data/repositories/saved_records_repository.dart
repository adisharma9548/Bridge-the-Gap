import 'package:flutter/foundation.dart';
import '../models/saved_item_model.dart';
import '../services/setu_api_client.dart';

class SavedRecordsRepository extends ChangeNotifier {
  final SetuApiClient apiClient;
  bool _isLoading = false;
  List<SavedItem> _savedItems = [];

  bool get isLoading => _isLoading;
  List<SavedItem> get savedItems => _savedItems;

  SavedRecordsRepository({required this.apiClient});

  Future<List<SavedItem>> fetchSavedItems() async {
    _isLoading = true;
    notifyListeners();
    try {
      final rawList = await apiClient.getSavedItems();
      _savedItems = rawList.map((e) => SavedItem.fromJson(e as Map<String, dynamic>)).toList();
      return _savedItems;
    } catch (_) {
      return _savedItems;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> saveItem({
    required String kind,
    required String title,
    required dynamic payload,
  }) async {
    _isLoading = true;
    notifyListeners();
    try {
      final res = await apiClient.saveItem(kind: kind, title: title, payload: payload);
      final success = res['success'] == true;
      if (success) {
        await fetchSavedItems();
      }
      return success;
    } catch (e) {
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> deleteItem(String id) async {
    _isLoading = true;
    notifyListeners();
    try {
      await apiClient.deleteSavedItem(id);
      _savedItems.removeWhere((item) => item.id == id);
      notifyListeners();
      return true;
    } catch (e) {
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
