import { defineSchema, defineTable } from "convex/server";
import { type Infer, v } from "convex/values";

const importStatus = v.optional(
  v.union(v.literal("importing"), v.literal("completed"), v.literal("failed")),
);
const exportStatus = v.optional(
  v.union(
    v.literal("exporting"),
    v.literal("completed"),
    v.literal("failed"),
    v.literal("cancelled"),
  ),
);

const projectsTable = defineTable({
  name: v.string(),
  // !TODO: change ownerId to v.id("user") after proper research on why the validation is failing
  ownerId: /*v.id("user") */ v.string(),
  updatedAt: v.number(),
  importStatus,
  exportStatus,
  exportRepoUrl: v.optional(v.string()),
}).index("by_owner_id", ["ownerId"]);

const schema = defineSchema({
  projects: projectsTable,
});
export default schema;

// const board = schema.tables.boards.validator;
// const column = schema.tables.columns.validator;
// const item = schema.tables.items.validator;

// export const updateBoardSchema = v.object({
//   id: board.fields.id,
//   name: v.optional(board.fields.name),
//   color: v.optional(v.string()),
// });

// export const updateColumnSchema = v.object({
//   id: column.fields.id,
//   boardId: column.fields.boardId,
//   name: v.optional(column.fields.name),
//   order: v.optional(column.fields.order),
// });

// export const deleteItemSchema = v.object({
//   id: item.fields.id,
//   boardId: item.fields.boardId,
// });
// const { order, id, ...rest } = column.fields;
// export const newColumnsSchema = v.object(rest);
// export const deleteColumnSchema = v.object({
//   boardId: column.fields.boardId,
//   id: column.fields.id,
// });

// export type Board = Infer<typeof board>;
// export type Column = Infer<typeof column>;
// export type Item = Infer<typeof item>;
