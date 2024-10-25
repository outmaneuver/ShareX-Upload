<?php
session_start();
require 'config.php';

function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function isStrongPassword($password) {
    $containsLetter  = preg_match('/[a-zA-Z]/', $password);
    $containsDigit   = preg_match('/\d/', $password);
    $containsSpecial = preg_match('/[^a-zA-Z\d]/', $password);
    $isLongEnough    = strlen($password) >= 8;

    return $containsLetter && $containsDigit && $containsSpecial && $isLongEnough;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $usernameOrEmail = $_POST['usernameOrEmail'];
    $password = $_POST['password'];

    if (empty($usernameOrEmail) || empty($password)) {
        echo "Please fill in all fields.";
        exit;
    }

    if (!isValidEmail($usernameOrEmail) && !preg_match('/^[a-zA-Z0-9_]+$/', $usernameOrEmail)) {
        echo "Invalid username or email format.";
        exit;
    }

    if (!isStrongPassword($password)) {
        echo "Password must be at least 8 characters long and include at least one letter, one number, and one special character.";
        exit;
    }

    $stmt = $conn->prepare("SELECT id, password, is_admin FROM users WHERE username = ? OR email = ?");
    $stmt->bind_param("ss", $usernameOrEmail, $usernameOrEmail);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $stmt->bind_result($id, $hashed_password, $is_admin);
        $stmt->fetch();

        if (password_verify($password, $hashed_password)) {
            $_SESSION['user_id'] = $id;
            if ($is_admin) {
                header("Location: admin_dashboard.php");
            } else {
                header("Location: dashboard.php");
            }
            exit;
        } else {
            echo "Invalid password.";
        }
    } else {
        echo "Username or email not found.";
    }

    $stmt->close();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
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
    <h2>Login</h2>
    <form method="POST" action="auth.php">
        <label for="usernameOrEmail">Username or Email:</label>
        <input type="text" id="usernameOrEmail" name="usernameOrEmail" required>
        <br>
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required>
        <br>
        <button type="submit">Login</button>
    </form>
    <a href="forgot_password.php">Forgot Password?</a>
</body>
</html>
