class FilterOption {
  final String labelEn;
  final String labelHi;
  final String value;

  const FilterOption({
    required this.labelEn,
    required this.labelHi,
    required this.value,
  });

  factory FilterOption.fromJson(Map<String, dynamic> json) {
    return FilterOption(
      labelEn: json['label_en'] as String? ?? '',
      labelHi: json['label_hi'] as String? ?? '',
      value: json['value'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'label_en': labelEn,
      'label_hi': labelHi,
      'value': value,
    };
  }
}

class CatalogItem {
  final String slug;
  final String resourceId;
  final String titleEn;
  final String titleHi;
  final String filterLabelEn;
  final String filterLabelHi;
  final String filterKey;
  final List<FilterOption> filterOptions;

  const CatalogItem({
    required this.slug,
    required this.resourceId,
    required this.titleEn,
    required this.titleHi,
    required this.filterLabelEn,
    required this.filterLabelHi,
    required this.filterKey,
    required this.filterOptions,
  });

  factory CatalogItem.fromJson(Map<String, dynamic> json) {
    return CatalogItem(
      slug: json['slug'] as String? ?? '',
      resourceId: json['resource_id'] as String? ?? '',
      titleEn: json['title_en'] as String? ?? '',
      titleHi: json['title_hi'] as String? ?? '',
      filterLabelEn: json['filter_label_en'] as String? ?? '',
      filterLabelHi: json['filter_label_hi'] as String? ?? '',
      filterKey: json['filter_key'] as String? ?? '',
      filterOptions: (json['filter_options'] as List<dynamic>?)
              ?.map((e) => FilterOption.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'slug': slug,
      'resource_id': resourceId,
      'title_en': titleEn,
      'title_hi': titleHi,
      'filter_label_en': filterLabelEn,
      'filter_label_hi': filterLabelHi,
      'filter_key': filterKey,
      'filter_options': filterOptions.map((e) => e.toJson()).toList(),
    };
  }
}

class DataGovSummary {
  final String summary;
  final String advice;
  final bool? cached;

  const DataGovSummary({
    required this.summary,
    required this.advice,
    this.cached,
  });

  factory DataGovSummary.fromJson(Map<String, dynamic> json) {
    return DataGovSummary(
      summary: json['summary'] as String? ?? '',
      advice: json['advice'] as String? ?? '',
      cached: json['cached'] as bool?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'summary': summary,
      'advice': advice,
      'cached': cached,
    };
  }
}

class SourceBadge {
  final String source;
  final bool isLive;
  final String timestamp;
  final String resourceId;

  const SourceBadge({
    required this.source,
    required this.isLive,
    required this.timestamp,
    required this.resourceId,
  });

  factory SourceBadge.fromJson(Map<String, dynamic> json) {
    return SourceBadge(
      source: json['source'] as String? ?? '',
      isLive: json['is_live'] as bool? ?? false,
      timestamp: json['timestamp'] as String? ?? '',
      resourceId: json['resource_id'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'source': source,
      'is_live': isLive,
      'timestamp': timestamp,
      'resource_id': resourceId,
    };
  }
}

class PublicDataResponse {
  final CatalogItem catalog;
  final String filterValue;
  final List<Map<String, dynamic>> rows;
  final DataGovSummary summary;
  final SourceBadge sourceBadge;

  const PublicDataResponse({
    required this.catalog,
    required this.filterValue,
    required this.rows,
    required this.summary,
    required this.sourceBadge,
  });

  factory PublicDataResponse.fromJson(Map<String, dynamic> json) {
    return PublicDataResponse(
      catalog: CatalogItem.fromJson(json['catalog'] as Map<String, dynamic>),
      filterValue: json['filter_value'] as String? ?? '',
      rows: (json['rows'] as List<dynamic>?)
              ?.map((e) => Map<String, dynamic>.from(e as Map))
              .toList() ??
          [],
      summary: DataGovSummary.fromJson(json['summary'] as Map<String, dynamic>),
      sourceBadge: SourceBadge.fromJson(json['source_badge'] as Map<String, dynamic>),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'catalog': catalog.toJson(),
      'filter_value': filterValue,
      'rows': rows,
      'summary': summary.toJson(),
      'source_badge': sourceBadge.toJson(),
    };
  }
}
