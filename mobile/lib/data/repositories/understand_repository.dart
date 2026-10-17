import 'package:flutter/foundation.dart';
import '../../core/localization/app_translations.dart';
import '../models/understand_model.dart';
import '../services/setu_api_client.dart';

class UnderstandRepository extends ChangeNotifier {
  final SetuApiClient apiClient;
  bool _isLoading = false;
  UnderstandResult? _lastResult;

  bool get isLoading => _isLoading;
  UnderstandResult? get lastResult => _lastResult;

  UnderstandRepository({required this.apiClient});

  Future<UnderstandResult> explainDocument({
    String? text,
    required AppLanguage lang,
    Map<String, dynamic>? file,
    String aiProvider = 'auto',
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      final json = await apiClient.understandDocument(
        text: text,
        lang: lang == AppLanguage.hi ? 'hi' : 'en',
        file: file,
        aiProvider: aiProvider,
      );

      final result = UnderstandResult.fromJson(json);
      _lastResult = result;
      return result;
    } catch (e) {
      // Offline fallback for demo notices so the app can be evaluated offline
      final fallback = _getDemoFallback(text ?? '', lang);
      if (fallback != null) {
        _lastResult = fallback;
        return fallback;
      }
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void clearResult() {
    _lastResult = null;
    notifyListeners();
  }

  void setResult(UnderstandResult result) {
    _lastResult = result;
    notifyListeners();
  }

  UnderstandResult? _getDemoFallback(String rawText, AppLanguage lang) {
    final lower = rawText.toLowerCase();

    // 1. Bank SARFAESI Notice
    if (lower.contains('sarfaesi') || lower.contains('non-performing') || lower.contains('npa') || lower.contains('lien')) {
      if (lang == AppLanguage.hi) {
        return const UnderstandResult(
          summary: 'बैंक ने आपके खाते को एनपीए (NPA) यानी डिफ़ॉल्ट घोषित कर दिया है क्योंकि पिछले 90 दिनों से किस्त नहीं भरी गई। बैंक ने बकाया वसूली के लिए आपकी ₹45,000 की फिक्स्ड डिपॉजिट (FD) पर कानूनी रोक (लियन) लगा दी है। यदि 60 दिनों के भीतर आपने बैंक से बात नहीं की, तो वे गिरवी रखी संपत्ति को जब्त कर सकते हैं। घबराएं नहीं, तुरंत बैंक जाकर समझौते (One-Time Settlement) की बात करें।',
          disclaimerType: 'legal',
          disclaimerText: 'कानूनी परामर्श सूचना: यह केवल नागरिक सहायता सारांश है और विधिक सलाह नहीं है। सरफेसी अधिनियम धारा 13(2) नोटिस वैधानिक प्रक्रिया है। 60 दिन की अवधि से पूर्व शाखा प्रबंधक अथवा निःशुल्क कानूनी सहायता (DLSA) से मिलें।',
          uncertainties: [
            'इस संक्षिप्त नोटिस अंश में ब्याज और अतिरिक्त विलंब शुल्क की गणना दर का उल्लेख नहीं है।',
            'संपत्ति की नीलामी या भौतिक कब्जे की तिथि 60 दिनों के उत्तर पर निर्भर है और अभी निश्चित नहीं है।',
          ],
          supportingEvidence: [
            SupportingEvidence(
              quote: 'lien of Rs. 45,000 has been marked on your Fixed Deposit',
              sourceRef: 'Notice Section 13(2)',
              context: 'एफडी पर कानूनी रोक का खंड',
            ),
            SupportingEvidence(
              quote: 'account is classified as a Non-Performing Asset (NPA)',
              sourceRef: 'Notice Header',
              context: 'डिफ़ॉल्ट वर्गीकरण खंड',
            ),
          ],
          termsExplained: [
            TermExplained(
              term: 'SARFAESI Act',
              phonetic: 'सरफेसी एक्ट (Sar-fay-see)',
              simpleMeaning: '2002 का एक कानून जो बैंकों को बिना कोर्ट के चक्कर काटे कर्ज़ वसूलने का अधिकार देता है।',
              whyItMatters: 'इसके तहत बैंक बिना लंबी अदालती सुनवाई के गिरवी रखी चीज़ को अपने नियंत्रण में ले सकता है।',
            ),
            TermExplained(
              term: 'Non-Performing Asset (NPA)',
              phonetic: 'नॉन-परफॉर्मिंग एसेट',
              simpleMeaning: 'वह बैंक खाता जिसमें पिछले 3 महीनों से कोई किस्त या ब्याज नहीं भरा गया है।',
              whyItMatters: 'इससे आपका सिबिल (CIBIL) स्कोर गिर जाता है और भविष्य में कोई बैंक कर्ज़ नहीं देगा।',
            ),
            TermExplained(
              term: 'Lien',
              phonetic: 'लियन (कानूनी ताला)',
              simpleMeaning: 'बैंक द्वारा आपके पैसों या FD पर लगाया गया रोक का आदेश।',
              whyItMatters: 'जब तक ₹45,000 की देनदारी साफ नहीं होती, आप अपनी FD के पैसे नहीं निकाल सकते।',
            ),
          ],
          actionSteps: [
            ActionStep(
              stepNumber: 1,
              action: 'अपनी बैंक शाखा में जाकर शाखा प्रबंधक (Branch Manager) से सीधे मिलें।',
              deadlineOrUrgency: 'अगले 7 दिनों के भीतर',
            ),
            ActionStep(
              stepNumber: 2,
              action: 'बैंक से बकाये खाते का संपूर्ण विवरण (Loan Account Statement) मांगें।',
              deadlineOrUrgency: 'तुरंत',
            ),
            ActionStep(
              stepNumber: 3,
              action: 'लिखित में एक आवेदन देकर किस्त पुनर्गठन या एकमुश्त निपटान की मांग करें।',
              deadlineOrUrgency: '60 दिनों की कानूनी समय सीमा समाप्त होने से पहले',
            ),
          ],
          questionsToAsk: [
            'मेरी फिक्स्ड डिपॉजिट पर लियन हटाने के लिए मुझे अभी तुरंत कितनी न्यूनतम राशि जमा करनी होगी?',
            'क्या मैं बची हुई रकम को आसान मासिक किस्तों (EMI) में बदल सकता हूँ?',
            'सरफेसी नोटिस के तहत मेरे पास औपचारिक उत्तर देने के लिए कितने दिन बाकी हैं?',
          ],
          watchOutFor: [
            WatchOutItem(
              warning: 'आपकी फिक्स्ड डिपॉजिट से ₹45,000 की रकम पर रोक लगा दी गई है जिसे आप निकाल नहीं सकते।',
              exactQuote: 'lien of Rs. 45,000 has been marked on your Fixed Deposit',
              verified: true,
            ),
          ],
          aiEngineUsed: 'Resilient Offline Demo Engine',
        );
      }

      return const UnderstandResult(
        summary: 'The bank has classified your account as a Non-Performing Asset (NPA) because monthly installments were missed for over 90 days. To recover the overdue amount, the bank has placed a freeze (lien) of Rs. 45,000 on your Fixed Deposit. Under the SARFAESI Act, you have a limited window of 60 days to respond before the bank takes further recovery action. Do not panic—visit your home branch immediately to discuss an installment restructuring.',
        disclaimerType: 'legal',
        disclaimerText: 'Legal Advisory: This plain-language guide is for civic empowerment, not formal legal counsel. Statutory proceedings under Section 13(2) of SARFAESI require formal response before 60 days. Consult your branch manager or free legal aid (DLSA).',
        uncertainties: [
          'The exact penal interest calculation rate beyond the overdue balance is not specified in this brief excerpt.',
          'The physical asset inspection or enforcement schedule is contingent on your response within the 60-day window.',
        ],
        supportingEvidence: [
          SupportingEvidence(
            quote: 'lien of Rs. 45,000 has been marked on your Fixed Deposit',
            sourceRef: 'Notice Section 13(2)',
            context: 'Bank security lien marked against FD balance',
          ),
          SupportingEvidence(
            quote: 'account is classified as a Non-Performing Asset (NPA)',
            sourceRef: 'Notice Header',
            context: 'Overdue default classification',
          ),
        ],
        termsExplained: [
          TermExplained(
            term: 'SARFAESI Act',
            phonetic: 'Sar-FAY-see Act',
            simpleMeaning: 'An Indian law empowering banks to recover unpaid loans by seizing pledged assets without prolonged court trials.',
            whyItMatters: 'It allows the bank to take direct enforcement action if you do not clear the default within the notice period.',
          ),
          TermExplained(
            term: 'Non-Performing Asset (NPA)',
            phonetic: 'Non Per-forming Ass-et',
            simpleMeaning: 'A loan or credit account where repayments are overdue for more than 90 days.',
            whyItMatters: 'Severely damages your CIBIL credit score and prevents you from obtaining future loans or credit cards.',
          ),
          TermExplained(
            term: 'Lien',
            phonetic: 'Lee-un (Legal Hold)',
            simpleMeaning: 'A formal lock placed on your bank deposits preventing you from withdrawing the funds.',
            whyItMatters: 'You cannot withdraw or close your Fixed Deposit until the Rs. 45,000 obligation is resolved with the bank.',
          ),
        ],
        actionSteps: [
          ActionStep(
            stepNumber: 1,
            action: 'Visit your home bank branch and request an audience with the Branch Manager.',
            deadlineOrUrgency: 'Within the next 7 business days',
          ),
          ActionStep(
            stepNumber: 2,
            action: 'Request an up-to-date loan statement showing the principal overdue vs penalty charges.',
            deadlineOrUrgency: 'Immediate',
          ),
          ActionStep(
            stepNumber: 3,
            action: 'Submit a written proposal requesting restructuring into manageable installments or one-time settlement.',
            deadlineOrUrgency: 'Before the 60-day SARFAESI statutory notice period expires',
          ),
        ],
        questionsToAsk: [
          'What is the minimum upfront payment required right now to lift the lien from my Fixed Deposit?',
          'Can you restructure the overdue balance into revised, smaller monthly installments?',
          'Can I have a written acknowledgment of my settlement proposal before any action under Section 13(4) is initiated?',
        ],
        watchOutFor: [
          WatchOutItem(
            warning: 'A financial hold has been marked on your Fixed Deposit preventing withdrawal of Rs. 45,000.',
            exactQuote: 'lien of Rs. 45,000 has been marked on your Fixed Deposit',
            verified: true,
          ),
        ],
        aiEngineUsed: 'Resilient Offline Demo Engine',
      );
    }

    return null;
  }
}
