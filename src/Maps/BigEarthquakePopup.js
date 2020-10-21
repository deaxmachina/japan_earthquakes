import React from "react";

const PopupInfo = ({ info }) => {

  return (
    <>
      <h3 className="header">{info.name}</h3>
      <p className="subhead">{info.date}</p>
    </>
  )
}

export default PopupInfo;