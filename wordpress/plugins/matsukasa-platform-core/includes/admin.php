<?php

if (!defined('ABSPATH')) {
    exit;
}

function matsukasa_platform_core_register_admin_hooks(): void
{
    foreach (matsukasa_platform_core_admin_post_types() as $post_type) {
        add_filter(
            'manage_' . $post_type . '_posts_columns',
            'matsukasa_platform_core_admin_columns'
        );
        add_action(
            'manage_' . $post_type . '_posts_custom_column',
            'matsukasa_platform_core_admin_column_content',
            10,
            2
        );
    }

    add_action('add_meta_boxes', 'matsukasa_platform_core_register_meta_boxes');
    add_action('save_post', 'matsukasa_platform_core_save_meta_box');
}

function matsukasa_platform_core_admin_post_types(): array
{
    return [
        'post',
        'report',
        'methodology',
        'researcher',
        'chart',
        'dataset',
        'financial_statement',
        'short_read',
        'correction',
    ];
}

function matsukasa_platform_core_admin_meta_post_types(): array
{
    return array_merge(matsukasa_platform_core_admin_post_types(), ['page']);
}

function matsukasa_platform_core_admin_columns(array $columns): array
{
    $next_columns = [];

    foreach ($columns as $key => $label) {
        $next_columns[$key] = $label;

        if ($key === 'title') {
            $next_columns['matsukasa_slug'] = 'Slug';
            $next_columns['matsukasa_topics'] = 'Topics';
            $next_columns['matsukasa_updated'] = 'Updated';
        }
    }

    return $next_columns;
}

function matsukasa_platform_core_admin_column_content(string $column_name, int $post_id): void
{
    if ($column_name === 'matsukasa_slug') {
        $post = get_post($post_id);
        echo esc_html($post ? $post->post_name : '');
        return;
    }

    if ($column_name === 'matsukasa_topics') {
        $terms = get_the_terms($post_id, 'research_topic');

        if (!$terms || is_wp_error($terms)) {
            echo '&mdash;';
            return;
        }

        echo esc_html(
            implode(
                ', ',
                array_map(
                    static function (WP_Term $term): string {
                        return $term->name;
                    },
                    $terms
                )
            )
        );
        return;
    }

    if ($column_name === 'matsukasa_updated') {
        echo esc_html((string) get_post_modified_time('Y-m-d H:i', false, $post_id));
    }
}

function matsukasa_platform_core_register_meta_boxes(): void
{
    foreach (matsukasa_platform_core_admin_meta_post_types() as $post_type) {
        add_meta_box(
            'matsukasa_platform_core_meta',
            'Matsukasa Metadata',
            'matsukasa_platform_core_render_meta_box',
            $post_type,
            'normal',
            'default'
        );
    }
}

