import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-4 row-start-2 items-center">
        <Image
          className=""
          src="/dancing.gif"
          alt="Dancing man gif"
          width={230}
          height={180}
          priority
        />
        <p className="text-center">
          Rendez-vous prochainement...
        </p>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center opacity-20 hover:opacity-100 transition-opacity">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://thbo.ch/"
          target="_blank"
          rel=""
        >
          <Image
            aria-hidden
            className="dark:invert"
            src="/pen-tool.svg"
            alt="Pen Tool icon"
            width={16}
            height={16}
          />
          thbo.ch
        </a>
      </footer>
    </div>
  );
}
