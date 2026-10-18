import 'package:flutter/material.dart';
import 'package:setu/core/localization/app_translations.dart';
import 'package:setu/core/localization/locale_provider.dart';
import 'package:setu/core/theme/app_colors.dart';
import 'package:setu/data/models/public_data_model.dart';
import 'package:setu/data/repositories/public_data_repository.dart';
import 'package:setu/data/repositories/saved_records_repository.dart';
import 'package:setu/ui/core/widgets/verified_badge.dart';

class PublicDataScreen extends StatefulWidget {
  final PublicDataRepository publicDataRepository;
  final SavedRecordsRepository savedRecordsRepository;
  final LocaleProvider localeProvider;

  const PublicDataScreen({
    super.key,
    required this.publicDataRepository,
    required this.savedRecordsRepository,
    required this.localeProvider,
  });

  @override
  State<PublicDataScreen> createState() => _PublicDataScreenState();
}

class _PublicDataScreenState extends State<PublicDataScreen> {
  CatalogItem? _selectedCatalog;
  String? _selectedFilterValue;
  bool _isSaved = false;

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  Future<void> _loadInitialData() async {
    final list = await widget.publicDataRepository.loadCatalog();
    if (list.isNotEmpty && mounted) {
      setState(() {
        _selectedCatalog = list.first;
        if (_selectedCatalog!.filterOptions.isNotEmpty) {
          _selectedFilterValue = _selectedCatalog!.filterOptions.first.value;
        }
      });
      _handleQuery();
    }
  }

  Future<void> _handleQuery() async {
    if (_selectedCatalog == null || _selectedFilterValue == null) return;
    setState(() => _isSaved = false);
    await widget.publicDataRepository.queryData(
      slug: _selectedCatalog!.slug,
      filterValue: _selectedFilterValue!,
      lang: widget.localeProvider.language,
    );
  }

