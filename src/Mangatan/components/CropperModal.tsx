import React, { useState, useRef, useEffect } from 'react';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import { getCroppedImg } from '@/Mangatan/utils/cropper';

interface CropperModalProps {
    imageSrc: string;
    onComplete: (croppedImage: string) => void;
    onCancel: () => void;
    quality: number;
}

export const CropperModal: React.FC<CropperModalProps> = ({ 
    imageSrc, 
    onComplete, 
    onCancel,
    quality 
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const imgRef = useRef<HTMLImageElement>(null);
    const cropperRef = useRef<Cropper | null>(null);

    useEffect(() => {
        if (!imgRef.current) return;

        const img = imgRef.current;

        const initCropper = () => {
            if (cropperRef.current) {
                cropperRef.current.destroy();
            }

            cropperRef.current = new Cropper(img, {
                viewMode: 1,
                dragMode: 'move',
                autoCropArea: 0.8, // Start with 80% crop area
                restore: false,
                guides: true,
                center: true,
                highlight: false,
                cropBoxMovable: true,
                cropBoxResizable: true,
                toggleDragModeOnDblclick: false,
                aspectRatio: NaN, // Free-form cropping
                ready() {
                    setIsLoading(false);
                }
            });
        };

        if (img.complete && img.naturalWidth > 0) {
            initCropper();
        } else {
            img.onload = initCropper;
        }

        // Cleanup
        return () => {
            if (cropperRef.current) {
                cropperRef.current.destroy();
                cropperRef.current = null;
            }
        };
    }, [imageSrc]);

    const handleConfirm = async () => {
        if (!cropperRef.current) return;

        // Get crop data in pixels relative to the natural image size
        const cropData = cropperRef.current.getData(true);

        const pixelCrop = {
            x: Math.round(cropData.x),
            y: Math.round(cropData.y),
            width: Math.round(cropData.width),
            height: Math.round(cropData.height)
        };

        const croppedImage = await getCroppedImg(
            imageSrc,
            pixelCrop,
            quality,
            0
        );

        if (croppedImage) {
            onComplete(croppedImage);
        }
    };

    return (
        <div className="ocr-modal-overlay" onClick={onCancel}>
            <div 
                className="ocr-modal" 
                onClick={(e) => e.stopPropagation()}
                style={{ 
                    maxWidth: '90vw', 
                    maxHeight: '90vh',
                    pointerEvents: 'auto',
                    position: 'relative',
                }}
            >
                <div className="ocr-modal-header">
                    <h2>Crop Image</h2>
                </div>
                <div 
                    className="ocr-modal-content cropper-modal-content" 
                    style={{ 
                        position: 'relative', 
                        height: '60vh', 
                        minHeight: '400px',
                        padding: '20px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'auto',
                    }}
                >
                    {isLoading && (
                        <div style={{ 
                            position: 'absolute', 
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 10 
                        }}>
                            <div className="ocr-spinner">
                                <svg className="circular" viewBox="25 25 50 50">
                                    <circle className="path" cx="50" cy="50" r="20" fill="none" strokeWidth="4" strokeMiterlimit="10"/>
                                </svg>
                            </div>
                        </div>
                    )}
                    
                    <img 
                        ref={imgRef}
                        src={imageSrc} 
                        alt="Crop preview"
                        crossOrigin="anonymous"
                        style={{ 
                            maxWidth: '100%',
                            display: 'block',
                            opacity: isLoading ? 0 : 1,
                            transition: 'opacity 0.2s'
                        }}
                    />
                </div>
                <div className="ocr-modal-footer">
                    <button type="button" onClick={onCancel}>
                        Cancel
                    </button>
                    <button type="button" className="primary" onClick={handleConfirm} disabled={isLoading}>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};
