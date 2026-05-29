'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, MagnifyingGlassIcon, UserCircleIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/', label: 'Discover', icon: HomeIcon },
  { href: '/browse', label: 'Browse', icon: MagnifyingGlassIcon },
  { href: '/chat', label: 'Chats', icon: ChatBubbleLeftIcon },
  { href: '/dashboard', label: 'You', icon: UserCircleIcon },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface-elevated/90 backdrop-blur-lg border-t border-subtle z-50 md:hidden">
      <div className="grid grid-cols-4 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn('flex flex-col items-center justify-center text-xs', active ? 'text-trust' : 'text-content-secondary')}
            >
              <Icon className="h-6 w-6 mb-1" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