function matsukasa_platform_core_admin_meta_fields(): array
{
    return [
        'Core' => [
            'description' => ['label' => 'Description', 'type' => 'textarea'],
            'category' => ['label' => 'Category', 'type' => 'text'],
            'format' => ['label' => 'Format', 'type' => 'text'],
            'region' => ['label' => 'Region', 'type' => 'text'],
            'reportType' => ['label' => 'Report Type', 'type' => 'text'],
            'chartType' => ['label' => 'Chart Type', 'type' => 'text'],
            'fiscalYear' => ['label' => 'Fiscal Year', 'type' => 'text'],
            'readingTime' => ['label' => 'Reading Time', 'type' => 'text'],
            'effectiveDate' => ['label' => 'Effective Date', 'type' => 'text'],
        ],
        'Files and Links' => [
            'pdfUrl' => ['label' => 'PDF URL', 'type' => 'url'],
            'fileUrl' => ['label' => 'File URL', 'type' => 'url'],
            'fileFormat' => ['label' => 'File Format', 'type' => 'text'],
            'sources' => ['label' => 'Sources', 'type' => 'source_links'],
        ],
        'Relations' => [
            'relatedMethodology' => ['label' => 'Related Methodology Slugs', 'type' => 'string_array'],
            'relatedDataset' => ['label' => 'Related Dataset Slugs', 'type' => 'string_array'],
            'relatedCharts' => ['label' => 'Related Chart Slugs', 'type' => 'string_array'],
            'relatedReports' => ['label' => 'Related Report Slugs', 'type' => 'string_array'],
            'researcherSlugs' => ['label' => 'Researcher Slugs', 'type' => 'string_array'],
            'methodologySlugs' => ['label' => 'Methodology Slugs', 'type' => 'string_array'],
            'relatedReportSlugs' => ['label' => 'Dataset Related Report Slugs', 'type' => 'string_array'],
            'relatedChartSlugs' => ['label' => 'Dataset Related Chart Slugs', 'type' => 'string_array'],
        ],
        'Research Notes' => [
            'keyFindings' => ['label' => 'Key Findings', 'type' => 'string_array'],
            'highlights' => ['label' => 'Highlights', 'type' => 'string_array'],
            'focusTopics' => ['label' => 'Focus Topics', 'type' => 'string_array'],
            'goodFor' => ['label' => 'Good For', 'type' => 'string_array'],
            'limits' => ['label' => 'Limits', 'type' => 'string_array'],
            'citation' => ['label' => 'Citation', 'type' => 'textarea'],
            'sourceNote' => ['label' => 'Source Note', 'type' => 'textarea'],
            'methodologyNote' => ['label' => 'Methodology Note', 'type' => 'textarea'],
            'methodologySummary' => ['label' => 'Methodology Summary', 'type' => 'textarea'],
            'revisionNote' => ['label' => 'Revision Note', 'type' => 'textarea'],
            'sourceBasis' => ['label' => 'Source Basis', 'type' => 'text'],
            'reviewer' => ['label' => 'Reviewer', 'type' => 'text'],
        ],
        'People and Pages' => [
            'role' => ['label' => 'Role', 'type' => 'text'],
            'team' => ['label' => 'Team', 'type' => 'text'],
            'email' => ['label' => 'Email', 'type' => 'email'],
            'authors' => ['label' => 'Authors', 'type' => 'string_array'],
            'roleCards' => ['label' => 'Role Cards', 'type' => 'labeled_text_blocks'],
            'stanceTitle' => ['label' => 'Stance Title', 'type' => 'text'],
            'stanceDescription' => ['label' => 'Stance Description', 'type' => 'textarea'],
            'stanceCards' => ['label' => 'Stance Cards', 'type' => 'labeled_text_blocks'],
            'relatedSummary' => ['label' => 'Related Summary', 'type' => 'textarea'],
            'disclosureItems' => ['label' => 'Disclosure Items', 'type' => 'labeled_text_blocks'],
            'disclosureTable' => ['label' => 'Disclosure Table', 'type' => 'labeled_text_blocks'],
            'policyItems' => ['label' => 'Policy Items', 'type' => 'labeled_text_blocks'],
            'contactText' => ['label' => 'Contact Text', 'type' => 'textarea'],
        ],
        'Corrections and Charts' => [
            'targetType' => ['label' => 'Correction Target Type', 'type' => 'text'],
            'targetSlug' => ['label' => 'Correction Target Slug', 'type' => 'text'],
            'chartData' => ['label' => 'Chart Data JSON', 'type' => 'json'],
        ],
    ];
}

