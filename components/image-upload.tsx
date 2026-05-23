"use client"

import React, { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ImageIcon, X, Upload, AlertCircle, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ImageUploadProps {
  onImageSelect: (file: File, preview: string) => void;
  onImageRemove: () => void;
  selectedImage: { file: File; preview: string } | null;
  disabled?: boolean;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function ImageUpload({ 
  onImageSelect, 
  onImageRemove, 
  selectedImage,
  disabled = false,
  maxSizeMB = 5,
  acceptedTypes = ACCEPTED_TYPES
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const validateFile = useCallback((file: File): boolean => {
    setError(null);

    // Vérifier le type
    if (!acceptedTypes.includes(file.type)) {
      setError(`Format non supporté. Types acceptés: ${acceptedTypes.map(t => t.split('/')[1]).join(', ')}`);
      return false;
    }

    // Vérifier la taille
    if (file.size > maxSizeBytes) {
      setError(`Image trop volumineuse. Taille max: ${maxSizeMB}MB`);
      return false;
    }

    return true;
  }, [acceptedTypes, maxSizeBytes, maxSizeMB]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) {
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsLoading(true);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      onImageSelect(file, reader.result as string);
      setIsLoading(false);
      setError(null);
    };
    reader.onerror = () => {
      setError("Erreur lors de la lecture de l'image");
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  }, [onImageSelect, validateFile]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleRemove = useCallback(() => {
    onImageRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onImageRemove]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (selectedImage) {
    return (
      <Card className="relative p-2 border-2 border-primary/30 bg-primary/5 hover:shadow-md transition-shadow">
        <div className="relative group">
          <img 
            src={selectedImage.preview || "/placeholder.svg"} 
            alt="Aperçu de l'image sélectionnée" 
            className="w-full h-24 object-cover rounded"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
            <Button
              size="sm"
              variant="destructive"
              className="h-8 w-8 rounded-full"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="truncate max-w-[120px]">{selectedImage.file.name}</span>
          <span>{formatFileSize(selectedImage.file.size)}</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isLoading}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={disabled || isLoading}
        className="gap-2 border-primary/30 hover:bg-primary/10 bg-transparent transition-all"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs">Chargement...</span>
          </>
        ) : (
          <>
            <ImageIcon className="h-4 w-4" />
            <span className="text-xs">Ajouter une image</span>
          </>
        )}
      </Button>

      {error && (
        <Alert variant="destructive" className="py-2 px-3">
          <AlertCircle className="h-3 w-3" />
          <AlertDescription className="text-xs">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <p className="text-[10px] text-muted-foreground">
        Formats: {acceptedTypes.map(t => t.split('/')[1]).join(', ')} • Max: {maxSizeMB}MB
      </p>
    </div>
  );
}