
import React from 'react';
import { 
  LifeBuoy, Server, MessageCircle, Mail, Monitor, 
  Users, UserPlus, Heart, Folder, Book, Library, 
  Shield, Search, Lock, Zap, Globe, Layout, Star,
  HelpCircle, Calendar, ClipboardList, Scale, FileText
} from 'lucide-react';

// Mapa centralizado de ícones do sistema
export const ICON_MAP: Record<string, React.ElementType> = {
  // Sidebar & Categories
  'life-buoy': LifeBuoy,
  'server': Server,
  'message-circle': MessageCircle,
  'mail': Mail,
  'monitor': Monitor,
  'users': Users,
  'user-plus': UserPlus,
  'heart': Heart,
  'folder': Folder,
  'book': Book,
  'library': Library,
  
  // Settings & UI
  'shield': Shield,
  'search': Search,
  'lock': Lock,
  'zap': Zap,
  'globe': Globe,
  'layout': Layout,
  'star': Star,

  // Templates
  'help-circle': HelpCircle,
  'calendar': Calendar,
  'clipboard-list': ClipboardList,
  'scale': Scale,
  'file-text': FileText
};

interface IconRendererProps {
  iconName?: string;
  size?: number;
  className?: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ iconName, size = 16, className = '' }) => {
  if (!iconName) return null;

  // 1. Verifica se existe no mapa
  const MappedIcon = ICON_MAP[iconName.toLowerCase()];
  
  if (MappedIcon) {
    return <MappedIcon size={size} className={className} />;
  }

  // 2. Verifica se é um emoji (curto)
  if (iconName.length <= 2) {
    return <span style={{ fontSize: size }} className={className}>{iconName}</span>;
  }

  // 3. Fallback genérico se for uma string desconhecida
  return <Folder size={size} className={`text-gray-400 ${className}`} />;
};
