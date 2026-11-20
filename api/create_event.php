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

$organizer_id   = intval($_POST["organizer_id"] ?? 0);
$school_faculty = trim($_POST["school_faculty"] ?? "");
$event_type     = trim($_POST["event_type"] ?? "");
$title          = trim($_POST["title"] ?? "");
$description    = trim($_POST["description"] ?? "");
$category       = trim($_POST["category"] ?? "");
$event_date     = $_POST["event_date"] ?? "";
$event_time     = $_POST["event_time"] ?? "";
$venue          = trim($_POST["venue"] ?? "");
$capacity       = intval($_POST["capacity"] ?? 0);

if (
    $organizer_id <= 0 ||
    $school_faculty === "" ||
    $event_type === "" ||
    $title === "" ||
    $description === "" ||
    $category === "" ||
    $event_date === "" ||
    $event_time === "" ||
    $venue === "" ||
    $capacity <= 0
) {
    echo json_encode([
        "success" => false,
        "message" => "Please fill in all event details."
    ]);
    exit;
}

$stmt = $conn->prepare(
    "INSERT INTO events
    (organizer_id, school_faculty, event_type, title, description, category,
     event_date, event_time, venue, capacity)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
);

$stmt->bind_param(
    "issssssssi",
    $organizer_id,
    $school_faculty,
    $event_type,
    $title,
    $description,
    $category,
    $event_date,
    $event_time,
    $venue,
    $capacity
);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Event created successfully.",
        "event_id" => $stmt->insert_id
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to create event."
    ]);
}

$stmt->close();
$conn->close();

?>