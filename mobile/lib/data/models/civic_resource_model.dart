class CivicResource {
  final String id;
  final String category;
  final String titleEn;
  final String titleHi;
  final String providerEn;
  final String providerHi;
  final String descriptionEn;
  final String descriptionHi;
  final String officialLink;
  final String targetAudienceEn;
  final String targetAudienceHi;
  final List<String> eligibilityRequirementsEn;
  final List<String> eligibilityRequirementsHi;
  final String whyItMatchesEn;
  final String whyItMatchesHi;
  final String missingRequirementsWarningEn;
  final String missingRequirementsWarningHi;
  final String deadlineOrSchedule;
  final String verificationDate;
  final String verifiedSource;
  final String locationCoverage;

  // Matched Resource extensions
  final String? relevanceReasonEn;
  final String? relevanceReasonHi;
  final String? actionConnectionEn;
  final String? actionConnectionHi;
  final String? eligibilityCautionEn;
  final String? eligibilityCautionHi;

  const CivicResource({
    required this.id,
    required this.category,
    required this.titleEn,
    required this.titleHi,
    required this.providerEn,
    required this.providerHi,
    required this.descriptionEn,
    required this.descriptionHi,
    required this.officialLink,
    required this.targetAudienceEn,
    required this.targetAudienceHi,
    required this.eligibilityRequirementsEn,
    required this.eligibilityRequirementsHi,
    required this.whyItMatchesEn,
    required this.whyItMatchesHi,
    required this.missingRequirementsWarningEn,
    required this.missingRequirementsWarningHi,
    required this.deadlineOrSchedule,
    required this.verificationDate,
    required this.verifiedSource,
    required this.locationCoverage,
    this.relevanceReasonEn,
    this.relevanceReasonHi,
    this.actionConnectionEn,
    this.actionConnectionHi,
    this.eligibilityCautionEn,
    this.eligibilityCautionHi,
  });

  factory CivicResource.fromJson(Map<String, dynamic> json) {
    return CivicResource(
      id: json['id'] as String? ?? '',
      category: json['category'] as String? ?? '',
      titleEn: json['title_en'] as String? ?? '',
      titleHi: json['title_hi'] as String? ?? '',
      providerEn: json['provider_en'] as String? ?? '',
      providerHi: json['provider_hi'] as String? ?? '',
      descriptionEn: json['description_en'] as String? ?? '',
      descriptionHi: json['description_hi'] as String? ?? '',
      officialLink: json['official_link'] as String? ?? '',
      targetAudienceEn: json['target_audience_en'] as String? ?? '',
      targetAudienceHi: json['target_audience_hi'] as String? ?? '',
      eligibilityRequirementsEn: (json['eligibility_requirements_en'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      eligibilityRequirementsHi: (json['eligibility_requirements_hi'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      whyItMatchesEn: json['why_it_matches_en'] as String? ?? '',
      whyItMatchesHi: json['why_it_matches_hi'] as String? ?? '',
      missingRequirementsWarningEn: json['missing_requirements_warning_en'] as String? ?? '',
      missingRequirementsWarningHi: json['missing_requirements_warning_hi'] as String? ?? '',
      deadlineOrSchedule: json['deadline_or_schedule'] as String? ?? '',
      verificationDate: json['verification_date'] as String? ?? '',
      verifiedSource: json['verified_source'] as String? ?? '',
      locationCoverage: json['location_coverage'] as String? ?? '',
      relevanceReasonEn: json['relevance_reason_en'] as String?,
      relevanceReasonHi: json['relevance_reason_hi'] as String?,
      actionConnectionEn: json['action_connection_en'] as String?,
      actionConnectionHi: json['action_connection_hi'] as String?,
      eligibilityCautionEn: json['eligibility_caution_en'] as String?,
      eligibilityCautionHi: json['eligibility_caution_hi'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'category': category,
      'title_en': titleEn,
      'title_hi': titleHi,
      'provider_en': providerEn,
      'provider_hi': providerHi,
      'description_en': descriptionEn,
      'description_hi': descriptionHi,
      'official_link': officialLink,
      'target_audience_en': targetAudienceEn,
      'target_audience_hi': targetAudienceHi,
      'eligibility_requirements_en': eligibilityRequirementsEn,
      'eligibility_requirements_hi': eligibilityRequirementsHi,
      'why_it_matches_en': whyItMatchesEn,
      'why_it_matches_hi': whyItMatchesHi,
      'missing_requirements_warning_en': missingRequirementsWarningEn,
      'missing_requirements_warning_hi': missingRequirementsWarningHi,
      'deadline_or_schedule': deadlineOrSchedule,
      'verification_date': verificationDate,
      'verified_source': verifiedSource,
      'location_coverage': locationCoverage,
      'relevance_reason_en': relevanceReasonEn,
      'relevance_reason_hi': relevanceReasonHi,
      'action_connection_en': actionConnectionEn,
      'action_connection_hi': actionConnectionHi,
      'eligibility_caution_en': eligibilityCautionEn,
      'eligibility_caution_hi': eligibilityCautionHi,
    };
  }
}
