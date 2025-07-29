import { FC, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
interface ImageSliderProps {
    images: string[];
    className?: string;
    size?: number;
}

export const ImageSlider: FC<ImageSliderProps> = ({ images, className, size = 20 }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 500); // Change image every 500ms for faster transitions

        return () => clearInterval(interval);
    }, [images.length]);

    return (
        <div className="flex gap-2">
            <span className="italic">Cooking...</span>

            <div className={cn("relative flex items-center justify-between", className)}>

                {images.map((image, index) => (
                    <Image
                        key={image}
                        src={image}
                        alt=""
                        width={size}
                        height={size}
                        className={cn(
                            "absolute transition-all duration-300 ease-in-out",
                            index === currentIndex
                                ? "opacity-100 scale-100"
                                : "opacity-0 scale-95"
                        )}

                    />
                ))}

            </div>
        </div>
    );
}; 