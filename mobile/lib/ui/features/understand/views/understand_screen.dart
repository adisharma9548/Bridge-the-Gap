import 'dart:convert';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:setu/core/localization/app_translations.dart';
import 'package:setu/core/localization/locale_provider.dart';
import 'package:setu/core/services/audio_tts_service.dart';
import 'package:setu/core/services/voice_input_service.dart';
import 'package:setu/core/theme/app_colors.dart';
import 'package:setu/data/repositories/saved_records_repository.dart';
import 'package:setu/data/repositories/understand_repository.dart';
import 'package:setu/ui/core/widgets/status_banner.dart';
import 'package:setu/ui/core/widgets/voice_control_sheet.dart';
import 'package:setu/ui/features/understand/views/case_file_view.dart';

class UnderstandScreen extends StatefulWidget {
  final UnderstandRepository understandRepository;
  final SavedRecordsRepository savedRecordsRepository;
  final LocaleProvider localeProvider;
  final AudioTtsService ttsService;
  final VoiceInputService voiceService;

  const UnderstandScreen({
    super.key,
    required this.understandRepository,
    required this.savedRecordsRepository,
    required this.localeProvider,
    required this.ttsService,
    required this.voiceService,
  });

  @override
  State<UnderstandScreen> createState() => _UnderstandScreenState();
}

class _UnderstandScreenState extends State<UnderstandScreen> {
  final TextEditingController _textController = TextEditingController();
  Map<String, dynamic>? _attachedFile;
  String? _attachedFileName;
  int? _attachedFileSize;
  String? _statusMessage;
  BannerType _statusType = BannerType.info;

  // Real-world sample notice texts matching Setu backend
  static const String _bankNoticeText =
      'Notice under Section 13(2) of the SARFAESI Act: Your account is classified as a Non-Performing Asset (NPA) and a lien of Rs. 45,000 has been marked on your Fixed Deposit.';

  static const String _medicalReportText =
      'HbA1c is 7.9% (Elevated). Fasting Lipid Profile shows LDL Cholesterol at 168 mg/dL. Advised strict glycemic control and daily statin therapy.';

  static const String _insuranceNoticeText =
      'Claim repudiated under Pre-Existing Disease (PED) exclusion clause 4.1 with a mandatory waiting period of 36 months and 20% mandatory co-payment.';

  @override
  void dispose() {
    _textController.dispose();
    super.dispose();
  }

  Future<void> _handlePickFile() async {
    try {
      final result = await FilePicker.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'txt'],
      );

