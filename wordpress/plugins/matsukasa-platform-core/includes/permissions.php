<?php

if (!defined('ABSPATH')) {
    exit;
}

function matsukasa_platform_core_register_permission_hooks(): void
{
    add_action('init', 'matsukasa_platform_core_register_editor_role');
}

function matsukasa_platform_core_register_editor_role(): void
{
    $capabilities = [
        'delete_pages' => true,
        'delete_posts' => true,
        'delete_published_pages' => true,
        'delete_published_posts' => true,
        'edit_pages' => true,
        'edit_posts' => true,
        'edit_published_pages' => true,
        'edit_published_posts' => true,
        'publish_pages' => true,
        'publish_posts' => true,
        'read' => true,
        'upload_files' => true,
    ];

    $role = get_role('matsukasa_editor');

    if (!$role) {
        add_role('matsukasa_editor', 'Matsukasa Editor', $capabilities);
        return;
    }

    foreach ($capabilities as $capability => $enabled) {
        if ($enabled) {
            $role->add_cap($capability);
        }
    }
}
