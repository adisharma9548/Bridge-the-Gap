import 'package:flutter/material.dart';
import 'package:setu/core/localization/app_translations.dart';
import 'package:setu/core/localization/locale_provider.dart';
import 'package:setu/core/theme/app_colors.dart';
import 'package:setu/data/repositories/auth_repository.dart';
import 'package:setu/ui/core/widgets/status_banner.dart';

class AuthModalSheet extends StatefulWidget {
  final AuthRepository authRepository;
  final LocaleProvider localeProvider;
  final VoidCallback onAuthSuccess;

  const AuthModalSheet({
    super.key,
    required this.authRepository,
    required this.localeProvider,
    required this.onAuthSuccess,
  });

  @override
  State<AuthModalSheet> createState() => _AuthModalSheetState();
}

class _AuthModalSheetState extends State<AuthModalSheet> {
  bool _isRegister = false;
  bool _otpSent = false;
  String? _otpPreview;
  String? _errorMessage;
  bool _isSubmitting = false;

  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _otpController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _nameController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  Future<void> _handleSendOtp() async {
    final email = _emailController.text.trim();
    final name = _nameController.text.trim();

    if (email.isEmpty || !email.contains('@')) {
      setState(() => _errorMessage = 'Please enter a valid email address.');
      return;
    }
    if (_isRegister && name.isEmpty) {
      setState(() => _errorMessage = 'Please enter your full name.');
      return;
    }

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    try {
      final res = await widget.authRepository.sendOtp(
        email: email,
        type: _isRegister ? 'register' : 'login',
        name: name.isNotEmpty ? name : null,
      );

      if (res.success) {
        setState(() {
          _otpSent = true;
          _otpPreview = res.otpPreview;
          if (res.otpPreview != null) {
            _otpController.text = res.otpPreview!;
          }
        });
      } else {
        setState(() => _errorMessage = res.message);
      }
    } catch (e) {
      setState(() => _errorMessage = e.toString());
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  Future<void> _handleVerifyOtp() async {
    final email = _emailController.text.trim();
    final otp = _otpController.text.trim();
    final name = _nameController.text.trim();

    if (otp.length < 6) {
      setState(() => _errorMessage = 'Please enter the 6-digit verification code.');
      return;
    }

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    try {
      final res = await widget.authRepository.verifyOtp(
        email: email,
        otp: otp,
        type: _isRegister ? 'register' : 'login',
        name: name.isNotEmpty ? name : null,
      );

      if (res.success) {
        widget.onAuthSuccess();
        if (mounted) Navigator.pop(context);
      } else {
        setState(() => _errorMessage = res.message ?? 'Verification failed');
      }
    } catch (e) {
      setState(() => _errorMessage = e.toString());
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final tr = widget.localeProvider.tr;
    final user = widget.authRepository.currentUser;

    // If user is already authenticated, display profile info & logout
    if (user != null) {
      return Container(
        padding: EdgeInsets.only(
          left: 24,
          right: 24,
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
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.borderGrey,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: AppColors.paleBlue,
                  child: Text(
                    user.name.isNotEmpty ? user.name[0].toUpperCase() : 'C',
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: AppColors.cobalt,
                    ),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user.name,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.navy,
                        ),
                      ),
                      Text(
                        user.email,
                        style: const TextStyle(fontSize: 13, color: AppColors.slateSubtle),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.paleMint,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.jade, width: 1.2),
              ),
              child: Row(
                children: [
                  const Icon(Icons.cloud_done_rounded, color: AppColors.jadeDark, size: 20),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      widget.localeProvider.language == AppLanguage.hi
                          ? 'आपका खाता सक्रिय है। सभी सहेजे गए रिकॉर्ड वेबसाइट और मोबाइल दोनों पर सुरक्षित हैं।'
                          : 'Connected. Your saved case files are synchronized across website and mobile.',
                      style: const TextStyle(fontSize: 12.5, color: AppColors.jadeDark, height: 1.4),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: () async {
                await widget.authRepository.logout();
                if (context.mounted) Navigator.pop(context);
              },
              icon: const Icon(Icons.logout_rounded, size: 18),
              label: Text(tr('signOut')),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.red,
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      );
    }

    // Unauthenticated: 2-step OTP flow
    return Container(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
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
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.borderGrey,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Title & Tabs
          Row(
            children: [
              const Icon(Icons.lock_person_rounded, color: AppColors.cobalt),
              const SizedBox(width: 10),
              Text(
                tr('account'),
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.navy),
              ),
            ],
          ),
          const SizedBox(height: 14),

          if (!_otpSent)
            Row(
              children: [
                Expanded(
                  child: ChoiceChip(
                    label: Center(child: Text(tr('signIn'))),
                    selected: !_isRegister,
                    onSelected: (val) {
                      setState(() {
                        _isRegister = false;
                        _errorMessage = null;
                      });
                    },
                    selectedColor: AppColors.paleBlue,
                    labelStyle: TextStyle(
                      fontWeight: !_isRegister ? FontWeight.bold : FontWeight.normal,
                      color: !_isRegister ? AppColors.cobalt : AppColors.slateSubtle,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ChoiceChip(
                    label: Center(child: Text(tr('register'))),
                    selected: _isRegister,
                    onSelected: (val) {
                      setState(() {
                        _isRegister = true;
                        _errorMessage = null;
                      });
                    },
                    selectedColor: AppColors.paleBlue,
                    labelStyle: TextStyle(
                      fontWeight: _isRegister ? FontWeight.bold : FontWeight.normal,
                      color: _isRegister ? AppColors.cobalt : AppColors.slateSubtle,
                    ),
                  ),
                ),
              ],
            ),
          const SizedBox(height: 16),

          if (_errorMessage != null)
            StatusBanner(
              message: _errorMessage!,
              type: BannerType.error,
              onDismiss: () => setState(() => _errorMessage = null),
            ),

          if (_otpPreview != null)
            StatusBanner(
              message: 'Local Dev Code: $_otpPreview (Auto-filled below)',
              type: BannerType.info,
            ),

          // Step 1: Input details
          if (!_otpSent) ...[
            if (_isRegister) ...[
              TextField(
                controller: _nameController,
                decoration: InputDecoration(
                  labelText: tr('nameLabel'),
                  hintText: tr('namePlaceholder'),
                  prefixIcon: const Icon(Icons.person_outline_rounded, size: 20),
                ),
                textCapitalization: TextCapitalization.words,
              ),
              const SizedBox(height: 12),
            ],
            TextField(
              controller: _emailController,
              decoration: InputDecoration(
                labelText: tr('emailLabel'),
                hintText: tr('emailPlaceholder'),
                prefixIcon: const Icon(Icons.mail_outline_rounded, size: 20),
              ),
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 12),
            Text(
              tr('otpHint'),
              style: const TextStyle(fontSize: 12, color: AppColors.slateSubtle),
            ),
            const SizedBox(height: 18),
            ElevatedButton(
              onPressed: _isSubmitting ? null : _handleSendOtp,
              child: _isSubmitting
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : Text(tr('sendOtp')),
            ),
          ] else ...[
            // Step 2: Enter 6-digit OTP
            Text(
              '${tr('enterOtp')} for ${_emailController.text}',
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.navy),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _otpController,
              decoration: const InputDecoration(
                labelText: '6-Digit Verification Code',
                hintText: '123456',
                prefixIcon: Icon(Icons.pin_rounded, size: 20),
              ),
              keyboardType: TextInputType.number,
              maxLength: 6,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                letterSpacing: 6,
                color: AppColors.cobalt,
              ),
            ),
            const SizedBox(height: 14),
            ElevatedButton(
              onPressed: _isSubmitting ? null : _handleVerifyOtp,
              child: _isSubmitting
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : Text(tr('verifyOtp')),
            ),
            const SizedBox(height: 10),
            TextButton(
              onPressed: () {
                setState(() {
                  _otpSent = false;
                  _otpPreview = null;
                  _errorMessage = null;
                });
              },
              child: Text(
                widget.localeProvider.language == AppLanguage.hi ? 'ईमेल बदलें' : 'Change Email',
                style: const TextStyle(fontSize: 13),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
