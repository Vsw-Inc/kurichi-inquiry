"use client";

/**
 * クリチちゃん Spline 3D ヒーロービュー。
 * iframe で my.spline.design を埋め込み。
 * 軽量・確実・SSR崩れなし。
 */
export default function SplineHero() {
  return (
    <div className="spline-wrap">
      <iframe
        src="https://my.spline.design/applewatchcopy-bcab29a377618726553d012ad8541da1/"
        title="クリチちゃん 3D"
        frameBorder="0"
        allow="autoplay; encrypted-media"
        loading="lazy"
        className="spline-iframe"
      />
      <div className="spline-overlay" aria-hidden />
    </div>
  );
}
