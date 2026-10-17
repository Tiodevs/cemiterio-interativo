import { AMIGOS, type Simbolo } from "@/lib/amigos";

const ROTULOS: Record<Simbolo, string> = {
  lua: "Lua",
  morcego: "Morcego",
  aranha: "Aranha",
  vela: "Vela",
};

export function ListaTumulos() {
  return (
    <section className="mt-10">
      <h2 className="font-sans text-xs tracking-[0.28em] text-moss uppercase">
        Lista de túmulos
      </h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {AMIGOS.map((amigo) => (
          <li key={amigo.id}>
            <article className="flex h-full flex-col rounded-t-[2.4rem] rounded-b-lg border border-bone/15 bg-stone px-5 pt-7 pb-5">
              <p className="font-sans text-[0.68rem] tracking-[0.22em] text-moss uppercase">
                {ROTULOS[amigo.simbolo]}
              </p>
              <h3 className="mt-2 font-serif text-3xl text-bone">{amigo.nome}</h3>
              <p className="mt-3 font-sans text-base leading-6 text-bone/80">
                {amigo.frase}
              </p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
