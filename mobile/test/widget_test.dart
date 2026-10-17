import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:setu/core/localization/locale_provider.dart';
import 'package:setu/core/services/audio_tts_service.dart';
import 'package:setu/core/services/storage_service.dart';
import 'package:setu/core/services/voice_input_service.dart';
import 'package:setu/data/repositories/auth_repository.dart';
import 'package:setu/data/repositories/public_data_repository.dart';
import 'package:setu/data/repositories/resources_repository.dart';
import 'package:setu/data/repositories/saved_records_repository.dart';
import 'package:setu/data/repositories/understand_repository.dart';
import 'package:setu/data/services/setu_api_client.dart';
import 'package:setu/main.dart';

void main() {
  testWidgets('SetuApp boots with branding, tabs, and localization switcher', (WidgetTester tester) async {
    final mockClient = MockClient((request) async {
      if (request.url.path.endsWith('/health')) {
        return http.Response('{"status":"healthy"}', 200, headers: {'content-type': 'application/json'});
      }
      if (request.url.path.endsWith('/find/catalog')) {
        return http.Response('{"success":true,"catalog":[]}', 200, headers: {'content-type': 'application/json'});
      }
      if (request.url.path.endsWith('/resources')) {
        return http.Response('{"success":true,"data":[]}', 200, headers: {'content-type': 'application/json'});
      }
      if (request.url.path.endsWith('/saved')) {
        return http.Response('{"success":true,"items":[]}', 200, headers: {'content-type': 'application/json'});
      }
      return http.Response('{"success":true}', 200, headers: {'content-type': 'application/json'});
    });

    final storageService = StorageService();
    final apiClient = SetuApiClient(storageService: storageService, httpClient: mockClient);
    final localeProvider = LocaleProvider();
    final ttsService = AudioTtsService();
    final voiceService = VoiceInputService();
    final authRepository = AuthRepository(apiClient: apiClient, storageService: storageService);
    final understandRepository = UnderstandRepository(apiClient: apiClient);
    final publicDataRepository = PublicDataRepository(apiClient: apiClient);
    final resourcesRepository = ResourcesRepository(apiClient: apiClient);
    final savedRecordsRepository = SavedRecordsRepository(apiClient: apiClient);

    await tester.pumpWidget(
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

    // Initial load
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 200));

    // Verify Brand Header
    expect(find.text('Setu'), findsOneWidget);
    expect(find.text('सेतु'), findsOneWidget);

    // Verify Bottom Navigation Bar Destinations
    expect(find.text('Explain'), findsOneWidget);
    expect(find.text('Public Data'), findsOneWidget);
    expect(find.text('Resources'), findsOneWidget);
    expect(find.text('Saved'), findsOneWidget);

    // Tap Language Switcher Pill (EN -> हिन्दी)
    final langPill = find.text('EN');
    expect(langPill, findsOneWidget);
    await tester.tap(langPill);
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 200));

    // Verify UI switched to Hindi
    expect(find.text('हिन्दी'), findsOneWidget);
    expect(find.text('व्याख्या'), findsOneWidget);
    expect(find.text('सार्वजनिक डेटा'), findsOneWidget);

    // Tap Font Scaler Button (A -> A+)
    final fontScaler = find.text('A');
    expect(fontScaler, findsOneWidget);
    await tester.tap(fontScaler);
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 200));
    expect(find.text('A+'), findsOneWidget);

    // Switch to Public Data Tab
    await tester.tap(find.text('सार्वजनिक डेटा'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 200));
    expect(find.text('सार्वजनिक डेटा व सरकारी सेवाएं'), findsOneWidget);

    // Switch to Resources Tab
    await tester.tap(find.text('संसाधन'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 200));
    expect(find.text('नागरिक संसाधन व कानूनी सहायता'), findsOneWidget);

    // Switch to Saved Tab
    await tester.tap(find.text('सुरक्षित'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 200));
    expect(find.text('सहेजे गए केस फाइल व रिकॉर्ड'), findsOneWidget);
  });
}
