import React, { useEffect, useState } from "react";

interface ICompProps {}

/**
 * 标题栏
 * @param props
 * @returns
 */
const TitleBar: React.FC<ICompProps> = (props) => {
  return (
    <div className="drag-el flex items-center justify-between h-32px select-none"></div>
  );
};

export default TitleBar;
