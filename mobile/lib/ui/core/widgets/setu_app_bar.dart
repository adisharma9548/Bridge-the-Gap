import 'package:flutter/material.dart';
import 'package:setu/core/localization/app_translations.dart';
import 'package:setu/core/localization/locale_provider.dart';
import 'package:setu/core/theme/app_colors.dart';
import 'package:setu/data/repositories/auth_repository.dart';
import 'package:setu/data/services/setu_api_client.dart';
import 'package:setu/ui/core/widgets/server_settings_dialog.dart';
import 'package:setu/ui/features/auth/views/auth_modal_sheet.dart';

class SetuAppBar extends StatelessWidget implements PreferredSizeWidget {
  final LocaleProvider localeProvider;
  final AuthRepository authRepository;
  final SetuApiClient apiClient;
  final bool isServerHealthy;
  final VoidCallback onRefreshServer;

  const SetuAppBar({
    super.key,
    required this.localeProvider,
    required this.authRepository,
    required this.apiClient,
    required this.isServerHealthy,
    required this.onRefreshServer,
  });

  @override
  Size get preferredSize => const Size.fromHeight(60);

  @override
  Widget build(BuildContext context) {
    final tr = localeProvider.tr;
    final isHindi = localeProvider.language == AppLanguage.hi;
    final user = authRepository.currentUser;

    return AppBar(
      titleSpacing: 16,
      title: Row(
        children: [
          // Setu logo mark
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.cobalt,
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Text(
              'सेतु',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                tr('brandName'),
                style: const TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w800,
                  color: AppColors.navy,
                ),
              ),
              Text(
                isHindi ? 'नागरिक सहायता' : 'Civic Bridge',
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: AppColors.slateSubtle,
                ),
              ),
            ],
          ),
        ],
      ),
      actions: [
        // Language Toggle Pill
        InkWell(
          onTap: () => localeProvider.toggleLanguage(),
          borderRadius: BorderRadius.circular(16),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.paleBlue,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.cobalt, width: 1.2),
            ),
            child: Text(
              isHindi ? 'हिन्दी' : 'EN',
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: AppColors.cobalt,
              ),
            ),
          ),
        ),
        const SizedBox(width: 6),

        // Font Scaler Button (A / A+ / A++)
        InkWell(
          onTap: () => localeProvider.cycleFontSize(),
          borderRadius: BorderRadius.circular(16),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.ivoryDark,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.borderGrey, width: 1.2),
            ),
            child: Text(
              localeProvider.fontSize.label,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w800,
                color: AppColors.navy,
              ),
            ),
          ),
        ),
        const SizedBox(width: 6),

        // Server Status Dot & Settings
        IconButton(
          icon: Stack(
            alignment: Alignment.topRight,
            children: [
              const Icon(Icons.dns_outlined, size: 22, color: AppColors.navy),
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isServerHealthy ? AppColors.jade : AppColors.red,
                  border: Border.all(color: Colors.white, width: 1.5),
                ),
              ),
            ],
          ),
          tooltip: tr('serverSettings'),
          onPressed: () {
            showDialog(
              context: context,
              builder: (ctx) => ServerSettingsDialog(
                apiClient: apiClient,
                onSaved: onRefreshServer,
              ),
            );
          },
        ),

        // Citizen Account Button
        Padding(
          padding: const EdgeInsets.only(right: 12),
          child: InkWell(
            onTap: () {
              showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                backgroundColor: Colors.transparent,
                builder: (ctx) => AuthModalSheet(
                  authRepository: authRepository,
                  localeProvider: localeProvider,
                  onAuthSuccess: onRefreshServer,
                ),
              );
            },
            borderRadius: BorderRadius.circular(20),
            child: CircleAvatar(
              radius: 16,
              backgroundColor: user != null ? AppColors.paleMint : AppColors.ivoryDark,
              child: user != null
                  ? Text(
                      user.name.isNotEmpty ? user.name[0].toUpperCase() : 'U',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: AppColors.jadeDark,
                      ),
                    )
                  : const Icon(Icons.person_outline_rounded, size: 18, color: AppColors.slateDark),
            ),
          ),
        ),
      ],
    );
  }
}
