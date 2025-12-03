import React, { useRef, useEffect, useCallback, useState } from 'react';
import { gsap } from 'gsap';
import './MagicBento.css';

export interface BentoCardProps {
    color?: string;
    title?: string;
    description?: string;
    label?: string;
    textAutoHide?: boolean;
    disableAnimations?: boolean;
}

export interface BentoProps {
    textAutoHide?: boolean;
    enableStars?: boolean;
    enableSpotlight?: boolean;
    enableBorderGlow?: boolean;
    disableAnimations?: boolean;
    spotlightRadius?: number;
    particleCount?: number;
    enableTilt?: boolean;
    glowColor?: string;
    clickEffect?: boolean;
    enableMagnetism?: boolean;
}

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = '168, 85, 247';
const MOBILE_BREAKPOINT = 768;

const cardData: BentoCardProps[] = [
    {
        color: 'rgba(0, 0, 0, 0.4)',
        title: 'Art Showcase',
        description: 'Browse AI-generated NFT designs',
        label: 'Gallery'
    },
    {
        color: 'rgba(0, 0, 0, 0.4)',
        title: 'Connect with Me',
        description: 'Follow on social platforms',
        label: 'Social'
    },
    {
        color: 'rgba(0, 0, 0, 0.4)',
        title: 'Documentation',
        description: 'Complete project guide',
        label: ''
    },
    {
        color: 'rgba(0, 0, 0, 0.4)',
        title: 'Smart Contracts',
        description: 'View verified contracts',
        label: 'Blockchain'
    },
    {
        color: 'rgba(0, 0, 0, 0.4)',
        title: 'Idea to Prod',
        description: 'Learn about CRYPT platform',
        label: 'Info'
    },
    {
        color: 'rgba(0, 0, 0, 0.4)',
        title: 'Demo Video',
        description: 'Watch platform walkthrough',
        label: 'Video'
    }
];

const createParticleElement = (
    x: number,
    y: number,
    color: string = DEFAULT_GLOW_COLOR
): HTMLDivElement => {
    const el = document.createElement('div');
    el.className = 'particle';
    el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
    return el;
};

const calculateSpotlightValues = (radius: number) => ({
    proximity: radius * 0.5,
    fadeDistance: radius * 0.75
});

const updateCardGlowProperties = (
    card: HTMLElement,
    mouseX: number,
    mouseY: number,
    glow: number,
    radius: number
) => {
    const rect = card.getBoundingClientRect();
    const relativeX = ((mouseX - rect.left) / rect.width) * 100;
    const relativeY = ((mouseY - rect.top) / rect.height) * 100;

    card.style.setProperty('--glow-x', `${relativeX}%`);
    card.style.setProperty('--glow-y', `${relativeY}%`);
    card.style.setProperty('--glow-intensity', glow.toString());
    card.style.setProperty('--glow-radius', `${radius}px`);
};

