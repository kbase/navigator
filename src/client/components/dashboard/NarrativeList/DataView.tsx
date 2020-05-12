import React from 'react';
import { DataObject } from '../../../utils/narrativeData';
import { getWSTypeName } from '../../../utils/stringUtils';

interface Props {
    dataObjects: Array<DataObject>
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
    return (
        <div>
            <p className="black-60">
                {props.dataObjects.length} total objects in the Narrative
            </p>
            <div className="dt dt--fixed">{rows}</div>
        </div>
    );

    // View for each row in the data listing for the narrative
    function dataViewRow(obj: DataObject) {
        const key = obj.name + obj.obj_type;
        const leftWidth = 40; // percentage
        return (
        <div key={key} className="dt-row">
            <span
            className="dib mr2 dtc b pa2 truncate"
            style={{ width: leftWidth + '%' }}
            >
            <i className="fa fa-database dib mr2 green"></i>
            {obj.readableType}
            </span>
            <span
            className="dib dtc pa2 black-60 truncate"
            style={{ width: 100 - leftWidth + '%' }}
            >
            {obj.name}
            </span>
        </div>
        );
    }

}
