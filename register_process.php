<?php
header("Content-Type: application/json");
$conn = new mysqli("localhost", "root", "", "real_estate_db");

$data = json_decode(file_get_contents("php://input"), true);
$user = $data['username'];
$email = $data['email'];
$pass = $data['password'];

// hashing the password
$hashed_pass = password_hash($pass, PASSWORD_DEFAULT);

// checking for username
$check = $conn->prepare("SELECT id FROM users WHERE username = ?");
$check->bind_param("s", $user);
$check->execute();
if ($check->get_result()->num_rows > 0) {
    echo json_encode(["status" => "error",  "message" => "Username already taken"]);
    exit;
}

//inserting new user
$stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $user, $email, $hashed_pass);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => "Registration Failed"]);
}
?>