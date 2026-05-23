"use client"

import React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ImageIcon, X, Upload } from "lucide-react"
import { Card } from "@/components/ui/card"

interface ImageUploadProps {
  onImageSelect: (file: File, preview: string) => void;
  onImageRemove: () => void;
  selectedImage: { file: File; preview: string } | null;
  disabled?: boolean;
}

export function ImageUpload({ 
  onImageSelect, 
  onImageRemove, 
  selectedImage,
  disabled = false 
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  if (selectedImage) {
    return (
      <Card className="relative p-2 border-2 border-primary/30 bg-primary/5">
        <div className="relative">
          <img 
            src={selectedImage.preview || "/placeholder.svg"} 
            alt="Selected" 
            className="w-full h-24 object-cover rounded"
          />
          <Button
            size="icon"
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={onImageRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1 truncate">
          {selectedImage.file.name}
        </p>
      </Card>
    );
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={disabled}
        className="gap-2 border-primary/30 hover:bg-primary/10 bg-transparent"
      >
        <ImageIcon className="h-4 w-4" />
        <span className="text-xs">Ajouter une image</span>
      </Button>
    </>
  );
}
