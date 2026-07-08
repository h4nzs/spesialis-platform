import { useState, type ImgHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.ts';

const avatarVariants = cva(
  'relative inline-flex items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold overflow-hidden shrink-0',
  {
    variants: {
      size: {
        sm: 'h-8 w-8 text-caption',
        md: 'h-10 w-10 text-body-sm',
        lg: 'h-12 w-12 text-body',
        xl: 'h-16 w-16 text-h5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

export interface AvatarProps extends VariantProps<typeof avatarVariants> {
  /** Image source URL. When falsy or on error, initials are shown. */
  src?: string;
  /** Required accessible label. Also used to generate initials. */
  alt: string;
  /** Explicit fallback initials (max 2 chars). Defaults from alt text. */
  fallback?: string;
  className?: string;
}

/**
 * Avatar displays a circular photo with initials fallback.
 *
 * When `src` fails to load, the component gracefully falls back
 * to displaying initials derived from `alt` or explicit `fallback`.
 *
 * @example
 * <Avatar src="/photo.jpg" alt="John Doe" />
 * <Avatar alt="Admin" size="lg" />
 * <Avatar alt="Partner" fallback="PT" size="xl" />
 */
export function Avatar({ src, alt, fallback, size, className }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = src && !imgError;

  const initials =
    fallback ??
    alt
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  // When showing an image, the container is decorative (aria-hidden).
  // When showing initials, the container has role="img" with the label.
  const isDecorative = showImage;

  return (
    <div
      className={cn(avatarVariants({ size }), className)}
      {...(isDecorative
        ? { 'aria-hidden': true as const }
        : { role: 'img' as const, 'aria-label': alt })}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden="true" className="select-none">
          {initials}
        </span>
      )}
    </div>
  );
}
