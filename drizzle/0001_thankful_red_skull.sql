CREATE TABLE `cartItems` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`productId` varchar(64) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`selectedColor` varchar(100),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cartItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`totalAmount` int NOT NULL,
	`status` enum('pending','completed','failed','cancelled') DEFAULT 'pending',
	`paymentMethod` varchar(50),
	`paymentId` varchar(255),
	`items` json,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`price` int NOT NULL,
	`image` varchar(500),
	`colors` json,
	`category` varchar(100),
	`inStock` boolean DEFAULT true,
	`comingSoon` boolean DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supportConversations` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`productId` varchar(64),
	`messages` json,
	`resolved` boolean DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `supportConversations_id` PRIMARY KEY(`id`)
);
