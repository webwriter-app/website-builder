import { css } from "lit";

export const draggingStyles = css`
  /* ===== Dragging visuals ===== */

  .builder-element.dragging {
    z-index: 1000;
    pointer-events: none; /* let pointer hit underlying items for hit-testing */
    will-change: left, top;
  }

  .builder-element.dragging .drag-shell {
    transform-origin: center;
    animation: pickUp 140ms ease-out forwards;
  }

  @keyframes pickUp {
    from {
      transform: translateZ(0) scale(1);
      box-shadow: none;
    }
    to {
      transform: translateZ(0) scale(1.03);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
    }
  }

  .builder-element.freeform-dragging > .drag-shell {
    transform: scale(1.03);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
    transition:
      transform 120ms ease-out,
      box-shadow 120ms ease-out;
  }

  /* Placeholder while dragging */
  .drag-placeholder {
    border-radius: 12px;
    outline: 2px dashed rgba(0, 0, 0, 0.18);
    outline-offset: -2px;
    background: rgba(0, 0, 0, 0.03);
  }

  /* FLIP transitions for siblings */
  .flow-root .flow-item,
  .flex-root .flow-item,
  .grid-root .flow-item {
    transition: transform 160ms cubic-bezier(0.2, 0.8, 0.2, 1);
    will-change: transform;
  }

  .flow-item {
    contain: layout paint; /* reduces repaint scope */
  }
`;