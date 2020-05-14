import React from 'react';
import { DataObject } from '../../../utils/narrativeData';
import { getWSTypeName } from '../../../utils/stringUtils';
import { TypeIcon } from '../../generic/Icon';

interface Props {
  dataObjects: Array<DataObject>;
}

export default function DataView(props: Props) {
  const rows = props.dataObjects
    .slice(0, 50)
    .map(obj => {
      obj.readableType = getWSTypeName(obj.obj_type);
      return obj;
    })
    .sort((a, b) => a.readableType.localeCompare(b.readableType))
    .map(obj => dataViewRow(obj));
  return <div className="pt3">{rows}</div>;

  // View for each row in the data listing for the narrative
  function dataViewRow(obj: DataObject) {
    const key = obj.name + obj.obj_type;
    const leftWidth = 40; // percentage
    return (
      <div key={key} className="flex flex-row flex-nowrap pv1 pl2">
        <div>
          <TypeIcon objType={obj.obj_type} />
        </div>
        <div className="ml4">
          <div className="">{obj.name}</div>
          <div className="black-80 f6 mt1">{obj.readableType}</div>
        </div>
      </div>
    );
  }
}
