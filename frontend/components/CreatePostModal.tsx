"use client";

import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, content: string) => void;
}

export default function ModalCreatePost({ isOpen, onClose, onSubmit }: ModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    onSubmit(title, content);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Criar novo post</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Título</label>
            <input
              type="text"
              name="title"
              required
              className="w-full p-2 rounded-lg border dark:border-gray-700 dark:bg-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Conteúdo</label>
            <textarea
              name="content"
              required
              rows={4}
              className="w-full p-2 rounded-lg border dark:border-gray-700 dark:bg-gray-900"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Criar Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
