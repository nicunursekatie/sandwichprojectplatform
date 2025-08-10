import { Router } from 'express';
import { emailService } from '../services/email-service';
import { verifySupabaseToken } from '../middleware/supabase-auth';
import { getSupabaseUserData } from '../utils/supabase-user-helper';

const router = Router();

// Get emails by folder with optional threading
router.get('/', verifySupabaseToken, async (req: any, res) => {
  try {
    // Get the Supabase user from the token
    const supabaseUser = req.user;
    if (!supabaseUser?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get the full user data from database
    const user = await getSupabaseUserData(supabaseUser);
    if (!user) {
      return res.status(401).json({ message: 'User not found in database' });
    }

    const folder = (req.query.folder as string) || 'inbox';
    const threaded = req.query.threaded === 'true';
    console.log(`[Email API] Getting emails for folder: ${folder}, user: ${user.email}, threaded: ${threaded}`);

    // Threading removed - always return flat list
    {
      // Return flat list of emails
      const emails = await emailService.getEmailsByFolder(user.id, folder);
      
      // Format emails for Gmail interface
      const formattedEmails = emails.map(email => ({
        id: email.id,
        senderId: email.senderId,
        senderName: email.senderName,
        senderEmail: email.senderEmail,
        recipientId: email.recipientId,
        recipientName: email.recipientName,
        recipientEmail: email.recipientEmail,
        content: email.content,
        subject: email.subject,
        createdAt: email.createdAt,
        threadId: email.id, // No threading - use email ID
        isRead: email.isRead,
        isStarred: email.isStarred,
        folder: folder,
        committee: email.contextType || 'email'
      }));

      console.log(`[Email API] Found ${formattedEmails.length} emails in ${folder}`);
      res.json(formattedEmails);
    }
  } catch (error) {
    console.error('[Email API] Error fetching emails:', error);
    res.status(500).json({ message: 'Failed to fetch emails' });
  }
});

// Send new email
router.post('/', verifySupabaseToken, async (req: any, res) => {
  try {
    // Get the Supabase user from the token
    const supabaseUser = req.user;
    if (!supabaseUser?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get the full user data from database
    const user = await getSupabaseUserData(supabaseUser);
    if (!user) {
      return res.status(401).json({ message: 'User not found in database' });
    }

    const { recipientId, recipientName, recipientEmail, subject, content, isDraft, contextType, contextId, contextTitle } = req.body;

    if (!subject || !content) {
      return res.status(400).json({ message: 'Subject and content are required' });
    }

    if (!isDraft && (!recipientId || !recipientName || !recipientEmail)) {
      return res.status(400).json({ message: 'Recipient information is required' });
    }

    console.log(`[Email API] Sending email from ${user.email} to ${recipientEmail}`);

    const newEmail = await emailService.sendEmail({
      senderId: user.id,
      senderName: `${user.firstName} ${user.lastName}`.trim() || user.email,
      senderEmail: user.email,
      recipientId: recipientId || user.id, // For drafts
      recipientName: recipientName || 'Draft',
      recipientEmail: recipientEmail || user.email,
      subject,
      content,
      // Threading removed
      contextType: contextType || undefined,
      contextId: contextId || undefined,
      contextTitle: contextTitle || undefined,
      isDraft: isDraft || false,
    });

    res.status(201).json(newEmail);
  } catch (error) {
    console.error('[Email API] Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email' });
  }
});

// Update email status (star, archive, trash, mark read)
router.patch('/:id', verifySupabaseToken, async (req: any, res) => {
  try {
    // Get the Supabase user from the token
    const supabaseUser = req.user;
    if (!supabaseUser?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get the full user data from database
    const user = await getSupabaseUserData(supabaseUser);
    if (!user) {
      return res.status(401).json({ message: 'User not found in database' });
    }

    const emailId = parseInt(req.params.id);
    const updates = req.body;

    console.log(`[Email API] Updating email ${emailId} status:`, updates);

    const success = await emailService.updateEmailStatus(emailId, user.id, updates);

    if (!success) {
      return res.status(404).json({ message: 'Email not found or access denied' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('[Email API] Error updating email:', error);
    res.status(500).json({ message: 'Failed to update email' });
  }
});

// Delete email
router.delete('/:id', verifySupabaseToken, async (req: any, res) => {
  try {
    // Get the Supabase user from the token
    const supabaseUser = req.user;
    if (!supabaseUser?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get the full user data from database
    const user = await getSupabaseUserData(supabaseUser);
    if (!user) {
      return res.status(401).json({ message: 'User not found in database' });
    }

    const emailId = parseInt(req.params.id);
    console.log(`[Email API] Deleting email ${emailId} for user ${user.email}`);

    const success = await emailService.deleteEmail(emailId, user.id);

    if (!success) {
      return res.status(404).json({ message: 'Email not found or access denied' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('[Email API] Error deleting email:', error);
    res.status(500).json({ message: 'Failed to delete email' });
  }
});

// Get unread email count
router.get('/unread-count', verifySupabaseToken, async (req: any, res) => {
  try {
    // Get the Supabase user from the token
    const supabaseUser = req.user;
    if (!supabaseUser?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get the full user data from database
    const user = await getSupabaseUserData(supabaseUser);
    if (!user) {
      return res.status(401).json({ message: 'User not found in database' });
    }

    const count = await emailService.getUnreadEmailCount(user.id);
    res.json({ count });
  } catch (error) {
    console.error('[Email API] Error getting unread count:', error);
    res.status(500).json({ message: 'Failed to get unread count' });
  }
});

// Search emails
router.get('/search', verifySupabaseToken, async (req: any, res) => {
  try {
    // Get the Supabase user from the token
    const supabaseUser = req.user;
    if (!supabaseUser?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get the full user data from database
    const user = await getSupabaseUserData(supabaseUser);
    if (!user) {
      return res.status(401).json({ message: 'User not found in database' });
    }

    const searchTerm = req.query.q as string;
    if (!searchTerm) {
      return res.status(400).json({ message: 'Search term is required' });
    }

    console.log(`[Email API] Searching emails for "${searchTerm}"`);

    const emails = await emailService.searchEmails(user.id, searchTerm);
    res.json(emails);
  } catch (error) {
    console.error('[Email API] Error searching emails:', error);
    res.status(500).json({ message: 'Failed to search emails' });
  }
});

export default router;