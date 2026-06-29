import Image from "next/image";

/**
 * クリチちゃんヒーロービジュアル。
 * public/kurichi.png を Next.js Image で最適化表示。
 */
export default function KurichiHero() {
  return (
    <div className="kurichi-hero-wrap">
      <div className="kurichi-hero-glow" aria-hidden />
      <Image
        src="/kurichi.png"
        alt="クリチちゃん"
        width={800}
        height={800}
        priority
        sizes="(max-width: 880px) 90vw, 50vw"
        className="kurichi-hero-img"
      />
    </div>
  );
}
