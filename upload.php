<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', 'error_log.txt');

session_start();
require 'config.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Return 401 Unauthorized status code
    $json->status = "Failed";
    $json->errormsg = "Unauthorized access. Please log in.";
    echo(json_encode($json));
    exit;
}

$user_id = $_SESSION['user_id'];

// Fetch user settings
$stmt = $conn->prepare("SELECT file_name_length, upload_password, hide_user_info FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($file_name_length, $upload_password, $hide_user_info);
$stmt->fetch();
$stmt->close();

$allowedFiles = array("png", "jpg", "gif", "txt");
$maxFileSize = 5 * 1024 * 1024; // 5 MB

$sharexdir = "./"; // File directory

$json = new StdClass();

// Random file name generation
function RandomString($length) {
    return substr(str_shuffle(str_repeat($x='0123456789abcdefghijklmnopqrstuvwxyz', ceil($length/strlen($x)) )),1,$length);
}

// Check for token
if (isset($_POST['secret'])) {
    // Checks if token is valid
    if ($_POST['secret'] === $upload_password) {
        // Prepares for upload
        $filename = RandomString($file_name_length);
        $target_file = $_FILES["sharex"]["name"];
        $fileType = pathinfo($target_file, PATHINFO_EXTENSION);
        $fileSize = $_FILES["sharex"]["size"];

        // Check if mime type is listed
        if (!in_array($fileType, $allowedFiles)) {
            http_response_code(406); // Return 406 Not Acceptable status code
            $json->status = "Failed";
            $json->errormsg = "This filetype is not allowed!";
        // Check if file size is within limit
        } else if ($fileSize > $maxFileSize) {
            http_response_code(413); // Return 413 Payload Too Large status code
            $json->status = "Failed";
            $json->errormsg = "File size exceeds the maximum limit!";
        // Accepts and moves to directory
        } else if (move_uploaded_file($_FILES["sharex"]["tmp_name"], $sharexdir.$filename.'.'.$fileType)) {
            // Store file metadata in the database
            $stmt = $conn->prepare("INSERT INTO uploads (user_id, filename, hide_user_info) VALUES (?, ?, ?)");
            $stmt->bind_param("isi", $user_id, $filename.'.'.$fileType, $hide_user_info);
            $stmt->execute();
            $stmt->close();

            // Sends info to client
            $json->status = "OK";
            $json->errormsg = null;
            $json->url = $filename . '.' . $fileType;
        } else {
            // Warning
            http_response_code(400); // Return 400 Bad Request status code
            $json->status = "Failed";
            $json->errormsg = "File upload failed - CHMOD/Folder doesn't exist?";
        }
    } else {
        // Invalid key
        http_response_code(401); // Return 401 Unauthorized status code
        $json->status = "Failed";
        $json->errormsg = "Invalid Secret Key";
    }
} else {
    // Warning if no uploaded data
    http_response_code(400); // Return 400 Bad Request status code
    $json->status = "Failed";
    $json->errormsg = "No post data received";
}

// Sends json
echo(json_encode($json));
?>
