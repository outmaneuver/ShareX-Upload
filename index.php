<?php
require 'config.php';
require 'upload.php';

$request_uri = $_SERVER['REQUEST_URI'];
$filename = basename($request_uri);

$extension = getFileExtension($filename);
if (!$extension) {
    echo "File not found.";
    exit;
}

$full_filename = $filename . '.' . $extension;
$file_path = './' . $full_filename;

if (!file_exists($file_path)) {
    echo "File not found.";
    exit;
}

header('Content-Type: ' . mime_content_type($file_path));
readfile($file_path);
?>
