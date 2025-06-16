import React from 'react';
import LSAIGLogo from '@/components/AuraChatLogo'; // Path remains AuraChatLogo.tsx, but imports LSAIGLogo
import { Button } from '@/components/ui/button';
import { Save, FolderOpen, Trash2, Moon, Sun } from 'lucide-react'; // Assuming Moon/Sun for theme toggle
import { SidebarTrigger } from '@/components/ui/sidebar';

interface ChatHeaderProps {
  onSaveChat: () => void;
  onLoadChat: () => void;
  onClearChat: () => void;
  // onToggleTheme: () => void; // Add if theme toggle is implemented
  // currentTheme: 'light' | 'dark'; // Add if theme toggle is implemented
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onSaveChat, onLoadChat, onClearChat }) => {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card p-3 md:p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <LSAIGLogo />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onSaveChat} aria-label="Save chat">
          <Save className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onLoadChat} aria-label="Load chat">
          <FolderOpen className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onClearChat} aria-label="Clear chat" className="text-destructive hover:text-destructive hover:bg-destructive/10">
          <Trash2 className="h-5 w-5" />
        </Button>
        {/* Example for theme toggle - implement if needed
        <Button variant="ghost" size="icon" onClick={onToggleTheme} aria-label="Toggle theme">
          {currentTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        */}
      </div>
    </header>
  );
};

export default ChatHeader;
