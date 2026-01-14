<?php
include 'db_config.php';

ini_set('display_errors', 1);
error_reporting(E_ALL);
$username = isset($_GET['user']) ? $_GET['user'] : '';

if (empty($username)) {
    echo json_encode(['success' => false, 'message' => 'No user provided']);
    exit;
}

// Use a subquery to get message count from 'messages' and profile pic from 'users'
$query = "SELECT 
            (SELECT COUNT(*) FROM messages WHERE username = ?) as total, 
            profile_pic 
          FROM users WHERE username = ?";

$stmt = $conn->prepare($query);
$stmt->bind_param("ss", $username, $username); // 'ss' for two strings
$stmt->execute();
$result = $stmt->get_result();
$data = $result->fetch_assoc();

// Send back the data for the dashboard
if ($data) {
    echo json_encode([
        'success' => true,
        'inquiry_count' => $data['total'],
        'profile_pic' => !empty($data['profile_pic']) ? $data['profile_pic'] : 'default-user.png'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'User not found'
    ]);
}
?>