import { Doc } from '../../../../utils/NarrativeModel';
import { AuthInfo } from '../../../Auth';

interface ControlMenuItemProps {
  authInfo: AuthInfo;
  narrative: Doc;
  cancelFn?: () => void;
  doneFn: () => void;
}

export default ControlMenuItemProps;
