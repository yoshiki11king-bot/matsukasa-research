<?php

if (!defined('ABSPATH')) {
    exit;
}

function matsukasa_platform_core_register_rest_api_hooks(): void
{
    add_action('rest_api_init', 'matsukasa_platform_core_register_rest_routes');
}

function matsukasa_platform_core_register_rest_routes(): void
{
    register_rest_route(
        'matsukasa/v1',
        '/health',
        [
            'methods' => WP_REST_Server::READABLE,
            'callback' => 'matsukasa_platform_core_rest_health',
            'permission_callback' => '__return_true',
        ]
    );

    $content_routes = [
        'posts' => 'post',
        'reports' => 'report',
        'methodologies' => 'methodology',
        'researchers' => 'researcher',
        'charts' => 'chart',
        'datasets' => 'dataset',
        'short-readings' => 'short_read',
        'financial-statements' => 'financial_statement',
    ];

    foreach ($content_routes as $route => $post_type) {
        register_rest_route(
            'matsukasa/v1',
            '/' . $route,
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => static function (WP_REST_Request $request) use ($post_type): WP_REST_Response {
                    return matsukasa_platform_core_rest_list_content($request, $post_type);
                },
                'permission_callback' => '__return_true',
                'args' => matsukasa_platform_core_rest_collection_args(),
            ]
        );

        register_rest_route(
            'matsukasa/v1',
            '/' . $route . '/(?P<slug>[a-zA-Z0-9_-]+)',
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => static function (WP_REST_Request $request) use ($post_type): WP_REST_Response {
                    return matsukasa_platform_core_rest_get_content($request, $post_type);
                },
                'permission_callback' => '__return_true',
                'args' => [
                    'slug' => [
                        'required' => true,
                        'sanitize_callback' => 'sanitize_title',
                    ],
                ],
            ]
        );
    }

    register_rest_route(
        'matsukasa/v1',
        '/topics',
        [
            'methods' => WP_REST_Server::READABLE,
            'callback' => 'matsukasa_platform_core_rest_list_topics',
            'permission_callback' => '__return_true',
            'args' => matsukasa_platform_core_rest_collection_args(),
        ]
    );

    register_rest_route(
        'matsukasa/v1',
        '/finance',
        [
            'methods' => WP_REST_Server::READABLE,
            'callback' => static function (WP_REST_Request $request): WP_REST_Response {
                return matsukasa_platform_core_rest_get_named_page($request, 'finance');
            },
            'permission_callback' => '__return_true',
        ]
    );

    register_rest_route(
        'matsukasa/v1',
        '/director',
        [
            'methods' => WP_REST_Server::READABLE,
            'callback' => static function (WP_REST_Request $request): WP_REST_Response {
                return matsukasa_platform_core_rest_get_named_page($request, 'director');
            },
            'permission_callback' => '__return_true',
        ]
    );
}

function matsukasa_platform_core_rest_collection_args(): array
{
    return [
        'limit' => [
            'default' => 10,
            'sanitize_callback' => 'absint',
        ],
        'offset' => [
            'default' => 0,
            'sanitize_callback' => 'absint',
        ],
    ];
}

function matsukasa_platform_core_rest_health(): WP_REST_Response
{
    return new WP_REST_Response(
        [
            'name' => 'matsukasa-platform-core',
            'version' => MATSUKASA_PLATFORM_CORE_VERSION,
            'status' => 'scaffold',
            'namespace' => 'matsukasa/v1',
            'implementedRoutes' => [
                '/health',
                '/posts',
                '/posts/{slug}',
                '/reports',
                '/reports/{slug}',
                '/methodologies',
                '/methodologies/{slug}',
                '/researchers',
                '/researchers/{slug}',
                '/charts',
                '/charts/{slug}',
                '/datasets',
                '/datasets/{slug}',
                '/short-readings',
                '/short-readings/{slug}',
                '/financial-statements',
                '/financial-statements/{slug}',
                '/topics',
                '/finance',
                '/director',
            ],
        ],
        200
    );
}

