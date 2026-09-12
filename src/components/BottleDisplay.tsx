import { BottleIcon } from "@/components/BottleIcon";

// Dirección de arte prestada de Stone Fragrances: todo el catálogo se muestra
// sobre el mismo pedestal circular, mismo ángulo y misma luz. Como todavía no
// hay fotos, el pedestal se compone en CSS — pero la regla es la misma: cuando
// entren las fotos reales, todas deben respetar este encuadre.
export function BottleDisplay({ size = "card" }: { size?: "card" | "hero" }) {
  const esHero = size === "hero";

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* luz cenital cálida */}
      <div className="display-glow absolute inset-0" />

      {/* pedestal */}
      <div
        className="absolute rounded-full bg-surface-alt"
        style={{
          width: esHero ? "58%" : "62%",
          height: esHero ? "9%" : "10%",
          bottom: esHero ? "16%" : "17%",
          boxShadow: "0 1px 0 var(--display-glow-a) inset",
        }}
      />
      {/* sombra proyectada del frasco sobre el pedestal */}
      <div
        className="display-shadow absolute rounded-full"
        style={{
          width: esHero ? "30%" : "34%",
          height: esHero ? "4%" : "4.5%",
          bottom: esHero ? "18.5%" : "19.5%",
        }}
      />

      <BottleIcon
        className={`relative text-ink/70 ${esHero ? "h-[68%]" : "h-[58%]"}`}
      />
    </div>
  );
}
