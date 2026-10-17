import 'package:flutter/foundation.dart';
import '../../core/localization/app_translations.dart';
import '../models/public_data_model.dart';
import '../services/setu_api_client.dart';

class PublicDataRepository extends ChangeNotifier {
  final SetuApiClient apiClient;
  bool _isLoading = false;
  List<CatalogItem> _catalogList = [];
  PublicDataResponse? _currentResult;

  bool get isLoading => _isLoading;
  List<CatalogItem> get catalogList => _catalogList;
  PublicDataResponse? get currentResult => _currentResult;

  PublicDataRepository({required this.apiClient});

  Future<List<CatalogItem>> loadCatalog() async {
    _isLoading = true;
    notifyListeners();
    try {
      final rawList = await apiClient.getCatalogList();
      _catalogList = rawList.map((e) => CatalogItem.fromJson(e as Map<String, dynamic>)).toList();
      return _catalogList;
    } catch (_) {
      // Resilient fallback with standard 4 catalogs
      _catalogList = _getDefaultCatalog();
      return _catalogList;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<PublicDataResponse> queryData({
    required String slug,
    required String filterValue,
    required AppLanguage lang,
  }) async {
    _isLoading = true;
    notifyListeners();
    try {
      final raw = await apiClient.queryPublicData(
        slug: slug,
        filterValue: filterValue,
        lang: lang == AppLanguage.hi ? 'hi' : 'en',
      );
      final res = PublicDataResponse.fromJson(raw);
      _currentResult = res;
      return res;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void clearResult() {
    _currentResult = null;
    notifyListeners();
  }

  List<CatalogItem> _getDefaultCatalog() {
    return [
      const CatalogItem(
        slug: 'mandi-prices',
        resourceId: '9ef84268-d588-465a-a308-a864a43d0070',
        titleEn: 'Daily Mandi Crop Prices',
        titleHi: 'दैनिक मंडी फसल भाव',
        filterLabelEn: 'Select State',
        filterLabelHi: 'राज्य चुनें',
        filterKey: 'state',
        filterOptions: [
          FilterOption(labelEn: 'Uttar Pradesh', labelHi: 'उत्तर प्रदेश', value: 'Uttar Pradesh'),
          FilterOption(labelEn: 'Punjab', labelHi: 'पंजाब', value: 'Punjab'),
          FilterOption(labelEn: 'Maharashtra', labelHi: 'महाराष्ट्र', value: 'Maharashtra'),
          FilterOption(labelEn: 'Madhya Pradesh', labelHi: 'मध्य प्रदेश', value: 'Madhya Pradesh'),
        ],
      ),
      const CatalogItem(
        slug: 'hospital-directory',
        resourceId: '3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69',
        titleEn: 'Public & PM-JAY Hospitals',
        titleHi: 'सरकारी व आयुष्मान भारत अस्पताल',
        filterLabelEn: 'Select State',
        filterLabelHi: 'राज्य चुनें',
        filterKey: 'state',
        filterOptions: [
          FilterOption(labelEn: 'Delhi', labelHi: 'दिल्ली', value: 'Delhi'),
          FilterOption(labelEn: 'Uttar Pradesh', labelHi: 'उत्तर प्रदेश', value: 'Uttar Pradesh'),
          FilterOption(labelEn: 'Maharashtra', labelHi: 'महाराष्ट्र', value: 'Maharashtra'),
          FilterOption(labelEn: 'Karnataka', labelHi: 'कर्नाटक', value: 'Karnataka'),
        ],
      ),
      const CatalogItem(
        slug: 'air-quality',
        resourceId: '3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69-aqi',
        titleEn: 'City Air Quality & Pollution (AQI)',
        titleHi: 'शहर वायु गुणवत्ता व प्रदूषण (AQI)',
        filterLabelEn: 'Select City',
        filterLabelHi: 'शहर चुनें',
        filterKey: 'city',
        filterOptions: [
          FilterOption(labelEn: 'Delhi', labelHi: 'दिल्ली', value: 'Delhi'),
          FilterOption(labelEn: 'Ghaziabad', labelHi: 'गाज़ियाबाद', value: 'Ghaziabad'),
          FilterOption(labelEn: 'Lucknow', labelHi: 'लखनऊ', value: 'Lucknow'),
          FilterOption(labelEn: 'Mumbai', labelHi: 'मुंबई', value: 'Mumbai'),
          FilterOption(labelEn: 'Bengaluru', labelHi: 'बेंगलुरु', value: 'Bengaluru'),
        ],
      ),
      const CatalogItem(
        slug: 'competitive-exams',
        resourceId: 'upsc-nta-exam-portal',
        titleEn: 'Competitive Exams & Education',
        titleHi: 'प्रतियोगी परीक्षाएं व उच्च शिक्षा',
        filterLabelEn: 'Select Exam Stream / Category',
        filterLabelHi: 'परीक्षा श्रेणी चुनें',
        filterKey: 'category',
        filterOptions: [
          FilterOption(labelEn: 'Civil Services (UPSC)', labelHi: 'सिविल सेवा (UPSC)', value: 'Civil Services'),
          FilterOption(labelEn: 'Staff Selection (SSC)', labelHi: 'कर्मचारी चयन (SSC)', value: 'Staff Selection'),
          FilterOption(labelEn: 'Banking (IBPS/SBI)', labelHi: 'बैंकिंग (IBPS/SBI)', value: 'Banking'),
          FilterOption(labelEn: 'Railways (RRB)', labelHi: 'रेलवे भर्ती (RRB)', value: 'Railways'),
        ],
      ),
    ];
  }
}
