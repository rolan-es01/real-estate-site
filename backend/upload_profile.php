<?php
include 'db_connection.php';
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    die(json_encode(['status' => 'error', 'message' => 'Not logged in']));
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $user_id = $_SESSION['user_id'];
    $display_name = $_POST['display_name'] ?? '';
    $response = ['status' => 'success'];

    // 1. Handle Image Upload if a file was sent
    if (isset($_FILES['profile_image']) && $_FILES['profile_image']['error'] == 0) {
        $file = $_FILES['profile_image'];
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $newFileName = "user_" . $user_id . "_" . time() . "." . $ext;
        $uploadPath = "assets/images/profiles/" . $newFileName;

        if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
            $sql = "UPDATE users SET profile_pic = ? WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("si", $newFileName, $user_id);
            $stmt->execute();
            $response['image_path'] = $uploadPath;
        }
    }

    // 2. Handle Name Update
    if (!empty($display_name)) {
        $sqlName = "UPDATE users SET full_name = ? WHERE id = ?";
        $stmtName = $conn->prepare($sqlName);
        $stmtName->bind_param("si", $display_name, $user_id);
        $stmtName->execute();
    }

    echo json_encode($response);
}
?>