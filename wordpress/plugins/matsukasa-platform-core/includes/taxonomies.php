<?php

if (!defined('ABSPATH')) {
    exit;
}

function matsukasa_platform_core_register_taxonomy_hooks(): void
{
    add_action('init', 'matsukasa_platform_core_register_taxonomies');
}

function matsukasa_platform_core_register_taxonomies(): void
{
    $content_post_types = [
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

    register_taxonomy(
        'research_topic',
        $content_post_types,
        [
            'labels' => [
                'name' => 'Research Topics',
                'singular_name' => 'Research Topic',
            ],
            'public' => false,
            'show_ui' => true,
            'show_admin_column' => true,
            'show_in_rest' => true,
            'hierarchical' => false,
            'rewrite' => false,
        ]
    );

    register_taxonomy(
        'research_region',
        ['post', 'report', 'dataset', 'short_read', 'correction'],
        [
            'labels' => [
                'name' => 'Research Regions',
                'singular_name' => 'Research Region',
            ],
            'public' => false,
            'show_ui' => true,
            'show_admin_column' => true,
            'show_in_rest' => true,
            'hierarchical' => false,
            'rewrite' => false,
        ]
    );

    register_taxonomy(
        'content_format',
        ['post', 'report', 'methodology', 'dataset', 'short_read', 'correction'],
        [
            'labels' => [
                'name' => 'Content Formats',
                'singular_name' => 'Content Format',
            ],
            'public' => false,
            'show_ui' => true,
            'show_admin_column' => true,
            'show_in_rest' => true,
            'hierarchical' => false,
            'rewrite' => false,
        ]
    );
}
