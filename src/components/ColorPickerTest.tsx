import React from 'react'
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';
import { Color, ColorPickerProps, ColorResult, TwitterPicker } from 'react-color';

const ColorPickerTest = () => {
  const getColor = (color: ColorResult) => {
    console.log(color.hex);
  }
  const popover = (

    <TwitterPicker onChangeComplete={getColor} />

  );

  return (
    <OverlayTrigger trigger="click" placement="right" overlay={popover}>
      <Button variant="success">Click me to see</Button>
    </OverlayTrigger>
  )
}

export default ColorPickerTest