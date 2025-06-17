
'use client';

import React, { useState, useCallback } from 'react';
import { Trash, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AnimatedTrashIconProps {
  onClear: () => void;
  className?: string;
  ariaLabel?: string;
}

const AnimatedTrashIcon: React.FC<AnimatedTrashIconProps> = ({ onClear, className, ariaLabel }) => {
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  const handleClick = useCallback(() => {
    setIsTrashOpen(true); // "Abre" la papelera
    onClear(); // Ejecuta la acción de borrado

    // Simula el cierre de la tapa después de que la acción (y el toast) probablemente hayan terminado.
    // Una implementación más robusta podría usar una promesa o callback desde onClear.
    setTimeout(() => {
      setIsTrashOpen(false); // "Cierra" la papelera
    }, 1500); // Ajusta este tiempo si es necesario para que coincida con la duración del toast
  }, [onClear]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      aria-label={ariaLabel || "Clear chat"}
      className={cn(
        "rounded-full text-destructive hover:text-destructive hover:bg-destructive/10",
        "hover:animate-shake", // Mantenemos la animación de shake al pasar el cursor
        className
      )}
    >
      {isTrashOpen ? <Trash className="h-5 w-5" /> : <Trash2 className="h-5 w-5" />}
    </Button>
  );
};

export default AnimatedTrashIcon;
