import React, { useState } from 'react'
import { Alert, Button, Offcanvas } from 'react-bootstrap'
import { CgNotes } from "react-icons/cg";
const SideBar = () => {
  enum sizes {
    small = "5%",
    big = "20%"
  }
  // {show} this is for ....
  const [show, setShow] = useState(false);
  const [width, setWidth] = useState<sizes>(sizes.big);
  const [visibility, setVisibility] = useState<boolean>(true);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button className="ms-auto" onClick={() => {
        setWidth(width === sizes.big ? sizes.small : sizes.big);
        setVisibility(false);
        setShow(true)
      }}>rrrr</Button>
      {visibility && <div>test</div>}
      <Offcanvas
        className="mt-5"
        show={show} onHide={() => {
          setWidth(width === sizes.big ? sizes.small : sizes.big);
          setVisibility(false);
        }} style={{ "width": width, "transition": "width 0.5s" }} backdrop={false}>
        <Offcanvas.Body>
          <div><CgNotes /> Some text</div>
        </Offcanvas.Body>
      </Offcanvas>

      <div>*Lorem ipsum, dolor sit amet consectetur adipisicing elit. Reprehenderit ea eius illo doloremque, sequi consequatur incidunt excepturi expedita? Consequuntur enim ad tenetur corporis beatae consequatur velit dicta quam ratione accusamus!</div>
    </>
  )
}

export default SideBar