import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

enum BadgeType {
  verified,
  advisory,
  statutoryCaution,
  uncertainty,
}

class VerifiedBadge extends StatelessWidget {
  final String label;
  final BadgeType type;

  const VerifiedBadge({
    super.key,
    required this.label,
    this.type = BadgeType.verified,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color border;
    Color text;
    IconData icon;

    switch (type) {
      case BadgeType.verified:
        bg = AppColors.paleMint;
        border = AppColors.jade;
        text = AppColors.jadeDark;
        icon = Icons.verified_rounded;
        break;
      case BadgeType.advisory:
        bg = AppColors.paleBlue;
        border = AppColors.cobalt;
        text = AppColors.cobaltDark;
        icon = Icons.shield_rounded;
        break;
      case BadgeType.statutoryCaution:
        bg = AppColors.paleAmber;
        border = AppColors.saffron;
        text = AppColors.saffronDark;
        icon = Icons.warning_amber_rounded;
        break;
      case BadgeType.uncertainty:
        bg = AppColors.ivoryDark;
        border = AppColors.slateSubtle;
        text = AppColors.slateDark;
        icon = Icons.help_outline_rounded;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: border, width: 1.2),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: text),
          const SizedBox(width: 5),
          Flexible(
            child: Text(
              label,
              style: TextStyle(
                fontSize: 11.5,
                fontWeight: FontWeight.w700,
                color: text,
                letterSpacing: 0.1,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}
