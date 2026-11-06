import { decodeDesignLink } from "../domain/design-links";
import { removeDesignParameter } from "../adapters/browser-sharing";
import { useEffect, useReducer } from "react";
import {
  customizerReducer,
  initialCustomizerState,
  type ConfigurationChange,
} from "../domain/customizer-reducer";

export const useCustomizer = () => {
  const [state, dispatch] = useReducer(
    customizerReducer,
    initialCustomizerState,
  );
  useEffect(() => {
    dispatch({
      type: "initialize",
      design: decodeDesignLink(window.location.search),
    });
  }, []);
  const reset = () => {
    dispatch({ type: "reset" });
    if (!removeDesignParameter())
      dispatch({
        type: "link-warning",
        message:
          "El diseño se restableció, pero no se pudo actualizar la dirección. Al recargar puede volver el diseño del enlace.",
      });
  };
  const change = (change: ConfigurationChange) =>
    dispatch({ type: "change", ...change });
  return { ...state, change, reset };
};
