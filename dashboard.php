<?php
session_start();
require 'config.php';

if (!isset($_SESSION['user_id'])) {
    header("Location: auth.php");
    exit;
}

$user_id = $_SESSION['user_id'];

// Fetch user images
$stmt = $conn->prepare("SELECT id, filename FROM uploads WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$images = $result->fetch_all(MYSQLI_ASSOC);
$stmt->close();

// Fetch user settings
$stmt = $conn->prepare("SELECT file_name_length, upload_password FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($file_name_length, $upload_password);
$stmt->fetch();
$stmt->close();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (isset($_POST['delete_image'])) {
        $image_id = $_POST['image_id'];
        $stmt = $conn->prepare("DELETE FROM uploads WHERE id = ? AND user_id = ?");
        $stmt->bind_param("ii", $image_id, $user_id);
        $stmt->execute();
        $stmt->close();
        header("Location: dashboard.php");
        exit;
    }

    if (isset($_POST['update_settings'])) {
        $file_name_length = $_POST['file_name_length'];
        $upload_password = $_POST['upload_password'];
        $stmt = $conn->prepare("UPDATE users SET file_name_length = ?, upload_password = ? WHERE id = ?");
        $stmt->bind_param("isi", $file_name_length, $upload_password, $user_id);
        $stmt->execute();
        $stmt->close();
        header("Location: dashboard.php");
        exit;
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
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
    <h2>Dashboard</h2>
    <h3>Your Images</h3>
    <ul>
        <?php foreach ($images as $image): ?>
            <li>
                <img src="<?php echo $image['filename']; ?>" alt="Image" width="100">
                <form method="POST" action="dashboard.php">
                    <input type="hidden" name="image_id" value="<?php echo $image['id']; ?>">
                    <button type="submit" name="delete_image">Delete</button>
                </form>
            </li>
        <?php endforeach; ?>
    </ul>

    <h3>Settings</h3>
    <form method="POST" action="dashboard.php">
        <label for="file_name_length">File Name Length:</label>
        <input type="number" id="file_name_length" name="file_name_length" value="<?php echo $file_name_length; ?>" required>
        <br>
        <label for="upload_password">Upload Password:</label>
        <input type="password" id="upload_password" name="upload_password" value="<?php echo $upload_password; ?>" required>
        <br>
        <label for="domain">Select Domain:</label>
        <select id="domain" name="domain">
            <option value="domain1.com">domain1.com</option>
            <option value="domain2.com">domain2.com</option>
        </select>
        <br>
        <label for="hide_user_info">Hide User Information:</label>
        <input type="checkbox" id="hide_user_info" name="hide_user_info">
        <br>
        <button type="submit" name="update_settings">Update Settings</button>
    </form>
</body>
</html>
