import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage-wrapper";
import { isAuthenticated } from "../replitAuth";

const conversationsRoutes = Router();

// Example route, needs to be replaced with actual routes
conversationsRoutes.get("/conversations", isAuthenticated, async (req, res) => {
  try {
    // Placeholder logic, replace with actual data fetching
    const conversations = await storage.list("conversations");
    res.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

conversationsRoutes.post("/conversations", isAuthenticated, async (req, res) => {
  try {
    const conversationSchema = z.object({
      participantIds: z.array(z.string()),
    });

    const result = conversationSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({ error: result.error.message });
      return;
    }

    const { participantIds } = result.data;
    const conversationId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    await storage.store(`conversations/${conversationId}`, JSON.stringify({participantIds:participantIds}));

    res.status(201).json({ message: "Conversation created", conversationId: conversationId });

  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});


export { conversationsRoutes };