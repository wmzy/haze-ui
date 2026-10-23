import { createContext, useContext } from 'react';

/**
 * Registration protocol between `ImagePreviewGroup` and the `Image`
 * children rendered inside it (AntD `Image.PreviewGroup` shape): each
 * child with `preview` enabled contributes its `src`/`alt` to the
 * shared gallery and delegates its click to the group's single overlay
 * instead of opening one of its own.
 */

/** What a child `<Image preview>` contributes to the shared gallery. */
export type GalleryImage = {
  src: string;
  alt: string;
};

type ImageGalleryContextValue = {
  /**
   * False while the group runs `preview={false}` — children stay inert
   * (no registration, no click behavior) instead of falling back to
   * their own single-image overlays.
   */
  enabled: boolean;
  /** Adds an entry, returns the id used to unregister/activate it. */
  register: (image: GalleryImage) => number;
  unregister: (id: number) => void;
  /** Opens the shared overlay on the entry with this id. */
  activate: (id: number) => void;
};

const ImageGalleryContext = createContext<ImageGalleryContextValue | null>(
  null
);

export const ImageGalleryProvider = ImageGalleryContext.Provider;

/** The enclosing gallery, or null outside an `ImagePreviewGroup`. */
export function useImageGallery() {
  return useContext(ImageGalleryContext);
}
