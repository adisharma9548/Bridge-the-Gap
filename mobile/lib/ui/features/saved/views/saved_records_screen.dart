import 'package:flutter/material.dart';
import 'package:setu/core/localization/app_translations.dart';
import 'package:setu/core/localization/locale_provider.dart';
import 'package:setu/core/services/audio_tts_service.dart';
import 'package:setu/core/theme/app_colors.dart';
import 'package:setu/data/models/saved_item_model.dart';
import 'package:setu/data/models/understand_model.dart';
import 'package:setu/data/repositories/saved_records_repository.dart';
import 'package:setu/data/repositories/understand_repository.dart';

class SavedRecordsScreen extends StatefulWidget {
  final SavedRecordsRepository savedRecordsRepository;
  final UnderstandRepository understandRepository;
  final LocaleProvider localeProvider;
  final AudioTtsService ttsService;
  final Function(int tabIndex) onSwitchTab;

  const SavedRecordsScreen({
    super.key,
    required this.savedRecordsRepository,
    required this.understandRepository,
    required this.localeProvider,
    required this.ttsService,
    required this.onSwitchTab,
  });

  @override
  State<SavedRecordsScreen> createState() => _SavedRecordsScreenState();
}

class _SavedRecordsScreenState extends State<SavedRecordsScreen> {
  String _selectedFilter = 'all';

  @override
  void initState() {
    super.initState();
    widget.savedRecordsRepository.fetchSavedItems();
  }

