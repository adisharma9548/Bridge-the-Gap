import 'package:flutter/foundation.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import '../localization/app_translations.dart';

enum VoiceInputState {
  idle,
  listening,
  paused,
  unavailable,
}

/// Controlled Voice Input State Machine.
/// Guarantees:
/// 1. Pausing does NOT auto-submit or discard text.
/// 2. User must explicitly confirm "Analyse" or "Cancel".
/// 3. Cancellation cleans up without side-effects or network calls.
class VoiceInputService extends ChangeNotifier {
  final stt.SpeechToText _speech = stt.SpeechToText();

  VoiceInputState _state = VoiceInputState.idle;
  String _finalTranscript = '';
  String _interimTranscript = '';
  String? _errorMessage;
  bool _isInitialized = false;

  VoiceInputState get state => _state;
  bool get isListening => _state == VoiceInputState.listening;
  bool get isPaused => _state == VoiceInputState.paused;
  String get transcript => '$_finalTranscript $_interimTranscript'.trim();
  String get finalTranscript => _finalTranscript;
  String? get errorMessage => _errorMessage;

  Future<bool> initialize() async {
    if (_isInitialized) return true;
    try {
      final available = await _speech.initialize(
        onError: (val) {
          if (_state == VoiceInputState.listening) {
            // Do not discard on silence error, pause and keep transcript
            _state = VoiceInputState.paused;
            notifyListeners();
          }
        },
        onStatus: (val) {
          if (val == 'done' && _state == VoiceInputState.listening) {
            // Pause instead of stopping/discarding
            _state = VoiceInputState.paused;
            notifyListeners();
          }
        },
      );
      _isInitialized = available;
      if (!available) {
        _state = VoiceInputState.unavailable;
        _errorMessage = 'Speech recognition is not supported on this device.';
      }
      notifyListeners();
      return available;
    } catch (e) {
      _state = VoiceInputState.unavailable;
      _errorMessage = 'Failed to initialize voice recognition.';
      notifyListeners();
      return false;
    }
  }

  Future<void> startListening(AppLanguage lang) async {
    final ready = await initialize();
    if (!ready) return;

    _finalTranscript = '';
    _interimTranscript = '';
    _errorMessage = null;
    _state = VoiceInputState.listening;
    notifyListeners();

    final localeId = lang == AppLanguage.hi ? 'hi_IN' : 'en_IN';

    try {
      await _speech.listen(
        onResult: (result) {
          if (result.finalResult) {
            _finalTranscript = '$_finalTranscript ${result.recognizedWords}'.trim();
            _interimTranscript = '';
          } else {
            _interimTranscript = result.recognizedWords;
          }
          notifyListeners();
        },
        listenOptions: stt.SpeechListenOptions(
          localeId: localeId,
          listenMode: stt.ListenMode.dictation,
          pauseFor: const Duration(seconds: 4),
          cancelOnError: false,
          partialResults: true,
        ),
      );
    } catch (e) {
      _state = VoiceInputState.paused;
      notifyListeners();
    }
  }

  Future<void> pauseListening() async {
    if (_state != VoiceInputState.listening) return;
    try {
      await _speech.stop();
    } catch (_) {}
    // Commit any interim text to final
    if (_interimTranscript.isNotEmpty) {
      _finalTranscript = '$_finalTranscript $_interimTranscript'.trim();
      _interimTranscript = '';
    }
    _state = VoiceInputState.paused;
    notifyListeners();
  }

  Future<void> resumeListening(AppLanguage lang) async {
    final ready = await initialize();
    if (!ready) return;

    _state = VoiceInputState.listening;
    notifyListeners();

    final localeId = lang == AppLanguage.hi ? 'hi_IN' : 'en_IN';

    try {
      await _speech.listen(
        onResult: (result) {
          if (result.finalResult) {
            _finalTranscript = '$_finalTranscript ${result.recognizedWords}'.trim();
            _interimTranscript = '';
          } else {
            _interimTranscript = result.recognizedWords;
          }
          notifyListeners();
        },
        listenOptions: stt.SpeechListenOptions(
          localeId: localeId,
          listenMode: stt.ListenMode.dictation,
          pauseFor: const Duration(seconds: 4),
          cancelOnError: false,
          partialResults: true,
        ),
      );
    } catch (e) {
      _state = VoiceInputState.paused;
      notifyListeners();
    }
  }

  /// Cancels listening and cleanly discards session without side-effects
  Future<void> cancel() async {
    try {
      await _speech.cancel();
    } catch (_) {}
    _finalTranscript = '';
    _interimTranscript = '';
    _state = VoiceInputState.idle;
    _errorMessage = null;
    notifyListeners();
  }

  /// Finalizes and returns the transcript for manual submission
  Future<String> finalize() async {
    try {
      await _speech.stop();
    } catch (_) {}
    final result = transcript;
    _finalTranscript = '';
    _interimTranscript = '';
    _state = VoiceInputState.idle;
    notifyListeners();
    return result;
  }
}
