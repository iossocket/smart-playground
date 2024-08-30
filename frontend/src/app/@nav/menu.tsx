"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Farm', href: '/farm' },
  { name: 'Projects', href: '/projects' },
  { name: 'Staking', href: '/staking' },
]

export function Menu() {
  const pathname = usePathname();
  return <div className="absolute gap-12 top-0 h-full left-1/2 -translate-x-1/2 flex justify-center items-center">
    {navigation.map((item) => (
      <Link key={item.name} href={item.href} className={`text-sm font-semibold leading-6 ${pathname === item.href ? "text-[#6366f1]" : "text-white"}`}>
        {item.name}
      </Link>
    ))}
  </div>
}