import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:setu/core/localization/app_translations.dart';
import 'package:setu/core/localization/locale_provider.dart';
import 'package:setu/core/services/audio_tts_service.dart';
import 'package:setu/core/theme/app_colors.dart';
import 'package:setu/data/models/understand_model.dart';
import 'package:setu/data/repositories/saved_records_repository.dart';
import 'package:setu/ui/core/widgets/verified_badge.dart';

class CaseFileView extends StatefulWidget {
  final UnderstandResult result;
  final LocaleProvider localeProvider;
  final AudioTtsService ttsService;
  final SavedRecordsRepository savedRecordsRepository;
  final VoidCallback onNewDocument;

  const CaseFileView({
    super.key,
    required this.result,
    required this.localeProvider,
    required this.ttsService,
    required this.savedRecordsRepository,
    required this.onNewDocument,
  });

  @override
  State<CaseFileView> createState() => _CaseFileViewState();
}

class _CaseFileViewState extends State<CaseFileView> {
  final Map<int, bool> _completedSteps = {};
  bool _isSaved = false;
  int? _copiedQuestionIndex;

  @override
  Widget build(BuildContext context) {
    final tr = widget.localeProvider.tr;
    final lang = widget.localeProvider.language;
    final isHindi = lang == AppLanguage.hi;
    final r = widget.result;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header Bar with "New Document" and "Save"
          Row(
            children: [
              OutlinedButton.icon(
                onPressed: widget.onNewDocument,
                icon: const Icon(Icons.arrow_back_rounded, size: 18),
                label: Text(isHindi ? 'नया दस्तावेज़' : 'New Document'),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(60, 40),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                ),
              ),
              const Spacer(),
              ElevatedButton.icon(
                onPressed: _isSaved
                    ? null
                    : () async {
                        final messenger = ScaffoldMessenger.of(context);
                        final title = r.summary.length > 50
                            ? '${r.summary.substring(0, 50)}...'
                            : r.summary;
                        final ok = await widget.savedRecordsRepository.saveItem(
                          kind: 'understand',
                          title: title,
                          payload: r.toJson(),
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
                icon: Icon(_isSaved ? Icons.bookmark_added_rounded : Icons.bookmark_add_outlined, size: 18),
                label: Text(_isSaved ? tr('savedSuccess') : tr('saveCaseFile')),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _isSaved ? AppColors.jade : AppColors.cobalt,
                  minimumSize: const Size(80, 40),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Dossier Title & Audio Read Aloud
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.ivorySurface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.cobalt, width: 1.5),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x0F0C4A60),
                  blurRadius: 10,
                  offset: Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.paleBlue,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.article_rounded, color: AppColors.cobalt, size: 24),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            isHindi ? 'सेतु दस्तावेज़ कार्य योजना (केस फाइल)' : 'Setu 5-Stage Document Action Dossier',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: AppColors.navy,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            r.aiEngineUsed != null
                                ? 'Verified Analysis • ${r.aiEngineUsed}'
                                : 'Verified Analysis • Google Gemini 2.5 Flash',
                            style: const TextStyle(fontSize: 11, color: AppColors.slateSubtle),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                // Audio Read Aloud Button
                ListenableBuilder(
                  listenable: widget.ttsService,
                  builder: (context, _) {
                    final isPlaying = widget.ttsService.isPlaying;
                    return InkWell(
                      onTap: () {
                        if (isPlaying) {
                          widget.ttsService.stop();
                        } else {
                          final speakText = '${r.summary}. ${r.disclaimerText ?? ''}';
                          widget.ttsService.speak(speakText, lang);
                        }
                      },
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: isPlaying ? AppColors.paleAmber : AppColors.paleBlue,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: isPlaying ? AppColors.saffron : AppColors.cobalt,
                            width: 1.2,
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              isPlaying ? Icons.volume_off_rounded : Icons.volume_up_rounded,
                              size: 18,
                              color: isPlaying ? AppColors.saffronDark : AppColors.cobalt,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              isPlaying ? tr('stopListening') : tr('listenAloud'),
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: isPlaying ? AppColors.saffronDark : AppColors.cobalt,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // -------------------------------------------------------------
          // STAGE 1: PLAIN-LANGUAGE SUMMARY & STATUTORY ADVISORY
          // -------------------------------------------------------------
          _buildStageCard(
            stageNumber: 1,
            title: tr('stage1Title'),
            color: AppColors.cobalt,
            icon: Icons.lightbulb_outline_rounded,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  r.summary,
                  style: const TextStyle(
                    fontSize: 15.5,
                    height: 1.55,
                    color: AppColors.navy,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                if (r.disclaimerText != null && r.disclaimerText!.isNotEmpty) ...[
                  const SizedBox(height: 14),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.paleAmber,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.saffron, width: 1.2),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.shield_outlined, color: AppColors.saffronDark, size: 20),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                tr('statutoryAdvisory'),
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.saffronDark,
                                ),
                              ),
                              const SizedBox(height: 3),
                              Text(
                                r.disclaimerText!,
                                style: const TextStyle(
                                  fontSize: 12.5,
                                  height: 1.4,
                                  color: AppColors.saffronDark,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 16),

          // -------------------------------------------------------------
          // STAGE 2: GROUNDED VERBATIM EVIDENCE & DEFINED TERMS
          // -------------------------------------------------------------
          _buildStageCard(
            stageNumber: 2,
            title: tr('stage2Title'),
            color: AppColors.jade,
            icon: Icons.format_quote_rounded,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Verbatim Evidence Quotes
                if (r.supportingEvidence.isNotEmpty) ...[
                  Text(
                    tr('supportingQuotes'),
                    style: const TextStyle(
                      fontSize: 13.5,
                      fontWeight: FontWeight.bold,
                      color: AppColors.navy,
                    ),
                  ),
                  const SizedBox(height: 8),
                  ...r.supportingEvidence.map((ev) => Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.paleMint,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.jade, width: 1.0),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('“', style: TextStyle(fontSize: 22, color: AppColors.jadeDark, height: 0.8)),
                                const SizedBox(width: 4),
                                Expanded(
                                  child: Text(
                                    ev.quote,
                                    style: const TextStyle(
                                      fontSize: 13.5,
                                      fontStyle: FontStyle.italic,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.jadeDark,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            if (ev.context != null && ev.context!.isNotEmpty) ...[
                              const SizedBox(height: 4),
                              Text(
                                '${isHindi ? 'संदर्भ: ' : 'Context: '}${ev.context!}',
                                style: const TextStyle(fontSize: 12, color: AppColors.slateSubtle),
                              ),
                            ],
                          ],
                        ),
                      )),
                  const SizedBox(height: 12),
                ],

                // Defined Terminology
                if (r.termsExplained.isNotEmpty) ...[
                  Text(
                    tr('definedTerms'),
                    style: const TextStyle(
                      fontSize: 13.5,
                      fontWeight: FontWeight.bold,
                      color: AppColors.navy,
                    ),
                  ),
                  const SizedBox(height: 8),
                  ...r.termsExplained.map((term) => Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.ivory,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.borderGrey, width: 1.2),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    term.term,
                                    style: const TextStyle(
                                      fontSize: 14.5,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.cobalt,
                                    ),
                                  ),
                                ),
                                if (term.phonetic.isNotEmpty)
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: AppColors.paleBlue,
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(
                                      term.phonetic,
                                      style: const TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.cobalt,
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              term.simpleMeaning,
                              style: const TextStyle(fontSize: 13, color: AppColors.navy, height: 1.4),
                            ),
                            const SizedBox(height: 4),
                            RichText(
                              text: TextSpan(
                                children: [
                                  TextSpan(
                                    text: '${tr('whyItMatters')} ',
                                    style: const TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.slateDark,
                                    ),
                                  ),
                                  TextSpan(
                                    text: term.whyItMatters,
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: AppColors.slateSubtle,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      )),
                ],
              ],
            ),
          ),
          const SizedBox(height: 16),

          // -------------------------------------------------------------
          // STAGE 3: UNCERTAINTIES & MISSING FACTS
          // -------------------------------------------------------------
          if (r.uncertainties.isNotEmpty) ...[
            _buildStageCard(
              stageNumber: 3,
              title: tr('stage3Title'),
              color: AppColors.saffron,
              icon: Icons.help_outline_rounded,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    isHindi
                        ? 'यह दस्तावेज़ क्या स्पष्ट नहीं करता (गलतफहमी से बचने के लिए इन तथ्यों की जांच करें):'
                        : 'Critical gaps omitted by this notice (facts to confirm before making decisions):',
                    style: const TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w600,
                      color: AppColors.slateSubtle,
                    ),
                  ),
                  const SizedBox(height: 10),
                  ...r.uncertainties.map((unc) => Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(Icons.info_outline_rounded, size: 16, color: AppColors.saffron),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                unc,
                                style: const TextStyle(fontSize: 13, height: 1.4, color: AppColors.navy),
                              ),
                            ),
                          ],
                        ),
                      )),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],

          // -------------------------------------------------------------
          // STAGE 4: ACTION CHECKLIST & OFFICIAL QUESTIONS
          // -------------------------------------------------------------
          _buildStageCard(
            stageNumber: 4,
            title: tr('stage4Title'),
            color: AppColors.cobaltDark,
            icon: Icons.checklist_rounded,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Prioritized Action Steps
                if (r.actionSteps.isNotEmpty) ...[
                  ...r.actionSteps.map((step) {
                    final isDone = _completedSteps[step.stepNumber] ?? false;
                    return Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isDone ? AppColors.paleMint : AppColors.ivory,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: isDone ? AppColors.jade : AppColors.borderGrey,
                          width: 1.2,
                        ),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Checkbox(
                            value: isDone,
                            onChanged: (val) {
                              setState(() {
                                _completedSteps[step.stepNumber] = val ?? false;
                              });
                            },
                            activeColor: AppColors.jade,
                          ),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '${isHindi ? 'कदम' : 'Step'} ${step.stepNumber}: ${step.action}',
                                  style: TextStyle(
                                    fontSize: 13.5,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.navy,
                                    decoration: isDone ? TextDecoration.lineThrough : null,
                                  ),
                                ),
                                if (step.deadlineOrUrgency.isNotEmpty) ...[
                                  const SizedBox(height: 4),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: AppColors.paleAmber,
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      '${tr('checklistUrgency')} ${step.deadlineOrUrgency}',
                                      style: const TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                        color: AppColors.saffronDark,
                                      ),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                  const SizedBox(height: 12),
                ],

                // Pre-formulated Questions for Officials
                if (r.questionsToAsk.isNotEmpty) ...[
                  Text(
                    tr('questionsForOfficials'),
                    style: const TextStyle(
                      fontSize: 13.5,
                      fontWeight: FontWeight.bold,
                      color: AppColors.navy,
                    ),
                  ),
                  const SizedBox(height: 8),
                  ...r.questionsToAsk.asMap().entries.map((entry) {
                    final idx = entry.key;
                    final q = entry.value;
                    final isCopied = _copiedQuestionIndex == idx;

                    return Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.ivorySurface,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.borderSubtle, width: 1.2),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Q${idx + 1}.',
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: AppColors.cobalt,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              q,
                              style: const TextStyle(fontSize: 13, height: 1.4, color: AppColors.navy),
                            ),
                          ),
                          IconButton(
                            icon: Icon(
                              isCopied ? Icons.check_rounded : Icons.copy_rounded,
                              size: 18,
                              color: isCopied ? AppColors.jade : AppColors.slateSubtle,
                            ),
                            tooltip: tr('copyQuestion'),
                            onPressed: () {
                              Clipboard.setData(ClipboardData(text: q));
                              setState(() => _copiedQuestionIndex = idx);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(tr('copied')),
                                  duration: const Duration(seconds: 1),
                                ),
                              );
                              Future.delayed(const Duration(seconds: 2), () {
                                if (mounted) setState(() => _copiedQuestionIndex = null);
                              });
                            },
                          ),
                        ],
                      ),
                    );
                  }),
                ],
              ],
            ),
          ),
          const SizedBox(height: 16),

          // -------------------------------------------------------------
          // STAGE 5: CONNECTED OFFICIAL CIVIC RESOURCES (THE BRIDGE)
          // -------------------------------------------------------------
          if (r.matchedResources.isNotEmpty) ...[
            _buildStageCard(
              stageNumber: 5,
              title: tr('stage5Title'),
              color: AppColors.jadeDark,
              icon: Icons.account_balance_rounded,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    isHindi
                        ? 'इस दस्तावेज़ के आधार पर जुड़े हुए आधिकारिक सरकारी पोर्टल व हेल्पलाइन:'
                        : 'Official statutory bodies & helplines matched to these specific notice clauses:',
                    style: const TextStyle(fontSize: 12.5, color: AppColors.slateSubtle),
                  ),
                  const SizedBox(height: 12),
                  ...r.matchedResources.map((res) {
                    final title = isHindi ? res.titleHi : res.titleEn;
                    final provider = isHindi ? res.providerHi : res.providerEn;
                    final desc = isHindi ? res.descriptionHi : res.descriptionEn;
                    final whyMatched = isHindi
                        ? (res.relevanceReasonHi ?? res.whyItMatchesHi)
                        : (res.relevanceReasonEn ?? res.whyItMatchesEn);
                    final howAssists = isHindi ? res.actionConnectionHi : res.actionConnectionEn;
                    final caution = isHindi
                        ? (res.eligibilityCautionHi ?? res.missingRequirementsWarningHi)
                        : (res.eligibilityCautionEn ?? res.missingRequirementsWarningEn);

                    return Container(
                      margin: const EdgeInsets.only(bottom: 14),
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppColors.ivorySurface,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.jade, width: 1.5),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x0A059669),
                            blurRadius: 6,
                            offset: Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const VerifiedBadge(label: 'Official Verified', type: BadgeType.verified),
                              const Spacer(),
                              Text(
                                res.locationCoverage,
                                style: const TextStyle(fontSize: 11, color: AppColors.slateSubtle),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            title,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: AppColors.navy,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            provider,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: AppColors.cobalt,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            desc,
                            style: const TextStyle(fontSize: 12.5, height: 1.4, color: AppColors.slateDark),
                          ),
                          if (whyMatched.isNotEmpty) ...[
                            const SizedBox(height: 8),
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: AppColors.paleMint,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    tr('whyMatched'),
                                    style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.jadeDark,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    whyMatched,
                                    style: const TextStyle(fontSize: 12, color: AppColors.jadeDark),
                                  ),
                                ],
                              ),
                            ),
                          ],
                          if (howAssists != null && howAssists.isNotEmpty) ...[
                            const SizedBox(height: 6),
                            Text(
                              '${tr('howItAssists')} $howAssists',
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: AppColors.navy,
                              ),
                            ),
                          ],
                          if (caution.isNotEmpty) ...[
                            const SizedBox(height: 6),
                            Text(
                              '⚠️ $caution',
                              style: const TextStyle(
                                fontSize: 11.5,
                                color: AppColors.saffronDark,
                              ),
                            ),
                          ],
                          const SizedBox(height: 10),
                          Align(
                            alignment: Alignment.centerRight,
                            child: OutlinedButton.icon(
                              onPressed: () async {
                                final uri = Uri.parse(res.officialLink);
                                if (await canLaunchUrl(uri)) {
                                  await launchUrl(uri, mode: LaunchMode.externalApplication);
                                }
                              },
                              icon: const Icon(Icons.open_in_new_rounded, size: 16),
                              label: Text(tr('openPortal'), style: const TextStyle(fontSize: 12)),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: AppColors.jadeDark,
                                side: const BorderSide(color: AppColors.jade, width: 1.2),
                                minimumSize: const Size(60, 36),
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                ],
              ),
            ),
          ],
          const SizedBox(height: 30),
        ],
      ),
    );
  }

  Widget _buildStageCard({
    required int stageNumber,
    required String title,
    required Color color,
    required IconData icon,
    required Widget child,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.ivorySurface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.borderGrey, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: AppColors.ivoryDark,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(11)),
              border: const Border(bottom: BorderSide(color: AppColors.borderGrey, width: 1.0)),
            ),
            child: Row(
              children: [
                Icon(icon, size: 18, color: color),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    title,
                    style: TextStyle(
                      fontSize: 13.5,
                      fontWeight: FontWeight.bold,
                      color: color,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(14),
            child: child,
          ),
        ],
      ),
    );
  }
}