function matsukasa_platform_core_rest_list_content(WP_REST_Request $request, string $post_type): WP_REST_Response
{
    $limit = matsukasa_platform_core_rest_limit($request);
    $offset = matsukasa_platform_core_rest_offset($request);

    $query = new WP_Query(
        [
            'post_type' => $post_type,
            'post_status' => 'publish',
            'posts_per_page' => $limit,
            'offset' => $offset,
            'orderby' => 'date',
            'order' => 'DESC',
            'no_found_rows' => false,
        ]
    );

    $contents = array_map(
        'matsukasa_platform_core_rest_serialize_post',
        $query->posts
    );

    return new WP_REST_Response(
        [
            'contents' => $contents,
            'totalCount' => (int) $query->found_posts,
            'limit' => $limit,
            'offset' => $offset,
        ],
        200
    );
}

function matsukasa_platform_core_rest_get_content(WP_REST_Request $request, string $post_type): WP_REST_Response
{
    $slug = (string) $request->get_param('slug');
    $post = matsukasa_platform_core_rest_find_post_by_slug($post_type, $slug);

    if (!$post) {
        return new WP_REST_Response(['message' => 'Content not found.'], 404);
    }

    return new WP_REST_Response(
        matsukasa_platform_core_rest_serialize_post($post),
        200
    );
}

function matsukasa_platform_core_rest_list_topics(WP_REST_Request $request): WP_REST_Response
{
    $limit = matsukasa_platform_core_rest_limit($request);
    $offset = matsukasa_platform_core_rest_offset($request);
    $terms = get_terms(
        [
            'taxonomy' => 'research_topic',
            'hide_empty' => false,
            'number' => $limit,
            'offset' => $offset,
        ]
    );

    if (is_wp_error($terms)) {
        return new WP_REST_Response(['contents' => [], 'totalCount' => 0, 'limit' => $limit, 'offset' => $offset], 200);
    }

    $all_terms = get_terms(
        [
            'taxonomy' => 'research_topic',
            'hide_empty' => false,
            'fields' => 'ids',
        ]
    );
    $total_count = is_wp_error($all_terms) ? count($terms) : count($all_terms);
    $contents = array_map(
        static function (WP_Term $term): array {
            return [
                'slug' => $term->slug,
                'name' => $term->name,
                'description' => $term->description,
            ];
        },
        $terms
    );

    return new WP_REST_Response(
        [
            'contents' => $contents,
            'totalCount' => $total_count,
            'limit' => $limit,
            'offset' => $offset,
        ],
        200
    );
}

function matsukasa_platform_core_rest_get_named_page(WP_REST_Request $request, string $slug): WP_REST_Response
{
    $post = matsukasa_platform_core_rest_find_post_by_slug('page', $slug);

    if (!$post) {
        return new WP_REST_Response(['message' => 'Page not found.'], 404);
    }

    return new WP_REST_Response(
        matsukasa_platform_core_rest_serialize_post($post),
        200
    );
}

function matsukasa_platform_core_rest_find_post_by_slug(string $post_type, string $slug): ?WP_Post
{
    $query = new WP_Query(
        [
            'post_type' => $post_type,
            'post_status' => 'publish',
            'name' => $slug,
            'posts_per_page' => 1,
            'no_found_rows' => true,
        ]
    );

    return $query->posts[0] ?? null;
}

