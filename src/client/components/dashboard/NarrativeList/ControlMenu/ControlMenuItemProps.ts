import { Doc } from '../../../../utils/narrativeData';

interface ControlMenuItemProps {
  narrative: Doc;
  cancelFn?: () => void;
  doneFn: () => void;
  isCurrentVersion?: boolean;
}

export default ControlMenuItemProps;
