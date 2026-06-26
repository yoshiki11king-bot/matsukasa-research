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
