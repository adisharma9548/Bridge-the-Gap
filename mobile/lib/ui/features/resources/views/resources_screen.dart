import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:setu/core/localization/app_translations.dart';
import 'package:setu/core/localization/locale_provider.dart';
import 'package:setu/core/theme/app_colors.dart';
import 'package:setu/data/models/civic_resource_model.dart';
import 'package:setu/data/repositories/resources_repository.dart';
import 'package:setu/data/repositories/saved_records_repository.dart';
import 'package:setu/ui/core/widgets/verified_badge.dart';

class ResourcesScreen extends StatefulWidget {
  final ResourcesRepository resourcesRepository;
  final SavedRecordsRepository savedRecordsRepository;
  final LocaleProvider localeProvider;

  const ResourcesScreen({
    super.key,
    required this.resourcesRepository,
    required this.savedRecordsRepository,
    required this.localeProvider,
  });

  @override
  State<ResourcesScreen> createState() => _ResourcesScreenState();
}

class _ResourcesScreenState extends State<ResourcesScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _selectedCategory = 'all';
  final String _selectedTarget = 'all';
  final Set<String> _bookmarkedIds = {};

  final List<Map<String, String>> _categories = [
    {'id': 'all', 'label_en': 'All Categories', 'label_hi': 'सभी श्रेणियां'},
    {'id': 'mentors-orgs', 'label_en': 'Mentors & Helplines', 'label_hi': 'मार्गदर्शक व हेल्पलाइन'},
    {'id': 'scholarships-education', 'label_en': 'Scholarships', 'label_hi': 'छात्रवृत्तियां'},
    {'id': 'internships-competitions', 'label_en': 'Opportunities', 'label_hi': 'अवसर व प्रतियोगिताएं'},
    {'id': 'funding-grants', 'label_en': 'Funding & Grants', 'label_hi': 'ऋण व अनुदान'},
    {'id': 'tools-services', 'label_en': 'Tools & Portals', 'label_hi': 'सुविधाएं व पोर्टल'},
  ];

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    await widget.resourcesRepository.fetchResources(
      category: _selectedCategory,
      search: _searchController.text,
      target: _selectedTarget,
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isHindi = widget.localeProvider.language == AppLanguage.hi;
    final resources = widget.resourcesRepository.resources;
    final isLoading = widget.resourcesRepository.isLoading;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Title & Subtitle
          Text(
            isHindi ? 'नागरिक संसाधन व कानूनी सहायता' : 'Curated Civic Directory',
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: AppColors.navy,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            isHindi
                ? 'वरिष्ठ नागरिकों, छात्रों, किसानों और परिवारों के लिए सत्यापित सरकारी पोर्टल व हेल्पलाइन।'
                : 'Verified statutory services, free legal aid portals, helplines, and public welfare schemes.',
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.slateSubtle,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 14),

          // Search Bar
          TextField(
            controller: _searchController,
            decoration: InputDecoration(
              hintText: isHindi ? 'योजना, संस्था या हेल्पलाइन खोजें...' : 'Search resources, legal aid, schemes...',
              prefixIcon: const Icon(Icons.search_rounded, size: 20, color: AppColors.cobalt),
              suffixIcon: _searchController.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear_rounded, size: 18),
                      onPressed: () {
                        _searchController.clear();
                        _fetch();
                      },
                    )
                  : null,
            ),
            onSubmitted: (_) => _fetch(),
          ),
          const SizedBox(height: 12),

          // Category Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _categories.map((c) {
                final isSelected = _selectedCategory == c['id'];
                final label = isHindi ? c['label_hi']! : c['label_en']!;

                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(label),
                    selected: isSelected,
                    selectedColor: AppColors.paleBlue,
                    labelStyle: TextStyle(
                      fontSize: 12,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                      color: isSelected ? AppColors.cobalt : AppColors.navy,
                    ),
                    onSelected: (val) {
                      setState(() => _selectedCategory = c['id']!);
                      _fetch();
                    },
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 16),

          // Content
          if (isLoading) ...[
            const Center(
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: 28),
                child: CircularProgressIndicator(),
              ),
            ),
          ] else if (resources.isEmpty) ...[
            Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 40),
                child: Text(
                  isHindi ? 'कोई संसाधन नहीं मिला।' : 'No verified resources match your query.',
                  style: const TextStyle(fontSize: 14, color: AppColors.slateSubtle),
                ),
              ),
            ),
          ] else ...[
            Text(
              '${isHindi ? 'उपलब्ध नागरिक सेवाएं' : 'Verified Resources'} (${resources.length})',
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.navy),
            ),
            const SizedBox(height: 10),
            ...resources.map((res) => _buildResourceCard(res, isHindi)),
            const SizedBox(height: 24),
          ],
        ],
      ),
    );
  }

  Widget _buildResourceCard(CivicResource res, bool isHindi) {
    final title = isHindi ? res.titleHi : res.titleEn;
    final provider = isHindi ? res.providerHi : res.providerEn;
    final desc = isHindi ? res.descriptionHi : res.descriptionEn;
    final whyMatches = isHindi ? res.whyItMatchesHi : res.whyItMatchesEn;
    final caution = isHindi ? res.missingRequirementsWarningHi : res.missingRequirementsWarningEn;
    final isBookmarked = _bookmarkedIds.contains(res.id);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
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
              const VerifiedBadge(label: 'Verified Statutory', type: BadgeType.verified),
              const Spacer(),
              IconButton(
                icon: Icon(
                  isBookmarked ? Icons.bookmark_added_rounded : Icons.bookmark_border_rounded,
                  size: 20,
                  color: isBookmarked ? AppColors.cobalt : AppColors.slateSubtle,
                ),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
                onPressed: () async {
                  if (isBookmarked) {
                    setState(() => _bookmarkedIds.remove(res.id));
                  } else {
                    final ok = await widget.savedRecordsRepository.saveItem(
                      kind: 'resource',
                      title: title,
                      payload: res.toJson(),
                    );
                    if (ok && mounted) {
                      setState(() => _bookmarkedIds.add(res.id));
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(isHindi ? 'संसाधन सुरक्षित किया गया' : 'Resource saved to My Records'),
                          backgroundColor: AppColors.jade,
                          duration: const Duration(seconds: 1),
                        ),
                      );
                    }
                  }
                },
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            title,
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.navy),
          ),
          const SizedBox(height: 2),
          Text(
            provider,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.cobalt),
          ),
          const SizedBox(height: 6),
          Text(
            desc,
            style: const TextStyle(fontSize: 12.5, height: 1.4, color: AppColors.slateDark),
          ),
          if (whyMatches.isNotEmpty) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.paleMint,
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                '💡 $whyMatches',
                style: const TextStyle(fontSize: 11.5, color: AppColors.jadeDark, height: 1.3),
              ),
            ),
          ],
          if (caution.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(
              '⚠️ $caution',
              style: const TextStyle(fontSize: 11.5, color: AppColors.saffronDark),
            ),
          ],
          const SizedBox(height: 10),
          Row(
            children: [
              Text(
                '📍 ${res.locationCoverage}',
                style: const TextStyle(fontSize: 11, color: AppColors.slateSubtle),
              ),
              const Spacer(),
              OutlinedButton.icon(
                onPressed: () async {
                  final uri = Uri.parse(res.officialLink);
                  if (await canLaunchUrl(uri)) {
                    await launchUrl(uri, mode: LaunchMode.externalApplication);
                  }
                },
                icon: const Icon(Icons.open_in_new_rounded, size: 15),
                label: Text(isHindi ? 'पोर्टल खोलें' : 'Open Portal', style: const TextStyle(fontSize: 12)),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(60, 36),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