  void _reopenDossier(SavedItem item) {
    if (item.kind == 'understand') {
      try {
        final payload = item.payload is Map<String, dynamic>
            ? item.payload as Map<String, dynamic>
            : Map<String, dynamic>.from(item.payload as Map);
        final result = UnderstandResult.fromJson(payload);
        widget.understandRepository.setResult(result);
        widget.onSwitchTab(0); // Switch to Explain tab
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to open dossier: $e')),
        );
      }
    }
  }

  Future<void> _confirmDelete(SavedItem item) async {
    final tr = widget.localeProvider.tr;
    final isHindi = widget.localeProvider.language == AppLanguage.hi;

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(isHindi ? 'रिकॉर्ड हटाएं?' : 'Delete Saved Record?'),
        content: Text(
          isHindi
              ? 'क्या आप "${item.title}" को अपने सुरक्षित रिकॉर्ड से हटाना चाहते हैं?'
              : 'Are you sure you want to remove "${item.title}" from your saved records?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(isHindi ? 'रद्द करें' : 'Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.red),
            child: Text(tr('deleteRecord')),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await widget.savedRecordsRepository.deleteItem(item.id);
    }
  }

  @override
  Widget build(BuildContext context) {
    final tr = widget.localeProvider.tr;
    final isHindi = widget.localeProvider.language == AppLanguage.hi;
    final allItems = widget.savedRecordsRepository.savedItems;
    final isLoading = widget.savedRecordsRepository.isLoading;

    final filteredItems = _selectedFilter == 'all'
        ? allItems
        : allItems.where((i) => i.kind == _selectedFilter).toList();

    return RefreshIndicator(
      onRefresh: () => widget.savedRecordsRepository.fetchSavedItems(),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Title & Subtitle
            Text(
              tr('savedHeading'),
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: AppColors.navy,
              ),
            ),
            const SizedBox(height: 3),
            Text(
              tr('savedSubtitle'),
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.slateSubtle,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 14),

            // Filter Chips (All, Documents, Public Data, Resources)
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildFilterChip('all', isHindi ? 'सभी रिकॉर्ड' : 'All Records'),
                  const SizedBox(width: 8),
                  _buildFilterChip('understand', isHindi ? 'केस फाइलें (दस्तावेज़)' : 'Case Files (Documents)'),
                  const SizedBox(width: 8),
                  _buildFilterChip('public_data', isHindi ? 'सार्वजनिक डेटा' : 'Public Data'),
                  const SizedBox(width: 8),
                  _buildFilterChip('resource', isHindi ? 'संसाधन' : 'Resources'),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Records List or Empty State
            if (isLoading && allItems.isEmpty) ...[
              const Center(
                child: Padding(
                  padding: EdgeInsets.symmetric(vertical: 40),
                  child: CircularProgressIndicator(),
                ),
              ),
            ] else if (filteredItems.isEmpty) ...[
              Container(
                padding: const EdgeInsets.all(28),
                decoration: BoxDecoration(
                  color: AppColors.ivorySurface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.borderGrey, width: 1.2),
                ),
                child: Column(
                  children: [
                    const Icon(Icons.bookmark_border_rounded, size: 48, color: AppColors.slateLight),
                    const SizedBox(height: 12),
                    Text(
                      tr('noSavedRecords'),
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontSize: 14, color: AppColors.slateDark, height: 1.4),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: () => widget.onSwitchTab(0),
                      icon: const Icon(Icons.document_scanner_rounded, size: 18),
                      label: Text(isHindi ? 'दस्तावेज़ व्याख्या पर जाएं' : 'Go to Document Explain'),
                    ),
                  ],
                ),
              ),
            ] else ...[
              Text(
                '${isHindi ? 'सहेजे गए रिकॉर्ड' : 'Saved Records'} (${filteredItems.length})',
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.navy),
              ),
              const SizedBox(height: 10),
              ...filteredItems.map((item) => _buildSavedItemCard(item, isHindi)),
              const SizedBox(height: 24),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(String value, String label) {
    final isSelected = _selectedFilter == value;
    return FilterChip(
      label: Text(label),
      selected: isSelected,
      selectedColor: AppColors.paleBlue,
      labelStyle: TextStyle(
        fontSize: 12,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
        color: isSelected ? AppColors.cobalt : AppColors.navy,
      ),
      onSelected: (val) {
        if (val) setState(() => _selectedFilter = value);
      },
    );
  }

  Widget _buildSavedItemCard(SavedItem item, bool isHindi) {
    IconData icon;
    Color iconColor;
    String typeLabel;

    switch (item.kind) {
      case 'understand':
        icon = Icons.article_rounded;
        iconColor = AppColors.cobalt;
        typeLabel = isHindi ? 'केस फाइल' : 'Case File';
        break;
      case 'public_data':
        icon = Icons.analytics_rounded;
        iconColor = AppColors.saffron;
        typeLabel = isHindi ? 'सार्वजनिक डेटा' : 'Public Data';
        break;
      case 'resource':
        icon = Icons.account_balance_rounded;
        iconColor = AppColors.jade;
        typeLabel = isHindi ? 'नागरिक सेवा' : 'Civic Service';
        break;
      default:
        icon = Icons.bookmark_rounded;
        iconColor = AppColors.slateDark;
        typeLabel = isHindi ? 'रिकॉर्ड' : 'Record';
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.ivorySurface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.borderGrey, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: iconColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Icon(icon, size: 16, color: iconColor),
              ),
              const SizedBox(width: 8),
              Text(
                typeLabel,
                style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: iconColor),
              ),
              const Spacer(),
              IconButton(
                icon: const Icon(Icons.delete_outline_rounded, size: 18, color: AppColors.red),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
                onPressed: () => _confirmDelete(item),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            item.title,
            style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.bold, color: AppColors.navy),
          ),
          const SizedBox(height: 4),
          Text(
            '${isHindi ? 'सहेजा गया: ' : 'Saved on: '}${item.createdAt.split('T').first}',
            style: const TextStyle(fontSize: 11, color: AppColors.slateSubtle),
          ),
          if (item.kind == 'understand') ...[
            const SizedBox(height: 10),
            Align(
              alignment: Alignment.centerRight,
              child: ElevatedButton.icon(
                onPressed: () => _reopenDossier(item),
                icon: const Icon(Icons.open_in_new_rounded, size: 15),
                label: Text(
                  widget.localeProvider.tr('viewCaseFile'),
                  style: const TextStyle(fontSize: 12),
                ),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(60, 36),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