function matsukasa_platform_core_render_meta_box(WP_Post $post): void
{
    wp_nonce_field('matsukasa_platform_core_save_meta', 'matsukasa_platform_core_meta_nonce');

    echo '<p class="description">Fields here are exposed through the Matsukasa REST API. Leave a field blank to remove its value.</p>';
    echo '<style>
        .matsukasa-meta-grid { display: grid; gap: 16px; }
        .matsukasa-meta-group { border: 1px solid #dcdcde; padding: 12px; background: #fff; }
        .matsukasa-meta-group summary { cursor: pointer; font-weight: 600; }
        .matsukasa-meta-field { margin-top: 12px; }
        .matsukasa-meta-field label { display: block; font-weight: 600; margin-bottom: 4px; }
        .matsukasa-meta-field input,
        .matsukasa-meta-field textarea { width: 100%; max-width: 860px; }
        .matsukasa-meta-field textarea { min-height: 86px; }
        .matsukasa-meta-hint { color: #646970; font-size: 12px; margin-top: 4px; }
    </style>';
    echo '<div class="matsukasa-meta-grid">';

    foreach (matsukasa_platform_core_admin_meta_fields() as $group_label => $fields) {
        echo '<details class="matsukasa-meta-group" open>';
        echo '<summary>' . esc_html($group_label) . '</summary>';

        foreach ($fields as $field_name => $field_config) {
            matsukasa_platform_core_render_meta_field($post->ID, $field_name, $field_config);
        }

        echo '</details>';
    }

    echo '</div>';
}

function matsukasa_platform_core_render_meta_field(int $post_id, string $field_name, array $field_config): void
{
    $type = $field_config['type'];
    $meta_key = 'matsukasa_' . $field_name;
    $value = get_post_meta($post_id, $meta_key, true);
    $input_name = 'matsukasa_meta[' . esc_attr($field_name) . ']';
    $display_value = matsukasa_platform_core_format_meta_value_for_edit($value, $type);

    echo '<div class="matsukasa-meta-field">';
    echo '<label for="matsukasa_meta_' . esc_attr($field_name) . '">' . esc_html($field_config['label']) . '</label>';

    if ($type === 'textarea' || $type === 'string_array' || $type === 'source_links' || $type === 'labeled_text_blocks' || $type === 'json') {
        echo '<textarea id="matsukasa_meta_' . esc_attr($field_name) . '" name="' . $input_name . '">' . esc_textarea($display_value) . '</textarea>';
    } else {
        $input_type = in_array($type, ['url', 'email'], true) ? $type : 'text';
        echo '<input id="matsukasa_meta_' . esc_attr($field_name) . '" type="' . esc_attr($input_type) . '" name="' . $input_name . '" value="' . esc_attr($display_value) . '" />';
    }

    $hint = matsukasa_platform_core_meta_field_hint($type);
    if ($hint !== '') {
        echo '<p class="matsukasa-meta-hint">' . esc_html($hint) . '</p>';
    }

    echo '</div>';
}

function matsukasa_platform_core_format_meta_value_for_edit($value, string $type): string
{
    if ($value === '' || $value === null) {
        return '';
    }

    if ($type === 'string_array' && is_array($value)) {
        return implode("\n", array_map('strval', $value));
    }

    if ($type === 'source_links' && is_array($value)) {
        return implode("\n", array_map('matsukasa_platform_core_format_source_link_line', $value));
    }

    if ($type === 'labeled_text_blocks' && is_array($value)) {
        return implode("\n", array_map('matsukasa_platform_core_format_labeled_text_block_line', $value));
    }

    if ($type === 'json') {
        return is_array($value) ? (string) wp_json_encode($value, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) : (string) $value;
    }

    return is_scalar($value) ? (string) $value : '';
}

function matsukasa_platform_core_format_source_link_line($item): string
{
    if (!is_array($item)) {
        return '';
    }

    return trim(($item['label'] ?? '') . ' | ' . ($item['url'] ?? ''));
}

function matsukasa_platform_core_format_labeled_text_block_line($item): string
{
    if (!is_array($item)) {
        return '';
    }

    return trim(($item['label'] ?? '') . ' | ' . ($item['title'] ?? '') . ' | ' . ($item['text'] ?? ''));
}

function matsukasa_platform_core_meta_field_hint(string $type): string
{
    if ($type === 'string_array') {
        return 'Enter one item per line.';
    }

    if ($type === 'source_links') {
        return 'Enter one source per line as: label | url';
    }

    if ($type === 'labeled_text_blocks') {
        return 'Enter one block per line as: label | title | text';
    }

    if ($type === 'json') {
        return 'Enter valid JSON. Blank removes the value; invalid JSON keeps the previous value.';
    }

    return '';
}

function matsukasa_platform_core_save_meta_box(int $post_id): void
{
    if (!isset($_POST['matsukasa_platform_core_meta_nonce'])) {
        return;
    }

    if (!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['matsukasa_platform_core_meta_nonce'])), 'matsukasa_platform_core_save_meta')) {
        return;
    }

    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }

    if (wp_is_post_revision($post_id) || !current_user_can('edit_post', $post_id)) {
        return;
    }

    $submitted = isset($_POST['matsukasa_meta']) && is_array($_POST['matsukasa_meta'])
        ? wp_unslash($_POST['matsukasa_meta'])
        : [];

    foreach (matsukasa_platform_core_flatten_meta_fields() as $field_name => $field_config) {
        $meta_key = 'matsukasa_' . $field_name;
        $raw_value = $submitted[$field_name] ?? '';
        $sanitized_value = matsukasa_platform_core_sanitize_admin_meta_value($raw_value, $field_config['type']);

        if ($sanitized_value === null) {
            continue;
        }

        if ($sanitized_value === '' || $sanitized_value === []) {
            delete_post_meta($post_id, $meta_key);
            continue;
        }

        update_post_meta($post_id, $meta_key, $sanitized_value);
    }
}

