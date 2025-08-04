
import { useState, useEffect } from "react";
import * as React from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Target, 
  CheckCircle2, 
  Clock, 
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  Users,
  MessageSquare,
  Award
} from "lucide-react";
import { TaskAssigneeSelector } from "@/components/task-assignee-selector";
import { ProjectAssigneeSelector } from "@/components/project-assignee-selector";
import { MultiUserTaskCompletion } from "@/components/multi-user-task-completion";
import SendKudosButton from "@/components/send-kudos-button";
import { useAuth } from '@/contexts/AuthContext';
import { canEditProject, canDeleteProject } from "@shared/auth-utils";

interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  assigneeId?: string;
  assigneeName?: string;
  estimatedHours?: number;
  actualHours?: number;
  budget?: number;
  progress?: number;
  createdAt: string;
  updatedAt: string;
}

interface Task {
  id: number;
  projectId: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate?: string;
  assigneeId?: string;
  assigneeName?: string;
  estimatedHours?: number;
  actualHours?: number;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectDetailClean({ projectId }: { projectId?: number }) {
  const { id: paramId } = useParams<{ id: string }>();
  const id = projectId ? projectId.toString() : paramId;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assigneeId: '',
    assigneeName: '',
    estimatedHours: 0
  });
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Fetch project details
  const { data: project, isLoading: isProjectLoading } = useQuery<Project>({
    queryKey: ['/api/projects', id],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/projects/${id}`);
      return response;
    },
    enabled: !!id,
  });

  // Fetch project tasks
  const { data: tasks = [], isLoading: isTasksLoading } = useQuery<Task[]>({
    queryKey: ['/api/projects', id, 'tasks'],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/projects/${id}/tasks`);
      return Array.isArray(response) ? response : [];
    },
    enabled: !!id,
  });

  // Function to send kudos to all project assignees when project is completed
  const sendKudosForProjectCompletion = async (project: Project, projectTitle: string) => {
    if (!user?.id) return;

    try {
      // Get all assignees for this project
      const assigneesToNotify = [];
      
      // Handle multiple assignees from assigneeIds array
      if ((project as any).assigneeIds && (project as any).assigneeIds.length > 0) {
        for (let i = 0; i < (project as any).assigneeIds.length; i++) {
          const assigneeId = (project as any).assigneeIds[i];
          const assigneeName = (project as any).assigneeNames?.[i] || `User ${assigneeId}`;
          
          // Don't send kudos to yourself
          if (assigneeId !== user.id) {
            assigneesToNotify.push({ id: assigneeId, name: assigneeName });
          }
        }
      } 
      // Handle single assignee from legacy assigneeId field
      else if (project.assigneeId && project.assigneeName && user?.id !== project.assigneeId) {
        assigneesToNotify.push({ 
          id: project.assigneeId, 
          name: project.assigneeName
        });
      }

      // Send kudos to each assignee
      for (const assignee of assigneesToNotify) {
        try {
          await apiRequest("POST", "/api/messaging/kudos", {
            recipientId: assignee.id,
            recipientName: assignee.name,
            contextType: "project",
            contextId: project.id.toString(),
            entityName: projectTitle,
            customMessage: `🎉 Congratulations on completing "${projectTitle}"! Amazing work!`
          });

          console.log(`Kudos sent to ${assignee.name} for project completion`);
        } catch (error) {
          console.error(`Failed to send kudos to ${assignee.name}:`, error);
        }
      }

      if (assigneesToNotify.length > 0) {
        toast({
          title: "🎉 Kudos sent!",
          description: `Congratulations sent to ${assigneesToNotify.length} team member${assigneesToNotify.length > 1 ? 's' : ''} for completing "${projectTitle}"`,
        });
      }
    } catch (error) {
      console.error('Failed to send project completion kudos:', error);
    }
  };

  // Project edit mutation
  const editProjectMutation = useMutation({
    mutationFn: async (projectData: Partial<Project>) => {
      return await apiRequest('PATCH', `/api/projects/${id}`, projectData);
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setIsEditingProject(false);
      setEditingProject(null);
      toast({ description: "Project updated successfully" });
      
      // If project was marked as completed, send kudos to all assignees
      if (variables.status === 'completed' && project) {
        await sendKudosForProjectCompletion(project, project.title);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error updating project",
        description: error.message || "Failed to update project",
        variant: "destructive"
      });
    }
  });

  // Add task mutation
  const addTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      return await apiRequest('POST', `/api/projects/${id}/tasks`, taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', id, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', id] });
      setIsAddingTask(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        assigneeId: '',
        assigneeName: '',
        estimatedHours: 0
      });
      toast({ description: "Task added successfully" });
    },
    onError: (error: any) => {
      console.error('Task creation failed:', error);
      toast({ 
        description: "Failed to add task", 
        variant: "destructive" 
      });
    },
  });

  // Function to check if project should be auto-completed
  const checkAndCompleteProject = async () => {
    if (!project || !tasks || tasks.length === 0) return;

    // Check if all tasks are completed
    const allTasksCompleted = tasks.every(task => task.status === 'completed');
    
    if (allTasksCompleted && project.status !== 'completed') {
      try {
        // Auto-complete the project
        await apiRequest('PATCH', `/api/projects/${id}`, { status: 'completed' });
        
        // Send kudos to all project assignees
        await sendKudosForProjectCompletion(project, project.title);
        
        toast({
          title: "🎉 Project Auto-Completed!",
          description: `"${project.title}" has been automatically completed since all tasks are done!`
        });
        
        // Refresh project data
        queryClient.invalidateQueries({ queryKey: ['/api/projects', id] });
        queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
        
      } catch (error) {
        console.error('Failed to auto-complete project:', error);
      }
    }
  };



  // Edit task mutation
  const editTaskMutation = useMutation({
    mutationFn: async ({ taskId, taskData }: { taskId: number; taskData: Partial<Task> }) => {
      return await apiRequest('PATCH', `/api/tasks/${taskId}`, taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', id, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', id] });
      setIsEditingTask(null);
      toast({ description: "Task updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating task",
        description: error.message || "Failed to update task",
        variant: "destructive"
      });
    }
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      return await apiRequest('DELETE', `/api/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', id, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', id] });
      toast({ description: "Task deleted successfully" });
    },
    onError: (error: any) => {
      console.error('Task deletion failed:', error);
      toast({ 
        description: "Failed to delete task", 
        variant: "destructive" 
      });
    },
  });

  const handleAddTask = () => {
    if (!newTask.title.trim()) {
      toast({ description: "Task title is required", variant: "destructive" });
      return;
    }
    addTaskMutation.mutate(newTask);
  };

  const handleDeleteTask = (taskId: number) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const handleEditProject = () => {
    if (project) {
      setEditingProject(project);
      setIsEditingProject(true);
    }
  };

  const handleUpdateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      editProjectMutation.mutate(editingProject);
    }
  };

  const handleEditTask = (task: Task) => {
    setIsEditingTask(task);
  };

  const handleUpdateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditingTask) {
      editTaskMutation.mutate({ 
        taskId: isEditingTask.id, 
        taskData: isEditingTask 
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500 text-white";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-white";
      case "low": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600 bg-green-50 border-green-200";
      case "in_progress": return "text-blue-600 bg-blue-50 border-blue-200";
      case "available": return "text-purple-600 bg-purple-50 border-purple-200";
      case "waiting": return "text-gray-600 bg-gray-50 border-gray-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  if (isProjectLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Project not found</div>
      </div>
    );
  }

  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log('Back to Projects clicked - navigating to projects');
              if ((window as any).dashboardSetActiveSection) {
                (window as any).dashboardSetActiveSection('projects');
              } else {
                setLocation('/projects');
              }
            }}
            className="flex items-center gap-2 text-[#236383] hover:bg-[#236383]/10 font-roboto"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#236383] font-roboto mb-2">{project.title}</h1>
            {project.description && (
              <p className="text-gray-600 font-roboto text-lg">{project.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user && canEditProject(user, project) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditProject}
              className="flex items-center gap-2 border-[#FBAD3F] text-[#FBAD3F] hover:bg-[#FBAD3F] hover:text-white font-roboto"
            >
              <Edit2 className="h-4 w-4" />
              Edit Project
            </Button>
          )}
          <Badge 
            className={`${getStatusColor(project.status)} font-roboto px-3 py-1`}
          >
            {project.status?.replace('_', ' ')}
          </Badge>
          <Badge 
            className={`${getPriorityColor(project.priority)} font-roboto px-3 py-1`}
          >
            {project.priority}
          </Badge>
        </div>
      </div>

      {/* Project Info Cards - Clean TSP Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Project Owner */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-[#236383]/10 rounded flex items-center justify-center shrink-0">
              <User className="h-3 w-3 text-[#236383]" />
            </div>
            <h3 className="text-sm font-semibold text-[#236383] font-roboto">Project Owner</h3>
          </div>
          <p className="text-sm text-gray-900 font-roboto font-medium mb-2 leading-tight">
            {project.assigneeName || 'Christine Cooper Nowicki'}
          </p>
          <p className="text-xs text-gray-500 font-roboto">
            Currently managing this project
          </p>
        </div>

        {/* Target Date */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-[#FBAD3F]/10 rounded flex items-center justify-center shrink-0">
              <Calendar className="h-3 w-3 text-[#FBAD3F]" />
            </div>
            <h3 className="text-sm font-semibold text-[#FBAD3F] font-roboto">Target Date</h3>
          </div>
          <p className="text-sm text-gray-900 font-roboto font-medium mb-2 leading-tight">
            {project.dueDate 
              ? new Date(project.dueDate).toLocaleDateString()
              : '8/30/2025'
            }
          </p>
          <p className="text-xs text-gray-500 font-roboto">
            About 1 month remaining
          </p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center shrink-0">
              <Target className="h-3 w-3 text-green-600" />
            </div>
            <h3 className="text-sm font-semibold text-green-600 font-roboto">Progress</h3>
          </div>
          <p className="text-sm text-gray-900 font-roboto font-medium mb-2 leading-tight">{progressPercentage}%</p>
          <p className="text-xs text-gray-500 font-roboto mb-3">
            {completedTasks} of {totalTasks} tasks complete
          </p>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-green-500 h-1.5 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#236383] font-roboto">Tasks</h2>
          {user && canEditProject(user, project) && (
            <Button
              onClick={() => setIsAddingTask(true)}
              className="flex items-center gap-2 bg-[#FBAD3F] hover:bg-[#FBAD3F]/90 text-white font-roboto px-4 py-2"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          )}
        </div>

        {/* Add Task Form */}
        {isAddingTask && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-[#236383] font-roboto mb-6">Add New Task</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="task-title">Title</Label>
                <Input
                  id="task-title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <Label htmlFor="task-description">Description</Label>
                <Textarea
                  id="task-description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Enter task description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="task-priority">Priority</Label>
                  <select
                    id="task-priority"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="task-due-date">Due Date</Label>
                  <Input
                    id="task-due-date"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <TaskAssigneeSelector
                value={{
                  assigneeIds: newTask.assigneeIds || [],
                  assigneeNames: newTask.assigneeNames || []
                }}
                onChange={({ assigneeIds, assigneeNames }) => 
                  setNewTask({ 
                    ...newTask, 
                    assigneeIds, 
                    assigneeNames,
                    // Keep backward compatibility
                    assigneeId: assigneeIds?.[0],
                    assigneeName: assigneeNames?.[0]
                  })
                }
                multiple={true}
              />
              <div>
                <Label htmlFor="task-estimated-hours">Estimated Hours</Label>
                <Input
                  id="task-estimated-hours"
                  type="number"
                  value={newTask.estimatedHours}
                  onChange={(e) => setNewTask({ ...newTask, estimatedHours: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddTask}
                  disabled={addTaskMutation.isPending}
                  className="bg-[#FBAD3F] hover:bg-[#FBAD3F]/90 text-white font-roboto"
                >
                  {addTaskMutation.isPending ? 'Adding...' : 'Add Task'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAddingTask(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 font-roboto"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tasks List */}
        <div className="space-y-4">
          {isTasksLoading ? (
            <div className="text-center py-8 text-gray-500 font-roboto">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Plus className="h-12 w-12 mx-auto mb-2" />
              </div>
              <p className="text-gray-500 font-roboto text-lg">No tasks yet</p>
              <p className="text-gray-400 font-roboto">Add your first task to get started!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className={`bg-white rounded-lg border border-gray-200 p-6 ${task.status === 'completed' ? 'bg-green-50 border-green-200' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className={`text-lg font-semibold font-roboto ${task.status === 'completed' ? 'line-through text-gray-600' : 'text-[#236383]'}`}>
                      {task.status === 'completed' && <CheckCircle2 className="inline w-5 h-5 mr-2 text-green-600" />}
                      {task.title}
                    </h4>
                    <p className={`mt-1 text-gray-600 font-roboto ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                      {task.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getPriorityColor(task.priority)} font-roboto px-2 py-1`}>
                      {task.priority}
                    </Badge>
                    <Badge className={`${getStatusColor(task.status)} font-roboto px-2 py-1`}>
                      {task.status?.replace('_', ' ')}
                    </Badge>
                    {user && canEditProject(user, project) && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTask(task)}
                          className="text-[#236383] hover:text-[#236383]/80"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {(task.assigneeNames?.length > 0 || task.assigneeName) && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <div className="flex flex-wrap gap-1">
                            {task.assigneeNames?.length > 0 ? (
                              task.assigneeNames.map((name, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {name}
                                </Badge>
                              ))
                            ) : task.assigneeName ? (
                              <Badge variant="outline" className="text-xs">
                                {task.assigneeName}
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                      {task.estimatedHours && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {task.estimatedHours}h estimated
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <MultiUserTaskCompletion 
                        taskId={task.id}
                        projectId={project.id}
                        assigneeIds={task.assigneeIds?.length > 0 ? task.assigneeIds : (task.assigneeId ? [task.assigneeId] : [])}
                        assigneeNames={task.assigneeNames?.length > 0 ? task.assigneeNames : (task.assigneeName ? [task.assigneeName] : [])}
                        currentUserId={user?.id}
                        currentUserName={user?.firstName || user?.displayName}
                        taskStatus={task.status}
                        onStatusChange={(isCompleted) => {
                          // Invalidate queries to refresh UI immediately
                          queryClient.invalidateQueries({ queryKey: ['/api/projects', project.id, 'tasks'] });
                          queryClient.invalidateQueries({ queryKey: ['/api/projects', project.id] });
                          
                          // Trigger congratulations when task is completed by someone else
                          const assigneeIds = task.assigneeIds?.length > 0 ? task.assigneeIds : (task.assigneeId ? [task.assigneeId] : []);
                          const assigneeNames = task.assigneeNames?.length > 0 ? task.assigneeNames : (task.assigneeName ? [task.assigneeName] : []);
                          if (isCompleted && assigneeIds.length > 0 && !assigneeIds.includes(user?.id || '')) {
                            toast({
                              title: "🎉 Task Completed!",
                              description: `Team member completed "${task.title}"`,
                            });
                          }
                        }}
                      />
                      {/* Show kudos buttons for completed tasks */}
                      {task.status === 'completed' && (
                        <div className="flex gap-1 flex-wrap">
                          {/* Handle new format with assigneeIds array */}
                          {task.assigneeIds && task.assigneeIds.length > 0 && task.assigneeIds.map((assigneeId, index) => {
                            const assigneeName = task.assigneeNames && task.assigneeNames[index] 
                              ? task.assigneeNames[index] 
                              : `Team Member ${index + 1}`;
                            
                            return (
                              <SendKudosButton 
                                key={`${task.id}-new-${assigneeId}`}
                                recipientId={assigneeId}
                                recipientName={assigneeName}
                                contextType="task"
                                contextId={task.id.toString()}
                                entityName={task.title}
                                size="xs"
                              />
                            );
                          })}
                          
                          {/* Handle legacy format with single assignee but no proper user ID */}
                          {(!task.assigneeIds || task.assigneeIds.length === 0) && task.assigneeName && (
                            <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">
                              ⚠️ Legacy assignment: {task.assigneeName}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Project Edit Dialog */}
      <Dialog open={isEditingProject} onOpenChange={setIsEditingProject}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update project details and assignments
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateProject} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="edit-project-title">Title</Label>
                <Input
                  id="edit-project-title"
                  value={editingProject?.title || ''}
                  onChange={(e) => setEditingProject(prev => prev ? { ...prev, title: e.target.value } : null)}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="edit-project-description">Description</Label>
                <Textarea
                  id="edit-project-description"
                  value={editingProject?.description || ''}
                  onChange={(e) => setEditingProject(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit-project-status">Status</Label>
                <Select 
                  value={editingProject?.status || ''} 
                  onValueChange={(value) => setEditingProject(prev => prev ? { ...prev, status: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="waiting">Waiting</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-project-priority">Priority</Label>
                <Select 
                  value={editingProject?.priority || ''} 
                  onValueChange={(value) => setEditingProject(prev => prev ? { ...prev, priority: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-project-category">Category</Label>
                <Select 
                  value={editingProject?.category || ''} 
                  onValueChange={(value) => setEditingProject(prev => prev ? { ...prev, category: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">💻 Tech</SelectItem>
                    <SelectItem value="events">📅 Events</SelectItem>
                    <SelectItem value="grants">💰 Grants</SelectItem>
                    <SelectItem value="outreach">🤝 Outreach</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <ProjectAssigneeSelector
                  value={editingProject?.assigneeName || ''}
                  onChange={(value, userIds) => setEditingProject(prev => prev ? { 
                    ...prev, 
                    assigneeName: value,
                    assigneeIds: userIds?.length ? userIds : undefined
                  } : null)}
                  label="Assigned To"
                  placeholder="Select or enter person responsible"
                />
              </div>
              <div>
                <Label htmlFor="edit-project-due-date">Due Date</Label>
                <Input
                  id="edit-project-due-date"
                  type="date"
                  value={editingProject?.dueDate ? editingProject.dueDate.split('T')[0] : ''}
                  onChange={(e) => setEditingProject(prev => prev ? { ...prev, dueDate: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-project-budget">Budget</Label>
                <Input
                  id="edit-project-budget"
                  type="number"
                  value={editingProject?.budget || ''}
                  onChange={(e) => setEditingProject(prev => prev ? { ...prev, budget: Number(e.target.value) } : null)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="edit-project-estimated-hours">Estimated Hours</Label>
                <Input
                  id="edit-project-estimated-hours"
                  type="number"
                  value={editingProject?.estimatedHours || ''}
                  onChange={(e) => setEditingProject(prev => prev ? { ...prev, estimatedHours: Number(e.target.value) } : null)}
                  placeholder="0"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditingProject(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={editProjectMutation.isPending}>
                {editProjectMutation.isPending ? 'Updating...' : 'Update Project'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Task Edit Dialog */}
      <Dialog open={!!isEditingTask} onOpenChange={() => setIsEditingTask(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Modify task details and assignments
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateTask} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="edit-task-title">Title</Label>
                <Input
                  id="edit-task-title"
                  value={isEditingTask?.title || ''}
                  onChange={(e) => setIsEditingTask(prev => prev ? { ...prev, title: e.target.value } : null)}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="edit-task-description">Description</Label>
                <Textarea
                  id="edit-task-description"
                  value={isEditingTask?.description || ''}
                  onChange={(e) => setIsEditingTask(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit-task-status">Status</Label>
                <Select 
                  value={isEditingTask?.status || ''} 
                  onValueChange={(value) => setIsEditingTask(prev => prev ? { ...prev, status: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="waiting">Waiting</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-task-priority">Priority</Label>
                <Select 
                  value={isEditingTask?.priority || ''} 
                  onValueChange={(value) => setIsEditingTask(prev => prev ? { ...prev, priority: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-task-assignee">Assigned To</Label>
                <TaskAssigneeSelector
                  value={{
                    assigneeIds: isEditingTask?.assigneeIds || (isEditingTask?.assigneeId ? [isEditingTask.assigneeId] : []),
                    assigneeNames: isEditingTask?.assigneeNames || (isEditingTask?.assigneeName ? [isEditingTask.assigneeName] : [])
                  }}
                  onChange={({ assigneeIds, assigneeNames }) => 
                    setIsEditingTask(prev => prev ? { 
                      ...prev, 
                      assigneeIds, 
                      assigneeNames,
                      // Keep backward compatibility with single assignee fields
                      assigneeId: assigneeIds?.[0],
                      assigneeName: assigneeNames?.[0]
                    } : null)
                  }
                  multiple={true}
                />
              </div>
              <div>
                <Label htmlFor="edit-task-due-date">Due Date</Label>
                <Input
                  id="edit-task-due-date"
                  type="date"
                  value={isEditingTask?.dueDate ? isEditingTask.dueDate.split('T')[0] : ''}
                  onChange={(e) => setIsEditingTask(prev => prev ? { ...prev, dueDate: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-task-estimated-hours">Estimated Hours</Label>
                <Input
                  id="edit-task-estimated-hours"
                  type="number"
                  value={isEditingTask?.estimatedHours || ''}
                  onChange={(e) => setIsEditingTask(prev => prev ? { ...prev, estimatedHours: Number(e.target.value) } : null)}
                  placeholder="0"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditingTask(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={editTaskMutation.isPending}>
                {editTaskMutation.isPending ? 'Updating...' : 'Update Task'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
