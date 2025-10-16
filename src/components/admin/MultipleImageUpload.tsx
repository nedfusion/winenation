import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ImageData {
  id?: string;
  url: string;
  is_primary: boolean;
  display_order: number;
}

interface MultipleImageUploadProps {
  productId?: string;
  images: ImageData[];
  onImagesChange: (images: ImageData[]) => void;
  disabled?: boolean;
}

export default function MultipleImageUpload({
  productId,
  images,
  onImagesChange,
  disabled
}: MultipleImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const uploadedImages: ImageData[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not an image file`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is larger than 5MB`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Error uploading:', uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        uploadedImages.push({
          url: publicUrl,
          is_primary: images.length === 0 && uploadedImages.length === 0,
          display_order: images.length + uploadedImages.length
        });
      }

      onImagesChange([...images, ...uploadedImages]);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload some images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);

    if (images[index].is_primary && newImages.length > 0) {
      newImages[0].is_primary = true;
    }

    newImages.forEach((img, i) => {
      img.display_order = i;
    });

    onImagesChange(newImages);
  };

  const handleSetPrimary = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      is_primary: i === index
    }));
    onImagesChange(newImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);

    newImages.forEach((img, i) => {
      img.display_order = i;
    });

    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Product Images / Thumbnails
        </label>
        <span className="text-xs text-gray-500">
          {images.length} image{images.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={image.url}
              alt={`Product ${index + 1}`}
              className={`w-full h-32 object-cover rounded-lg border-2 ${
                image.is_primary ? 'border-red-500' : 'border-gray-300'
              }`}
            />

            {!disabled && (
              <>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>

                {!image.is_primary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(index)}
                    className="absolute bottom-2 left-2 bg-white text-gray-700 text-xs px-2 py-1 rounded shadow hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Set Primary
                  </button>
                )}

                <div className="absolute bottom-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, index - 1)}
                      className="bg-white text-gray-700 px-2 py-1 rounded shadow hover:bg-gray-100 transition-colors text-xs"
                    >
                      ←
                    </button>
                  )}
                  {index < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, index + 1)}
                      className="bg-white text-gray-700 px-2 py-1 rounded shadow hover:bg-gray-100 transition-colors text-xs"
                    >
                      →
                    </button>
                  )}
                </div>
              </>
            )}

            {image.is_primary && (
              <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded shadow">
                Primary
              </div>
            )}

            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              {index + 1}
            </div>
          </div>
        ))}

        {!disabled && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-red-500 hover:bg-red-50 transition-colors"
          >
            {uploading ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                <p className="text-xs text-gray-600">Uploading...</p>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-xs text-gray-600 text-center px-2">
                  Add Images
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
        multiple
      />

      <div className="text-xs text-gray-500 space-y-1">
        <p>• Upload multiple images at once</p>
        <p>• The first image is set as primary by default</p>
        <p>• Click "Set Primary" to change the main product image</p>
        <p>• Use arrow buttons to reorder images</p>
        <p>• PNG, JPG, WEBP up to 5MB each</p>
      </div>
    </div>
  );
}
