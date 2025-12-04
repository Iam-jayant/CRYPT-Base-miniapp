import React, { useEffect, useRef, useState, useCallback } from 'react';
import './PixelCard.css';

interface PixelCardProps {
    variant?: 'default' | 'blue' | 'yellow' | 'pink';
    gap?: number;
    speed?: number;
    colors?: string;
    noFocus?: boolean;
    className?: string;
    role?: string;
    'aria-label'?: string;
    children: React.ReactNode;
}

class Pixel {
    x: number;
    y: number;
    size: number;
    maxSize: number;
    color: string;
    state: 'idle' | 'appearing' | 'appeared' | 'disappearing';
    delay: number;
    appearProgress: number;
    shimmerPhase: number;

    constructor(x: number, y: number, maxSize: number, color: string, delay: number) {
        this.x = x;
        this.y = y;
        this.size = 0;
        this.maxSize = maxSize;
        this.color = color;
        this.state = 'idle';
        this.delay = delay;
        this.appearProgress = 0;
        this.shimmerPhase = Math.random() * Math.PI * 2;
    }

    appear(speed: number): void {
        if (this.delay > 0) {
            this.delay -= speed;
            return;
        }

        if (this.state === 'idle') {
            this.state = 'appearing';
        }

        if (this.state === 'appearing') {
            this.appearProgress += speed * 0.05;
            this.size = this.maxSize * Math.min(1, this.appearProgress);

            if (this.appearProgress >= 1) {
                this.state = 'appeared';
                this.size = this.maxSize;
            }
        }
    }

    disappear(speed: number): void {
        if (this.state === 'appeared' || this.state === 'appearing') {
            this.state = 'disappearing';
        }

        if (this.state === 'disappearing') {
            this.appearProgress -= speed * 0.05;
            this.size = this.maxSize * Math.max(0, this.appearProgress);

            if (this.appearProgress <= 0) {
                this.state = 'idle';
                this.size = 0;
                this.appearProgress = 0;
            }
        }
    }

    shimmer(time: number): void {
        if (this.state === 'appeared') {
            const shimmer = Math.sin(time * 0.002 + this.shimmerPhase) * 0.15 + 1;
            this.size = this.maxSize * shimmer;
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (this.size > 0) {
            ctx.fillStyle = this.color;
            ctx.fillRect(
                this.x - this.size / 2,
                this.y - this.size / 2,
                this.size,
                this.size
            );
        }
    }
}

const VARIANT_COLORS = {
    default: ['#f8fafc', '#f1f5f9', '#cbd5e1'],
    blue: ['#e0f2fe', '#7dd3fc', '#0ea5e9'],
    yellow: ['#fef08a', '#fde047', '#eab308'],
    pink: ['#fecdd3', '#fda4af', '#e11d48'],
};

export const PixelCard: React.FC<PixelCardProps> = ({
    variant = 'default',
    gap = 8,
    speed = 1,
    colors,
    noFocus = false,
    className = '',
    role,
    'aria-label': ariaLabel,
    children,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const pixelsRef = useRef<Pixel[]>([]);
    const animationFrameRef = useRef<number | undefined>(undefined);
    const lastFrameTimeRef = useRef<number>(0);
    const isHoveredRef = useRef<boolean>(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    // Detect reduced motion preference
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const handleChange = (e: MediaQueryListEvent) => {
            setPrefersReducedMotion(e.matches);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Initialize pixels
    const initializePixels = () => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        const pixels: Pixel[] = [];
        const colorPalette = colors ? colors.split(',') : VARIANT_COLORS[variant];

        const cols = Math.floor(canvas.width / gap);
        const rows = Math.floor(canvas.height / gap);
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * gap + gap / 2;
                const y = row * gap + gap / 2;
                const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];

                // Calculate delay based on distance from center for wave effect
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const delay = distance * 0.5;

                pixels.push(new Pixel(x, y, gap * 0.8, color, delay));
            }
        }

        pixelsRef.current = pixels;
    };

    // Animation loop
    const animate = useCallback((currentTime: number) => {
        if (prefersReducedMotion) return;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        // Throttle to 60fps
        const deltaTime = currentTime - lastFrameTimeRef.current;
        if (deltaTime < 16.67) {
            animationFrameRef.current = requestAnimationFrame(animate);
            return;
        }
        lastFrameTimeRef.current = currentTime;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw pixels
        pixelsRef.current.forEach(pixel => {
            if (isHoveredRef.current) {
                pixel.appear(speed);
                pixel.shimmer(currentTime);
            } else {
                pixel.disappear(speed);
            }
            pixel.draw(ctx);
        });

        animationFrameRef.current = requestAnimationFrame(animate);
    }, [prefersReducedMotion, speed]);

    // Setup ResizeObserver
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver(() => {
            initializePixels();
        });

        resizeObserver.observe(container);
        initializePixels();

        return () => {
            resizeObserver.disconnect();
        };
    }, [gap, variant, colors]);

    // Start/stop animation
    useEffect(() => {
        if (prefersReducedMotion) return;

        const startAnimation = (time: number) => {
            lastFrameTimeRef.current = time;
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(startAnimation);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [animate, prefersReducedMotion]);

    const handleMouseEnter = () => {
        isHoveredRef.current = true;
    };

    const handleMouseLeave = () => {
        isHoveredRef.current = false;
    };

    const handleFocus = () => {
        if (!noFocus) {
            isHoveredRef.current = true;
        }
    };

    const handleBlur = () => {
        if (!noFocus) {
            isHoveredRef.current = false;
        }
    };

    return (
        <div
            ref={containerRef}
            className={`pixel-card ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
            tabIndex={noFocus ? -1 : 0}
            role={role}
            aria-label={ariaLabel}
        >
            <canvas ref={canvasRef} className="pixel-card-canvas" aria-hidden="true" />
            <div className="pixel-card-content">
                {children}
            </div>
        </div>
    );
};
