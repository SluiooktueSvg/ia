
'use client';

import React from 'react';
import LSAIGLogo from '@/components/AuraChatLogo';

const QuotaExceededScreen: React.FC = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center animate-fade-in">
      <div className="flex flex-col items-center">
        <LSAIGLogo />
        <h1 className="mt-8 text-2xl font-semibold text-destructive">Límite de Solicitudes Alcanzado</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Has superado la cuota de solicitudes gratuitas para hoy. El acceso se restablecerá mañana.
        </p>
        <p className="mt-4 text-xs text-muted-foreground/50">
          Error Code: 429 Too Many Requests
        </p>
      </div>
    </div>
  );
};

export default QuotaExceededScreen;
