import React from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import * as IoIcons from "react-icons/io";
import * as RiIcons from "react-icons/ri";

export const SidebarData = [
  {
    title: "Principal",
    path: "/principal",
    icon: <AiIcons.AiFillHome />,
    iconClosed: <RiIcons.RiArrowDownSFill />,
    iconOpened: <RiIcons.RiArrowUpSFill />,

    subNav: [
      {
        title: "Usuarios",
        path: "/principal/usuarios",
        icon: <IoIcons.IoIosPaper />,
      },
      {
        title: "Información",
        path: "/principal/info",
        icon: <IoIcons.IoIosPaper />,
      },
    ],
  },
  {
    title: "Reportes",
    path: "/reportes",
    icon: <IoIcons.IoIosPaper />,
    iconClosed: <RiIcons.RiArrowDownSFill />,
    iconOpened: <RiIcons.RiArrowUpSFill />,

    subNav: [
      {
        title: "Reportes",
        path: "/reportes/reportes1",
        icon: <IoIcons.IoIosPaper />,
        cName: "sub-nav",
      },
      {
        title: "Reportes 2",
        path: "/reportes/reportes2",
        icon: <IoIcons.IoIosPaper />,
        cName: "sub-nav",
      },
      {
        title: "Reportes 3",
        path: "/reportes/reportes3",
        icon: <IoIcons.IoIosPaper />,
      },
    ],
  },
  {
    title: "Modo Cuadricula",
    path: "/grilla",
    icon: <FaIcons.FaTh />,
  },
  {
    title: "Acerca",
    path: "/acerca",
    icon: <AiIcons.AiFillInfoCircle />,
  },
];
