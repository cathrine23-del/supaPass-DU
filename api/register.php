<?php

header("Content-Type: application/json");

require_once "../config/database.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request method."
    ]);
    exit;
}

$name = $_POST["name"] ?? "";
$email = $_POST["email"] ?? "";
$password = $_POST["password"] ?? "";
$role = $_POST["role"] ?? "attendee";

if ($name === "" || $email === "" || $password === "") {
    echo json_encode([
        "success" => false,
        "message" => "Please fill in all required fields."
    ]);
    exit;
}

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$sql = "INSERT INTO users (name, email, password, role)
        VALUES (?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ssss", $name, $email, $hashedPassword, $role);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Registration successful."
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Registration failed."
    ]);
}

$stmt->close();
$conn->close();

?>