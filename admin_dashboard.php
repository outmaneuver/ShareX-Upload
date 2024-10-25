<?php
session_start();
require 'config.php';

if (!isset($_SESSION['user_id'])) {
    header("Location: auth.php");
    exit;
}

$user_id = $_SESSION['user_id'];

// Check if the user is an administrator
$stmt = $conn->prepare("SELECT is_admin FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($is_admin);
$stmt->fetch();
$stmt->close();

if (!$is_admin) {
    header("Location: dashboard.php");
    exit;
}

// Fetch announcements
$announcements = [];
$stmt = $conn->prepare("SELECT id, content FROM announcements ORDER BY created_at DESC");
$stmt->execute();
$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
    $announcements[] = $row;
}
$stmt->close();

// Fetch current forgot password domain
$stmt = $conn->prepare("SELECT value FROM site_statistics WHERE name = 'forgot_password_domain'");
$stmt->execute();
$stmt->bind_result($forgot_password_domain);
$stmt->fetch();
$stmt->close();

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (isset($_POST['post_announcement'])) {
        $content = $_POST['announcement_content'];
        $stmt = $conn->prepare("INSERT INTO announcements (content) VALUES (?)");
        $stmt->bind_param("s", $content);
        $stmt->execute();
        $stmt->close();
        header("Location: admin_dashboard.php");
        exit;
    }

    if (isset($_POST['suspend_user'])) {
        $user_id_to_suspend = $_POST['user_id'];
        $stmt = $conn->prepare("UPDATE users SET is_suspended = 1 WHERE id = ?");
        $stmt->bind_param("i", $user_id_to_suspend);
        $stmt->execute();
        $stmt->close();
        header("Location: admin_dashboard.php");
        exit;
    }

    if (isset($_POST['delete_user'])) {
        $user_id_to_delete = $_POST['user_id'];
        $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
        $stmt->bind_param("i", $user_id_to_delete);
        $stmt->execute();
        $stmt->close();
        header("Location: admin_dashboard.php");
        exit;
    }

    if (isset($_POST['set_upload_size'])) {
        $user_id_to_set = $_POST['user_id'];
        $upload_size = $_POST['upload_size'];
        $stmt = $conn->prepare("UPDATE users SET upload_size = ? WHERE id = ?");
        $stmt->bind_param("ii", $upload_size, $user_id_to_set);
        $stmt->execute();
        $stmt->close();
        header("Location: admin_dashboard.php");
        exit;
    }

    if (isset($_POST['update_forgot_password_domain'])) {
        $new_domain = $_POST['forgot_password_domain'];
        $stmt = $conn->prepare("UPDATE site_statistics SET value = ? WHERE name = 'forgot_password_domain'");
        $stmt->bind_param("s", $new_domain);
        $stmt->execute();
        $stmt->close();
        header("Location: admin_dashboard.php");
        exit;
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard</title>
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
    <h2>Admin Dashboard</h2>

    <h3>Announcements</h3>
    <form method="POST" action="admin_dashboard.php">
        <textarea name="announcement_content" required></textarea>
        <br>
        <button type="submit" name="post_announcement">Post Announcement</button>
    </form>
    <ul>
        <?php foreach ($announcements as $announcement): ?>
            <li><?php echo $announcement['content']; ?></li>
        <?php endforeach; ?>
    </ul>

    <h3>User Management</h3>
    <form method="POST" action="admin_dashboard.php">
        <label for="user_id">User ID:</label>
        <input type="number" id="user_id" name="user_id" required>
        <br>
        <button type="submit" name="suspend_user">Suspend User</button>
        <button type="submit" name="delete_user">Delete User</button>
        <br>
        <label for="upload_size">Set Upload Size (MB):</label>
        <input type="number" id="upload_size" name="upload_size" required>
        <br>
        <button type="submit" name="set_upload_size">Set Upload Size</button>
    </form>

    <h3>Forgot Password Domain</h3>
    <form method="POST" action="admin_dashboard.php">
        <label for="forgot_password_domain">Forgot Password Domain:</label>
        <input type="text" id="forgot_password_domain" name="forgot_password_domain" value="<?php echo $forgot_password_domain; ?>" required>
        <br>
        <button type="submit" name="update_forgot_password_domain">Update Domain</button>
    </form>
</body>
</html>
