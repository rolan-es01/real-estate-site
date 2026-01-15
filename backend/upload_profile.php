<?php
session_start();
header('Content-Type: application/json');
include 'db_config.php'; 

$username = $_POST['username'] ?? ''; // This is your "ID" that doesn't change
$new_name = $_POST['display_name'] ?? ''; // This is the new nickname

if (isset($_FILES['profile_image']) && $_FILES['profile_image']['error'] == 0) {
    $file = $_FILES['profile_image'];
    $newFileName = "user_" . time() . "." . pathinfo($file['name'], PATHINFO_EXTENSION);
    $uploadPath = "../assets/images/profiles/" . $newFileName;

    if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
        // UPDATE display_name and profile_pic ONLY
        // We use the WHERE username clause so the inquiries stay linked!
        $sql = "UPDATE users SET profile_pic = ?, display_name = ? WHERE username = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sss", $newFileName, $new_name, $username);
        
        if ($stmt->execute()) {
            echo json_encode([
                'status' => 'success', 
                'image_path' => $newFileName,
                'name_to_show' => $new_name
            ]);
        }
    }
}
exit;