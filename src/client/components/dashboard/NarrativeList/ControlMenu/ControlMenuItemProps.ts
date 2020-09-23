import { Doc } from '../../../../utils/narrativeData';

interface ControlMenuItemProps {
  narrative: Doc;
  cancelFn?: () => void;
  doneFn: () => void;
}

export default ControlMenuItemProps;
