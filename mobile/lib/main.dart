import 'package:flutter/material.dart';
import 'core/config/api_config.dart';
import 'core/localization/locale_provider.dart';
import 'core/services/audio_tts_service.dart';
import 'core/services/storage_service.dart';
import 'core/services/voice_input_service.dart';
import 'core/theme/app_theme.dart';
import 'data/repositories/auth_repository.dart';
import 'data/repositories/public_data_repository.dart';
import 'data/repositories/resources_repository.dart';
import 'data/repositories/saved_records_repository.dart';
import 'data/repositories/understand_repository.dart';
import 'data/services/setu_api_client.dart';
import 'ui/home_navigation_shell.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize centralized API configuration and storage
  await ApiConfig.initialize();
  final storageService = StorageService();

  // Initialize localization & user accessibility preferences
  final localeProvider = LocaleProvider();
  await localeProvider.initialize();

  // Audio TTS & Voice Services
  final ttsService = AudioTtsService();
  final voiceService = VoiceInputService();

  // Core API Client
  final apiClient = SetuApiClient(storageService: storageService);

  // Repositories
  final authRepository = AuthRepository(
    apiClient: apiClient,
    storageService: storageService,
  );
  // Restore session if user was previously signed in
  await authRepository.restoreSession();

  final understandRepository = UnderstandRepository(apiClient: apiClient);
  final publicDataRepository = PublicDataRepository(apiClient: apiClient);
  final resourcesRepository = ResourcesRepository(apiClient: apiClient);
  final savedRecordsRepository = SavedRecordsRepository(apiClient: apiClient);

  runApp(
    SetuApp(
      apiClient: apiClient,
      authRepository: authRepository,
      understandRepository: understandRepository,
      publicDataRepository: publicDataRepository,
      resourcesRepository: resourcesRepository,
      savedRecordsRepository: savedRecordsRepository,
      localeProvider: localeProvider,
      ttsService: ttsService,
      voiceService: voiceService,
    ),
  );
}

class SetuApp extends StatelessWidget {
  final SetuApiClient apiClient;
  final AuthRepository authRepository;
  final UnderstandRepository understandRepository;
  final PublicDataRepository publicDataRepository;
  final ResourcesRepository resourcesRepository;
  final SavedRecordsRepository savedRecordsRepository;
  final LocaleProvider localeProvider;
  final AudioTtsService ttsService;
  final VoiceInputService voiceService;

  const SetuApp({
    super.key,
    required this.apiClient,
    required this.authRepository,
    required this.understandRepository,
    required this.publicDataRepository,
    required this.resourcesRepository,
    required this.savedRecordsRepository,
    required this.localeProvider,
    required this.ttsService,
    required this.voiceService,
  });

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: Listenable.merge([localeProvider, authRepository]),
      builder: (context, _) {
        return MaterialApp(
          title: 'Setu (सेतु)',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.getTheme(fontSize: localeProvider.fontSize),
          home: HomeNavigationShell(
            apiClient: apiClient,
            authRepository: authRepository,
            understandRepository: understandRepository,
            publicDataRepository: publicDataRepository,
            resourcesRepository: resourcesRepository,
            savedRecordsRepository: savedRecordsRepository,
            localeProvider: localeProvider,
            ttsService: ttsService,
            voiceService: voiceService,
          ),
        );
      },
    );
  }
}