function matsukasa_platform_core_rest_serialize_post(WP_Post $post): array
{
    $featured_image_id = get_post_thumbnail_id($post);

    return [
        'id' => $post->ID,
        'slug' => $post->post_name,
        'title' => get_the_title($post),
        'description' => matsukasa_platform_core_rest_meta_string($post->ID, 'description'),
        'excerpt' => get_the_excerpt($post),
        'status' => $post->post_status,
        'publishedAt' => get_post_time(DATE_ATOM, false, $post),
        'updatedAt' => get_post_modified_time(DATE_ATOM, false, $post),
        'body' => apply_filters('the_content', $post->post_content),
        'eyecatch' => $featured_image_id ? matsukasa_platform_core_rest_serialize_attachment($featured_image_id) : null,
        'pdfUrl' => matsukasa_platform_core_rest_meta_string($post->ID, 'pdfUrl'),
        'fileUrl' => matsukasa_platform_core_rest_meta_string($post->ID, 'fileUrl'),
        'fileFormat' => matsukasa_platform_core_rest_meta_string($post->ID, 'fileFormat'),
        'topics' => matsukasa_platform_core_rest_terms($post->ID, 'research_topic'),
        'regions' => matsukasa_platform_core_rest_terms($post->ID, 'research_region'),
        'formats' => matsukasa_platform_core_rest_terms($post->ID, 'content_format'),
        'citation' => matsukasa_platform_core_rest_meta_string($post->ID, 'citation'),
        'sourceNote' => matsukasa_platform_core_rest_meta_string($post->ID, 'sourceNote'),
        'methodologyNote' => matsukasa_platform_core_rest_meta_string($post->ID, 'methodologyNote'),
        'revisionNote' => matsukasa_platform_core_rest_meta_string($post->ID, 'revisionNote'),
        'fiscalYear' => matsukasa_platform_core_rest_meta_string($post->ID, 'fiscalYear'),
        'readingTime' => matsukasa_platform_core_rest_meta_string($post->ID, 'readingTime'),
        'role' => matsukasa_platform_core_rest_meta_string($post->ID, 'role'),
        'team' => matsukasa_platform_core_rest_meta_string($post->ID, 'team'),
        'email' => matsukasa_platform_core_rest_meta_string($post->ID, 'email'),
        'relatedMethodology' => matsukasa_platform_core_rest_meta_string_array($post->ID, 'relatedMethodology'),
        'relatedDataset' => matsukasa_platform_core_rest_meta_string_array($post->ID, 'relatedDataset'),
        'relatedCharts' => matsukasa_platform_core_rest_meta_string_array($post->ID, 'relatedCharts'),
        'relatedReports' => matsukasa_platform_core_rest_meta_string_array($post->ID, 'relatedReports'),
        'researcherSlugs' => matsukasa_platform_core_rest_meta_string_array($post->ID, 'researcherSlugs'),
        'methodologySlugs' => matsukasa_platform_core_rest_meta_string_array($post->ID, 'methodologySlugs'),
        'keyFindings' => matsukasa_platform_core_rest_meta_string_array($post->ID, 'keyFindings'),
        'highlights' => matsukasa_platform_core_rest_meta_string_array($post->ID, 'highlights'),
        'sources' => matsukasa_platform_core_rest_meta_array($post->ID, 'sources'),
        'chartData' => matsukasa_platform_core_rest_meta_array($post->ID, 'chartData'),
    ];
}

function matsukasa_platform_core_rest_serialize_attachment(int $attachment_id): array
{
    $metadata = wp_get_attachment_metadata($attachment_id);

    return [
        'url' => wp_get_attachment_url($attachment_id),
        'alt' => get_post_meta($attachment_id, '_wp_attachment_image_alt', true),
        'width' => is_array($metadata) && isset($metadata['width']) ? (int) $metadata['width'] : null,
        'height' => is_array($metadata) && isset($metadata['height']) ? (int) $metadata['height'] : null,
    ];
}

function matsukasa_platform_core_rest_terms(int $post_id, string $taxonomy): array
{
    $terms = get_the_terms($post_id, $taxonomy);

    if (!$terms || is_wp_error($terms)) {
        return [];
    }

    return array_map(
        static function (WP_Term $term): array {
            return [
                'slug' => $term->slug,
                'name' => $term->name,
                'description' => $term->description,
            ];
        },
        $terms
    );
}

function matsukasa_platform_core_rest_meta_string(int $post_id, string $field_name): string
{
    $value = get_post_meta($post_id, 'matsukasa_' . $field_name, true);

    return is_string($value) ? $value : '';
}

function matsukasa_platform_core_rest_meta_string_array(int $post_id, string $field_name): array
{
    $value = get_post_meta($post_id, 'matsukasa_' . $field_name, true);

    if (!is_array($value)) {
        return [];
    }

    return array_values(array_filter($value, 'is_string'));
}

function matsukasa_platform_core_rest_meta_array(int $post_id, string $field_name): array
{
    $value = get_post_meta($post_id, 'matsukasa_' . $field_name, true);

    return is_array($value) ? array_values($value) : [];
}

function matsukasa_platform_core_rest_limit(WP_REST_Request $request): int
{
    $limit = absint($request->get_param('limit'));

    if ($limit < 1) {
        return 10;
    }

    return min($limit, 100);
}

function matsukasa_platform_core_rest_offset(WP_REST_Request $request): int
{
    return absint($request->get_param('offset'));
}
