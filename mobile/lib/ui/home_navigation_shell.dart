import 'package:flutter/material.dart';
import '../core/localization/locale_provider.dart';
import '../core/services/audio_tts_service.dart';
import '../core/services/voice_input_service.dart';
import '../data/repositories/auth_repository.dart';
import '../data/repositories/public_data_repository.dart';
import '../data/repositories/resources_repository.dart';
import '../data/repositories/saved_records_repository.dart';
import '../data/repositories/understand_repository.dart';
import '../data/services/setu_api_client.dart';
import 'core/widgets/setu_app_bar.dart';
import 'features/public_data/views/public_data_screen.dart';
import 'features/resources/views/resources_screen.dart';
import 'features/saved/views/saved_records_screen.dart';
import 'features/understand/views/understand_screen.dart';

class HomeNavigationShell extends StatefulWidget {
  final SetuApiClient apiClient;
  final AuthRepository authRepository;
  final UnderstandRepository understandRepository;
  final PublicDataRepository publicDataRepository;
  final ResourcesRepository resourcesRepository;
  final SavedRecordsRepository savedRecordsRepository;
  final LocaleProvider localeProvider;
  final AudioTtsService ttsService;
  final VoiceInputService voiceService;

  const HomeNavigationShell({
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
  State<HomeNavigationShell> createState() => _HomeNavigationShellState();
}

class _HomeNavigationShellState extends State<HomeNavigationShell> {
  int _currentIndex = 0;
  bool _isServerHealthy = false;

  @override
  void initState() {
    super.initState();
    _checkServer();
  }

  Future<void> _checkServer() async {
    final healthy = await widget.apiClient.checkHealth();
    if (mounted) {
      setState(() => _isServerHealthy = healthy);
    }
  }

  void _onSwitchTab(int index) {
    setState(() => _currentIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    final tr = widget.localeProvider.tr;

    final screens = [
      UnderstandScreen(
        understandRepository: widget.understandRepository,
        savedRecordsRepository: widget.savedRecordsRepository,
        localeProvider: widget.localeProvider,
        ttsService: widget.ttsService,
        voiceService: widget.voiceService,
      ),
      PublicDataScreen(
        publicDataRepository: widget.publicDataRepository,
        savedRecordsRepository: widget.savedRecordsRepository,
        localeProvider: widget.localeProvider,
      ),
      ResourcesScreen(
        resourcesRepository: widget.resourcesRepository,
        savedRecordsRepository: widget.savedRecordsRepository,
        localeProvider: widget.localeProvider,
      ),
      SavedRecordsScreen(
        savedRecordsRepository: widget.savedRecordsRepository,
        understandRepository: widget.understandRepository,
        localeProvider: widget.localeProvider,
        ttsService: widget.ttsService,
        onSwitchTab: _onSwitchTab,
      ),
    ];

    return Scaffold(
      appBar: SetuAppBar(
        localeProvider: widget.localeProvider,
        authRepository: widget.authRepository,
        apiClient: widget.apiClient,
        isServerHealthy: _isServerHealthy,
        onRefreshServer: () {
          _checkServer();
          widget.savedRecordsRepository.fetchSavedItems();
        },
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (idx) {
          setState(() => _currentIndex = idx);
          if (idx == 3) {
            widget.savedRecordsRepository.fetchSavedItems();
          }
        },
        destinations: [
          NavigationDestination(
            icon: const Icon(Icons.document_scanner_outlined),
            selectedIcon: const Icon(Icons.document_scanner_rounded),
            label: tr('tabExplain'),
          ),
          NavigationDestination(
            icon: const Icon(Icons.travel_explore_outlined),
            selectedIcon: const Icon(Icons.travel_explore_rounded),
            label: tr('tabFind'),
          ),
          NavigationDestination(
            icon: const Icon(Icons.account_balance_outlined),
            selectedIcon: const Icon(Icons.account_balance_rounded),
            label: tr('tabResources'),
          ),
          NavigationDestination(
            icon: const Icon(Icons.bookmarks_outlined),
            selectedIcon: const Icon(Icons.bookmarks_rounded),
            label: tr('tabSaved'),
          ),
        ],
      ),
    );
  }
}
