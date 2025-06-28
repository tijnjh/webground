CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`short_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`html_code` text DEFAULT '' NOT NULL,
	`css_code` text DEFAULT '' NOT NULL,
	`js_code` text DEFAULT '' NOT NULL,
	`user_id` text,
	`is_public` integer DEFAULT true NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_short_id_unique` ON `projects` (`short_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);