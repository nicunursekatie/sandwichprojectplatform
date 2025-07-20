import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage-wrapper";
import { requirePermission, isAuthenticated, optionalAuth } from "../middleware/auth";
import { insertProjectSchema } from "@shared/schema";
import { logger } from "../utils/logger";

const router = Router();

// Get all projects
router.get("/", optionalAuth, async (req: any, res) => {
  try {
    const projects = await storage.getAllProjects();
    res.json(projects);
  } catch (error) {
    logger.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// Get single project
router.get("/:id", optionalAuth, async (req: any, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const project = await storage.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    logger.error("Error fetching project:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// Create new project
router.post("/", requirePermission("edit_data"), async (req: any, res) => {
  try {
    const validatedData = insertProjectSchema.parse(req.body);
    const project = await storage.createProject(validatedData);
    res.status(201).json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid project data", details: error?.errors || "Unknown" });
    }
    logger.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// Update project
router.put("/:id", requirePermission("edit_data"), async (req: any, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const validatedData = insertProjectSchema.partial().parse(req.body);
    const project = await storage.updateProject(projectId, validatedData);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid project data", details: error?.errors || "Unknown" });
    }
    logger.error("Error updating project:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
});

// Delete project
router.delete("/:id", requirePermission("edit_data"), async (req: any, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const success = await storage.deleteProject(projectId);
    if (!success) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.status(204).send();
  } catch (error) {
    logger.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// Get project tasks
router.get("/:id/tasks", optionalAuth, async (req: any, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const tasks = await storage.getProjectTasks(projectId);
    res.json(tasks);
  } catch (error) {
    logger.error("Error fetching project tasks:", error);
    res.status(500).json({ error: "Failed to fetch project tasks" });
  }
});

// Create task for project
router.post("/:id/tasks", requirePermission("edit_data"), async (req: any, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const taskData = { ...req.body, projectId };
    const task = await storage.createTask(taskData);
    res.status(201).json(task);
  } catch (error) {
    logger.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// Update task completion
router.post("/:projectId/tasks/:taskId/complete", requirePermission("edit_data"), async (req: any, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const { notes } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const completion = await storage.completeTask(taskId, userId, notes);
    res.status(201).json(completion);
  } catch (error) {
    logger.error("Error completing task:", error);
    res.status(500).json({ error: "Failed to complete task" });
  }
});

// Get task completions
router.get("/:projectId/tasks/:taskId/completions", optionalAuth, async (req: any, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const completions = await storage.getTaskCompletions(taskId);
    res.json(completions);
  } catch (error) {
    logger.error("Error fetching task completions:", error);
    res.status(500).json({ error: "Failed to fetch task completions" });
  }
});

export default router;