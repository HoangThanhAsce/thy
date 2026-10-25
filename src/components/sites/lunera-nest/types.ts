/**
 * Layout model for the Canva-published invitation.
 *
 * Canva places every element absolutely on a section artboard. Coordinates are stored
 * in source pixels for three reference renders:
 * - `d`: desktop artboard measured at 1440px (scale 1, design width 1366px)
 * - `t`: tablet reflow measured at 1024px
 * - `m`: mobile reflow measured at 390px
 * `x` is relative to the horizontal centre of the section, `y` to the section top.
 */
export type Rect = readonly [x: number, y: number, w: number, h: number];

export interface Layout {
  d: Rect;
  t: Rect;
  m: Rect;
}

export type FontKey =
  | "times"
  | "seasons"
  | "cooper"
  | "amsterdam3"
  | "amsterdam4"
  | "andasia";

export type AnimType =
  | "wipe"
  | "rise"
  | "fade"
  | "pop"
  | "lift"
  | "letters"
  | "zoom";

export interface Anim {
  type: AnimType;
  /** ms after the section enters the viewport */
  delay: number;
  /** ms */
  duration: number;
  /** px (desktop) for rise / lift */
  distance?: number;
}

export interface TextRun {
  text: string;
  color?: string;
  weight?: number;
  href?: string;
}

export interface Paragraph {
  font: FontKey;
  size: number;
  lineHeight: number;
  /** em */
  letterSpacing: number;
  color: string;
  uppercase?: boolean;
  runs: TextRun[];
}

interface ElementBase {
  id: string;
  layout: Layout;
  rotate?: number;
  flip?: readonly [number, number];
  opacity?: number;
  /** CSS filter, e.g. a drop shadow */
  filter?: string;
  href?: string;
  anim?: Anim;
}

export interface ImageElement extends ElementBase {
  kind: "image";
  src: string;
  alt: string;
  /** image box inside the element, as fractions of the element box */
  crop?: readonly [x: number, y: number, w: number, h: number];
  cropRotate?: number;
}

export interface ShapeLayer {
  /** clip path in Canva's 256-unit space */
  path: string;
  pathScale: number;
  fill?: string;
  image?: { src: string; x: number; y: number; w: number; h: number };
  stroke?: { viewBox: string; path: string; color: string; width: number };
}

export interface ShapeElement extends ElementBase {
  kind: "shape";
  /** desktop size, used as the SVG viewBox */
  size: readonly [w: number, h: number];
  layers: ShapeLayer[];
  alt?: string;
}

export interface LineElement extends ElementBase {
  kind: "line";
  /** desktop size, used as the SVG viewBox */
  size: readonly [w: number, h: number];
  path: string;
  color: string;
  strokeWidth: number;
  linecap: "round" | "butt" | "square";
}

export interface TextBox {
  /** top-left of the text box, same coordinate space as `Layout` */
  x: number;
  y: number;
  /** Canva's text scale for this layout */
  k: number;
}

export interface TextElement extends ElementBase {
  kind: "text";
  box: { w: number; h: number; d: TextBox; t: TextBox; m: TextBox };
  /** optical offset Canva applies inside the box */
  offset: readonly [x: number, y: number];
  paragraphs: Paragraph[];
}

export interface WidgetElement extends ElementBase {
  kind: "youtube" | "countdown" | "rsvp";
}

export type SiteElement =
  | ImageElement
  | ShapeElement
  | LineElement
  | TextElement
  | WidgetElement;

export interface BackgroundImage {
  src: string;
  /** aspect ratio (w / h) of the image box */
  ratio: number;
  /** how far the image overscans a centred cover fit */
  bleed: { d: number; t: number; m: number };
}

export interface Section {
  id: string;
  height: { d: number; t: number; m: number };
  /** Canva "fit to screen" sections are at least one viewport tall */
  fillViewport?: boolean;
  background: string;
  backgroundImage?: BackgroundImage;
  elements: SiteElement[];
}

export interface PageData {
  sections: Section[];
}
