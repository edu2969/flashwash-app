// components/OperatorPanel.tsx
'use client';

import { useState, useRef, TouchEvent } from 'react';
import SellerTerminal from './SellerTerminal';
import TodoList from './TodoList';

export default function OperatorPanel() {
    const [activeTab, setActiveTab] = useState<'terminal' | 'todos'>('terminal');
    const [touchStartX, setTouchStartX] = useState(0);
    const [touchEndX, setTouchEndX] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Manejar inicio del swipe
    const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
        setTouchStartX(e.targetTouches[0].clientX);
        setTouchEndX(e.targetTouches[0].clientX);
    };

    // Manejar movimiento del swipe
    const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
        setTouchEndX(e.targetTouches[0].clientX);
    };

    // Manejar fin del swipe
    const handleTouchEnd = () => {
        const swipeDistance = touchStartX - touchEndX;
        const minSwipeDistance = 50; // Mínimo 50px para activar swipe

        if (Math.abs(swipeDistance) > minSwipeDistance && !isTransitioning) {
            setIsTransitioning(true);
            
            if (swipeDistance > 0 && activeTab === 'terminal') {
                // Swipe izquierda - ir a TodoList
                setActiveTab('todos');
            } else if (swipeDistance < 0 && activeTab === 'todos') {
                // Swipe derecha - ir a SellerTerminal
                setActiveTab('terminal');
            }

            // Resetear estado de transición después de 200ms
            setTimeout(() => {
                setIsTransitioning(false);
            }, 200);
        }
    };

    // Navegación programática
    const navigateTo = (tab: 'terminal' | 'todos') => {
        if (tab !== activeTab && !isTransitioning) {
            setIsTransitioning(true);
            setActiveTab(tab);
            setTimeout(() => {
                setIsTransitioning(false);
            }, 200);
        }
    };

    return (
        <div className="h-dvh w-full overflow-hidden bg-neutral-900">
            {/* Contenedor de deslizamiento */}
            <div 
                ref={containerRef}
                className="h-full w-full overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
            >
                <div 
                    className="flex h-full w-[200%] transition-transform duration-200 ease-in-out"
                    style={{
                        transform: `translateX(${activeTab === 'terminal' ? '0%' : '-50%'})`,
                        willChange: 'transform',
                    }}
                >
                    {/* SellerTerminal - 50% del ancho */}
                    <div className="w-1/2 h-full shrink-0">
                        <SellerTerminal />
                    </div>

                    {/* TodoList - 50% del ancho */}
                    <div className="w-1/2 h-full shrink-0">
                        <TodoList />
                    </div>
                </div>
            </div>

            {/* Indicador de página (puntos) */}
            <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
                <div 
                    className={`w-2 h-2 rounded-full transition-all duration-300
                        ${activeTab === 'terminal' 
                            ? 'w-8 bg-cyan-400' 
                            : 'bg-neutral-600'
                        }`}
                />
                <div 
                    className={`w-2 h-2 rounded-full transition-all duration-300
                        ${activeTab === 'todos' 
                            ? 'w-8 bg-cyan-400' 
                            : 'bg-neutral-600'
                        }`}
                />
            </div>
        </div>
    );
}