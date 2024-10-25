<?php
require 'config.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $token = $_POST['token'];
    $new_password = $_POST['new_password'];
    $confirm_password = $_POST['confirm_password'];

    if (empty($token) || empty($new_password) || empty($confirm_password)) {
        echo "Please fill in all fields.";
        exit;
    }

    if ($new_password !== $confirm_password) {
        echo "Passwords do not match.";
        exit;
    }

    if (!isStrongPassword($new_password)) {
        echo "Password must be at least 8 characters long and include at least one letter, one number, and one special character.";
        exit;
    }

    $stmt = $conn->prepare("SELECT email FROM password_resets WHERE token = ?");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $stmt->bind_result($email);
    $stmt->fetch();
    $stmt->close();

    if ($email) {
        $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);

        $stmt = $conn->prepare("UPDATE users SET password = ? WHERE email = ?");
        $stmt->bind_param("ss", $hashed_password, $email);
        $stmt->execute();
        $stmt->close();

        $stmt = $conn->prepare("DELETE FROM password_resets WHERE token = ?");
        $stmt->bind_param("s", $token);
        $stmt->execute();
        $stmt->close();

        echo "Password reset successful. You can now <a href='auth.php'>login</a>.";
    } else {
        echo "Invalid token.";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password</title>
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
    <h2>Reset Password</h2>
    <form method="POST" action="reset_password.php">
        <input type="hidden" name="token" value="<?php echo $_GET['token']; ?>" required>
        <label for="new_password">New Password:</label>
        <input type="password" id="new_password" name="new_password" required>
        <br>
        <label for="confirm_password">Confirm Password:</label>
        <input type="password" id="confirm_password" name="confirm_password" required>
        <br>
        <button type="submit">Reset Password</button>
    </form>
</body>
</html>
