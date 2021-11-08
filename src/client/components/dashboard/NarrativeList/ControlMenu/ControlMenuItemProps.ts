import { Doc } from '../../../../utils/narrativeData';
import { History } from 'history'

interface ControlMenuItemProps {
  narrative: Doc;
  cancelFn?: () => void;
  doneFn: () => void;
  isCurrentVersion?: boolean;
  history?: History;
  category: string;
}

export default ControlMenuItemProps;
