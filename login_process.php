<?php
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "real_estate_db");

if ($conn->connect_error) {
    echo json_encode(["status" => "error", "messsage" => "Database connection failed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$user = $data['username'];
$pass = $data['password'];

$stmt = $conn->prepare("SELECT password FROM users WHERE username = ?");
$stmt->bind_param("s", $user);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()){
    if (password_verify($pass, $row['password'])) {
        session_start();
        $_surrent_user['username'] = $user;
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid password."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "User not found."]);
}
?>