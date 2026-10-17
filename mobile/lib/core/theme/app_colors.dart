import 'package:flutter/material.dart';

/// Setu Permanent Visual Identity Color Palette
/// Aubergine, Persimmon & Porcelain design system.
/// Designed for dignified civic clarity, senior-friendly contrast, and WCAG AA/AAA compliance.
class AppColors {
  // Brand Colors (Aubergine)
  static const Color brandPrimary = Color(0xFF633B72);
  static const Color brandPrimaryHover = Color(0xFF4E2E5B);
  static const Color brandPrimarySoft = Color(0xFFF0E8F3);

  // High-Emphasis Secondary / Action (Persimmon)
  static const Color brandSecondary = Color(0xFFE46D45);
  static const Color brandSecondaryHover = Color(0xFFC95431);
  static const Color brandSecondarySoft = Color(0xFFFBECE5);

  // Warm Brass Highlight
  static const Color highlight = Color(0xFFE5BD55);

  // Neutral Foundation (Porcelain Canvas & Surfaces)
  static const Color canvas = Color(0xFFF7F4F0);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceRaised = Color(0xFFFFFCF8);
  static const Color surfaceMuted = Color(0xFFEEE9E3);

  // Borders & Dividers
  static const Color border = Color(0xFFDDD5CE);
  static const Color borderStrong = Color(0xFFB8ADA3);

  // Typography
  static const Color textPrimary = Color(0xFF29232B);
  static const Color textSecondary = Color(0xFF665D68);
  static const Color textMuted = Color(0xFF776F78);

  // Shadow
  static const Color shadow = Color(0x1429232B);

  // Semantic States
  static const Color success = Color(0xFF216E4E);
  static const Color successSoft = Color(0xFFE7F4EC);
  static const Color warning = Color(0xFF875700);
  static const Color warningSoft = Color(0xFFFFF2D6);
  static const Color error = Color(0xFFB42332);
  static const Color errorSoft = Color(0xFFFCEBED);
  static const Color info = Color(0xFF454B9A);
  static const Color infoSoft = Color(0xFFECEEFC);

  // ---------------------------------------------------------------------------
  // Backward-Compatible Aliases mapped to the permanent Aubergine & Porcelain palette
  // ---------------------------------------------------------------------------
  static const Color cobalt = brandPrimary;
  static const Color cobaltDark = brandPrimaryHover;
  static const Color cobaltLight = brandPrimary;

  static const Color saffron = brandSecondary;
  static const Color saffronLight = highlight;
  static const Color saffronDark = brandSecondaryHover;

  static const Color jade = success;
  static const Color jadeLight = Color(0xFF2E8B63);
  static const Color jadeDark = Color(0xFF18533B);

  static const Color ivory = canvas;
  static const Color ivorySurface = surface;
  static const Color ivoryDark = surfaceMuted;

  static const Color navy = textPrimary;
  static const Color navyDeep = textPrimary;
  static const Color navyMuted = textSecondary;

  static const Color slateSubtle = textSecondary;
  static const Color slateDark = textPrimary;
  static const Color slateLight = textMuted;

  static const Color borderGrey = border;
  static const Color borderSubtle = border;

  static const Color paleBlue = brandPrimarySoft;
  static const Color paleMint = successSoft;
  static const Color paleAmber = warningSoft;
  static const Color paleRed = errorSoft;
  static const Color red = error;
}
