import 'package:flutter_test/flutter_test.dart';
import 'package:setu/data/models/user_model.dart';
import 'package:setu/data/models/auth_response.dart';
import 'package:setu/data/models/understand_model.dart';
import 'package:setu/data/models/public_data_model.dart';
import 'package:setu/data/models/saved_item_model.dart';

void main() {
  group('Setu Data Models', () {
    test('UserModel serialization and deserialization', () {
      final user = UserModel(
        id: 'usr_12345',
        email: 'citizen@example.com',
        name: 'Aadi Sharma',
        role: 'citizen',
        createdAt: '2026-10-18T00:00:00Z',
        lastLogin: '2026-10-18T00:00:00Z',
      );

      final json = user.toJson();
      expect(json['id'], 'usr_12345');
      expect(json['email'], 'citizen@example.com');
      expect(json['name'], 'Aadi Sharma');

      final fromJson = UserModel.fromJson(json);
      expect(fromJson.id, user.id);
      expect(fromJson.email, user.email);
      expect(fromJson.name, user.name);
      expect(fromJson.role, user.role);
    });

    test('AuthResponse models parse correctly', () {
      final sendOtpJson = {
        'success': true,
        'message': 'Code sent',
        'otpPreview': '654321',
      };
      final sendOtpRes = SendOtpResponse.fromJson(sendOtpJson);
      expect(sendOtpRes.success, true);
      expect(sendOtpRes.message, 'Code sent');
      expect(sendOtpRes.otpPreview, '654321');

      final verifyOtpJson = {
        'success': true,
        'token': 'setu_token_abc',
        'user': {
          'id': 'usr_1',
          'email': 'test@gov.in',
          'name': 'Ramesh',
          'role': 'citizen',
        },
        'message': 'Welcome',
      };
      final verifyOtpRes = VerifyOtpResponse.fromJson(verifyOtpJson);
      expect(verifyOtpRes.success, true);
      expect(verifyOtpRes.token, 'setu_token_abc');
      expect(verifyOtpRes.user?.name, 'Ramesh');
    });

    test('UnderstandResult parses full 5-stage dossier correctly', () {
      final dossierJson = {
        'summary': 'Bank default notice SARFAESI',
        'disclaimer_type': 'legal',
        'disclaimer_text': 'Legal advisory notice',
        'uncertainties': ['Omitted interest breakdown'],
        'supporting_evidence': [
          {
            'quote': 'lien of Rs. 45,000 has been marked',
            'source_ref': 'Section 13(2)',
            'context:': 'FD hold',
          }
        ],
        'terms_explained': [
          {
            'term': 'SARFAESI Act',
            'phonetic': 'Sar-FAY-see',
            'simple_meaning': 'Loan recovery law',
            'why_it_matters': 'Empowers asset attachment',
          }
        ],
        'action_steps': [
          {
            'step_number': 1,
            'action': 'Visit home branch',
            'deadline_or_urgency': 'Within 7 days',
          }
        ],
        'questions_to_ask': ['What is minimum upfront payment?'],
        'watch_out_for': [
          {
            'warning': 'FD locked',
            'exact_quote': 'lien of Rs. 45,000',
            'verified': true,
          }
        ],
        'matched_resources': [
          {
            'id': 'res-nalsa-legal-aid',
            'category': 'tools-services',
            'title_en': 'NALSA Free Legal Aid',
            'title_hi': 'नालसा निःशुल्क कानूनी सहायता',
            'provider_en': 'Supreme Court of India',
            'provider_hi': 'सर्वोच्च न्यायालय',
            'description_en': 'Free certified advocates',
            'description_hi': 'निःशुल्क सरकारी वकील',
            'official_link': 'https://nalsa.gov.in',
            'target_audience_en': 'Senior citizens & low income',
            'target_audience_hi': 'वरिष्ठ नागरिक',
            'eligibility_requirements_en': ['Income under 3 Lakhs'],
            'eligibility_requirements_hi': ['3 लाख से कम आय'],
            'why_it_matches_en': 'Free legal representation',
            'why_it_matches_hi': 'निःशुल्क कानूनी वकील',
            'missing_requirements_warning_en': 'Carry income certificate',
            'missing_requirements_warning_hi': 'आय प्रमाण पत्र साथ रखें',
            'deadline_or_schedule': 'All court working days',
            'verification_date': 'February 2026',
            'verified_source': 'nalsa.gov.in',
            'location_coverage': 'Pan-India',
          }
        ],
      };

      final result = UnderstandResult.fromJson(dossierJson);
      expect(result.summary, 'Bank default notice SARFAESI');
      expect(result.disclaimerType, 'legal');
      expect(result.uncertainties.length, 1);
      expect(result.supportingEvidence.length, 1);
      expect(result.termsExplained.length, 1);
      expect(result.termsExplained.first.term, 'SARFAESI Act');
      expect(result.actionSteps.length, 1);
      expect(result.actionSteps.first.stepNumber, 1);
      expect(result.questionsToAsk.length, 1);
      expect(result.watchOutFor.length, 1);
      expect(result.matchedResources.length, 1);
      expect(result.matchedResources.first.id, 'res-nalsa-legal-aid');
    });

    test('PublicDataResponse parses catalog query rows correctly', () {
      final dataJson = {
        'catalog': {
          'slug': 'mandi-prices',
          'resource_id': 'mandi-123',
          'title_en': 'Mandi Prices',
          'title_hi': 'मंडी भाव',
          'filter_label_en': 'Select State',
          'filter_label_hi': 'राज्य चुनें',
          'filter_key': 'state',
          'filter_options': [
            {'label_en': 'UP', 'label_hi': 'उत्तर प्रदेश', 'value': 'UP'}
          ],
        },
        'filter_value': 'UP',
        'rows': [
          {
            'commodity': 'Wheat',
            'modal_price': '₹2,350',
            'market': 'Meerut',
          }
        ],
        'summary': {
          'summary': 'Rates are stable',
          'advice': 'Sell at APMC mandi',
          'cached': false,
        },
        'source_badge': {
          'source': 'data.gov.in',
          'is_live': true,
          'timestamp': 'Today',
          'resource_id': 'mandi-123',
        },
      };

      final res = PublicDataResponse.fromJson(dataJson);
      expect(res.catalog.slug, 'mandi-prices');
      expect(res.rows.length, 1);
      expect(res.rows.first['commodity'], 'Wheat');
      expect(res.summary.summary, 'Rates are stable');
      expect(res.sourceBadge.isLive, true);
    });

    test('SavedItem parses and serializes correctly', () {
      final savedJson = {
        'id': 'saved-123',
        'session_id': 'usr_456',
        'kind': 'understand',
        'title': 'Bank Notice Case File',
        'payload': {'summary': 'Test summary'},
        'created_at': '2026-10-18T00:00:00Z',
      };

      final item = SavedItem.fromJson(savedJson);
      expect(item.id, 'saved-123');
      expect(item.sessionId, 'usr_456');
      expect(item.kind, 'understand');
      expect(item.title, 'Bank Notice Case File');
      expect(item.payload['summary'], 'Test summary');

      final serialized = item.toJson();
      expect(serialized['id'], 'saved-123');
    });
  });
}