  @override
  Widget build(BuildContext context) {
    final tr = widget.localeProvider.tr;
    final isHindi = widget.localeProvider.language == AppLanguage.hi;
    final catalogs = widget.publicDataRepository.catalogList;
    final result = widget.publicDataRepository.currentResult;
    final isLoading = widget.publicDataRepository.isLoading;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Screen Title & Subtitle
          Text(
            tr('findHeading'),
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: AppColors.navy,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            tr('findSubtitle'),
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.slateSubtle,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 14),

          // Catalog Selector (Mandi, Hospitals, AQI, Exams)
          Text(
            tr('selectCatalog'),
            style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold, color: AppColors.navy),
          ),
          const SizedBox(height: 8),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: catalogs.map((cat) {
                final isSelected = _selectedCatalog?.slug == cat.slug;
                final title = isHindi ? cat.titleHi : cat.titleEn;

                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(title),
                    selected: isSelected,
                    selectedColor: AppColors.paleBlue,
                    labelStyle: TextStyle(
                      fontSize: 12.5,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                      color: isSelected ? AppColors.cobalt : AppColors.navy,
                    ),
                    onSelected: (val) {
                      if (val) {
                        setState(() {
                          _selectedCatalog = cat;
                          _selectedFilterValue =
                              cat.filterOptions.isNotEmpty ? cat.filterOptions.first.value : null;
                        });
                        _handleQuery();
                      }
                    },
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 14),

          // Filter Selector (State / City / Category)
          if (_selectedCatalog != null && _selectedCatalog!.filterOptions.isNotEmpty) ...[
            Text(
              isHindi ? _selectedCatalog!.filterLabelHi : _selectedCatalog!.filterLabelEn,
              style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold, color: AppColors.navy),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: AppColors.ivorySurface,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.borderGrey, width: 1.2),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _selectedFilterValue,
                  isExpanded: true,
                  icon: const Icon(Icons.arrow_drop_down_rounded, color: AppColors.cobalt),
                  items: _selectedCatalog!.filterOptions.map((opt) {
                    final label = isHindi ? opt.labelHi : opt.labelEn;
                    return DropdownMenuItem<String>(
                      value: opt.value,
                      child: Text(label, style: const TextStyle(fontSize: 14, color: AppColors.navy)),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) {
                      setState(() => _selectedFilterValue = val);
                      _handleQuery();
                    }
                  },
                ),
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Loading Indicator
          if (isLoading) ...[
            const Center(
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: 24),
                child: CircularProgressIndicator(),
              ),
            ),
          ] else if (result != null) ...[
            // Result Header & Save Button
            Row(
              children: [
                const VerifiedBadge(label: 'data.gov.in Official', type: BadgeType.verified),
                const Spacer(),
                ElevatedButton.icon(
                  onPressed: _isSaved
                      ? null
                      : () async {
                          final messenger = ScaffoldMessenger.of(context);
                          final title =
                              '${isHindi ? result.catalog.titleHi : result.catalog.titleEn} (${result.filterValue})';
                          final ok = await widget.savedRecordsRepository.saveItem(
                            kind: 'public_data',
                            title: title,
                            payload: result.toJson(),
                          );
                          if (ok && mounted) {
                            setState(() => _isSaved = true);
                            messenger.showSnackBar(
                              SnackBar(
                                content: Text(tr('savedSuccess')),
                                backgroundColor: AppColors.jade,
                              ),
                            );
                          }
                        },
                  icon: Icon(_isSaved ? Icons.bookmark_added_rounded : Icons.bookmark_add_outlined, size: 16),
                  label: Text(_isSaved ? tr('savedSuccess') : tr('saveCaseFile'), style: const TextStyle(fontSize: 12)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _isSaved ? AppColors.success : AppColors.brandSecondary,
                    minimumSize: const Size(60, 36),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Grounded Official Summary & Advice Card
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.ivorySurface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.cobalt, width: 1.2),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.analytics_rounded, size: 18, color: AppColors.cobalt),
                      const SizedBox(width: 8),
                      Text(
                        tr('officialSummary'),
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: AppColors.cobaltDark,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    result.summary.summary,
                    style: const TextStyle(fontSize: 13.5, height: 1.45, color: AppColors.navy),
                  ),
                  if (result.summary.advice.isNotEmpty) ...[
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.paleMint,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            tr('actionableAdvice'),
                            style: const TextStyle(
                              fontSize: 11.5,
                              fontWeight: FontWeight.bold,
                              color: AppColors.jadeDark,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            result.summary.advice,
                            style: const TextStyle(fontSize: 12.5, color: AppColors.jadeDark),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Record Rows Cards (Mobile-optimized cards, not overflowing tables!)
            Text(
              isHindi ? 'दस्तावेजी रिकॉर्ड तालिका (${result.rows.length}):' : 'Official Dataset Records (${result.rows.length}):',
              style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold, color: AppColors.navy),
            ),
            const SizedBox(height: 10),

            ...result.rows.map((row) => _buildRowCard(row, result.catalog.slug, isHindi)),
            const SizedBox(height: 24),
          ],
        ],
      ),
    );
  }

  Widget _buildRowCard(Map<String, dynamic> row, String slug, bool isHindi) {
    if (slug == 'mandi-prices') {
      return Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.ivorySurface,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.borderGrey, width: 1.2),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    row['commodity']?.toString() ?? '',
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.navy),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.paleAmber,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    row['modal_price']?.toString() ?? '',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: AppColors.saffronDark,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              '${row['market'] ?? ''} • ${row['district'] ?? ''}, ${row['state'] ?? ''}',
              style: const TextStyle(fontSize: 12, color: AppColors.slateSubtle),
            ),
            const SizedBox(height: 6),
            Row(
              children: [
                Text(
                  '${isHindi ? 'न्यूनतम:' : 'Min:'} ${row['min_price'] ?? ''}  |  ${isHindi ? 'अधिकतम:' : 'Max:'} ${row['max_price'] ?? ''}',
                  style: const TextStyle(fontSize: 12, color: AppColors.slateDark),
                ),
                const Spacer(),
                Text(
                  row['unit']?.toString() ?? '',
                  style: const TextStyle(fontSize: 11, color: AppColors.slateLight),
                ),
              ],
            ),
          ],
        ),
      );
    } else if (slug == 'hospital-directory') {
      return Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.ivorySurface,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.borderGrey, width: 1.2),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              row['hospital_name']?.toString() ?? '',
              style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.bold, color: AppColors.navy),
            ),
            const SizedBox(height: 4),
            Text(
              '${row['category'] ?? ''} • ${row['district'] ?? ''}, ${row['state'] ?? ''}',
              style: const TextStyle(fontSize: 12, color: AppColors.cobalt),
            ),
            const SizedBox(height: 6),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.paleMint,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    row['ayushman_pmjay']?.toString() ?? '',
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.jadeDark),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  row['emergency_services']?.toString() ?? '',
                  style: const TextStyle(fontSize: 11.5, color: AppColors.slateSubtle),
                ),
              ],
            ),
            if (row['contact_number'] != null) ...[
              const SizedBox(height: 6),
              Text(
                '📞 ${row['contact_number']}',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.navy),
              ),
            ],
          ],
        ),
      );
    } else if (slug == 'air-quality') {
      return Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.ivorySurface,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.borderGrey, width: 1.2),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    row['station']?.toString() ?? row['city']?.toString() ?? '',
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.navy),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.paleAmber,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.saffron, width: 1.0),
                  ),
                  child: Text(
                    'AQI ${row['aqi_index']}',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.saffronDark),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              '${isHindi ? 'स्थिति:' : 'Category:'} ${row['category'] ?? ''} • ${isHindi ? 'प्रमुख प्रदूषक:' : 'Pollutant:'} ${row['prominent_pollutant'] ?? ''}',
              style: const TextStyle(fontSize: 12, color: AppColors.slateSubtle),
            ),
            const SizedBox(height: 6),
            Text(
              isHindi ? (row['health_advice_hi'] ?? '') : (row['health_advice_en'] ?? ''),
              style: const TextStyle(fontSize: 12.5, color: AppColors.navy, height: 1.35),
            ),
          ],
        ),
      );
    }

    // Default card for competitive exams or general rows
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.ivorySurface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.borderGrey, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: row.entries.map((e) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 3),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${e.key}: ',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.slateDark),
                ),
                Expanded(
                  child: Text(
                    e.value?.toString() ?? '',
                    style: const TextStyle(fontSize: 12.5, color: AppColors.navy),
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }
}
