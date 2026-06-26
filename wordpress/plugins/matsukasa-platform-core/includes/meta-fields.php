<?php

if (!defined('ABSPATH')) {
    exit;
}

function matsukasa_platform_core_register_meta_field_hooks(): void
{
    add_action('init', 'matsukasa_platform_core_register_meta_fields');
}

function matsukasa_platform_core_register_meta_fields(): void
{
    $string_fields = [
        'description',
        'pdfUrl',
        'fileUrl',
        'fileFormat',
        'citation',
        'sourceNote',
        'methodologyNote',
        'revisionNote',
        'fiscalYear',
        'readingTime',
        'role',
        'team',
        'email',
        'targetType',
        'targetSlug',
        'effectiveDate',
        'stanceTitle',
        'stanceDescription',
        'relatedSummary',
        'contactText',
        'sourceBasis',
        'reviewer',
        'reportType',
        'category',
        'format',
        'region',
        'methodologySummary',
        'chartType',
    ];

    $string_array_fields = [
        'relatedMethodology',
        'relatedDataset',
        'relatedCharts',
        'relatedReports',
        'researcherSlugs',
        'methodologySlugs',
        'keyFindings',
        'highlights',
        'focusTopics',
        'goodFor',
        'limits',
        'relatedReportSlugs',
        'relatedChartSlugs',
        'authors',
    ];

    $labeled_text_block_fields = [
        'roleCards',
        'stanceCards',
        'disclosureItems',
        'disclosureTable',
        'policyItems',
    ];

    $post_types = [
        'post',
        'report',
        'methodology',
        'researcher',
        'chart',
        'dataset',
        'financial_statement',
        'short_read',
        'correction',
        'page',
    ];

    foreach ($post_types as $post_type) {
        foreach ($string_fields as $field_name) {
            register_post_meta(
                $post_type,
                'matsukasa_' . $field_name,
                [
                    'type' => 'string',
                    'single' => true,
                    'show_in_rest' => true,
                    'sanitize_callback' => 'sanitize_text_field',
                    'auth_callback' => 'matsukasa_platform_core_can_edit_meta',
                ]
            );
        }

        foreach ($string_array_fields as $field_name) {
            register_post_meta(
                $post_type,
                'matsukasa_' . $field_name,
                [
                    'type' => 'array',
                    'single' => true,
                    'show_in_rest' => [
                        'schema' => [
                            'type' => 'array',
                            'items' => [
                                'type' => 'string',
                            ],
                        ],
                    ],
                    'sanitize_callback' => 'matsukasa_platform_core_sanitize_string_array',
                    'auth_callback' => 'matsukasa_platform_core_can_edit_meta',
                ]
            );
        }

        foreach ($labeled_text_block_fields as $field_name) {
            register_post_meta(
                $post_type,
                'matsukasa_' . $field_name,
                [
                    'type' => 'array',
                    'single' => true,
                    'show_in_rest' => [
                        'schema' => [
                            'type' => 'array',
                            'items' => [
                                'type' => 'object',
                                'properties' => [
                                    'label' => [
                                        'type' => 'string',
                                    ],
                                    'title' => [
                                        'type' => 'string',
                                    ],
                                    'text' => [
                                        'type' => 'string',
                                    ],
                                ],
                            ],
                        ],
                    ],
                    'sanitize_callback' => 'matsukasa_platform_core_sanitize_labeled_text_blocks',
                    'auth_callback' => 'matsukasa_platform_core_can_edit_meta',
                ]
            );
        }

        register_post_meta(
            $post_type,
            'matsukasa_sources',
            [
                'type' => 'array',
                'single' => true,
                'show_in_rest' => [
                    'schema' => [
                        'type' => 'array',
                        'items' => [
                            'type' => 'object',
                            'properties' => [
                                'label' => [
                                    'type' => 'string',
                                ],
                                'url' => [
                                    'type' => 'string',
                                ],
                            ],
                        ],
                    ],
                ],
                'sanitize_callback' => 'matsukasa_platform_core_sanitize_source_links',
                'auth_callback' => 'matsukasa_platform_core_can_edit_meta',
            ]
        );

        register_post_meta(
            $post_type,
            'matsukasa_chartData',
            [
                'type' => 'array',
                'single' => true,
                'show_in_rest' => [
                    'schema' => [
                        'type' => 'array',
                        'items' => [
                            'type' => 'object',
                        ],
                    ],
                ],
                'sanitize_callback' => 'matsukasa_platform_core_sanitize_chart_data',
                'auth_callback' => 'matsukasa_platform_core_can_edit_meta',
            ]
        );
    }
}

function matsukasa_platform_core_can_edit_meta(): bool
{
    return current_user_can('edit_posts');
}

function matsukasa_platform_core_sanitize_string_array($value): array
{
    if (!is_array($value)) {
        return [];
    }

    return array_values(array_map('sanitize_text_field', $value));
}

function matsukasa_platform_core_sanitize_source_links($value): array
{
    if (!is_array($value)) {
        return [];
    }

    $items = [];

    foreach ($value as $item) {
        if (!is_array($item)) {
            continue;
        }

        $label = isset($item['label']) ? sanitize_text_field($item['label']) : '';
        $url = isset($item['url']) ? esc_url_raw($item['url']) : '';

        if ($label === '' && $url === '') {
            continue;
        }

        $items[] = [
            'label' => $label,
            'url' => $url,
        ];
    }

    return $items;
}

function matsukasa_platform_core_sanitize_labeled_text_blocks($value): array
{
    if (!is_array($value)) {
        return [];
    }

    $items = [];

    foreach ($value as $item) {
        if (!is_array($item)) {
            continue;
        }

        $label = isset($item['label']) ? sanitize_text_field($item['label']) : '';
        $title = isset($item['title']) ? sanitize_text_field($item['title']) : '';
        $text = isset($item['text']) ? sanitize_textarea_field($item['text']) : '';

        if ($label === '' && $title === '' && $text === '') {
            continue;
        }

        $items[] = [
            'label' => $label,
            'title' => $title,
            'text' => $text,
        ];
    }

    return $items;
}

function matsukasa_platform_core_sanitize_chart_data($value): array
{
    if (!is_array($value)) {
        return [];
    }

    return array_values(array_filter($value, 'is_array'));
}
