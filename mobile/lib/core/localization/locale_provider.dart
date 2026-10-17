import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../theme/app_theme.dart';
import 'app_translations.dart';

class LocaleProvider extends ChangeNotifier {
  static const String _prefKeyLang = 'setu_pref_language';
  static const String _prefKeyFontSize = 'setu_pref_font_size';

  AppLanguage _language = AppLanguage.en;
  FontSizeOption _fontSize = FontSizeOption.normal;

  AppLanguage get language => _language;
  FontSizeOption get fontSize => _fontSize;

  String tr(String key) => AppTranslations.text(key, _language);

  Future<void> initialize() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final langStr = prefs.getString(_prefKeyLang);
      if (langStr == 'hi') {
        _language = AppLanguage.hi;
      } else {
        _language = AppLanguage.en;
      }

      final fontStr = prefs.getString(_prefKeyFontSize);
      if (fontStr == 'large') {
        _fontSize = FontSizeOption.large;
      } else if (fontStr == 'xlarge') {
        _fontSize = FontSizeOption.xlarge;
      } else {
        _fontSize = FontSizeOption.normal;
      }
      notifyListeners();
    } catch (_) {}
  }

  Future<void> setLanguage(AppLanguage newLang) async {
    if (_language == newLang) return;
    _language = newLang;
    notifyListeners();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_prefKeyLang, newLang == AppLanguage.hi ? 'hi' : 'en');
    } catch (_) {}
  }

  Future<void> toggleLanguage() async {
    await setLanguage(_language == AppLanguage.en ? AppLanguage.hi : AppLanguage.en);
  }

  Future<void> setFontSize(FontSizeOption option) async {
    if (_fontSize == option) return;
    _fontSize = option;
    notifyListeners();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_prefKeyFontSize, option.name);
    } catch (_) {}
  }

  Future<void> cycleFontSize() async {
    switch (_fontSize) {
      case FontSizeOption.normal:
        await setFontSize(FontSizeOption.large);
        break;
      case FontSizeOption.large:
        await setFontSize(FontSizeOption.xlarge);
        break;
      case FontSizeOption.xlarge:
        await setFontSize(FontSizeOption.normal);
        break;
    }
  }
}
