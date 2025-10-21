CREATE TABLE `categoryMessages` (
	`id` varchar(64) NOT NULL,
	`categoryId` varchar(64) NOT NULL,
	`message` text NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categoryMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `products` ADD `customMessage` text;