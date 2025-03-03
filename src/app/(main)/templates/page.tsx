'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Loader2, Copy, Search, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Template {
  id: string;
  name: string;
  description: string | null;
  content: string;
  category: string | null;
  createdAt: string;
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get('/api/templates');
        setTemplates(response.data);
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(
            response.data
              .map((template: Template) => template.category)
              .filter(Boolean)
          )
        ) as string[];
        
        setCategories(uniqueCategories);
      } catch {
        toast.error('Failed to load templates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const copyTemplateToClipboard = (template: Template) => {
    navigator.clipboard.writeText(template.content);
    toast.success('Copied to clipboard');
  };

  const handleUseTemplate = (template: Template) => {
    // Store the template in session storage to use it in the project
    sessionStorage.setItem('selectedTemplate', JSON.stringify(template));
    router.push('/dashboard');
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (template.description && 
        template.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = 
      !selectedCategory || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Prompt Templates</h1>
        <p className="mt-1 text-gray-600">
          Browse and use pre-made prompt templates for your projects
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>
        {categories.length > 0 && (
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Filter size={18} className="text-gray-400" />
            </div>
            <select
              value={selectedCategory || ''}
              onChange={(e) => 
                setSelectedCategory(e.target.value || null)
              }
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 size={24} className="animate-spin text-blue-600" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-gray-600">
            {searchQuery || selectedCategory
              ? 'No templates match your search'
              : 'No templates available'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="rounded-lg border bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {template.name}
                </h3>
                {template.category && (
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                    {template.category}
                  </span>
                )}
              </div>
              {template.description && (
                <p className="mb-3 text-sm text-gray-500">
                  {template.description}
                </p>
              )}
              <div className="mb-3 max-h-32 overflow-hidden rounded-md bg-gray-50 p-3">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 line-clamp-4">
                  {template.content}
                </pre>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => copyTemplateToClipboard(template)}
                  className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Copy size={14} />
                  <span>Copy</span>
                </button>
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 