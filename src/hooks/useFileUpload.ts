import { formatISO } from "date-fns";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { v4 as uuid } from "uuid";
import type { Attachment } from "../services/commentService";

/**
 * Custom hook to handle file uploads
 * @param props - Configuration options for the file upload
 * @returns {Object} - File upload state and handlers
 */
export function useFileUpload({
  maxSizeMB = 10,
  onFiles,
  currentUserId,
}: {
  maxSizeMB?: number;
  currentUserId: string;
  onFiles: (files: Attachment[]) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const onDrop = useCallback(
    (accepted: File[]) => {
      setError(null);
      const tooBig = accepted.filter((f) => f.size > maxSizeMB * 1024 * 1024);
      if (tooBig.length) {
        setError(`Some files exceed ${maxSizeMB}MB`);
        return;
      }

      const newFiles: Attachment[] = [];
      accepted.forEach((file) => {
        const reader = new FileReader();

        reader.onload = () => {
          const base64String = reader.result as string;
          newFiles.push({
            id: `file_${uuid()}`,
            filename: file.name,
            originalName: file.name,
            path: base64String,
            type: file.type,
            size: file.size,
            uploadedBy: currentUserId,
            uploadedAt: formatISO(new Date()),
          });
          onFiles(newFiles);
        };

        reader.onerror = (error) => {
          console.error("Error converting file:", error);
        };

        reader.readAsDataURL(file);
      });
    },
    [maxSizeMB, onFiles, currentUserId],
  );
  const dz = useDropzone({ onDrop, accept: { "image/*": [] } });
  return { ...dz, error };
}
