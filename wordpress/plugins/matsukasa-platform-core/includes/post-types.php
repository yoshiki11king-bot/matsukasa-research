<?php

if (!defined('ABSPATH')) {
    exit;
}

function matsukasa_platform_core_register_post_type_hooks(): void
{
    add_action('init', 'matsukasa_platform_core_register_post_types');
}

function matsukasa_platform_core_register_post_types(): void
{
    $post_types = [
        'report' => [
            'singular' => 'Report',
            'plural' => 'Reports',
            'menu_icon' => 'dashicons-media-document',
            'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions', 'author'],
        ],
        'methodology' => [
            'singular' => 'Methodology',
            'plural' => 'Methodologies',
            'menu_icon' => 'dashicons-clipboard',
            'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions', 'author'],
        ],
        'researcher' => [
            'singular' => 'Researcher',
            'plural' => 'Researchers',
            'menu_icon' => 'dashicons-groups',
            'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions'],
        ],
        'chart' => [
            'singular' => 'Chart',
            'plural' => 'Charts',
            'menu_icon' => 'dashicons-chart-bar',
            'supports' => ['title', 'editor', 'excerpt', 'revisions', 'author'],
        ],
        'dataset' => [
            'singular' => 'Dataset',
            'plural' => 'Datasets',
            'menu_icon' => 'dashicons-database',
            'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions', 'author'],
        ],
        'financial_statement' => [
            'singular' => 'Financial Statement',
            'plural' => 'Financial Statements',
            'menu_icon' => 'dashicons-media-spreadsheet',
            'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions', 'author'],
        ],
        'short_read' => [
            'singular' => 'Short Read',
            'plural' => 'Short Reads',
            'menu_icon' => 'dashicons-text-page',
            'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions', 'author'],
        ],
    ];

    foreach ($post_types as $post_type => $config) {
        register_post_type(
            $post_type,
            [
                'labels' => [
                    'name' => $config['plural'],
                    'singular_name' => $config['singular'],
                    'add_new_item' => 'Add New ' . $config['singular'],
                    'edit_item' => 'Edit ' . $config['singular'],
                    'new_item' => 'New ' . $config['singular'],
                    'view_item' => 'View ' . $config['singular'],
                    'search_items' => 'Search ' . $config['plural'],
                    'not_found' => 'No ' . strtolower($config['plural']) . ' found',
                ],
                'public' => false,
                'show_ui' => true,
                'show_in_menu' => true,
                'show_in_rest' => true,
                'rest_base' => $post_type,
                'menu_icon' => $config['menu_icon'],
                'supports' => $config['supports'],
                'has_archive' => false,
                'rewrite' => false,
                'capability_type' => 'post',
                'map_meta_cap' => true,
            ]
        );
    }
}
