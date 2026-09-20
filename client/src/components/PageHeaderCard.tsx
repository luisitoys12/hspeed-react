import { ReactNode } from "react";

interface PageHeaderCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  kicker?: string;
  icon?: ReactNode;
  rightElement?: ReactNode;
  action?: ReactNode;
  badge?: ReactNode;
}

export function PageHeaderCard({
  title,
  subtitle,
  description,
  kicker,
  icon,
  rightElement,
  action,
  badge,
}: PageHeaderCardProps) {
  const descText = description || subtitle;
  const actions = action || rightElement;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 flex items-center justify-between flex-wrap gap-4 transition-all">
      <div className="flex items-center gap-3.5 min-w-0">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg flex-shrink-0 border border-amber-500/20 shadow-xs">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          {kicker && (
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400 block">
              {kicker}
            </span>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              {title}
            </h1>
            {badge}
          </div>
          {descText && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate sm:whitespace-normal">
              {descText}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export default PageHeaderCard;

