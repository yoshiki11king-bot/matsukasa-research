<?php

if (!defined('ABSPATH')) {
    exit;
}

function matsukasa_platform_core_register_media_hooks(): void
{
    add_filter('upload_mimes', 'matsukasa_platform_core_upload_mimes');
}

function matsukasa_platform_core_upload_mimes(array $mime_types): array
{
    $mime_types['csv'] = 'text/csv';
    $mime_types['tsv'] = 'text/tab-separated-values';
    $mime_types['json'] = 'application/json';
    $mime_types['geojson'] = 'application/geo+json';

    return $mime_types;
}
