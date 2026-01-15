<?php
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "real_estate_db");

if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$user_input = $data['username']; // This is the string from the login form
$pass_input = $data['password'];

// 1. Fixed: Changed $input_user to $user_input
$sql = "SELECT username, password, profile_pic, display_name FROM users WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $user_input); 
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    // 2. verify password using the hashed password from the database ($row)
    if (password_verify($pass_input, $row['password'])) {
        session_start();
        $_SESSION['username'] = $row['username'];
        echo json_encode([
            'status' => 'success',
            'username' => $row['username'],
            'display_name' => $row['display_name'] ?? $row['username'],
            'profile_pic' => (!empty($row['profile_pic'])) ? $row['profile_pic'] : 'default-user.jpeg'
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid password."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "User not found."]);
}
?>