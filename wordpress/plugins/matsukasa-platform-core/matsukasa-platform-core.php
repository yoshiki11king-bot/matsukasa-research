<?php
/**
 * Plugin Name: Matsukasa Platform Core
 * Description: Core content platform scaffolding for Matsukasa Research Center.
 * Version: 0.1.0
 * Author: Matsukasa Research Center
 * License: GPL-2.0-or-later
 * Text Domain: matsukasa-platform-core
 */

if (!defined('ABSPATH')) {
    exit;
}

define('MATSUKASA_PLATFORM_CORE_VERSION', '0.1.0');
define('MATSUKASA_PLATFORM_CORE_PATH', plugin_dir_path(__FILE__));

require_once MATSUKASA_PLATFORM_CORE_PATH . 'includes/post-types.php';
require_once MATSUKASA_PLATFORM_CORE_PATH . 'includes/taxonomies.php';
require_once MATSUKASA_PLATFORM_CORE_PATH . 'includes/meta-fields.php';
require_once MATSUKASA_PLATFORM_CORE_PATH . 'includes/rest-api.php';
require_once MATSUKASA_PLATFORM_CORE_PATH . 'includes/media.php';
require_once MATSUKASA_PLATFORM_CORE_PATH . 'includes/admin.php';
require_once MATSUKASA_PLATFORM_CORE_PATH . 'includes/permissions.php';

add_action('plugins_loaded', 'matsukasa_platform_core_boot');

function matsukasa_platform_core_boot(): void
{
    matsukasa_platform_core_register_post_type_hooks();
    matsukasa_platform_core_register_taxonomy_hooks();
    matsukasa_platform_core_register_meta_field_hooks();
    matsukasa_platform_core_register_rest_api_hooks();
    matsukasa_platform_core_register_media_hooks();
    matsukasa_platform_core_register_admin_hooks();
    matsukasa_platform_core_register_permission_hooks();
}
