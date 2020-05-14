import React from 'react';
import IconProvider, { IconInfo } from '../../api/iconProvider';

/**
 * Generates various KBase Narrative icons from input props.
 */

interface TypeProps {
  objType: string;
}

interface CellProps {
  cellType: string;
  appId?: string;
  appTag?: string;
}

export function TypeIcon(props: TypeProps) {
  const iconProvider = IconProvider.Instance;
  const iconInfo = iconProvider.typeIcon(props.objType);
  return (
    <span className="fa-stack fa-lg">
      <span
        className="fa fa-circle fa-stack-2x"
        style={{ color: iconInfo.color }}
      />
      <span className={`fa fa-inverse fa-stack-1x ${iconInfo.icon}`} />
    </span>
  );
}

export function CellIcon(props: CellProps) {}
