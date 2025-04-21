/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable("access_history", {
    id: "id",
    name: { type: "text", notNull: true },
    slug: { type: "text", notNull: true },
    access_time: { type: "timestamp", default: pgm.func("current_timestamp") },
    result: {
      type: "text",
      notNull: true,
      check: `result IN ('allow', 'block')`,
    },
    reason: { type: "text" },
  });

  pgm.createTable("blocked_names", {
    id: "id",
    value: { type: "text", notNull: true, unique: true },
  });

  pgm.createTable("blocked_slugs", {
    id: "id",
    value: { type: "text", notNull: true, unique: true },
  });

  pgm.createTable("allowed_names", {
    id: "id",
    value: { type: "text", notNull: true, unique: true },
  });

  pgm.createTable("allowed_slugs", {
    id: "id",
    value: { type: "text", notNull: true, unique: true },
  });

  pgm.createTable("verification_queue", {
    id: "id",
    name: { type: "text", notNull: true },
    slug: { type: "text", notNull: true },
    queued_at: { type: "timestamp", default: pgm.func("current_timestamp") },
    status: {
      type: "text",
      default: "pending",
      check: `status IN ('pending', 'reviewed')`,
    },
  });

  pgm.createTable("messages", {
    id: "id",
    name: { type: "text", notNull: true },
    slug: { type: "text", notNull: true },
    content: { type: "text", notNull: true },
    created_at: { type: "timestamp", default: pgm.func("current_timestamp") },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("messages");
  pgm.dropTable("verification_queue");
  pgm.dropTable("allowed_slugs");
  pgm.dropTable("allowed_names");
  pgm.dropTable("blocked_slugs");
  pgm.dropTable("blocked_names");
  pgm.dropTable("access_history");
};
