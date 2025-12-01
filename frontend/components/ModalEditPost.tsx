"use client";

import { useState } from "react";

interface ModalEditPostProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, content: string) => void;
  initialTitle: string;
  initialContent: string;
}

export default function ModalEditPost({
  isOpen,
  onClose,
  onSubmit,
  initialTitle,
  initialContent,
}: ModalEditPostProps) {
  // Inicializa estado diretamente a partir das props
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(title, content);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-96">
        <h2 className="text-lg font-semibold mb-4">Editar Post</h2>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título"
          className="w-full p-2 border rounded mb-3"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Conteúdo"
          className="w-full p-2 border rounded mb-3"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-yellow-500 text-white rounded"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
