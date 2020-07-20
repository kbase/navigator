import { Doc } from '../../../../utils/narrativeData';

export default interface ControlMenuItemProps {
  narrative: Doc;
  cancelFn?: () => void;
  doneFn: () => void;
}
