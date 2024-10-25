<?php
require 'config.php';

$image_id = $_GET['id'] ?? null;

if (!$image_id) {
    echo "Image not found.";
    exit;
}

$stmt = $conn->prepare("SELECT uploads.filename, uploads.upload_date, users.username, uploads.hide_user_info FROM uploads JOIN users ON uploads.user_id = users.id WHERE uploads.id = ?");
$stmt->bind_param("i", $image_id);
$stmt->execute();
$stmt->bind_result($filename, $upload_date, $username, $hide_user_info);
$stmt->fetch();
$stmt->close();

if (!$filename) {
    echo "Image not found.";
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>View Image</title>
    <link rel="stylesheet" href="style.css">
    <script>
        function toggleMode() {
            var element = document.body;
            element.classList.toggle("dark-mode");
        }
    </script>
</head>
<body>
    <button onclick="toggleMode()">Toggle Light/Dark Mode</button>
    <h2>View Image</h2>
    <img src="<?php echo $filename; ?>" alt="Image" width="500">
    <?php if (!$hide_user_info): ?>
        <p>Uploaded by: <?php echo $username; ?></p>
        <p>Upload date: <?php echo $upload_date; ?></p>
    <?php endif; ?>
</body>
</html>
