import 'package:flutter/foundation.dart';
import 'package:flutter_tts/flutter_tts.dart';
import '../localization/app_translations.dart';

class AudioTtsService extends ChangeNotifier {
  final FlutterTts _flutterTts = FlutterTts();
  bool _isPlaying = false;
  String? _currentlySpeakingText;

  bool get isPlaying => _isPlaying;
  String? get currentlySpeakingText => _currentlySpeakingText;

  AudioTtsService() {
    _initTts();
  }

  void _initTts() {
    try {
      _flutterTts.setStartHandler(() {
        _isPlaying = true;
        notifyListeners();
      });

      _flutterTts.setCompletionHandler(() {
        _isPlaying = false;
        _currentlySpeakingText = null;
        notifyListeners();
      });

      _flutterTts.setCancelHandler(() {
        _isPlaying = false;
        _currentlySpeakingText = null;
        notifyListeners();
      });

      _flutterTts.setErrorHandler((msg) {
        _isPlaying = false;
        _currentlySpeakingText = null;
        notifyListeners();
      });
    } catch (_) {}
  }

  Future<void> speak(String text, AppLanguage lang) async {
    if (text.trim().isEmpty) return;

    // If already speaking the same text, stop it
    if (_isPlaying && _currentlySpeakingText == text) {
      await stop();
      return;
    }

    try {
      await _flutterTts.stop();

      // Senior-friendly pacing: slower, crisp pronunciation
      await _flutterTts.setSpeechRate(0.45);
      await _flutterTts.setVolume(1.0);
      await _flutterTts.setPitch(1.0);

      if (lang == AppLanguage.hi) {
        await _flutterTts.setLanguage('hi-IN');
      } else {
        await _flutterTts.setLanguage('en-IN');
      }

      _currentlySpeakingText = text;
      _isPlaying = true;
      notifyListeners();

      await _flutterTts.speak(text);
    } catch (e) {
      _isPlaying = false;
      _currentlySpeakingText = null;
      notifyListeners();
    }
  }

  Future<void> stop() async {
    try {
      await _flutterTts.stop();
    } catch (_) {}
    _isPlaying = false;
    _currentlySpeakingText = null;
    notifyListeners();
  }

  @override
  void dispose() {
    try {
      _flutterTts.stop();
    } catch (_) {}
    super.dispose();
  }
}
