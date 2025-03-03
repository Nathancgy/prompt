'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Plus,
  Loader2,
  Edit,
  Trash2,
  Copy,
  ArrowLeft,
  Save,
  X,
} from 'lucide-react';
import Link from 'next/link';

interface Prompt {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  prompts: Prompt[];
}

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newPrompt, setNewPrompt] = useState({ name: "", content: "" });
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`/api/projects/${projectId}`);
        setProject(response.data);
      } catch {
        toast.error("Failed to load project");
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId, router]);

  const handleCreatePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrompt.name.trim() || !newPrompt.content.trim()) {
      toast.error("Name and content are required");
      return;
    }

    setIsCreating(true);
    try {
      const response = await axios.post(
        `/api/projects/${projectId}/prompts`,
        newPrompt
      );
      setProject((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          prompts: [response.data, ...prev.prompts],
        };
      });
      setNewPrompt({ name: "", content: "" });
      setShowCreateForm(false);
      toast.success("Prompt created successfully");
    } catch {
      toast.error("Failed to create prompt");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdatePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrompt) return;

    if (!editingPrompt.name.trim() || !editingPrompt.content.trim()) {
      toast.error("Name and content are required");
      return;
    }

    setIsEditing(true);
    try {
      const response = await axios.patch(
        `/api/prompts/${editingPrompt.id}`,
        {
          name: editingPrompt.name,
          content: editingPrompt.content,
        }
      );
      setProject((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          prompts: prev.prompts.map((p) =>
            p.id === editingPrompt.id ? response.data : p
          ),
        };
      });
      setEditingPrompt(null);
      toast.success("Prompt updated successfully");
    } catch {
      toast.error("Failed to update prompt");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeletePrompt = async (promptId: string) => {
    if (!confirm("Are you sure you want to delete this prompt?")) return;

    try {
      await axios.delete(`/api/prompts/${promptId}`);
      setProject((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          prompts: prev.prompts.filter((p) => p.id !== promptId),
        };
      });
      toast.success("Prompt deleted successfully");
    } catch {
      toast.error("Failed to delete prompt");
    }
  };

  const copyPromptToClipboard = (prompt: Prompt) => {
    navigator.clipboard.writeText(prompt.content);
    toast.success("Copied to clipboard");
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={24} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <p className="mb-4 text-lg text-gray-600">Project not found</p>
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-blue-600 hover:underline"
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2">
        <Link
          href="/dashboard"
          className="flex w-fit items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
        {project.description && (
          <p className="mt-1 text-gray-600">{project.description}</p>
        )}
      </div>

      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Prompts</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus size={16} />
          <span>New Prompt</span>
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-8 rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            Create a new prompt
          </h3>
          <form onSubmit={handleCreatePrompt} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Prompt Name
              </label>
              <input
                id="name"
                type="text"
                value={newPrompt.name}
                onChange={(e) =>
                  setNewPrompt({ ...newPrompt, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="Feature Implementation"
              />
            </div>
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700"
              >
                Prompt Content
              </label>
              <textarea
                id="content"
                value={newPrompt.content}
                onChange={(e) =>
                  setNewPrompt({ ...newPrompt, content: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="Write your prompt here..."
                rows={6}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCreating && <Loader2 size={16} className="animate-spin" />}
                <span>Create Prompt</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {project.prompts.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="mb-4 text-gray-600">No prompts yet</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus size={16} />
            <span>Create your first prompt</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {project.prompts.map((prompt) => (
            <div
              key={prompt.id}
              className="rounded-lg border bg-white p-4 shadow-sm"
            >
              {editingPrompt?.id === prompt.id ? (
                <form onSubmit={handleUpdatePrompt} className="space-y-4">
                  <div>
                    <label
                      htmlFor={`edit-name-${prompt.id}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Prompt Name
                    </label>
                    <input
                      id={`edit-name-${prompt.id}`}
                      type="text"
                      value={editingPrompt.name}
                      onChange={(e) =>
                        setEditingPrompt({
                          ...editingPrompt,
                          name: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`edit-content-${prompt.id}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Prompt Content
                    </label>
                    <textarea
                      id={`edit-content-${prompt.id}`}
                      value={editingPrompt.content}
                      onChange={(e) =>
                        setEditingPrompt({
                          ...editingPrompt,
                          content: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      rows={6}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingPrompt(null)}
                      className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <X size={16} />
                      <span>Cancel</span>
                    </button>
                    <button
                      type="submit"
                      disabled={isEditing}
                      className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isEditing && (
                        <Loader2 size={16} className="animate-spin" />
                      )}
                      <Save size={16} />
                      <span>Save</span>
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      {prompt.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyPromptToClipboard(prompt)}
                        className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        title="Copy to clipboard"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={() => setEditingPrompt(prompt)}
                        className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        title="Edit prompt"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeletePrompt(prompt.id)}
                        className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                        title="Delete prompt"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="rounded-md bg-gray-50 p-3">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800">
                      {prompt.content}
                    </pre>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    Created on{" "}
                    {new Date(prompt.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 