const ParticleCard: React.FC<{
    children: React.ReactNode;
    className?: string;
    disableAnimations?: boolean;
    style?: React.CSSProperties;
    particleCount?: number;
    glowColor?: string;
    enableTilt?: boolean;
    clickEffect?: boolean;
    enableMagnetism?: boolean;
}> = ({
    children,
    className = '',
    disableAnimations = false,
    style,
    particleCount = DEFAULT_PARTICLE_COUNT,
    glowColor = DEFAULT_GLOW_COLOR,
    enableTilt = true,
    clickEffect = false,
    enableMagnetism = false
}) => {
        const cardRef = useRef<HTMLDivElement>(null);
        const particlesRef = useRef<HTMLDivElement[]>([]);
        const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
        const isHoveredRef = useRef(false);
        const memoizedParticles = useRef<HTMLDivElement[]>([]);
        const particlesInitialized = useRef(false);
        const magnetismAnimationRef = useRef<gsap.core.Tween | null>(null);

        const initializeParticles = useCallback(() => {
            if (particlesInitialized.current || !cardRef.current) return;

            const { width, height } = cardRef.current.getBoundingClientRect();
            memoizedParticles.current = Array.from({ length: particleCount }, () =>
                createParticleElement(Math.random() * width, Math.random() * height, glowColor)
            );
            particlesInitialized.current = true;
        }, [particleCount, glowColor]);

        const clearAllParticles = useCallback(() => {
            timeoutsRef.current.forEach(clearTimeout);
            timeoutsRef.current = [];
            magnetismAnimationRef.current?.kill();

            particlesRef.current.forEach(particle => {
                gsap.to(particle, {
                    scale: 0,
                    opacity: 0,
                    duration: 0.3,
                    ease: 'back.in(1.7)',
                    onComplete: () => {
                        particle.parentNode?.removeChild(particle);
                    }
                });
            });
            particlesRef.current = [];
        }, []);

        const animateParticles = useCallback(() => {
            if (!cardRef.current || !isHoveredRef.current) return;

            if (!particlesInitialized.current) {
                initializeParticles();
            }

            memoizedParticles.current.forEach((particle, index) => {
                const timeoutId = setTimeout(() => {
                    if (!isHoveredRef.current || !cardRef.current) return;

                    const clone = particle.cloneNode(true) as HTMLDivElement;
                    cardRef.current.appendChild(clone);
                    particlesRef.current.push(clone);

                    gsap.fromTo(
                        clone,
                        { scale: 0, opacity: 0 },
                        { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
                    );

                    gsap.to(clone, {
                        x: (Math.random() - 0.5) * 100,
                        y: (Math.random() - 0.5) * 100,
                        rotation: Math.random() * 360,
                        duration: 2 + Math.random() * 2,
                        ease: 'none',
                        repeat: -1,
                        yoyo: true
                    });

                    gsap.to(clone, {
                        opacity: 0.3,
                        duration: 1.5,
                        ease: 'power2.inOut',
                        repeat: -1,
                        yoyo: true
                    });
                }, index * 100);

                timeoutsRef.current.push(timeoutId);
            });
        }, [initializeParticles]);

        useEffect(() => {
            if (disableAnimations || !cardRef.current) return;

            const element = cardRef.current;

            const handleMouseEnter = () => {
                isHoveredRef.current = true;
                animateParticles();

                if (enableTilt) {
                    gsap.to(element, {
                        rotateX: 5,
                        rotateY: 5,
                        duration: 0.3,
                        ease: 'power2.out',
                        transformPerspective: 1000
                    });
                }
            };

            const handleMouseLeave = () => {
                isHoveredRef.current = false;
                clearAllParticles();

                if (enableTilt) {
                    gsap.to(element, {
                        rotateX: 0,
                        rotateY: 0,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                }

                if (enableMagnetism) {
                    gsap.to(element, {
                        x: 0,
                        y: 0,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                }
            };

            const handleMouseMove = (e: MouseEvent) => {
                if (!enableTilt && !enableMagnetism) return;

                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                if (enableTilt) {
                    const rotateX = ((y - centerY) / centerY) * -10;
                    const rotateY = ((x - centerX) / centerX) * 10;

                    gsap.to(element, {
                        rotateX,
                        rotateY,
                        duration: 0.1,
                        ease: 'power2.out',
                        transformPerspective: 1000
                    });
                }

                if (enableMagnetism) {
                    const magnetX = (x - centerX) * 0.05;
                    const magnetY = (y - centerY) * 0.05;

                    magnetismAnimationRef.current = gsap.to(element, {
                        x: magnetX,
                        y: magnetY,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                }
            };

            const handleClick = (e: MouseEvent) => {
                if (!clickEffect) return;

                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const maxDistance = Math.max(
                    Math.hypot(x, y),
                    Math.hypot(x - rect.width, y),
                    Math.hypot(x, y - rect.height),
                    Math.hypot(x - rect.width, y - rect.height)
                );

                const ripple = document.createElement('div');
                ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 1000;
      `;

                element.appendChild(ripple);

                gsap.fromTo(
                    ripple,
                    {
                        scale: 0,
                        opacity: 1
                    },
                    {
                        scale: 1,
                        opacity: 0,
                        duration: 0.8,
                        ease: 'power2.out',
                        onComplete: () => ripple.remove()
                    }
                );
            };

            element.addEventListener('mouseenter', handleMouseEnter);
            element.addEventListener('mouseleave', handleMouseLeave);
            element.addEventListener('mousemove', handleMouseMove);
            element.addEventListener('click', handleClick);

            return () => {
                isHoveredRef.current = false;
                element.removeEventListener('mouseenter', handleMouseEnter);
                element.removeEventListener('mouseleave', handleMouseLeave);
                element.removeEventListener('mousemove', handleMouseMove);
                element.removeEventListener('click', handleClick);
                clearAllParticles();
            };
        }, [animateParticles, clearAllParticles, disableAnimations, enableTilt, enableMagnetism, clickEffect, glowColor]);

        return (
            <div
                ref={cardRef}
                className={`${className} particle-container`}
                style={{ ...style, position: 'relative', overflow: 'hidden' }}
            >
                {children}
            </div>
        );
    };

const GlobalSpotlight: React.FC<{
    gridRef: React.RefObject<HTMLDivElement | null>;
    disableAnimations?: boolean;
    enabled?: boolean;
    spotlightRadius?: number;
    glowColor?: string;
}> = ({
    gridRef,
    disableAnimations = false,
    enabled = true,
    spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
    glowColor = DEFAULT_GLOW_COLOR
}) => {
        const spotlightRef = useRef<HTMLDivElement | null>(null);
        const isInsideSection = useRef(false);

        useEffect(() => {
            if (disableAnimations || !gridRef?.current || !enabled) return;

            const spotlight = document.createElement('div');
            spotlight.className = 'global-spotlight';
            spotlight.style.cssText = `
      position: fixed;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.15) 0%,
        rgba(${glowColor}, 0.08) 15%,
        rgba(${glowColor}, 0.04) 25%,
        rgba(${glowColor}, 0.02) 40%,
        rgba(${glowColor}, 0.01) 65%,
        transparent 70%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `;

            document.body.appendChild(spotlight);
            spotlightRef.current = spotlight;

            const handleMouseMove = (e: MouseEvent) => {
                if (!spotlightRef.current || !gridRef.current) return;

                const section = gridRef.current.closest('.bento-section');
                const rect = section?.getBoundingClientRect();
                const mouseInside =
                    rect &&
                    e.clientX >= rect.left &&
                    e.clientX <= rect.right &&
                    e.clientY >= rect.top &&
                    e.clientY <= rect.bottom;

                isInsideSection.current = mouseInside || false;

                const cards = gridRef.current.querySelectorAll('.magic-bento-card');

                if (!mouseInside) {
                    gsap.to(spotlightRef.current, {
                        opacity: 0,
                        duration: 0.3,
                        ease: 'power2.out'
                    });

                    cards.forEach(card => {
                        (card as HTMLElement).style.setProperty('--glow-intensity', '0');
                    });
                    return;
                }

                const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
                let minDistance = Infinity;

                cards.forEach(card => {
                    const cardElement = card as HTMLElement;
                    const cardRect = cardElement.getBoundingClientRect();
                    const centerX = cardRect.left + cardRect.width / 2;
                    const centerY = cardRect.top + cardRect.height / 2;

                    const distance =
                        Math.hypot(e.clientX - centerX, e.clientY - centerY) -
                        Math.max(cardRect.width, cardRect.height) / 2;

                    const effectiveDistance = Math.max(0, distance);
                    minDistance = Math.min(minDistance, effectiveDistance);

                    let glowIntensity = 0;
                    if (effectiveDistance <= proximity) {
                        glowIntensity = 1;
                    } else if (effectiveDistance <= fadeDistance) {
                        glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
                    }

                    updateCardGlowProperties(cardElement, e.clientX, e.clientY, glowIntensity, spotlightRadius);
                });

                gsap.to(spotlightRef.current, {
                    left: e.clientX,
                    top: e.clientY,
                    duration: 0.1,
                    ease: 'power2.out'
                });

                const targetOpacity =
                    minDistance <= proximity
                        ? 0.8
                        : minDistance <= fadeDistance
                            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
                            : 0;

                gsap.to(spotlightRef.current, {
                    opacity: targetOpacity,
                    duration: targetOpacity > 0 ? 0.2 : 0.5,
                    ease: 'power2.out'
                });
            };

            const handleMouseLeave = () => {
                isInsideSection.current = false;
                gridRef.current?.querySelectorAll('.magic-bento-card').forEach(card => {
                    (card as HTMLElement).style.setProperty('--glow-intensity', '0');
                });

                if (spotlightRef.current) {
                    gsap.to(spotlightRef.current, {
                        opacity: 0,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                }
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseleave', handleMouseLeave);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseleave', handleMouseLeave);
                spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
            };
        }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

        return null;
    };

const BentoCardGrid: React.FC<{
    children: React.ReactNode;
    gridRef?: React.RefObject<HTMLDivElement | null>;
}> = ({ children, gridRef }) => (
    <div className="card-grid bento-section" ref={gridRef}>
        {children}
    </div>
);

const useMobileDetection = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
};

const MagicBento: React.FC<BentoProps> = ({
    textAutoHide = true,
    enableStars = true,
    enableSpotlight = true,
    enableBorderGlow = true,
    disableAnimations = false,
    spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
    particleCount = DEFAULT_PARTICLE_COUNT,
    enableTilt = false,
    glowColor = DEFAULT_GLOW_COLOR,
    clickEffect = true,
    enableMagnetism = true
}) => {
    const gridRef = useRef<HTMLDivElement>(null);
    const isMobile = useMobileDetection();
    const shouldDisableAnimations = disableAnimations || isMobile;

    return (
        <>
            {enableSpotlight && (
                <GlobalSpotlight
                    gridRef={gridRef}
                    disableAnimations={shouldDisableAnimations}
                    enabled={enableSpotlight}
                    spotlightRadius={spotlightRadius}
                    glowColor={glowColor}
                />
            )}
            <BentoCardGrid gridRef={gridRef}>
                {cardData.map((card, index) => {
                    const baseClassName = `magic-bento-card ${textAutoHide ? 'magic-bento-card--text-autohide' : ''
                        } ${enableBorderGlow ? 'magic-bento-card--border-glow' : ''}`;

                    const cardProps = {
                        className: baseClassName,
                        style: {
                            backgroundColor: card.color,
                            '--glow-color': glowColor
                        } as React.CSSProperties
                    };

                    if (enableStars) {
                        return (
                            <ParticleCard
                                key={index}
                                {...cardProps}
                                disableAnimations={shouldDisableAnimations}
                                particleCount={particleCount}
                                glowColor={glowColor}
                                enableTilt={enableTilt}
                                clickEffect={clickEffect}
                                enableMagnetism={enableMagnetism}
                            >
                                {index === 1 ? (
                                    // Connect with Me card
                                    <>
                                        <div className="magic-bento-card__header">
                                            <div className="magic-bento-card__label">{card.label}</div>
                                        </div>
                                        <div className="magic-bento-card__content">
                                            <h2 className="magic-bento-card__title">{card.title}</h2>
                                            <p className="magic-bento-card__description mb-4">{card.description}</p>
                                            <div className="flex gap-3 mt-auto">
                                                <a href="https://github.com/Iam-jayant" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                                                    <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                                                </a>
                                                <a href="https://x.com/0xjayantxyz" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                                                    <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                                </a>
                                                <a href="https://www.linkedin.com/in/jayant-kurekar/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                                                    <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                                </a>
                                            </div>
                                        </div>
                                    </>
                                ) : index === 2 ? (
                                    // Documentation card
                                    <a href="https://www.notion.so/CRPT-Documentation-2be4b6aeb42480f7b0b2f10caafb0209" target="_blank" rel="noopener noreferrer" className="block h-full">
                                        <div className="magic-bento-card__header">
                                            <div className="magic-bento-card__label">{card.label}</div>
                                        </div>
                                        <div className="magic-bento-card__content">
                                            <h2 className="magic-bento-card__title">{card.title}</h2>
                                            <p className="magic-bento-card__description">{card.description}</p>
                                            <div className="mt-4 text-violet-400 text-sm flex items-center gap-2">
                                                <span>Read docs</span>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                            </div>
                                        </div>
                                    </a>
                                ) : index === 5 ? (
                                    // Demo Video card
                                    <a href="https://youtube.com/Iam-jayant" target="_blank" rel="noopener noreferrer" className="block h-full">
                                        <div className="magic-bento-card__header">
                                            <div className="magic-bento-card__label">{card.label}</div>
                                        </div>
                                        <div className="magic-bento-card__content flex flex-col items-center justify-center h-full">
                                            <div className="w-16 h-16 rounded-full border-2 border-white/30 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors mb-4">
                                                <svg className="w-8 h-8 ml-1" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                            </div>
                                            <h2 className="magic-bento-card__title text-center">{card.title}</h2>
                                            <p className="magic-bento-card__description text-center">{card.description}</p>
                                        </div>
                                    </a>
                                ) : (
                                    // Default card
                                    <>
                                        <div className="magic-bento-card__header">
                                            <div className="magic-bento-card__label">{card.label}</div>
                                        </div>
                                        <div className="magic-bento-card__content">
                                            <h2 className="magic-bento-card__title">{card.title}</h2>
                                            <p className="magic-bento-card__description">{card.description}</p>
                                        </div>
                                    </>
                                )}
                            </ParticleCard>
                        );
                    }

                    return (
                        <div key={index} {...cardProps}>
                            <div className="magic-bento-card__header">
                                <div className="magic-bento-card__label">{card.label}</div>
                            </div>
                            <div className="magic-bento-card__content">
                                <h2 className="magic-bento-card__title">{card.title}</h2>
                                <p className="magic-bento-card__description">{card.description}</p>
                            </div>
                        </div>
                    );
                })}
            </BentoCardGrid>
        </>
    );
};

export default MagicBento;
