import { useEffect, useRef } from "react";
import { supabase } from "./supabase";
import { auth } from "./auth";

export function useOutsideClick(handler, listenCapturing = true) {
  const ref = useRef();

  useEffect(
    function () {
      function handleClick(e) {
        if (ref.current && !ref.current.contains(e.target)) {
          handler();
        }
      }
      //First problem, when we click on the button the modal opens for a milisecond, and then immediately click on the outside is detected, so then it will close it
      //Solution: listen the event on the capturing phase, not the bubbling phase

      document.addEventListener("click", handleClick, listenCapturing);

      return () => document.removeEventListener("click", handleClick);
    },
    [handler, listenCapturing]
  );

  return ref;
}
