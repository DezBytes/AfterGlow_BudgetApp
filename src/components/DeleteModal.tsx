"use client";

interface DeleteModalProps {
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteModal({
  description,
  onConfirm,
  onCancel,
}: DeleteModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="mx-4 w-full max-w-sm rounded-xl border border-white/10 bg-zinc-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-2 text-lg font-semibold text-white">
          Delete Transaction
        </h3>
        <p className="mb-6 text-sm text-zinc-400">
          Are you sure you want to delete{" "}
          <span className="font-medium text-zinc-200">
            &ldquo;{description}&rdquo;
          </span>
          ? This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/30"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
