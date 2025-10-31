import { ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';

type ButtonVariant = 'primary' | 'success' | 'danger' | 'disabled';

interface BaseProps {
  variant?: ButtonVariant;
  className?: string;
  fullWidth?: boolean;
}

interface ButtonProps extends BaseProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  href?: never;
}

interface LinkProps extends BaseProps {
  children: ReactNode;
  href: string;
  onClick?: never;
  type?: never;
  disabled?: never;
}

type VintageButtonProps = ButtonProps | LinkProps;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-b from-amber-600 to-amber-800 text-white border-amber-900 shadow-[0_4px_0_0_rgba(120,53,15,0.4),inset_0_2px_0_0_rgba(255,255,255,0.2)] hover:shadow-[0_2px_0_0_rgba(120,53,15,0.4),inset_0_2px_0_0_rgba(255,255,255,0.2)] hover:translate-y-[2px]',
  success:
    'bg-green-600 text-white border-green-900 shadow-[0_4px_0_0_rgba(20,83,45,0.4),inset_0_2px_0_0_rgba(255,255,255,0.2)] hover:shadow-[0_2px_0_0_rgba(20,83,45,0.4),inset_0_2px_0_0_rgba(255,255,255,0.2)] hover:translate-y-[2px]',
  danger:
    'bg-gradient-to-b from-red-600 to-red-800 text-white border-red-900 shadow-[0_4px_0_0_rgba(127,29,29,0.4),inset_0_2px_0_0_rgba(255,255,255,0.2)] hover:shadow-[0_2px_0_0_rgba(127,29,29,0.4),inset_0_2px_0_0_rgba(255,255,255,0.2)] hover:translate-y-[2px]',
  disabled: 'bg-gradient-to-b from-gray-300 to-gray-400 text-gray-600 cursor-not-allowed border-gray-500 shadow-[0_4px_0_0_rgba(107,114,128,0.3),inset_0_2px_0_0_rgba(255,255,255,0.2)]',
};

export default function VintageButton({
  children,
  variant = 'primary',
  className = '',
  fullWidth = false,
  ...props
}: VintageButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center px-12 py-6 font-extrabold text-lg border-4 rounded-[50%] transition-all duration-150 relative overflow-hidden cursor-pointer';
  const widthStyles = fullWidth ? 'w-full' : '';
  const combinedStyles = `${baseStyles} ${widthStyles} ${variantStyles[variant]} ${className}`;

  const content = <span className="relative z-10">{children}</span>;

  if ('href' in props && props.href) {
    return (
      <Link href={props.href} className={combinedStyles}>
        {content}
      </Link>
    );
  }

  const { disabled, ...buttonProps } = props as ButtonProps;
  const effectiveVariant = disabled ? 'disabled' : variant;
  const buttonStyles = `${baseStyles} ${widthStyles} ${variantStyles[effectiveVariant]} ${className}`;

  return (
    <button {...buttonProps} disabled={disabled} className={buttonStyles}>
      {content}
    </button>
  );
}
