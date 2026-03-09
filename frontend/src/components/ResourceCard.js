import React from 'react';
import { Trash2 } from 'lucide-react';

const ResourceCard = ({
  icon: Icon,
  iconBgClass,
  title,
  subtitle,
  subtitleClassName = '',
  statusLabel,
  statusColorClass,
  stats = [],
  footerText,
  footerIcon: FooterIcon,
  footerIconClass = 'text-dark-400',
  onDelete,
}) => {
  return (
    <div className="card hover:bg-dark-700/50 transition-colors cursor-pointer flex flex-col h-full relative group">
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-4 right-4 p-2 text-dark-400 hover:text-red-400 bg-dark-800 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10 shadow-lg border border-dark-600"
          title="Удалить"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
      <div className="flex items-start justify-between mb-4 flex-grow">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBgClass}`}>
            {Icon && <Icon className="w-5 h-5 text-white" />}
          </div>
          <div className="pr-8">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className={`text-sm text-dark-400 ${subtitleClassName}`.trim()}>{subtitle}</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 mb-4">
        <div className={`w-2 h-2 rounded-full ${statusColorClass}`}></div>
        <span className="text-sm text-dark-300 capitalize">{statusLabel}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {stats.map((stat) => {
          const StatIcon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center space-x-2">
              {StatIcon && <StatIcon className={`w-4 h-4 ${stat.iconClass || 'text-dark-400'}`} />}
              <div>
                <span className="block text-sm text-dark-400">{stat.label}</span>
                <span className="text-white font-medium">{stat.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-dark-700 mt-auto">
        <span className="text-sm text-dark-400">{footerText}</span>
        {FooterIcon && <FooterIcon className={`w-4 h-4 ${footerIconClass}`} />}
      </div>
    </div>
  );
};

export default ResourceCard;