      if (result.isNotEmpty) {
        final file = result.first;
        final sizeBytes = file.lengthSync() ?? (await file.length()) ?? 0;

        if (sizeBytes > 20 * 1024 * 1024) {
          setState(() {
            _statusMessage = 'File size exceeds 20MB limit. Please choose a smaller file.';
            _statusType = BannerType.warning;
          });
          return;
        }

        final bytes = await file.readAsBytes();
        final base64Data = 'data:${_getMimeType(file.extension)};base64,${base64Encode(bytes)}';

        setState(() {
          _attachedFileName = file.name;
          _attachedFileSize = sizeBytes;
          _attachedFile = {
            'name': file.name,
            'type': _getMimeType(file.extension),
            'base64': base64Data,
          };
          _statusMessage = null;
        });
      }
    } catch (e) {
      setState(() {
        _statusMessage = 'Failed to attach file: $e';
        _statusType = BannerType.error;
      });
    }
  }

  String _getMimeType(String? extension) {
    switch (extension?.toLowerCase()) {
      case 'pdf':
        return 'application/pdf';
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'webp':
        return 'image/webp';
      case 'txt':
        return 'text/plain';
      default:
        return 'application/octet-stream';
    }
  }

  void _removeFile() {
    setState(() {
      _attachedFile = null;
      _attachedFileName = null;
      _attachedFileSize = null;
    });
  }

  Future<void> _triggerAnalysis([String? customText]) async {
    final text = (customText ?? _textController.text).trim();
    if (text.isEmpty && _attachedFile == null) {
      setState(() {
        _statusMessage = widget.localeProvider.language == AppLanguage.hi
            ? 'कृपया दस्तावेज़ का पाठ दर्ज करें या फाइल जोड़ें।'
            : 'Please enter notice text or attach a document file.';
        _statusType = BannerType.warning;
      });
      return;
    }

    setState(() => _statusMessage = null);

    try {
      await widget.understandRepository.explainDocument(
        text: text,
        lang: widget.localeProvider.language,
        file: _attachedFile,
      );
    } catch (e) {
      setState(() {
        _statusMessage = 'Analysis failed: $e';
        _statusType = BannerType.error;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final tr = widget.localeProvider.tr;
    final currentResult = widget.understandRepository.lastResult;
    final isLoading = widget.understandRepository.isLoading;

    // If an analysis result exists, display CaseFileView
    if (currentResult != null) {
      return CaseFileView(
        result: currentResult,
        localeProvider: widget.localeProvider,
        ttsService: widget.ttsService,
        savedRecordsRepository: widget.savedRecordsRepository,
        onNewDocument: () {
          widget.understandRepository.clearResult();
          _textController.clear();
          _removeFile();
        },
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Screen Title & Subtitle
          Text(
            tr('understandHeading'),
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: AppColors.navy,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            tr('understandSubtitle'),
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.slateSubtle,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 14),

          // Real-World Sample Notices
          Text(
            tr('sampleNoticesLabel'),
            style: const TextStyle(
              fontSize: 12.5,
              fontWeight: FontWeight.bold,
              color: AppColors.navy,
            ),
          ),
          const SizedBox(height: 8),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildDemoNoticeChip(
                  icon: Icons.account_balance_rounded,
                  title: tr('demoBankTitle'),
                  subtitle: tr('demoBankDesc'),
                  color: AppColors.cobalt,
                  onTap: () {
                    _textController.text = _bankNoticeText;
                    _removeFile();
                    _triggerAnalysis(_bankNoticeText);
                  },
                ),
                const SizedBox(width: 8),
                _buildDemoNoticeChip(
                  icon: Icons.medical_services_rounded,
                  title: tr('demoMedicalTitle'),
                  subtitle: tr('demoMedicalDesc'),
                  color: AppColors.jade,
                  onTap: () {
                    _textController.text = _medicalReportText;
                    _removeFile();
                    _triggerAnalysis(_medicalReportText);
                  },
                ),
                const SizedBox(width: 8),
                _buildDemoNoticeChip(
                  icon: Icons.shield_rounded,
                  title: tr('demoInsuranceTitle'),
                  subtitle: tr('demoInsuranceDesc'),
                  color: AppColors.saffron,
                  onTap: () {
                    _textController.text = _insuranceNoticeText;
                    _removeFile();
                    _triggerAnalysis(_insuranceNoticeText);
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          if (_statusMessage != null)
            StatusBanner(
              message: _statusMessage!,
              type: _statusType,
              onDismiss: () => setState(() => _statusMessage = null),
            ),

          // Document Text Input
          Container(
            decoration: BoxDecoration(
              color: AppColors.ivorySurface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.borderGrey, width: 1.4),
            ),
            child: Column(
              children: [
                TextField(
                  controller: _textController,
                  maxLines: 7,
                  minLines: 4,
                  style: const TextStyle(fontSize: 15, height: 1.45, color: AppColors.navy),
                  decoration: InputDecoration(
                    hintText: tr('inputPlaceholder'),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.all(14),
                  ),
                ),
                const Divider(height: 1),

                // Attached File Pill (if present)
                if (_attachedFileName != null)
                  Container(
                    margin: const EdgeInsets.all(8),
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.paleBlue,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.cobalt, width: 1.0),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.attachment_rounded, size: 18, color: AppColors.cobalt),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            '$_attachedFileName (${(_attachedFileSize! / 1024).toStringAsFixed(1)} KB)',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: AppColors.cobaltDark,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close_rounded, size: 16, color: AppColors.cobalt),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                          onPressed: _removeFile,
                        ),
                      ],
                    ),
                  ),

                // Intake Actions Bar: Attach File, Voice, Clear
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  child: Row(
                    children: [
                      // File Picker
                      TextButton.icon(
                        onPressed: _handlePickFile,
                        icon: const Icon(Icons.upload_file_rounded, size: 18),
                        label: Text(tr('attachFile'), style: const TextStyle(fontSize: 12.5)),
                      ),
                      const SizedBox(width: 4),

                      // Voice Input
                      TextButton.icon(
                        onPressed: () {
                          showModalBottomSheet(
                            context: context,
                            isScrollControlled: true,
                            backgroundColor: Colors.transparent,
                            builder: (ctx) => VoiceControlSheet(
                              voiceService: widget.voiceService,
                              localeProvider: widget.localeProvider,
                              onAnalyse: (spokenText) {
                                _textController.text = spokenText;
                                _triggerAnalysis(spokenText);
                              },
                            ),
                          );
                        },
                        icon: const Icon(Icons.mic_rounded, size: 18, color: AppColors.saffronDark),
                        label: Text(
                          tr('voiceInput'),
                          style: const TextStyle(fontSize: 12.5, color: AppColors.saffronDark),
                        ),
                      ),
                      const Spacer(),

                      // Clear Text
                      if (_textController.text.isNotEmpty || _attachedFile != null)
                        IconButton(
                          icon: const Icon(Icons.delete_outline_rounded, size: 20, color: AppColors.slateSubtle),
                          tooltip: tr('clear'),
                          onPressed: () {
                            setState(() {
                              _textController.clear();
                              _removeFile();
                              _statusMessage = null;
                            });
                          },
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            tr('supportedFileTypes'),
            style: const TextStyle(fontSize: 11, color: AppColors.slateLight),
          ),
          const SizedBox(height: 18),

          // Primary Action: Analyse Document
          ElevatedButton(
            onPressed: isLoading ? null : () => _triggerAnalysis(),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.brandSecondary,
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 52),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              elevation: 1,
            ),
            child: isLoading
                ? Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2.2, color: Colors.white),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        tr('analysing'),
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                      ),
                    ],
                  )
                : Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.auto_awesome_rounded, size: 20),
                      const SizedBox(width: 8),
                      Text(
                        tr('analyseDocument'),
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildDemoNoticeChip({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        width: 190,
        padding: const EdgeInsets.all(10),
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
                Icon(icon, size: 16, color: color),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    title,
                    style: TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.bold,
                      color: color,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 3),
            Text(
              subtitle,
              style: const TextStyle(fontSize: 11, color: AppColors.slateSubtle),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
