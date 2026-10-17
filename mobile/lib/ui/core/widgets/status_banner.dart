import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

enum BannerType { info, warning, error, success }

class StatusBanner extends StatelessWidget {
  final String message;
  final BannerType type;
  final VoidCallback? onDismiss;

  const StatusBanner({
    super.key,
    required this.message,
    this.type = BannerType.info,
    this.onDismiss,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color border;
    Color textColor;
    IconData icon;

    switch (type) {
      case BannerType.info:
        bg = AppColors.paleBlue;
        border = AppColors.cobalt;
        textColor = AppColors.cobaltDark;
        icon = Icons.info_outline_rounded;
        break;
      case BannerType.warning:
        bg = AppColors.paleAmber;
        border = AppColors.saffron;
        textColor = AppColors.saffronDark;
        icon = Icons.warning_amber_rounded;
        break;
      case BannerType.error:
        bg = AppColors.paleRed;
        border = AppColors.red;
        textColor = AppColors.red;
        icon = Icons.error_outline_rounded;
        break;
      case BannerType.success:
        bg = AppColors.paleMint;
        border = AppColors.jade;
        textColor = AppColors.jadeDark;
        icon = Icons.check_circle_outline_rounded;
        break;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: border, width: 1.2),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: textColor),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              message,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: textColor,
                height: 1.4,
              ),
            ),
          ),
          if (onDismiss != null)
            IconButton(
              icon: Icon(Icons.close_rounded, size: 18, color: textColor),
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
              onPressed: onDismiss,
            ),
        ],
      ),
    );
  }
}
