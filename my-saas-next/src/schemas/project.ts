// src/schemas/project.ts
// Zod validation schemas for Project and Task operations

import { z } from 'zod';

// Project status enum
export const ProjectStatusSchema = z.enum(['active', 'completed', 'archived']);
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

// Task status enum
export const TaskStatusSchema = z.enum(['todo', 'in_progress', 'done']);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

// Task priority enum
export const TaskPrioritySchema = z.enum(['low', 'medium', 'high']);
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;

// Create project input
export const CreateProjectSchema = z.object({
    teamId: z.string().uuid('Invalid team ID'),
    name: z.string()
        .min(1, 'Project name is required')
        .max(100, 'Project name must be less than 100 characters'),
    description: z.string().max(500).optional(),
    status: ProjectStatusSchema.default('active'),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

// Update project input
export const UpdateProjectSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    status: ProjectStatusSchema.optional(),
});

export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;

// Create task input
export const CreateTaskSchema = z.object({
    projectId: z.string().uuid('Invalid project ID'),
    title: z.string()
        .min(1, 'Task title is required')
        .max(200, 'Task title must be less than 200 characters'),
    description: z.string().max(2000).optional(),
    status: TaskStatusSchema.default('todo'),
    priority: TaskPrioritySchema.default('medium'),
    assigneeId: z.string().uuid().optional().nullable(),
    dueDate: z.coerce.date().optional().nullable(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

// Update task input
export const UpdateTaskSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    status: TaskStatusSchema.optional(),
    priority: TaskPrioritySchema.optional(),
    assigneeId: z.string().uuid().optional().nullable(),
    dueDate: z.coerce.date().optional().nullable(),
});

export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;

// Add project member input
export const AddProjectMemberSchema = z.object({
    projectId: z.string().uuid('Invalid project ID'),
    userId: z.string().uuid('Invalid user ID'),
    role: z.enum(['viewer', 'editor', 'owner']).default('editor'),
});

export type AddProjectMemberInput = z.infer<typeof AddProjectMemberSchema>;
