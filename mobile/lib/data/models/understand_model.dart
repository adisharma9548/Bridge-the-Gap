import 'civic_resource_model.dart';

class SupportingEvidence {
  final String quote;
  final String? sourceRef;
  final String? context;

  const SupportingEvidence({
    required this.quote,
    this.sourceRef,
    this.context,
  });

  factory SupportingEvidence.fromJson(Map<String, dynamic> json) {
    return SupportingEvidence(
      quote: json['quote'] as String? ?? '',
      sourceRef: json['source_ref'] as String?,
      context: json['context'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'quote': quote,
      'source_ref': sourceRef,
      'context': context,
    };
  }
}

class TermExplained {
  final String term;
  final String phonetic;
  final String simpleMeaning;
  final String whyItMatters;

  const TermExplained({
    required this.term,
    required this.phonetic,
    required this.simpleMeaning,
    required this.whyItMatters,
  });

  factory TermExplained.fromJson(Map<String, dynamic> json) {
    return TermExplained(
      term: json['term'] as String? ?? '',
      phonetic: json['phonetic'] as String? ?? '',
      simpleMeaning: json['simple_meaning'] as String? ?? '',
      whyItMatters: json['why_it_matters'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'term': term,
      'phonetic': phonetic,
      'simple_meaning': simpleMeaning,
      'why_it_matters': whyItMatters,
    };
  }
}

class ActionStep {
  final int stepNumber;
  final String action;
  final String deadlineOrUrgency;

  const ActionStep({
    required this.stepNumber,
    required this.action,
    required this.deadlineOrUrgency,
  });

  factory ActionStep.fromJson(Map<String, dynamic> json) {
    return ActionStep(
      stepNumber: json['step_number'] as int? ?? 1,
      action: json['action'] as String? ?? '',
      deadlineOrUrgency: json['deadline_or_urgency'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'step_number': stepNumber,
      'action': action,
      'deadline_or_urgency': deadlineOrUrgency,
    };
  }
}

class WatchOutItem {
  final String warning;
  final String exactQuote;
  final bool verified;

  const WatchOutItem({
    required this.warning,
    required this.exactQuote,
    this.verified = true,
  });

  factory WatchOutItem.fromJson(Map<String, dynamic> json) {
    return WatchOutItem(
      warning: json['warning'] as String? ?? '',
      exactQuote: json['exact_quote'] as String? ?? '',
      verified: json['verified'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'warning': warning,
      'exact_quote': exactQuote,
      'verified': verified,
    };
  }
}

class UnderstandResult {
  final String summary;
  final String? disclaimerType;
  final String? disclaimerText;
  final List<String> uncertainties;
  final List<SupportingEvidence> supportingEvidence;
  final List<TermExplained> termsExplained;
  final List<ActionStep> actionSteps;
  final List<String> questionsToAsk;
  final List<WatchOutItem> watchOutFor;
  final List<CivicResource> matchedResources;
  final String? aiEngineUsed;
  final bool? cached;

  const UnderstandResult({
    required this.summary,
    this.disclaimerType,
    this.disclaimerText,
    this.uncertainties = const [],
    this.supportingEvidence = const [],
    this.termsExplained = const [],
    this.actionSteps = const [],
    this.questionsToAsk = const [],
    this.watchOutFor = const [],
    this.matchedResources = const [],
    this.aiEngineUsed,
    this.cached,
  });

  factory UnderstandResult.fromJson(Map<String, dynamic> json) {
    return UnderstandResult(
      summary: json['summary'] as String? ?? '',
      disclaimerType: json['disclaimer_type'] as String?,
      disclaimerText: json['disclaimer_text'] as String?,
      uncertainties: (json['uncertainties'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      supportingEvidence: (json['supporting_evidence'] as List<dynamic>?)
              ?.map((e) => SupportingEvidence.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      termsExplained: (json['terms_explained'] as List<dynamic>?)
              ?.map((e) => TermExplained.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      actionSteps: (json['action_steps'] as List<dynamic>?)
              ?.map((e) => ActionStep.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      questionsToAsk: (json['questions_to_ask'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      watchOutFor: (json['watch_out_for'] as List<dynamic>?)
              ?.map((e) => WatchOutItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      matchedResources: (json['matched_resources'] as List<dynamic>?)
              ?.map((e) => CivicResource.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      aiEngineUsed: json['ai_engine_used'] as String?,
      cached: json['cached'] as bool?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'summary': summary,
      'disclaimer_type': disclaimerType,
      'disclaimer_text': disclaimerText,
      'uncertainties': uncertainties,
      'supporting_evidence': supportingEvidence.map((e) => e.toJson()).toList(),
      'terms_explained': termsExplained.map((e) => e.toJson()).toList(),
      'action_steps': actionSteps.map((e) => e.toJson()).toList(),
      'questions_to_ask': questionsToAsk,
      'watch_out_for': watchOutFor.map((e) => e.toJson()).toList(),
      'matched_resources': matchedResources.map((e) => e.toJson()).toList(),
      'ai_engine_used': aiEngineUsed,
      'cached': cached,
    };
  }
}
