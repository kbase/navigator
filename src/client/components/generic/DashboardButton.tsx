import React, { Component } from 'react';

type DashboardButtonProps = {
    bgcolor?: string;
    textcolor?: string;
} & React.HTMLAttributes<HTMLButtonElement>;

function DashboardButton(props: DashboardButtonProps) {
    const styling = {
        backgroundColor: props.bgcolor,
        color: props.textcolor,
        border: '1px solid #ccc'
    };
    return (
        <button
            className="pointer dim dib pa2 br2 dib mh1"
            style={styling}
            {...props}>
            {props.children}
        </button>
    );
}

export default DashboardButton;
