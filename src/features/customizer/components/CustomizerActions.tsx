import styles from "./CustomizerActions.module.scss";

type CustomizerActionsProps = {
  ready: boolean;
  onShare: () => void;
};
export const CustomizerActions = ({
  ready,
  onShare,
}: CustomizerActionsProps) => (
  <div className={styles.actions}>
    <button
      data-share-trigger
      className={styles.share}
      type="button"
      disabled={!ready}
      onClick={onShare}
    >
      <span className={styles.linkIcon} aria-hidden="true" />
      Compartir diseño
    </button>
    <p>Este enlace incluye los textos y la información de tu diseño.</p>
  </div>
);
