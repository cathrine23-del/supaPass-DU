CREATE DATABASE IF NOT EXISTS supapass_du
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_general_ci;

USE supapass_du;

CREATE TABLE IF NOT EXISTS users (
    id int(11) NOT NULL AUTO_INCREMENT,
    name varchar(100) NOT NULL,
    email varchar(150) NOT NULL,
    password varchar(255) NOT NULL,
    role enum('attendee', 'organizer') NOT NULL,
    created_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS events (
    id int(11) NOT NULL AUTO_INCREMENT,
    organizer_id int(11) NOT NULL,
    school_faculty varchar(100) NOT NULL,
    event_type varchar(30) NOT NULL,
    title varchar(150) NOT NULL,
    description text NOT NULL,
    category varchar(50) NOT NULL,
    event_date date NOT NULL,
    event_time time NOT NULL,
    venue varchar(150) NOT NULL,
    capacity int(11) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS bookings (
    id int(11) NOT NULL AUTO_INCREMENT,
    user_id int(11) NOT NULL,
    event_id int(11) NOT NULL,
    ticket_number varchar(30) NOT NULL,
    booking_date timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    status varchar(20) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
