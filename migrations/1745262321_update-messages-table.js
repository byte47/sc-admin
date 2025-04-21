/**
 * @type {import('node-pg-migrate').MigrationBuilder}
 */
exports.up = (pgm) => {
  // Only add new columns if they do not exist
  pgm.addColumns("messages", {
    from: { type: "text", notNull: true },
    to: { type: "text", notNull: true },
    text: { type: "text", notNull: true },
    is_flagged: { type: "boolean", notNull: true, default: false },
    time: { type: "timestamp" },
  });
  // Add unique constraint
  pgm.addConstraint("messages", "messages_from_text_time_key", {
    unique: ["from", "text", "time"],
  });
};

exports.down = (pgm) => {
  // Remove new columns and constraint
  pgm.dropConstraint("messages", "messages_from_text_time_key");
  pgm.dropColumns("messages", ["from", "to", "text", "is_flagged", "time"]);
};