function matsukasa_platform_core_flatten_meta_fields(): array
{
    $fields = [];

    foreach (matsukasa_platform_core_admin_meta_fields() as $group_fields) {
        foreach ($group_fields as $field_name => $field_config) {
            $fields[$field_name] = $field_config;
        }
    }

    return $fields;
}

function matsukasa_platform_core_sanitize_admin_meta_value($value, string $type)
{
    $value = is_string($value) ? trim($value) : $value;

    if ($value === '' || $value === null) {
        return $type === 'json' || $type === 'string_array' || $type === 'source_links' || $type === 'labeled_text_blocks' ? [] : '';
    }

    if ($type === 'textarea') {
        return sanitize_textarea_field((string) $value);
    }

    if ($type === 'url') {
        return esc_url_raw((string) $value);
    }

    if ($type === 'email') {
        return sanitize_email((string) $value);
    }

    if ($type === 'string_array') {
        return matsukasa_platform_core_sanitize_string_array(matsukasa_platform_core_parse_lines((string) $value));
    }

    if ($type === 'source_links') {
        return matsukasa_platform_core_sanitize_source_links(matsukasa_platform_core_parse_source_links((string) $value));
    }

    if ($type === 'labeled_text_blocks') {
        return matsukasa_platform_core_sanitize_labeled_text_blocks(matsukasa_platform_core_parse_labeled_text_blocks((string) $value));
    }

    if ($type === 'json') {
        $decoded = json_decode((string) $value, true);
        return is_array($decoded) ? matsukasa_platform_core_sanitize_chart_data($decoded) : null;
    }

    return sanitize_text_field((string) $value);
}

function matsukasa_platform_core_parse_lines(string $value): array
{
    return array_values(
        array_filter(
            array_map('trim', preg_split('/\r\n|\r|\n/', $value) ?: []),
            static function (string $line): bool {
                return $line !== '';
            }
        )
    );
}

function matsukasa_platform_core_parse_source_links(string $value): array
{
    return array_map(
        static function (string $line): array {
            $parts = array_map('trim', explode('|', $line, 2));
            return [
                'label' => $parts[0] ?? '',
                'url' => $parts[1] ?? '',
            ];
        },
        matsukasa_platform_core_parse_lines($value)
    );
}

function matsukasa_platform_core_parse_labeled_text_blocks(string $value): array
{
    return array_map(
        static function (string $line): array {
            $parts = array_map('trim', explode('|', $line, 3));
            return [
                'label' => $parts[0] ?? '',
                'title' => $parts[1] ?? '',
                'text' => $parts[2] ?? '',
            ];
        },
        matsukasa_platform_core_parse_lines($value)
    );
}
