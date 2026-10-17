import 'package:flutter/material.dart';
import 'package:setu/core/localization/app_translations.dart';
import 'package:setu/core/localization/locale_provider.dart';
import 'package:setu/core/services/voice_input_service.dart';
import 'package:setu/core/theme/app_colors.dart';

class VoiceControlSheet extends StatefulWidget {
  final VoiceInputService voiceService;
  final LocaleProvider localeProvider;
  final Function(String finalTranscript) onAnalyse;

  const VoiceControlSheet({
    super.key,
    required this.voiceService,
    required this.localeProvider,
    required this.onAnalyse,
  });

  @override
  State<VoiceControlSheet> createState() => _VoiceControlSheetState();
}

class _VoiceControlSheetState extends State<VoiceControlSheet> {
  late TextEditingController _textController;

  @override
  void initState() {
    super.initState();
    _textController = TextEditingController(text: widget.voiceService.transcript);
    widget.voiceService.addListener(_onVoiceUpdate);
    widget.voiceService.startListening(widget.localeProvider.language);
  }

  void _onVoiceUpdate() {
    if (mounted) {
      final current = widget.voiceService.transcript;
      if (current.isNotEmpty) {
        _textController.text = current;
      }
      setState(() {});
    }
  }

  @override
  void dispose() {
    widget.voiceService.removeListener(_onVoiceUpdate);
    _textController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final tr = widget.localeProvider.tr;
    final isListening = widget.voiceService.isListening;
    final isPaused = widget.voiceService.isPaused;

    return Container(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      decoration: const BoxDecoration(
        color: AppColors.ivorySurface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 44,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.borderGrey,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Header
          Row(
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: isListening ? AppColors.paleRed : AppColors.paleBlue,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  isListening ? Icons.mic_rounded : Icons.pause_rounded,
                  color: isListening ? AppColors.red : AppColors.cobalt,
                  size: 26,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isListening
                          ? tr('voiceListening')
                          : isPaused
                              ? tr('voicePaused')
                              : tr('voiceInput'),
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: AppColors.navy,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      widget.localeProvider.language == AppLanguage.hi
                          ? 'बोलना समाप्त करने पर "रोकें" या "दस्तावेज़ समझें" दबाएं'
                          : 'Review text below before explicitly analysing',
                      style: const TextStyle(fontSize: 12, color: AppColors.slateSubtle),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),

          // Live Transcript Preview Box
          Container(
            height: 130,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.ivory,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isListening ? AppColors.cobalt : AppColors.borderGrey,
                width: 1.5,
              ),
            ),
            child: TextField(
              controller: _textController,
              maxLines: null,
              expands: true,
              style: const TextStyle(fontSize: 15, height: 1.4, color: AppColors.navy),
              decoration: InputDecoration(
                border: InputBorder.none,
                hintText: widget.localeProvider.language == AppLanguage.hi
                    ? 'आपकी आवाज यहां लिखी जाएगी...'
                    : 'Your speech will appear here...',
                hintStyle: const TextStyle(color: AppColors.slateLight),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Action Controls: Pause / Resume, Cancel, Explicit Analyse
          Row(
            children: [
              // Pause / Resume Button
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: isListening
                      ? () => widget.voiceService.pauseListening()
                      : () => widget.voiceService.resumeListening(widget.localeProvider.language),
                  icon: Icon(isListening ? Icons.pause_rounded : Icons.play_arrow_rounded, size: 20),
                  label: Text(
                    isListening ? tr('voicePause') : tr('voiceResume'),
                    style: const TextStyle(fontSize: 14),
                  ),
                ),
              ),
              const SizedBox(width: 10),

              // Cancel Button
              Expanded(
                child: TextButton.icon(
                  onPressed: () async {
                    await widget.voiceService.cancel();
                    if (context.mounted) Navigator.pop(context);
                  },
                  icon: const Icon(Icons.close_rounded, size: 20, color: AppColors.slateDark),
                  label: Text(
                    tr('voiceCancel'),
                    style: const TextStyle(fontSize: 14, color: AppColors.slateDark),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Explicit Analyse Button
          ElevatedButton.icon(
            onPressed: _textController.text.trim().isEmpty
                ? null
                : () async {
                    final text = _textController.text.trim();
                    await widget.voiceService.finalize();
                    if (context.mounted) {
                      Navigator.pop(context);
                      widget.onAnalyse(text);
                    }
                  },
            icon: const Icon(Icons.auto_awesome_rounded, size: 20),
            label: Text(
              tr('voiceAnalyse'),
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.cobalt,
              minimumSize: const Size(double.infinity, 50),
            ),
          ),
        ],
      ),
    );
  }
}
