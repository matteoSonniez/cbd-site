"use client";

import { useEffect, useLayoutEffect, useState, useRef, Fragment } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollPochon from "@/components/ScrollPochon";
import StaticFlowingBackground from "@/components/StaticFlowingBackground";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ── GSAP scale-in on scroll ── */
function ScaleReveal({ children, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { scale: 0.82, y: 80, opacity: 0.5 },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            end: "top 35%",
            scrub: 0.8,
          },
        }
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={className} style={{ transformOrigin: "center top", willChange: "transform" }}>
      {children}
    </div>
  );
}

/* ── Animated text reveal (letter by letter) ── */
function SplitText({ text, staggerMs = 30, durationMs = 500, delayMs = 0 }) {
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      requestAnimationFrame(() => requestAnimationFrame(() => setReveal(true)));
    }, delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  const words = text.split(" ");
  let ci = 0;

  return (
    <>
      {words.map((word, wi) => (
        <span key={wi} className="inline-flex overflow-hidden" style={{ marginRight: "0.25em" }}>
          {word.split("").map((char) => {
            const i = ci++;
            return (
              <span
                key={i}
                className="inline-block"
                style={{
                  transform: reveal ? "translateY(0)" : "translateY(110%)",
                  opacity: reveal ? 1 : 0,
                  transition: `transform ${durationMs}ms cubic-bezier(0.22,1,0.36,1) ${i * staggerMs}ms, opacity ${durationMs * 0.6}ms ease ${i * staggerMs}ms`,
                }}
              >
                {char}
              </span>
            );
          })}
        </span>
      ))}
    </>
  );
}

/* ── Scroll-triggered reveal ── */
function ScrollReveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(50px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ── Fade-in wrapper ── */
function FadeIn({ children, className = "", delay = 0 }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={className}
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.8s ease, transform 0.8s ease",
      }}
    >
      {children}
    </div>
  );
}

/* ── GSAP counter (count-up on scroll) ── */
function Counter({ end, suffix = "" }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obj = { v: 0 };
    const tween = gsap.to(obj, {
      v: end,
      duration: 2.2,
      ease: "power3.out",
      onUpdate: () => setVal(Math.round(obj.v)),
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });
    return () => tween.kill();
  }, [end]);

  return (
    <span ref={ref} className="tabular-nums">
      {val.toLocaleString("fr-FR")}
      {suffix}
    </span>
  );
}

/* ── FAQ accordion item ── */
function FAQItem({ q, a, isOpen, onToggle, index }) {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [isOpen]);

  return (
    <div className="border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-6 md:py-7 text-left group gap-6"
      >
        <div className="flex items-center gap-6 md:gap-10 min-w-0">
          <span
            className="text-[10px] uppercase tracking-[0.25em] tabular-nums shrink-0"
            style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-heading)" }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3
            className="text-base md:text-xl font-semibold transition-colors duration-300"
            style={{
              color: isOpen ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.7)",
              fontFamily: "var(--font-heading)",
            }}
          >
            {q}
          </h3>
        </div>
        <span
          className="flex items-center justify-center w-10 h-10 rounded-full shrink-0 transition-all duration-500"
          style={{
            background: isOpen ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.09)",
            color: isOpen ? "#042D24" : "rgba(255,255,255,0.6)",
            transform: isOpen ? "rotate(45deg)" : "rotate(0)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </button>
      <div
        style={{
          height: `${height}px`,
          overflow: "hidden",
          transition: "height 0.55s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div
          ref={contentRef}
          className="pb-7 pl-0 md:pl-20 pr-0 md:pr-20 text-sm md:text-base leading-relaxed space-y-2"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          {a.split("\n").map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Data ── */
const CATEGORIES = [
  {
    key: "fleurs",
    title: "Fleurs",
    label: "Fleurs CBD",
    tagline: "Variétés sélectionnées, séchées lentement, triées à la main.",
    accent: "#2d5a44",
    image: "/pochons/pochon-vert.png",
    products: [
      { name: "Lemon Haze",    cbd: "18%", price: "12,90", image: "/pochons/pochon-vert.png",    tint: "#3d3a10" },
      { name: "OG Kush",       cbd: "20%", price: "14,50", image: "/pochons/pochon-rose.png",    tint: "#2e1e12" },
      { name: "Amnesia Haze",  cbd: "16%", price: "11,90", image: "/pochons/pochon-orange.png",  tint: "#1a3d2b" },
      { name: "Purple Haze",   cbd: "15%", price: "13,50", image: "/pochons/pochon-bleu.png",    tint: "#2a1538" },
      { name: "White Widow",   cbd: "19%", price: "13,90", image: "/pochons/pochon-marron.png",  tint: "#2c3a2a" },
    ],
  },
  {
    key: "huiles",
    title: "Huiles",
    label: "Huiles CBD",
    tagline: "Concentrés purs, dosage précis, gout neutre.",
    accent: "#4a7560",
    image: "/pochons/pochon-rose.png",
    products: [
      { name: "Huile 5%",         cbd: "5%",  price: "24,90", image: "/pochons/pochon-rose.png",   tint: "#3a2715" },
      { name: "Huile 10%",        cbd: "10%", price: "39,00", image: "/pochons/pochon-vert.png",   tint: "#2b3a1a" },
      { name: "Full Spectrum 20%",cbd: "20%", price: "59,00", image: "/pochons/pochon-orange.png", tint: "#3a1a1f" },
      { name: "Huile Sommeil",    cbd: "10%", price: "44,00", image: "/pochons/pochon-bleu.png",   tint: "#1a2a3a" },
      { name: "Huile Détente",    cbd: "15%", price: "49,00", image: "/pochons/pochon-marron.png", tint: "#2a1a3a" },
    ],
  },
  {
    key: "résines",
    title: "Résines",
    label: "Résines artisanales",
    tagline: "Pressées à la main, dans la pure tradition.",
    accent: "#1a3d2b",
    image: "/pochons/pochon-marron.png",
    products: [
      { name: "Pollen Maroc",  cbd: "22%", price: "9,90",  image: "/pochons/pochon-marron.png", tint: "#2a1d10" },
      { name: "Charas",        cbd: "25%", price: "14,90", image: "/pochons/pochon-vert.png",   tint: "#1f140a" },
      { name: "Afghan Black",  cbd: "28%", price: "16,50", image: "/pochons/pochon-rose.png",   tint: "#15110b" },
      { name: "Hash Premium",  cbd: "30%", price: "19,90", image: "/pochons/pochon-orange.png", tint: "#2d1a0d" },
      { name: "Lebanese Red",  cbd: "26%", price: "15,90", image: "/pochons/pochon-bleu.png",   tint: "#3a1a14" },
    ],
  },
];

const ENGAGEMENTS = [
  {
    number: "01",
    title: "Culture Bio",
    desc: "Cultivées sans pesticides, en respectant les cycles naturels.",
    detail: "Nos partenaires producteurs travaillent en agriculture raisonnée, certifiés par des organismes indépendants. Aucun engrais de synthèse, aucun OGM, aucun raccourci.",
    stat: "100%",
    statLabel: "Cultures certifiées",
    icon: (
      <svg viewBox="-1 -1 26 27" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C7 7 4 11 4 16a8 8 0 0016 0c0-5-3-9-8-14z" />
        <path d="M12 22V8M12 14c-2-1-3-2-4-4M12 11c2-1 3-2 4-4" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Teste en Labo",
    desc: "Chaque lot analysé pour garantir qualité et pureté.",
    detail: "Analyses HPLC réalisées par un laboratoire français indépendant. Cannabinoïdes, pesticides, métaux lourds, micro-organismes : tout est vérifié, tout est tracé.",
    stat: "12",
    statLabel: "Paramètres testés",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3h6v5l4.5 11c1 2-.5 4-2.5 4H7c-2 0-3.5-2-2.5-4L9 8V3z" />
        <path d="M8 14h8M11 18h.01M14 17h.01" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Livraison 24h",
    desc: "Emballage discret, expédié sous 24h partout en France.",
    detail: "Commandes préparées le jour même avant 14h. Colis neutres, sans mention extérieure du contenu, suivi en temps réel jusqu'à votre porte.",
    stat: "24h",
    statLabel: "Delai moyen",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7h12v10H3zM15 10h4l2 3v4h-6" />
        <circle cx="6" cy="18.5" r="1.5" />
        <circle cx="18" cy="18.5" r="1.5" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "100% Naturel",
    desc: "Aucun additif. Que du CBD pur, simple, honnete.",
    detail: "Sans arome artificiel, sans conservateur, sans colorant. Le produit final est tel que la nature l'a fait, simplement raffine avec le plus grand soin.",
    stat: "0",
    statLabel: "Additif chimique",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2c3 3 7 7 7 12a7 7 0 01-14 0c0-5 4-9 7-12z" />
        <path d="M12 13c-1.5 0-2.5 1-2.5 2.5S10.5 18 12 18" />
      </svg>
    ),
  },
];

const USE_CASES = [
  {
    title: "CBD Sommeil",
    subtitle: "Nuits réparatrices",
    desc: "Apaisez l'esprit et retrouvez un sommeil profond, naturel.",
    accent: "#9CB7E8",
    glowSoft: "rgba(140, 170, 230, 0.22)",
    glowStrong: "rgba(140, 170, 230, 0.42)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 13A9 9 0 1111 3a7 7 0 0010 10z" />
      </svg>
    ),
  },
  {
    title: "CBD Relaxation",
    subtitle: "Calmer le quotidien",
    desc: "Réduisez stress et anxiété pour mieux profiter de l'instant.",
    accent: "#A8D5BA",
    glowSoft: "rgba(160, 210, 185, 0.22)",
    glowStrong: "rgba(160, 210, 185, 0.42)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c-2 0-7-2-7-7 0-3 2-5 4-5s3 1 3 3M12 22c2 0 7-2 7-7 0-3-2-5-4-5s-3 1-3 3M12 22V10M12 10c0-3 1-6 3-8M12 10c0-3-1-6-3-8" />
      </svg>
    ),
  },
  {
    title: "CBD Recuperation",
    subtitle: "Soulager les tensions",
    desc: "Apaisez douleurs musculaires et inflammations après l'effort.",
    accent: "#B4DCD0",
    glowSoft: "rgba(180, 220, 210, 0.22)",
    glowStrong: "rgba(180, 220, 210, 0.42)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h4l2-5 4 10 2-5h6" />
      </svg>
    ),
  },
];

const INFO_CARDS = [
  {
    label: "Mais qui sommes-nous ?",
    title: "Notre maison CBD",
    body: "Une boutique pensée pour celles et ceux qui recherchent l'exigence : sélection rigoureuse, traçabilité totale, transparence absolue sur chaque produit.",
    cta: "Notre histoire",
    href: "/about",
    image: "/home_img/cbd.webp",
  },
  {
    label: "Vous vous posez la question ?",
    title: "Le bon dosage",
    body: "Nos experts vous guident pour doser parfaitement vos huiles, gélules, fleurs ou résines selon vos besoins, votre profil et le moment de la journée.",
    cta: "Tous nos conseils",
    href: "/blog",
    image: "/home_img/huile.png",
  },
];

const NEW_ARRIVALS = [
  { name: "Gelato 41",        cbd: "22%", price: "16,90", image: "/pochons/pochon-vert.png",   tag: "Indoor" },
  { name: "Strawberry Glue",  cbd: "19%", price: "14,90", image: "/pochons/pochon-rose.png",   tag: "Greenhouse" },
  { name: "Critical Mass",    cbd: "21%", price: "15,50", image: "/pochons/pochon-orange.png", tag: "Indoor" },
  { name: "Pineapple Express", cbd: "20%", price: "15,90", image: "/pochons/pochon-bleu.png",  tag: "Greenhouse" },
];

const STATS = [
  { value: 5,     suffix: "+",  label: "Annees d'expertise" },
  { value: 12000, suffix: "+",  label: "Clients satisfaits" },
  { value: 50,    suffix: "+",  label: "Variétés sélectionnées" },
  { value: 100,   suffix: "%",  label: "Made in France" },
];

const GUIDE_CARDS = [
  {
    cat: "Bases",
    title: "Qu'est-ce que le CBD ?",
    excerpt: "Tout savoir sur ce cannabinoide non-psychoactif et ses proprietes.",
    image: "https://images.unsplash.com/photo-1605733160314-4fc7dac4bb16?w=900&q=80&auto=format&fit=crop",
  },
  {
    cat: "Comparatif",
    title: "CBD vs THC : la différence",
    excerpt: "Comprendre les distinctions entre les deux molecules les plus connues du cannabis.",
    image: "https://images.unsplash.com/photo-1603909223429-69bb7101f420?w=900&q=80&auto=format&fit=crop",
  },
  {
    cat: "Bien-etre",
    title: "Les bienfaits au quotidien",
    excerpt: "Stress, sommeil, douleurs : ce que la recherche actuelle nous apprend.",
    image: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=900&q=80&auto=format&fit=crop",
  },
  {
    cat: "Guide d'achat",
    title: "Comment choisir son produit ?",
    excerpt: "Fleurs, huiles, résines : trouver la forme adaptée à vos besoins.",
    image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=900&q=80&auto=format&fit=crop",
  },
];

const REVIEWS = [
  { name: "Camille L.", city: "Paris",     rating: 5, text: "Qualité premium, livraison ultra rapide. Le packaging est très soigné, on sent que tout est pensé." },
  { name: "Antoine R.", city: "Lyon",      rating: 5, text: "J'utilise leur huile 10% pour le sommeil depuis 3 mois, je vois une vraie différence. Service client au top." },
  { name: "Sophie M.",  city: "Bordeaux",  rating: 5, text: "Les fleurs sont magnifiques, parfums très marques. C'est vraiment une autre catégorie." },
  { name: "Julien D.",  city: "Marseille", rating: 4, text: "Très bon rapport qualité-prix, conseils pertinents par chat. Je recommande sans hésiter." },
  { name: "Marie P.",   city: "Toulouse",  rating: 5, text: "Première commande, déjà conquise. Tout est conforme aux descriptions, et bien plus encore." },
  { name: "Thomas B.",  city: "Nantes",    rating: 5, text: "Le service client repond vite et bien. Les analyses lab sont disponibles, ca change tout." },
];

const REVIEWS_2 = [
  { name: "Lucas G.",   city: "Strasbourg",   rating: 5, text: "Sans hésiter le meilleur CBD de France. Les fleurs CBD bio sont d'une qualité incomparable, parfums riches et effets bien là." },
  { name: "Emma T.",    city: "Rennes",       rating: 5, text: "Je commande mes huiles CBD chez eux depuis 6 mois. Livraison 24h, packaging discret, qualité au rendez-vous à chaque fois." },
  { name: "Maxime V.",  city: "Nice",         rating: 5, text: "Boutique CBD française fiable, transparente sur les analyses labo. Les résines artisanales valent vraiment le détour." },
  { name: "Clara F.",   city: "Lille",        rating: 4, text: "Très bonne sélection de CBD premium. Les conseillers sont compétents, ils m'ont aidé à choisir le bon dosage pour mon sommeil." },
  { name: "Hugo M.",    city: "Grenoble",     rating: 5, text: "Le CBD français au top. Cultures bio, traçabilité totale, prix corrects. Difficile de faire mieux dans le secteur." },
  { name: "Lea R.",     city: "Montpellier",  rating: 5, text: "Qualité CBD supérieure et service client réactif. La référence parmi les boutiques CBD en ligne pour moi désormais." },
  { name: "Antoine D.", city: "Angers",       rating: 5, text: "Fleurs CBD indoor exceptionnelles, parfums marqués et effets puissants. Je ne commanderai plus ailleurs." },
  { name: "Manon B.",   city: "Reims",        rating: 4, text: "Premier achat dans cette boutique CBD : huile 10% impeccable, livraison rapide, je recommande sans réserve." },
];

const FAQS = [
  {
    q: "Que signifie CBD ?",
    a: "CBD est l'abréviation de cannabidiol, l'un des cannabinoïdes naturellement présents dans la plante de cannabis.\nContrairement au THC, il n'est pas psychoactif : il ne provoque aucun effet planant.\nIl interagit notamment avec le système endocannabinoïde et sérotoninergique pour favoriser détente, sommeil et bien-être.",
  },
  {
    q: "Quelle est la différence entre CBD et THC ?",
    a: "Tous deux issus de la même plante, le CBD et le THC ont pourtant des effets très différents.\nLe THC est psychoactif, classé stupéfiant et illégal en France.\nLe CBD n'est pas classé comme stupéfiant : il agit sur le système sérotoninergique pour son effet apaisant, sans altérer la conscience ni les capacités motrices.",
  },
  {
    q: "Le CBD est-il légal en France ?",
    a: "Oui. La législation française autorise la vente et la consommation des produits à base de CBD dès lors que leur taux de THC reste inférieur à 0,3 %.\nIls doivent être issus de chanvre industriel cultivé dans l'Union européenne.\nTous nos produits respectent strictement ces critères, accompagnés de leurs certificats d'analyse.",
  },
  {
    q: "Est-il bon de prendre du CBD tous les jours ?",
    a: "Une prise quotidienne s'intègre très bien dans une routine de bien-être.\nLa qualité du produit, le dosage et votre profil personnel restent essentiels.\nSelon l'OMS, le CBD ne présente pas de potentiel d'abus ou de dépendance.\nSi vous suivez un traitement médicamenteux, demandez l'avis de votre médecin ou pharmacien avant toute consommation régulière.",
  },
  {
    q: "Combien de temps avant d'en ressentir les effets ?",
    a: "Cela dépend du mode de consommation : quelques minutes pour une inhalation, 15 à 45 minutes pour les huiles sublinguales, jusqu'à 1h30 pour les comestibles.\nLes effets durent généralement de 2 à 6 heures.",
  },
  {
    q: "Y a-t-il des effets secondaires ou des interactions médicamenteuses ?",
    a: "Le CBD est très bien toléré.\nDans de rares cas : légère somnolence, bouche sèche, petits troubles digestifs.\nLe CBD peut interagir avec certains médicaments (antiépileptiques, immunosuppresseurs comme l'évérolimus) et est déconseillé en cas d'insuffisance hépatique.\nDemandez l'avis d'un professionnel de santé si vous suivez un traitement.",
  },
  {
    q: "Le CBD est-il détectable aux contrôles routiers ?",
    a: "Le CBD pur n'est pas recherché par les tests.\nDes traces résiduelles de THC (légales) peuvent toutefois rester détectables quelques heures.\nLa Cour de Cassation (arrêt du 21 juin 2023) a confirmé que la simple présence de THC dans l'organisme suffit à constituer l'infraction de conduite sous stupéfiants, peu importe la dose.\nSoyez prudent si vous conduisez ou exercez une profession sensible.",
  },
  {
    q: "Comment sont expédiées vos commandes ?",
    a: "Toutes nos commandes sont préparées et expédiées depuis la France.\nColis 100 % neutre, anonymisé et sécurisé pour une discrétion totale.\nLivraison suivie par services postaux, points relais ou GLS.\nOption Chronopost disponible, encore plus rapide et offerte dès 80 € d'achat.\nPaiement 100 % sécurisé avec 3D Secure.",
  },
  {
    q: "Quelle est votre politique de retour ?",
    a: "Vous disposez de 14 jours pour retourner un produit qui ne vous conviendrait pas.\nNos produits sont vendus et expédiés en direct, sans dropshipping ni intermédiaires.\nNotre service client vous répond sous 72 h maximum avec une réponse personnalisée et adaptée.",
  },
];

const PRODUCT_FAMILIES = [
  {
    slug: "fleurs",
    number: "01",
    kicker: "Fleurs de chanvre légales",
    name: "Fleurs de CBD",
    tagline: "Le chanvre dans son écrin végétal",
    body:
      "Issues d'une culture européenne raisonnée, nos fleurs de CBD respectent strictement le cadre légal français avec un taux de THC inférieur à 0,3%. Cultivées en outdoor, indoor ou greenhouse, chaque variété révèle un profil terpénique unique — agrumes, pin, fruits rouges, hashish. Idéales pour apaiser le mental, détendre les muscles et favoriser un sommeil profond grâce à leurs vertus naturellement relaxantes.",
    features: ["Outdoor", "Indoor", "Greenhouse", "THC < 0,3%", "Bio certifié"],
    accent: "rgba(125, 175, 95, 0.55)",
    href: "/products?cat=fleurs",
    icon: (
      <svg viewBox="-1 -1 26 27" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C7 7 4 11 4 16a8 8 0 0016 0c0-5-3-9-8-14z" />
        <path d="M12 22V8M12 14c-2-1-3-2-4-4M12 11c2-1 3-2 4-4" />
      </svg>
    ),
  },
  {
    slug: "huiles",
    number: "02",
    kicker: "Huiles full-spectrum & broad",
    name: "Huiles de CBD",
    tagline: "Le bien-être condensé en quelques gouttes",
    body:
      "Nos huiles full-spectrum et broad-spectrum interagissent avec le système endocannabinoïde pour favoriser un équilibre durable. Reconnues pour leurs effets sur le stress, l'anxiété, les douleurs chroniques et la qualité du sommeil, elles s'intègrent simplement à toute routine bien-être. Disponibles en plusieurs concentrations, de 5% à 30%, pour s'adapter à chaque profil et à chaque besoin.",
    features: ["Full-spectrum", "Broad-spectrum", "5% à 30%", "100% naturelles", "Vegan"],
    accent: "rgba(220, 175, 90, 0.5)",
    href: "/products?cat=huiles",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.5c3 4 6 8 6 12.5a6 6 0 01-12 0c0-4.5 3-8.5 6-12.5z" />
        <path d="M9 16c.5 1.2 1.7 2 3 2" />
      </svg>
    ),
  },
  {
    slug: "infusions",
    number: "03",
    kicker: "Tisanes au cannabidiol",
    name: "Infusions au CBD",
    tagline: "Le rituel chaud, à savourer lentement",
    body:
      "Nos tisanes au CBD allient les vertus du chanvre à celles des plantes traditionnelles : camomille, verveine, mélisse, gingembre. Une méthode de consommation douce et chaleureuse, idéale pour décompresser en fin de journée ou ouvrir un moment de calme. Les cannabinoïdes diffusent progressivement dans l'organisme pour un effet enveloppant, durable et profond.",
    features: ["Plantes bio associées", "Sans caféine", "Saveurs douces", "Soir & matin"],
    accent: "rgba(225, 130, 95, 0.5)",
    href: "/products?cat=infusions",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 10h13v6a4 4 0 01-4 4H8a4 4 0 01-4-4v-6z" />
        <path d="M17 11h2a2 2 0 010 4h-2" />
        <path d="M8 7c0-1 1-1.5 1-2.5S8 3 8 2M11.5 7c0-1 1-1.5 1-2.5S11.5 3 11.5 2M15 7c0-1 1-1.5 1-2.5S15 3 15 2" />
      </svg>
    ),
  },
  {
    slug: "gelules",
    number: "04",
    kicker: "Capsules de CBD pré-dosées",
    name: "Gélules CBD",
    tagline: "Précision, discrétion, simplicité",
    body:
      "Pré-dosées et sans goût, nos gélules sont la solution la plus pratique pour intégrer le CBD à votre quotidien. Certaines formulations enrichies en mélatonine et plantes apaisantes ciblent spécifiquement le sommeil, pour des nuits plus profondes et une récupération optimale. Une consommation maîtrisée, sans contrainte, où que vous soyez.",
    features: ["Dosage exact", "Sans arrière-goût", "Formules sommeil", "Format nomade"],
    accent: "rgba(95, 165, 200, 0.5)",
    href: "/products?cat=gelules",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="9" width="18" height="6" rx="3" />
        <path d="M12 9v6" />
      </svg>
    ),
  },
  {
    slug: "bonbons",
    number: "05",
    kicker: "Gummies au CBD",
    name: "Bonbons CBD",
    tagline: "Le plaisir gourmand au service du calme",
    body:
      "Framboise, pêche, pomme, menthe : nos gummies au CBD transforment votre prise quotidienne en un moment gourmand. Discrets, transportables et délicieux, ils sont parfaits pour décompresser en journée ou apaiser un pic de stress. Réservés à un public adulte, ils garantissent une expérience douce, savoureuse et naturelle.",
    features: ["4 saveurs fruitées", "Format nomade", "Vegan-friendly", "+18 ans"],
    accent: "rgba(220, 110, 145, 0.5)",
    href: "/products?cat=bonbons",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <path d="M7 12l-4-3v6l4-3zM17 12l4-3v6l-4-3z" />
        <path d="M10 11l1 1-1 1M14 11l-1 1 1 1" />
      </svg>
    ),
  },
  {
    slug: "animaux",
    number: "06",
    kicker: "CBD chiens & chats sans THC",
    name: "CBD Animaux",
    tagline: "Le bien-être de vos compagnons",
    body:
      "Nos huiles CBD broad-spectrum dédiées aux chiens et chats sont rigoureusement formulées sans THC, molécule toxique pour eux. Elles peuvent soulager l'anxiété, les troubles articulaires et améliorer le quotidien des animaux âgés ou stressés. Toujours après consultation vétérinaire, pour offrir à vos compagnons une vie plus paisible et heureuse.",
    features: ["Sans THC", "Chiens & chats", "Bio broad-spectrum", "Validé vétérinaires"],
    accent: "rgba(155, 120, 200, 0.5)",
    href: "/products?cat=animaux",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="16" rx="4.5" ry="3.5" />
        <ellipse cx="6" cy="10" rx="1.7" ry="2.2" />
        <ellipse cx="18" cy="10" rx="1.7" ry="2.2" />
        <ellipse cx="9" cy="6" rx="1.6" ry="2" />
        <ellipse cx="15" cy="6" rx="1.6" ry="2" />
      </svg>
    ),
  },
];

const PRODUCT_OVERVIEW_STATS = [
  { value: "06", label: "Gammes de CBD" },
  { value: "120+", label: "Produits au cannabidiol" },
  { value: "<0,3%", label: "THC légal" },
];

const BLOG_POSTS = [
  {
    cat: "Lifestyle",
    title: "Integrer le CBD dans sa routine du soir",
    date: "12 avril 2026",
    excerpt: "Trois rituels simples pour préparer une nuit réparatrice.",
    image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=900&q=80&auto=format&fit=crop",
  },
  {
    cat: "Culture",
    title: "Indoor, outdoor, greenhouse : les différences",
    date: "28 mars 2026",
    excerpt: "Comprendre l'impact du mode de culture sur le profil aromatique des fleurs.",
    image: "https://images.unsplash.com/photo-1614935151651-0bea6508db6b?w=900&q=80&auto=format&fit=crop",
  },
  {
    cat: "Sante",
    title: "CBD et sport : ce que dit la recherche",
    date: "15 mars 2026",
    excerpt: "Récupération musculaire, sommeil, focus : un point sur les études récentes.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80&auto=format&fit=crop",
  },
];

/* ── Engagements (sticky split + active detection + liquid fill) ── */
function Engagements() {
  const [active, setActive] = useState(0);
  const [progresses, setProgresses] = useState(() => ENGAGEMENTS.map(() => 0));
  const itemRefs = useRef([]);

  useEffect(() => {
    let raf = 0;
    const pick = () => {
      const target = window.innerHeight * 0.55;
      const activeTarget = window.innerHeight * 0.45;
      const newP = itemRefs.current.map((el) => {
        if (!el) return 0;
        const r = el.getBoundingClientRect();
        const p = (target - r.top) / r.height;
        return Math.max(0, Math.min(1, p));
      });
      let bestIdx = 0;
      let bestDist = Infinity;
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const cy = r.top + r.height / 2;
        const dist = Math.abs(cy - activeTarget);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      });
      // Last engagement: activate the instant the scroll enters its area,
      // since the user often stops scrolling before its center hits 45% viewport.
      const lastIdx = itemRefs.current.length - 1;
      if (newP[lastIdx] > 0.01) {
        bestIdx = lastIdx;
      }
      setProgresses((prev) => {
        const changed = prev.some((v, i) => Math.abs(v - newP[i]) > 0.003);
        return changed ? newP : prev;
      });
      setActive((cur) => (cur === bestIdx ? cur : bestIdx));
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        pick();
      });
    };
    pick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const current = ENGAGEMENTS[active];

  return (
    <section className="relative z-10 py-12 md:py-16 px-6 md:px-14 lg:px-24">
      {/* Header */}
      <ScrollReveal className="mb-4 md:mb-5 max-w-3xl">
        <p
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] mb-4 md:mb-5 px-3 py-1 rounded-full"
          style={{
            color: "rgba(255,255,255,0.7)",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            fontFamily: "var(--font-heading)",
          }}
        >
          <span className="block w-1.5 h-1.5 rounded-full bg-white/60" />
          Pourquoi nous
        </p>
        <h2
          className="text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-tight text-white/95"
          style={{ fontFamily: "Glorify, var(--font-heading)", fontWeight: 400 }}
        >
          Nos <span className="text-white/40">engagements.</span>
        </h2>
        <p className="mt-2 md:mt-2.5 text-sm md:text-base text-white/55 leading-relaxed max-w-xl">
          Ce sur quoi vous pouvez compter, à chaque commande.
        </p>
      </ScrollReveal>

      {/* Sticky split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
        {/* LEFT — sticky visual panel */}
        <div className="hidden lg:block lg:col-span-5">
          <div className="sticky top-28">
            <div
              className="relative aspect-[4/5] rounded-[28px] overflow-hidden"
              style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(244,241,234,0.9))",
                border: "1px solid rgba(255,255,255,0.68)",
                boxShadow: "0 30px 70px -35px rgba(0,0,0,0.55)",
              }}
            >
              {/* Soft animated glow following active */}
              <div
                aria-hidden
                className="absolute inset-0 transition-opacity duration-1000"
                style={{
                  background:
                    "radial-gradient(60% 50% at 50% 38%, rgba(4,45,36,0.13) 0%, transparent 70%)",
                  opacity: 1,
                }}
              />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(4,45,36,0.04) 100%)",
                }}
              />

              {/* Radial burst — replays each time `active` changes, delayed so it syncs with the stamp entrance */}
              <div
                key={`burst-${active}`}
                aria-hidden
                className="absolute left-1/2 pointer-events-none"
                style={{ top: "calc(25% + 88px)" }}
              >
                {/* Outer ring — expanding light pulse */}
                <div
                  className="absolute left-0 top-0"
                  style={{
                    width: 360,
                    height: 360,
                    borderRadius: "9999px",
                    border: "1.5px solid rgba(4,45,36,0.55)",
                    boxShadow:
                      "0 0 60px 10px rgba(4,45,36,0.18), inset 0 0 30px rgba(4,45,36,0.12)",
                    animation: "eng-burst-ring 1100ms cubic-bezier(0.16, 1, 0.3, 1) 380ms both",
                    transformOrigin: "center",
                  }}
                />
                {/* Soft glow */}
                <div
                  className="absolute left-0 top-0"
                  style={{
                    width: 320,
                    height: 320,
                    borderRadius: "9999px",
                    background:
                      "radial-gradient(circle, rgba(4,45,36,0.35) 0%, rgba(4,45,36,0.08) 45%, rgba(4,45,36,0) 70%)",
                    animation: "eng-burst-glow 950ms cubic-bezier(0.22, 1, 0.36, 1) 380ms both",
                  }}
                />
                {/* Radiating sparkle particles */}
                {Array.from({ length: 10 }).map((_, k) => {
                  const angle = (k / 10) * Math.PI * 2;
                  const radius = 70;
                  const px = (Math.cos(angle) * radius).toFixed(3);
                  const py = (Math.sin(angle) * radius).toFixed(3);
                  return (
                    <span
                      key={k}
                      className="absolute left-0 top-0 block rounded-full"
                      style={{
                        width: 6,
                        height: 6,
                        background: "rgba(4,45,36,0.85)",
                        boxShadow: "0 0 10px rgba(4,45,36,0.6)",
                        ["--px"]: `${px}px`,
                        ["--py"]: `${py}px`,
                        animation: `eng-particle 900ms cubic-bezier(0.16, 1, 0.3, 1) ${380 + k * 18}ms both`,
                      }}
                    />
                  );
                })}
              </div>

              {/* Stamp icons — quick exit first, then elastic 3D entrance after the previous logo is gone */}
              {ENGAGEMENTS.map((eng, i) => {
                const isActive = active === i;
                return (
                  <div
                    key={i}
                    className="absolute inset-x-0 top-[25%] flex items-center justify-center"
                    style={{
                      opacity: isActive ? 1 : 0,
                      animation: isActive
                        ? "eng-icon-stamp 1100ms cubic-bezier(0.22, 1, 0.36, 1) 380ms both"
                        : "eng-icon-exit 320ms cubic-bezier(0.7, 0, 0.84, 0) both",
                      transformOrigin: "center center",
                      willChange: "transform, opacity, filter",
                      pointerEvents: isActive ? "auto" : "none",
                    }}
                  >
                    <span
                      className="block w-32 h-32 md:w-44 md:h-44 text-[#042d24]/85"
                      style={{
                        filter: isActive
                          ? "drop-shadow(0 8px 22px rgba(4,45,36,0.28))"
                          : "none",
                      }}
                    >
                      {eng.icon}
                    </span>
                  </div>
                );
              })}

              {/* Top — progress segments */}
              <div className="absolute top-7 left-7 right-7 flex gap-2">
                {ENGAGEMENTS.map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-[2px] rounded-full overflow-hidden"
                    style={{ background: "rgba(4,45,36,0.12)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        background: "rgba(4,45,36,0.82)",
                        width: i <= active ? "100%" : "0%",
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Top-right — small label */}
              <div className="absolute top-12 right-7 text-right">
                <p
                  className="text-[10px] uppercase tracking-[0.3em] text-[#042d24]/45 tabular-nums"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Engagement {String(active + 1).padStart(2, "0")} / {String(ENGAGEMENTS.length).padStart(2, "0")}
                </p>
              </div>

              {/* Center — active commitment copy */}
              <div className="absolute left-8 right-8 top-[56%] text-center">
                <p
                  className="text-[10px] uppercase tracking-[0.32em] text-[#042d24]/45 mb-3"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Garantie maison
                </p>
                <div className="relative h-20">
                  {ENGAGEMENTS.map((eng, i) => (
                    <div
                      key={eng.number}
                      className="absolute inset-0 transition-all duration-700"
                      style={{
                        opacity: active === i ? 1 : 0,
                        transform: active === i ? "translateY(0)" : "translateY(16px)",
                        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                      }}
                    >
                      <h3
                        className="text-2xl uppercase tracking-tight text-[#042d24]"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {eng.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#042d24]/58">
                        {eng.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom — number + stat */}
              <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between gap-6">
                <div className="relative leading-none" style={{ fontFamily: "Ahsing, var(--font-heading)" }}>
                  <span className="block text-[10px] uppercase tracking-[0.3em] text-[#042d24]/38 mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                    Numero
                  </span>
                  <div className="relative h-[5.5rem] md:h-[7rem] w-[5rem] md:w-[7rem]">
                    {ENGAGEMENTS.map((eng, i) => (
                      <span
                        key={i}
                        className="absolute inset-0 text-7xl md:text-9xl text-[#042d24] transition-all duration-[700ms]"
                        style={{
                          opacity: active === i ? 1 : 0,
                          transform: active === i ? "translateY(0)" : "translateY(24px)",
                          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                        }}
                      >
                        {eng.number}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right pb-1">
                  <div className="relative h-10 md:h-12 min-w-[3.5rem]">
                    {ENGAGEMENTS.map((eng, i) => (
                      <p
                        key={i}
                        className="absolute right-0 bottom-0 text-3xl md:text-4xl font-black text-[#042d24] leading-none transition-all duration-[700ms]"
                        style={{
                          fontFamily: "var(--font-heading)",
                          opacity: active === i ? 1 : 0,
                          transform: active === i ? "translateY(0)" : "translateY(12px)",
                        }}
                      >
                        {eng.stat}
                      </p>
                    ))}
                  </div>
                  <p
                    className="text-[10px] uppercase tracking-[0.25em] text-[#042d24]/45 mt-2"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {current.statLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — scrolling cards */}
        <div className="lg:col-span-7 flex flex-col gap-5 md:gap-6">
          {ENGAGEMENTS.map((eng, i) => {
            const progress = progresses[i] || 0;
            const fillPct = progress * 100;

            const renderInner = (mode) => {
              const isDark = mode === "dark";
              const indexColor = isDark ? "rgba(4,45,36,0.78)" : "rgba(255,255,255,0.55)";
              const ruleBg = isDark
                ? "linear-gradient(to right, rgba(4,45,36,0.42), rgba(4,45,36,0.05))"
                : "rgba(255,255,255,0.12)";
              const titleColor = isDark ? "#042d24" : "rgba(255,255,255,0.88)";
              const descColor = isDark ? "rgba(4,45,36,0.7)" : "rgba(255,255,255,0.55)";
              const detailColor = isDark ? "rgba(4,45,36,0.55)" : "rgba(255,255,255,0.35)";
              const iconBubbleBg = isDark ? "rgba(4,45,36,0.07)" : "rgba(255,255,255,0.09)";
              const iconBubbleBorder = isDark ? "rgba(4,45,36,0.12)" : "rgba(255,255,255,0.1)";
              const iconColor = isDark ? "#042d24" : "rgba(255,255,255,0.85)";
              const dividerBorder = isDark ? "rgba(4,45,36,0.12)" : "rgba(255,255,255,0.08)";
              const statColor = isDark ? "#042d24" : "rgba(255,255,255,0.95)";
              const statLabelColor = isDark ? "rgba(4,45,36,0.5)" : "rgba(255,255,255,0.4)";

              return (
                <div className="p-7 md:p-10 lg:p-12">
                  {/* Mobile-only icon */}
                  <div className="lg:hidden mb-6">
                    <span
                      className="inline-flex items-center justify-center w-14 h-14 rounded-full"
                      style={{
                        background: iconBubbleBg,
                        border: `1px solid ${iconBubbleBorder}`,
                        color: iconColor,
                      }}
                    >
                      <span className="block w-6 h-6">{eng.icon}</span>
                    </span>
                  </div>

                  {/* Index row */}
                  <div className="flex items-center gap-4 mb-5">
                    <span
                      className="text-[10px] uppercase tracking-[0.3em] tabular-nums shrink-0"
                      style={{
                        color: indexColor,
                        fontFamily: "var(--font-heading)",
                      }}
                    >
                      {eng.number} / {String(ENGAGEMENTS.length).padStart(2, "0")}
                    </span>
                    <span
                      className="h-px flex-1"
                      style={{ background: ruleBg }}
                    />
                  </div>

                  <h3
                    className="text-3xl md:text-4xl lg:text-5xl tracking-tight mb-5 leading-[0.92]"
                    style={{
                      color: titleColor,
                      fontFamily: "Glorify, var(--font-heading)",
                      fontWeight: 400,
                    }}
                  >
                    {eng.title}
                  </h3>

                  <p
                    className="text-base md:text-lg leading-relaxed mb-4 max-w-xl"
                    style={{ color: descColor }}
                  >
                    {eng.desc}
                  </p>

                  <p
                    className="text-sm md:text-base leading-relaxed max-w-xl"
                    style={{ color: detailColor }}
                  >
                    {eng.detail}
                  </p>

                  {/* Mobile stat row */}
                  <div
                    className="lg:hidden flex items-baseline gap-3 mt-7 pt-6 border-t"
                    style={{ borderColor: dividerBorder }}
                  >
                    <span
                      className="text-3xl font-black"
                      style={{ fontFamily: "var(--font-heading)", color: statColor }}
                    >
                      {eng.stat}
                    </span>
                    <span
                      className="text-[10px] uppercase tracking-[0.2em]"
                      style={{ fontFamily: "var(--font-heading)", color: statLabelColor }}
                    >
                      {eng.statLabel}
                    </span>
                  </div>
                </div>
              );
            };

            return (
              <div
                key={eng.number}
                ref={(el) => (itemRefs.current[i] = el)}
                data-idx={i}
                className="relative rounded-[24px] overflow-hidden transition-shadow duration-500"
                style={{
                  background: "rgba(4,45,36,0.62)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  boxShadow:
                    progress > 0.15
                      ? `0 ${24 + progress * 16}px ${48 + progress * 24}px -24px rgba(0,0,0,${0.3 + progress * 0.2})`
                      : "none",
                }}
              >
                {/* Liquid fill — white dome that flattens as it rises */}
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 pointer-events-none"
                  style={{ height: `${fillPct}%` }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "#ffffff",
                      borderTopLeftRadius: `${(1 - progress) * 110}px`,
                      borderTopRightRadius: `${(1 - progress) * 110}px`,
                    }}
                  />
                  {/* Subtle bottom shine */}
                  <div
                    className="absolute inset-x-0 bottom-0"
                    style={{
                      height: "40%",
                      background:
                        "linear-gradient(180deg, rgba(244,241,234,0) 0%, rgba(244,241,234,0.45) 100%)",
                    }}
                  />
                </div>

                {/* Base layer — light text on the dark glass background */}
                <div className="relative z-10">{renderInner("light")}</div>

                {/* Overlay — dark text, clipped to the filled region so it appears only over the white liquid */}
                <div
                  aria-hidden
                  className="absolute inset-0 z-20 pointer-events-none"
                  style={{
                    clipPath: `inset(${100 - fillPct}% 0 0 0 round ${(1 - progress) * 110}px ${(1 - progress) * 110}px 0 0)`,
                    WebkitClipPath: `inset(${100 - fillPct}% 0 0 0 round ${(1 - progress) * 110}px ${(1 - progress) * 110}px 0 0)`,
                  }}
                >
                  {renderInner("dark")}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Product Universe (SEO-rich product families showcase) ── */
function ProductUniverse() {
  return (
    <section className="relative z-10 py-12 md:py-16 px-6 md:px-14 lg:px-24">
      {/* Header */}
      <ScrollReveal className="mb-12 md:mb-16 max-w-3xl">
        <p
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] mb-4 md:mb-5 px-3 py-1 rounded-full"
          style={{
            color: "rgba(255,255,255,0.7)",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            fontFamily: "var(--font-heading)",
          }}
        >
          <span className="block w-1.5 h-1.5 rounded-full bg-white/60" />
          L&apos;univers CBD
        </p>
        <h2
          className="text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-tight text-white/95"
          style={{ fontFamily: "Glorify, var(--font-heading)", fontWeight: 400 }}
        >
          Toute notre <span className="text-white/40">gamme.</span>
        </h2>
        <p className="mt-3 md:mt-4 text-sm md:text-base text-white/55 leading-relaxed max-w-xl">
          Six familles de produits au cannabidiol, sélectionnées avec exigence et conçues pour s&apos;intégrer
          naturellement à votre quotidien, du rituel matinal au rituel du soir.
        </p>
      </ScrollReveal>

      {/* Overview chips */}
      <ScrollReveal className="mb-14 md:mb-20" delay={120}>
        <div className="flex flex-wrap gap-3">
          {PRODUCT_OVERVIEW_STATS.map((s) => (
            <div
              key={s.label}
              className="inline-flex items-baseline gap-2.5 px-4 py-2.5 rounded-full"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              <span
                className="text-base md:text-lg text-white/95 tabular-nums"
                style={{ fontFamily: "Glorify, var(--font-heading)", fontWeight: 400 }}
              >
                {s.value}
              </span>
              <span
                className="text-[10px] uppercase tracking-[0.22em] text-white/45"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Product blocks — alternating magazine layout */}
      <div className="space-y-8 md:space-y-10">
        {PRODUCT_FAMILIES.map((p, i) => {
          const reverse = i % 2 === 1;
          return (
            <ScrollReveal key={p.slug} delay={i * 80}>
              <article
                className="group relative overflow-hidden rounded-[28px] md:rounded-[36px] transition-all duration-700"
                style={{
                  background:
                    "linear-gradient(155deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.02) 60%, rgba(4,45,36,0.18) 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
                  e.currentTarget.style.transform = "translateY(-3px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Accent radial glow that follows the icon side */}
                <div
                  aria-hidden
                  className="absolute pointer-events-none transition-opacity duration-700 opacity-60 group-hover:opacity-100"
                  style={{
                    width: "60%",
                    height: "120%",
                    top: "-10%",
                    [reverse ? "right" : "left"]: "-15%",
                    background: `radial-gradient(circle at center, ${p.accent} 0%, transparent 60%)`,
                    filter: "blur(40px)",
                  }}
                />

                <div
                  className={`relative grid grid-cols-1 md:grid-cols-12 items-center gap-8 md:gap-12 p-7 md:p-12 lg:p-16 ${
                    reverse ? "md:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  {/* Icon side */}
                  <div className="md:col-span-5 lg:col-span-4 flex items-center justify-center">
                    <div className="relative">
                      {/* Outer ring */}
                      <div
                        className="absolute inset-0 rounded-full transition-transform duration-1000 group-hover:scale-110"
                        style={{
                          width: 220,
                          height: 220,
                          background: `radial-gradient(circle, ${p.accent} 0%, transparent 65%)`,
                          filter: "blur(20px)",
                          opacity: 0.7,
                        }}
                      />
                      {/* Inner glass disc */}
                      <div
                        className="relative flex items-center justify-center rounded-full transition-transform duration-700 group-hover:scale-[1.04]"
                        style={{
                          width: 220,
                          height: 220,
                          background:
                            "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 50%, rgba(4,45,36,0.25) 100%)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          boxShadow:
                            "inset 0 1px 0 rgba(255,255,255,0.18), 0 30px 60px -25px rgba(0,0,0,0.6)",
                        }}
                      >
                        <span
                          className="block w-24 h-24 lg:w-28 lg:h-28 text-white/85"
                          style={{
                            filter: `drop-shadow(0 8px 20px ${p.accent})`,
                          }}
                        >
                          {p.icon}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content side */}
                  <div className="md:col-span-7 lg:col-span-8">
                    <div className="flex items-center gap-4 mb-5">
                      <span
                        className="text-[11px] uppercase tracking-[0.32em] text-white/45"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        <span className="tabular-nums">{p.number}</span> · {p.kicker}
                      </span>
                      <span className="h-px flex-1 bg-gradient-to-r from-white/25 to-transparent" />
                    </div>

                    <h3
                      className="text-3xl md:text-4xl lg:text-5xl tracking-tight text-white/95 leading-[0.98] mb-3"
                      style={{ fontFamily: "Glorify, var(--font-heading)", fontWeight: 400 }}
                    >
                      {p.name}
                    </h3>

                    <p
                      className="text-[11px] md:text-xs uppercase tracking-[0.28em] text-white/45 mb-5"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {p.tagline}
                    </p>

                    <p className="text-sm md:text-base text-white/65 leading-relaxed mb-6 max-w-2xl">
                      {p.body}
                    </p>

                    {/* Feature chips */}
                    <div className="flex flex-wrap gap-2 mb-7">
                      {p.features.map((f) => (
                        <span
                          key={f}
                          className="text-[10px] md:text-[11px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full"
                          style={{
                            color: "rgba(255,255,255,0.7)",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            fontFamily: "var(--font-heading)",
                          }}
                        >
                          {f}
                        </span>
                      ))}
                    </div>

                    <a
                      href={p.href}
                      className="group/cta inline-flex items-center gap-2.5 text-xs md:text-sm font-semibold uppercase tracking-widest text-white/85 transition-all duration-500"
                      style={{ fontFamily: "var(--font-heading)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#ffffff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                      }}
                    >
                      Découvrir la gamme
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4 transition-transform duration-500 ease-out group-hover/cta:translate-x-2"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              </article>
            </ScrollReveal>
          );
        })}
      </div>

      {/* SEO closing paragraph — top trait above label, bottom trait below paragraph */}
      <ScrollReveal className="mt-20 md:mt-28 max-w-3xl mx-auto text-center" delay={120}>
        <div className="inline-flex flex-col items-stretch mb-6 md:mb-8">
          <div className="h-px shimmer-line-horizontal opacity-60 mb-6 md:mb-8" />
          <p
            className="text-[10px] uppercase tracking-[0.32em] text-white/40 whitespace-nowrap"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Pourquoi choisir La Fleur CBD ?
          </p>
        </div>
        <p className="text-sm md:text-base text-white/55 leading-relaxed">
          Spécialiste français du cannabidiol, LaFleurCBD propose une sélection exigeante de produits au
          CBD issus de chanvre européen biologique : fleurs de CBD conformes à la législation française
          (THC inférieur à 0,3%), huiles full-spectrum et broad-spectrum, tisanes au chanvre, gélules
          pré-dosées, gummies au CBD et soins dédiés aux chiens et chats. Chaque lot bénéficie
          d&apos;analyses laboratoire indépendantes garantissant pureté, traçabilité et conformité légale.
          Livraison discrète sous 24h partout en France, paiement 100% sécurisé, conseils personnalisés
          et un large catalogue de produits CBD adaptés à tous les usages : sommeil, anxiété, relaxation,
          douleurs musculaires, récupération sportive et bien-être animal.
        </p>
        <div className="inline-flex flex-col items-stretch mt-6 md:mt-8">
          <span
            aria-hidden
            className="text-[10px] uppercase tracking-[0.32em] whitespace-nowrap invisible h-0 leading-none overflow-hidden"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Pourquoi choisir La Fleur CBD ?
          </span>
          <div className="h-px shimmer-line-horizontal opacity-60" />
        </div>
      </ScrollReveal>
    </section>
  );
}

/* ── Best-sellers grid (modern light card) ── */
const INK = "#0a2520";
const INK_MUTED = "rgba(10, 37, 32, 0.58)";
const INK_DIM = "rgba(10, 37, 32, 0.38)";
const HAIRLINE = "rgba(10, 37, 32, 0.08)";
const SURFACE = "#f4f1ea";

const CATEGORY_TONES = {
  fleurs: "#2d7a4a",
  huiles: "#5fa8d3",
  résines: "#7a4a2a",
};

const ROTATING_WORDS = [
  { text: "Fleurs", color: CATEGORY_TONES.fleurs },
  { text: "Huiles", color: CATEGORY_TONES.huiles },
  { text: "Résines", color: CATEGORY_TONES.résines },
];

const ROTATING_PLASTIC_WORDS = ["plastique", "dechets"];

const ROTATING_HELP_WORDS = ["repond", "conseille"];

const STORY_STEPS = [
  {
    title: "L'origine",
    text: "Une conviction : le CBD mérite la même exigence qu'un grand vin. Le terroir, le savoir-faire et le temps avant tout.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l2.4 5.4 5.6.6-4.2 3.9 1.2 5.6L12 16l-5 2.5 1.2-5.6L4 9l5.6-.6L12 3z" />
      </svg>
    ),
  },
  {
    title: "La sélection",
    text: "Chaque producteur visité, chaque variété goûtée. Nous refusons tout ce qui ne tient pas la route.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="6" />
        <path d="M16 16l5 5" />
      </svg>
    ),
  },
  {
    title: "L'expertise",
    text: "Une équipe formée à la plante, à ses variétés, à ses usages. Pour vous orienter, pas pour vous vendre.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4v15a1 1 0 0 0 1.45.89L12 17l6.55 2.89A1 1 0 0 0 20 19V4a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1z" />
        <path d="M8 8h8M8 12h5" />
      </svg>
    ),
  },
  {
    title: "L'engagement",
    text: "Transparence totale, traçabilité complète, satisfaction garantie. Notre parole avant tout.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L3 6v6c0 5 3.5 9.5 9 10 5.5-.5 9-5 9-10V6l-9-4z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
];

function RotatingCategoryWord() {
  const [index, setIndex] = useState(0);
  const containerRef = useRef(null);
  const isFirstRef = useRef(true);

  useEffect(() => {
    const id = setInterval(() => {
      const el = containerRef.current;
      if (!el) return;
      const letters = el.querySelectorAll(".letter");
      gsap.to(letters, {
        opacity: 0,
        yPercent: -70,
        filter: "blur(5px)",
        rotateX: 30,
        duration: 0.45,
        ease: "power3.in",
        stagger: { each: 0.03, from: "start" },
        onComplete: () => setIndex((i) => (i + 1) % ROTATING_WORDS.length),
      });
    }, 2600);
    return () => clearInterval(id);
  }, []);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (isFirstRef.current) {
      isFirstRef.current = false;
      return;
    }
    const letters = el.querySelectorAll(".letter");
    gsap.fromTo(
      letters,
      { opacity: 0, yPercent: 70, filter: "blur(5px)", rotateX: -30 },
      {
        opacity: 1,
        yPercent: 0,
        filter: "blur(0px)",
        rotateX: 0,
        duration: 0.65,
        ease: "expo.out",
        stagger: { each: 0.035, from: "start" },
      }
    );
  }, [index]);

  const word = ROTATING_WORDS[index];

  return (
    <span
      style={{
        display: "inline-block",
        width: 0,
        verticalAlign: "baseline",
        whiteSpace: "nowrap",
        overflow: "visible",
        color: word.color,
        perspective: "600px",
        lineHeight: 1,
        fontSize: "0.95em",
      }}
      aria-label={word.text}
    >
      <span
        ref={containerRef}
        key={word.text}
        style={{ display: "inline-block", whiteSpace: "pre" }}
      >
        {word.text.split("").map((char, i) => (
          <span
            key={i}
            className="letter"
            style={{
              display: "inline-block",
              transformOrigin: "center bottom",
              willChange: "transform, opacity, filter",
            }}
          >
            {char}
          </span>
        ))}
      </span>
    </span>
  );
}

function RotatingPlasticWord() {
  const [index, setIndex] = useState(0);
  const containerRef = useRef(null);
  const isFirstRef = useRef(true);

  useEffect(() => {
    const id = setInterval(() => {
      const el = containerRef.current;
      if (!el) return;
      const letters = el.querySelectorAll(".letter");
      gsap.to(letters, {
        opacity: 0,
        yPercent: -70,
        filter: "blur(5px)",
        rotateX: 30,
        duration: 0.45,
        ease: "power3.in",
        stagger: { each: 0.03, from: "start" },
        onComplete: () => setIndex((i) => (i + 1) % ROTATING_PLASTIC_WORDS.length),
      });
    }, 2600);
    return () => clearInterval(id);
  }, []);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (isFirstRef.current) {
      isFirstRef.current = false;
      return;
    }
    const letters = el.querySelectorAll(".letter");
    gsap.fromTo(
      letters,
      { opacity: 0, yPercent: 70, filter: "blur(5px)", rotateX: -30 },
      {
        opacity: 1,
        yPercent: 0,
        filter: "blur(0px)",
        rotateX: 0,
        duration: 0.65,
        ease: "expo.out",
        stagger: { each: 0.035, from: "start" },
      }
    );
  }, [index]);

  const word = ROTATING_PLASTIC_WORDS[index];

  return (
    <span
      style={{
        display: "inline-block",
        verticalAlign: "baseline",
        color: CATEGORY_TONES.fleurs,
        perspective: "600px",
        lineHeight: 1,
      }}
    >
      <span
        ref={containerRef}
        key={word}
        style={{ display: "inline-block", whiteSpace: "pre" }}
      >
        {word.split("").map((char, i) => (
          <span
            key={i}
            className="letter"
            style={{
              display: "inline-block",
              transformOrigin: "center bottom",
              willChange: "transform, opacity, filter",
            }}
          >
            {char}
          </span>
        ))}
      </span>
    </span>
  );
}

function RotatingHelpWord() {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = ROTATING_HELP_WORDS[wordIndex];
    const typingSpeed = isDeleting ? 55 : 105;
    const holdAtFull = 1400;
    const holdAtEmpty = 200;

    let timeout;
    if (!isDeleting && text === currentWord) {
      timeout = setTimeout(() => setIsDeleting(true), holdAtFull);
    } else if (isDeleting && text === "") {
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setWordIndex((i) => (i + 1) % ROTATING_HELP_WORDS.length);
      }, holdAtEmpty);
    } else {
      timeout = setTimeout(() => {
        setText((prev) =>
          isDeleting ? prev.slice(0, -1) : currentWord.slice(0, prev.length + 1)
        );
      }, typingSpeed);
    }
    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex]);

  return (
    <span style={{ display: "inline-block", whiteSpace: "pre" }}>
      {text}
      <span className="typing-cursor" aria-hidden />
    </span>
  );
}

const CBD_TABS = [
  {
    id: "definition",
    label: "Le CBD, c'est quoi ?",
    title: "Une plante. Une histoire millenaire.",
    intro: "Le chanvre, utilise depuis des millenaires par les civilisations anciennes, donne aujourd'hui naissance a l'un des composes les plus etudies au monde : le cannabidiol, ou CBD.",
    blocks: [
      {
        kicker: "Origines",
        title: "Une plante ancienne",
        text: "Civilisations chinoises et egyptiennes l'utilisaient deja pour ses fibres robustes, ses huiles et ses vertus apaisantes.",
      },
      {
        kicker: "1940 → 1963",
        title: "Decouverte scientifique",
        text: "Isole pour la premiere fois par Roger Adams en 1940, sa structure chimique est elucidee en 1963 par Mechoulam et Shvo.",
      },
      {
        kicker: "Aujourd'hui",
        title: "Bien-etre moderne",
        text: "Sans effet psychotrope, contrairement au THC. Le CBD interagit avec votre systeme endocannabinoide pour favoriser detente et equilibre.",
      },
    ],
    forms: [
      { label: "Fleurs", desc: "A infuser ou vaporiser" },
      { label: "Huiles", desc: "Sublinguales, dosage precis" },
      { label: "Resines", desc: "Concentre artisanal" },
      { label: "Cosmetiques", desc: "Cremes, baumes, lotions" },
      { label: "Aliments", desc: "Tisanes, gelules, gelifies" },
    ],
  },
  {
    id: "bienfaits",
    label: "Les bienfaits",
    title: "Ce que la recherche nous dit.",
    intro: "Le CBD n'est pas un medicament et ne remplace aucun traitement. Les etudes en cours suggerent toutefois plusieurs benefices potentiels sur le bien-etre.",
    benefits: [
      {
        title: "Apaiser la douleur",
        text: "Action sur les recepteurs de la douleur dans le systeme nerveux.",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" /></svg>
        ),
      },
      {
        title: "Stress et anxiete",
        text: "Interaction avec les recepteurs de la serotonine pour un effet apaisant.",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /><path d="M3 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /><path d="M3 6c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /></svg>
        ),
      },
      {
        title: "Sommeil",
        text: "Amelioration de la qualite du sommeil et de l'endormissement.",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
        ),
      },
      {
        title: "Peau",
        text: "Anti-inflammatoire pour eczema, psoriasis et acne.",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2 5 5 1-3.5 3.5L17 18l-5-3-5 3 1.5-5.5L5 9l5-1z" /></svg>
        ),
      },
      {
        title: "Neurologique",
        text: "Etudes en cours : epilepsie, Parkinson, Alzheimer.",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3a3 3 0 0 0-3 3 3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0 3-3 3 3 0 0 0-3-3 3 3 0 0 0-3-3 3 3 0 0 0-3-3z" /><path d="M9 9v6M15 9v6M9 12h6" /></svg>
        ),
      },
      {
        title: "Digestion",
        text: "Regulation de l'appetit et du tractus gastro-intestinal.",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3c-3 5-6 6-6 11a6 6 0 0 0 12 0c0-5-3-6-6-11z" /></svg>
        ),
      },
      {
        title: "Cardiovasculaire",
        text: "Action potentielle sur la pression arterielle et le stress oxydatif.",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
        ),
      },
      {
        title: "Recuperation sportive",
        text: "Anti-inflammatoire pour courbatures et performance.",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l4 4M14 14l4 4M3 9l6 6M9 3l12 12M15 21l6-6M5 19l3-3" /></svg>
        ),
      },
    ],
  },
  {
    id: "pourquoi",
    label: "Pourquoi LaFleurCBD ?",
    title: "Notre engagement, votre confiance.",
    intro: "Plus de 100 000 clients nous font confiance pour leur quotidien. Voici pourquoi.",
    pillars: [
      {
        num: "01",
        title: "Qualite superieure",
        text: "Selection rigoureuse, tolerance zero sur la qualite et la securite des produits.",
      },
      {
        num: "02",
        title: "Variete et innovation",
        text: "Huiles, fleurs, resines, cosmetiques : une gamme complete pensee pour chaque besoin.",
      },
      {
        num: "03",
        title: "Livraison 48h",
        text: "Discretion totale, expedition partout en France, Belgique, Luxembourg, Allemagne, Italie, Espagne.",
      },
      {
        num: "04",
        title: "Expertise et conseil",
        text: "Une equipe disponible pour vous accompagner dans le choix et l'usage de chaque produit.",
      },
    ],
  },
];

function WhyLaFleurBento() {
  const cardBase = {
    background: "linear-gradient(150deg, #ffffff 0%, #f7f6f1 100%)",
    border: "1px solid rgba(255,255,255,0.7)",
    boxShadow:
      "0 28px 60px -28px rgba(0,0,0,0.55), 0 10px 28px -14px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.85)",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
      {/* Card 01 — Qualité (large hero) */}
      <div
        className="cbd-anim group relative overflow-hidden rounded-3xl p-6 md:p-8 md:col-span-7 transition-transform duration-500 hover:-translate-y-1"
        style={cardBase}
      >
        <div
          aria-hidden
          className="absolute -bottom-24 -right-20 w-72 h-72 rounded-full blur-3xl opacity-60 transition-opacity duration-700 group-hover:opacity-100 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(45,122,74,0.22), transparent 70%)" }}
        />
        <p
          className="relative text-[10px] uppercase tracking-[0.28em] mb-3"
          style={{ fontFamily: "var(--font-heading)", color: "rgba(10,37,32,0.45)" }}
        >
          01 · Exigence
        </p>
        <div className="relative flex items-center gap-5 md:gap-7 flex-wrap">
          <div
            className="tracking-tight whitespace-nowrap inline-flex items-start"
            style={{
              fontFamily: "Glorify, var(--font-heading)",
              fontWeight: 400,
              fontSize: "clamp(3.5rem, 8.5vw, 6rem)",
              lineHeight: 1.15,
              paddingTop: "0.18em",
              paddingRight: "0.1em",
              background: "linear-gradient(135deg, #0a2520 0%, #2d7a4a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            <span>100</span>
            <span style={{ fontSize: "0.28em", marginLeft: "0.15em", marginTop: "0.4em", lineHeight: 1 }}>%</span>
          </div>
          <div className="flex-1 min-w-[200px]">
            <h3
              className="text-xl md:text-2xl mb-2 leading-[1.05]"
              style={{ fontFamily: "Glorify, var(--font-heading)", fontWeight: 400, color: "#0a2520" }}
            >
              Qualité supérieure
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(10,37,32,0.6)" }}>
              Sélection rigoureuse, tolérance zéro sur la qualité et la sécurité de chaque produit.
            </p>
          </div>
        </div>
      </div>

      {/* Card 02 — Variété (chips) */}
      <div
        className="cbd-anim group relative overflow-hidden rounded-3xl p-8 md:p-10 md:col-span-5 transition-transform duration-500 hover:-translate-y-1 flex flex-col justify-between"
        style={cardBase}
      >
        <div>
          <p
            className="text-[10px] uppercase tracking-[0.28em] mb-3"
            style={{ fontFamily: "var(--font-heading)", color: "rgba(10,37,32,0.45)" }}
          >
            02 · Gamme complète
          </p>
          <h3
            className="text-2xl md:text-3xl mb-3 leading-[1.05]"
            style={{ fontFamily: "Glorify, var(--font-heading)", fontWeight: 400, color: "#0a2520" }}
          >
            Variété et innovation
          </h3>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(10,37,32,0.6)" }}>
            Une gamme complète pensée pour chaque besoin.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Fleurs", color: "#2d7a4a" },
            { label: "Huiles", color: "#5fa8d3" },
            { label: "Resines", color: "#7a4a2a" },
          ].map((t) => (
            <span
              key={t.label}
              className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full"
              style={{
                background: "rgba(10,37,32,0.06)",
                color: t.color,
                border: "1px solid rgba(10,37,32,0.1)",
                fontFamily: "var(--font-heading)",
              }}
            >
              <span className="block w-1.5 h-1.5 rounded-full dot-pulse" style={{ background: t.color, color: t.color }} />
              {t.label}
            </span>
          ))}
        </div>
      </div>

      {/* Card 03 — Livraison 48h (stat + countries) */}
      <div
        className="cbd-anim group relative overflow-hidden rounded-3xl p-8 md:p-10 md:col-span-5 transition-transform duration-500 hover:-translate-y-1 flex flex-col justify-between"
        style={cardBase}
      >
        <div>
          <p
            className="text-[10px] uppercase tracking-[0.28em] mb-3"
            style={{ fontFamily: "var(--font-heading)", color: "rgba(10,37,32,0.45)" }}
          >
            03 · Livraison express
          </p>
          <div className="flex items-baseline gap-3 mb-2">
            <span
              className="text-6xl md:text-7xl leading-[0.85] tracking-tight"
              style={{ fontFamily: "Glorify, var(--font-heading)", fontWeight: 400, color: "#0a2520" }}
            >
              48h
            </span>
            <span className="text-xs uppercase tracking-[0.2em]" style={{ color: "rgba(10,37,32,0.45)", fontFamily: "var(--font-heading)" }}>
              Maximum
            </span>
          </div>
          <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(10,37,32,0.6)" }}>
            Discrétion totale, suivi en temps réel.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {["FR", "BE", "LU", "DE", "IT", "ES"].map((c) => (
            <span
              key={c}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full text-[10px] font-semibold tabular-nums"
              style={{
                background: "rgba(10,37,32,0.06)",
                color: "rgba(10,37,32,0.7)",
                border: "1px solid rgba(10,37,32,0.1)",
                fontFamily: "var(--font-heading)",
              }}
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Card 04 — Expertise (avatars + 100k) */}
      <div
        className="cbd-anim group relative overflow-hidden rounded-3xl p-8 md:p-10 md:col-span-7 transition-transform duration-500 hover:-translate-y-1"
        style={cardBase}
      >
        <div
          aria-hidden
          className="absolute -top-20 -left-16 w-64 h-64 rounded-full blur-3xl opacity-50 transition-opacity duration-700 group-hover:opacity-100 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(95,168,211,0.18), transparent 70%)" }}
        />
        <p
          className="relative text-[10px] uppercase tracking-[0.28em] mb-3"
          style={{ fontFamily: "var(--font-heading)", color: "rgba(10,37,32,0.45)" }}
        >
          04 · Conseil humain
        </p>
        <div className="relative flex items-center gap-6 md:gap-8 flex-wrap">
          <div className="flex items-center">
            {["A", "M", "J", "L"].map((c, i) => (
              <span
                key={c}
                className="flex items-center justify-center w-12 h-12 rounded-full text-sm font-semibold"
                style={{
                  marginLeft: i === 0 ? 0 : "-14px",
                  background: i % 2 === 0 ? "#0a2520" : "#2d7a4a",
                  color: "#ffffff",
                  border: "2px solid #ffffff",
                  fontFamily: "var(--font-heading)",
                  zIndex: 4 - i,
                }}
              >
                {c}
              </span>
            ))}
            <span
              className="flex items-center justify-center w-12 h-12 rounded-full text-[11px] font-bold"
              style={{
                marginLeft: "-14px",
                background: "#ffffff",
                color: "#0a2520",
                border: "2px solid #ffffff",
                fontFamily: "var(--font-heading)",
                boxShadow: "0 4px 12px -4px rgba(10,37,32,0.25)",
              }}
            >
              100k
            </span>
          </div>
          <div className="flex-1 min-w-[200px]">
            <h3
              className="text-2xl md:text-3xl mb-2 leading-[1.05]"
              style={{ fontFamily: "Glorify, var(--font-heading)", fontWeight: 400, color: "#0a2520" }}
            >
              Une équipe à vos côtés
            </h3>
            <p className="text-sm md:text-base leading-relaxed" style={{ color: "rgba(10,37,32,0.6)" }}>
              Plus de 100 000 clients accompagnés. Conseillers formés à la plante, ses variétés et ses usages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BenefitsConstellation({ benefits }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const detailRef = useRef(null);
  const isFirstRef = useRef(true);

  useLayoutEffect(() => {
    if (!detailRef.current) return;
    if (isFirstRef.current) {
      isFirstRef.current = false;
      return;
    }
    gsap.fromTo(
      detailRef.current,
      { opacity: 0, y: 12, filter: "blur(8px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.5, ease: "expo.out" }
    );
  }, [activeIdx]);

  const positions = benefits.map((_, i) => {
    const angle = (i / benefits.length) * Math.PI * 2 - Math.PI / 2;
    return { x: Math.cos(angle), y: Math.sin(angle) };
  });

  const active = benefits[activeIdx];

  return (
    <div
      className="relative mx-auto -mt-16 md:-mt-30 pointer-events-none"
      style={{ maxWidth: "920px", width: "100%", aspectRatio: "1 / 1" }}
    >
      {/* Branches (dotted lines from center to each icon) */}
      <svg
        aria-hidden
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 600 600"
      >
        {positions.map((pos, i) => {
          const radius = 146;
          const inner = 48;
          const x1 = 300 + pos.x * inner;
          const y1 = 300 + pos.y * inner;
          const x2 = 300 + pos.x * radius;
          const y2 = 300 + pos.y * radius;
          const isActive = i === activeIdx;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isActive ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.1)"}
              strokeWidth="1"
              strokeDasharray="2 5"
              style={{ transition: "stroke 0.5s ease" }}
            />
          );
        })}
      </svg>

      {/* Center detail panel */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center px-6"
        style={{ width: "min(60%, 400px)" }}
      >
        <div ref={detailRef} key={activeIdx}>
          <h3
            className="text-3xl md:text-4xl text-white/95 mb-3"
            style={{ fontFamily: "Glorify, var(--font-heading)", fontWeight: 400 }}
          >
            {active.title}
          </h3>
          <p className="text-sm md:text-base text-white/60 leading-relaxed">
            {active.text}
          </p>
        </div>
      </div>

      {/* Icon nodes */}
      {benefits.map((b, i) => {
        const pos = positions[i];
        const isActive = i === activeIdx;
        const radius = 27.7; // percent of container — icon center synced with line outer (146 viewBox)
        return (
          <button
            key={b.title}
            type="button"
            onClick={() => setActiveIdx(i)}
            aria-label={b.title}
            className="absolute flex flex-col items-center transition-all duration-500 pointer-events-auto"
            style={{
              left: `${50 + pos.x * radius}%`,
              top: `${50 + pos.y * radius}%`,
              transform: `translate(-50%, -50%) scale(${isActive ? 1.1 : 1})`,
              zIndex: isActive ? 5 : 2,
            }}
          >
            <span
              className="flex items-center justify-center rounded-full transition-all duration-500"
              style={{
                width: isActive ? "91px" : "74px",
                height: isActive ? "91px" : "74px",
                background: isActive ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.05)",
                color: isActive ? "#042D24" : "rgba(255,255,255,0.7)",
                border: isActive
                  ? "1px solid rgba(255,255,255,0.95)"
                  : "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                boxShadow: isActive
                  ? "0 18px 40px -12px rgba(255,255,255,0.25), 0 0 0 6px rgba(255,255,255,0.06)"
                  : "0 8px 24px -10px rgba(0,0,0,0.5)",
              }}
            >
              <span className="block w-7 h-7">{b.icon}</span>
            </span>
            <span
              className="block mt-2 text-[10px] uppercase tracking-[0.2em] transition-all duration-500"
              style={{
                color: isActive ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)",
                fontFamily: "var(--font-heading)",
                whiteSpace: "nowrap",
                textAlign: "center",
              }}
            >
              {b.title.split(" ")[0]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function CBDExplained() {
  const [activeTab, setActiveTab] = useState(0);
  const contentRef = useRef(null);
  const isFirstRef = useRef(true);

  useLayoutEffect(() => {
    if (!contentRef.current) return;
    if (isFirstRef.current) {
      isFirstRef.current = false;
      return;
    }
    const items = contentRef.current.querySelectorAll(".cbd-anim");
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 10, filter: "blur(6px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.32, ease: "expo.out", overwrite: true }
    );
    if (items.length) {
      gsap.fromTo(
        items,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35, ease: "expo.out", stagger: 0.025, overwrite: true }
      );
    }
  }, [activeTab]);

  const tab = CBD_TABS[activeTab];

  return (
    <section className="relative z-10 py-12 md:py-16 px-6 md:px-14 lg:px-24">
      <ScrollReveal className="text-center max-w-2xl mx-auto mb-4 md:mb-5">
        <p
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] mb-4 md:mb-5 px-3 py-1 rounded-full"
          style={{
            color: "rgba(255,255,255,0.7)",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            fontFamily: "var(--font-heading)",
          }}
        >
          <span className="block w-1.5 h-1.5 rounded-full bg-white/60" />A decouvrir
        </p>
        <h2
          className="text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-tight text-white/95"
          style={{ fontFamily: "Glorify, var(--font-heading)", fontWeight: 400 }}
        >
          Tout savoir sur le <span className="text-white/40">CBD</span>
        </h2>
        <p className="mt-4 md:mt-5 text-sm md:text-base text-white/55 leading-relaxed max-w-xl mx-auto">
          Histoire, bienfaits, et ce qui fait la difference de LaFleurCBD.
        </p>
      </ScrollReveal>

      <ScrollReveal className="mb-4 md:mb-5 flex justify-center">
        <div
          role="tablist"
          className="inline-flex items-center gap-1 p-1 rounded-full flex-wrap justify-center"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          {CBD_TABS.map((t, i) => {
            const isActive = i === activeTab;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(i)}
                className="relative inline-flex items-center px-4 md:px-5 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-300"
                style={{
                  background: isActive ? "rgba(255,255,255,0.95)" : "transparent",
                  color: isActive ? "#042D24" : "rgba(255,255,255,0.65)",
                  fontFamily: "var(--font-heading)",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </ScrollReveal>

      <div ref={contentRef} className="max-w-5xl mx-auto">
        <p className="cbd-anim text-center text-sm md:text-base text-white/55 leading-relaxed max-w-2xl mx-auto mb-4 md:mb-5">
          {tab.intro}
        </p>

        {activeTab === 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-8 md:mb-10">
              {tab.blocks.map((b) => (
                <div
                  key={b.kicker}
                  className="cbd-anim relative overflow-hidden rounded-3xl p-7 md:p-8 flex flex-col items-center text-center"
                  style={{
                    background: "linear-gradient(150deg, #ffffff 0%, #f7f6f1 100%)",
                    border: "1px solid rgba(255,255,255,0.7)",
                    boxShadow:
                      "0 24px 50px -24px rgba(0,0,0,0.45), 0 8px 20px -10px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.85)",
                  }}
                >
                  <p
                    className="text-[10px] uppercase tracking-[0.28em] mb-3"
                    style={{ fontFamily: "var(--font-heading)", color: "rgba(10,37,32,0.45)" }}
                  >
                    {b.kicker}
                  </p>
                  <h3
                    className="text-xl md:text-2xl mb-3 leading-[1.05]"
                    style={{ fontFamily: "Glorify, var(--font-heading)", fontWeight: 400, color: "#0a2520" }}
                  >
                    {b.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(10,37,32,0.6)" }}>
                    {b.text}
                  </p>
                </div>
              ))}
            </div>
            <div className="cbd-anim">
              <p
                className="text-[10px] uppercase tracking-[0.28em] text-center mb-5 shimmer-text"
                style={{ fontFamily: "var(--font-heading)", animationDuration: "7s" }}
              >
                Sous toutes ses formes
              </p>
              <div className="flex flex-wrap md:flex-nowrap justify-center items-center gap-2 md:gap-0">
                {tab.forms.map((f, idx) => (
                  <Fragment key={f.label}>
                    <div
                      className="px-3 py-2 md:px-4 md:py-2.5 rounded-xl md:rounded-2xl text-center shrink-0"
                      style={{
                        background: "linear-gradient(150deg, #ffffff 0%, #f7f6f1 100%)",
                        border: "1px solid rgba(255,255,255,0.7)",
                        boxShadow:
                          "0 10px 24px -14px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.85)",
                      }}
                    >
                      <p
                        className="text-xs md:text-sm font-semibold"
                        style={{ fontFamily: "var(--font-heading)", color: "#0a2520" }}
                      >
                        {f.label}
                      </p>
                      <p className="text-[10px] md:text-[11px] mt-0.5 whitespace-nowrap" style={{ color: "rgba(10,37,32,0.55)" }}>
                        {f.desc}
                      </p>
                    </div>
                    {idx < tab.forms.length - 1 && (
                      <span
                        aria-hidden
                        className="hidden md:inline-block mx-2 h-px w-8 shimmer-line-dotted shrink-0"
                      />
                    )}
                  </Fragment>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 1 && <BenefitsConstellation benefits={tab.benefits} />}

        {activeTab === 2 && <WhyLaFleurBento />}
      </div>
    </section>
  );
}

function StoryTimeline() {
  const containerRef = useRef(null);
  const fillRef = useRef(null);
  const bgBarRef = useRef(null);

  useLayoutEffect(() => {
    const adjustBar = () => {
      if (!containerRef.current || !fillRef.current || !bgBarRef.current) return;
      const dots = containerRef.current.querySelectorAll(".tl-dot");
      if (dots.length < 2) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const firstRect = dots[0].getBoundingClientRect();
      const lastRect = dots[dots.length - 1].getBoundingClientRect();
      const topOffset = firstRect.top + firstRect.height / 2 - containerRect.top;
      const bottomOffset = containerRect.bottom - (lastRect.top + lastRect.height / 2);
      [fillRef.current, bgBarRef.current].forEach((el) => {
        el.style.top = `${topOffset}px`;
        el.style.bottom = `${bottomOffset}px`;
      });
    };
    adjustBar();
    window.addEventListener("resize", adjustBar);
    return () => window.removeEventListener("resize", adjustBar);
  }, []);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      const totalSteps = STORY_STEPS.length;
      const stepFraction = 1 / (totalSteps - 1);
      const stepEls = gsap.utils.toArray(".tl-step");

      // Initial hidden states
      stepEls.forEach((step, i) => {
        const bubble = step.querySelector(".tl-bubble");
        const text = step.querySelector(".tl-text");
        const dot = step.querySelector(".tl-dot");
        const bubbleSide = i % 2 === 0 ? -1 : 1;
        gsap.set(bubble, { scale: 0, opacity: 0, x: bubbleSide * 18 });
        gsap.set(text, { opacity: 0, x: -bubbleSide * 22 });
        gsap.set(dot, { scale: 0 });
      });
      gsap.set(fillRef.current, { scaleY: 0 });

      const sectionEl = containerRef.current.closest("section");
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionEl,
          start: "top 70%",
          end: "bottom 70%",
          scrub: 0.6,
        },
      });

      tl.to(fillRef.current, { scaleY: 1, ease: "none", duration: 1 }, 0);

      stepEls.forEach((step, i) => {
        const bubble = step.querySelector(".tl-bubble");
        const text = step.querySelector(".tl-text");
        const dot = step.querySelector(".tl-dot");
        const stepPos = i * stepFraction;

        tl.to(
          bubble,
          { scale: 1, opacity: 1, x: 0, duration: 0.15, ease: "expo.out" },
          stepPos
        );
        tl.to(
          text,
          { opacity: 1, x: 0, duration: 0.15, ease: "expo.out" },
          stepPos + 0.02
        );
        tl.to(
          dot,
          { scale: 1, duration: 0.1, ease: "back.out(2.2)" },
          stepPos + 0.04
        );
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative max-w-4xl mx-auto py-6">
      <div
        ref={bgBarRef}
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 w-px"
        style={{ top: 0, bottom: 0, background: "rgba(255,255,255,0.08)" }}
      />
      <div
        ref={fillRef}
        aria-hidden
        className="absolute left-1/2 w-px origin-top shimmer-line"
        style={{
          top: 0,
          bottom: 0,
          transform: "translateX(-50%) scaleY(0)",
        }}
      />

      <div className="space-y-20 md:space-y-28">
        {STORY_STEPS.map((step, i) => {
          const bubbleOnLeft = i % 2 === 0;
          return (
            <div
              key={step.title}
              className="tl-step relative grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-10"
            >
              <div className="flex justify-end">
                {bubbleOnLeft ? (
                  <div
                    className="tl-bubble flex items-center justify-center w-16 h-16 md:w-24 md:h-24 rounded-full"
                    style={{
                      background: "#ffffff",
                      border: "1px solid rgba(255,255,255,0.6)",
                      boxShadow: "0 18px 40px -20px rgba(0,0,0,0.6)",
                    }}
                  >
                    <div className="w-6 h-6 md:w-9 md:h-9" style={{ color: "#0a2520" }}>{step.icon}</div>
                  </div>
                ) : (
                  <div className="tl-text max-w-[220px] md:max-w-xs text-right">
                    <h3
                      className="text-lg md:text-2xl text-white/95 mb-1.5 md:mb-2"
                      style={{ fontFamily: "Glorify, var(--font-heading)", fontWeight: 400 }}
                    >
                      {step.title}
                    </h3>
                    <p className="text-xs md:text-sm text-white/55 leading-relaxed">{step.text}</p>
                  </div>
                )}
              </div>

              <div className="tl-dot relative">
                <span
                  className="block w-3 h-3 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.9)",
                    boxShadow:
                      "0 0 0 4px rgba(4,45,36,1), 0 0 14px rgba(255,255,255,0.45)",
                  }}
                />
              </div>

              <div className="flex justify-start">
                {bubbleOnLeft ? (
                  <div className="tl-text max-w-[220px] md:max-w-xs text-left">
                    <h3
                      className="text-lg md:text-2xl text-white/95 mb-1.5 md:mb-2"
                      style={{ fontFamily: "Glorify, var(--font-heading)", fontWeight: 400 }}
                    >
                      {step.title}
                    </h3>
                    <p className="text-xs md:text-sm text-white/55 leading-relaxed">{step.text}</p>
                  </div>
                ) : (
                  <div
                    className="tl-bubble flex items-center justify-center w-16 h-16 md:w-24 md:h-24 rounded-full"
                    style={{
                      background: "#ffffff",
                      border: "1px solid rgba(255,255,255,0.6)",
                      boxShadow: "0 18px 40px -20px rgba(0,0,0,0.6)",
                    }}
                  >
                    <div className="w-6 h-6 md:w-9 md:h-9" style={{ color: "#0a2520" }}>{step.icon}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CategoryIcon({ name, className = "w-5 h-5" }) {
  const props = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  if (name === "fleurs") {
    return (
      <svg {...props}>
        <path d="M12 2C12 2 14.5 5.5 14.5 8.5C14.5 10.5 13.5 12 12 12C10.5 12 9.5 10.5 9.5 8.5C9.5 5.5 12 2 12 2Z" />
        <path d="M5.6 5.6C5.6 5.6 9.5 6.8 11.2 9.3C12.3 10.9 12.2 12.7 11 13.5C9.8 14.3 8 13.8 6.9 12.2C5.2 9.7 5.6 5.6 5.6 5.6Z" />
        <path d="M18.4 5.6C18.4 5.6 14.5 6.8 12.8 9.3C11.7 10.9 11.8 12.7 13 13.5C14.2 14.3 16 13.8 17.1 12.2C18.8 9.7 18.4 5.6 18.4 5.6Z" />
        <path d="M3 12C3 12 6.8 12.2 9 14.3C10.5 15.7 10.8 17.5 9.8 18.5C8.8 19.5 7 19.2 5.5 17.7C3.5 15.6 3 12 3 12Z" />
        <path d="M21 12C21 12 17.2 12.2 15 14.3C13.5 15.7 13.2 17.5 14.2 18.5C15.2 19.5 17 19.2 18.5 17.7C20.5 15.6 21 12 21 12Z" />
        <line x1="12" y1="13" x2="12" y2="22" />
      </svg>
    );
  }
  if (name === "huiles") {
    return (
      <svg {...props}>
        <path d="M10 2L8 8H16L14 2H10Z" />
        <rect x="7" y="8" width="10" height="14" rx="2" />
        <path d="M12 12C12 12 14 14 14 16C14 17.1 13.1 18 12 18C10.9 18 10 17.1 10 16C10 14 12 12 12 12Z" />
      </svg>
    );
  }
  if (name === "résines") {
    return (
      <svg {...props}>
        <path d="M12 3C8 3 5 6 5 10C5 14 8 19 12 21C16 19 19 14 19 10C19 6 16 3 12 3Z" />
        <path d="M12 7C10.5 7 9 8.5 9 10.5C9 12.5 10.5 14 12 15C13.5 14 15 12.5 15 10.5C15 8.5 13.5 7 12 7Z" />
      </svg>
    );
  }
  return null;
}

function BestSellers() {
  const [activeKey, setActiveKey] = useState(CATEGORIES[0].key);
  const [offset, setOffset] = useState(0);
  const gridRef = useRef(null);
  const tweenRef = useRef(null);
  const active = CATEGORIES.find((c) => c.key === activeKey);
  const activeIndex = CATEGORIES.findIndex((c) => c.key === activeKey);
  const total = active.products.length;
  const rotated = active.products.map((_, i) => active.products[(i + offset) % total]);

  const isFirstRender = useRef(true);
  useLayoutEffect(() => {
    if (!gridRef.current) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (tweenRef.current) tweenRef.current.kill();
    const cards = gridRef.current.children;
    gsap.set(cards, { opacity: 0, y: 50, scale: 0.94, filter: "blur(10px)" });
    tweenRef.current = gsap.to(cards, {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      duration: 0.77,
      ease: "expo.out",
      stagger: 0.088,
      overwrite: true,
    });
  }, [offset, activeKey]);

  const handleSelect = (key) => {
    if (key === activeKey) return;
    setActiveKey(key);
    setOffset(0);
  };

  const next = () => setOffset((o) => (o + 1) % total);
  const prev = () => setOffset((o) => (o - 1 + total) % total);

  return (
    <>
      {/* Magnetic pill tabs with sliding indicator */}
      <ScrollReveal className="mb-6 md:mb-8 flex items-center justify-center">
        <div
          role="tablist"
          className="relative grid p-1.5 rounded-full"
          style={{
            gridTemplateColumns: `repeat(${CATEGORIES.length}, minmax(0, 1fr))`,
            background: "rgba(10,37,32,0.04)",
            border: `1px solid ${HAIRLINE}`,
          }}
        >
          <span
            aria-hidden
            className="absolute top-1.5 bottom-1.5 left-1.5 rounded-full pointer-events-none"
            style={{
              width: `calc((100% - 12px) / ${CATEGORIES.length})`,
              transform: `translateX(${activeIndex * 100}%)`,
              background: "#ffffff",
              boxShadow: "0 1px 2px rgba(10,37,32,0.05), 0 8px 22px rgba(10,37,32,0.08)",
              transition: "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
          {CATEGORIES.map((cat) => {
            const isActive = cat.key === activeKey;
            return (
              <button
                key={cat.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => handleSelect(cat.key)}
                className="relative z-10 inline-flex items-center justify-center gap-2 px-3.5 md:px-5 py-1.5 md:py-2 rounded-full text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.15em] cursor-pointer"
                style={{
                  color: isActive ? CATEGORY_TONES[cat.key] : INK_MUTED,
                  fontFamily: "var(--font-heading)",
                  transition: "color 400ms ease",
                }}
              >
                <span
                  aria-hidden
                  className="inline-flex items-center justify-center"
                  style={{
                    transform: isActive ? "scale(1.15)" : "scale(1)",
                    color: isActive ? CATEGORY_TONES[cat.key] : INK_DIM,
                    transition: "transform 500ms cubic-bezier(0.22, 1, 0.36, 1), color 400ms ease",
                  }}
                >
                  <CategoryIcon name={cat.key} className="w-3.5 h-3.5 md:w-[15px] md:h-[15px]" />
                </span>
                <span>{cat.title}</span>
              </button>
            );
          })}
        </div>
      </ScrollReveal>


      {/* Products grid */}
      <div className="relative">
        <button
          type="button"
          onClick={prev}
          aria-label="Produits precedents"
          className="group/chev hidden md:flex absolute left-0 -translate-x-full -translate-y-1/2 z-20 items-center justify-center w-14 h-14 rounded-full transition-all duration-300 hover:scale-110 cursor-pointer"
          style={{
            top: "calc((100% - 75px) / 2)",
            background: "transparent",
            border: "none",
            color: "rgba(10,37,32,0.45)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#000000")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(10,37,32,0.45)")}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
            <path d="M14.5 18l-6-6 6-6" />
          </svg>
        </button>

        <button
          type="button"
          onClick={next}
          aria-label="Produits suivants"
          className="group/chev hidden md:flex absolute right-0 translate-x-full -translate-y-1/2 z-20 items-center justify-center w-14 h-14 rounded-full transition-all duration-300 hover:scale-110 cursor-pointer"
          style={{
            top: "calc((100% - 75px) / 2)",
            background: "transparent",
            border: "none",
            color: "rgba(10,37,32,0.45)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#000000")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(10,37,32,0.45)")}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
            <path d="M9.5 6l6 6-6 6" />
          </svg>
        </button>

        <div
          ref={gridRef}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4"
        >
        {rotated.map((p, i) => (
          <a
            key={`${active.key}-${i}`}
            href="/products"
            className="group block relative overflow-hidden rounded-[28px] text-center"
            style={{
              background: "#042d24",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <StaticFlowingBackground
              color="rgba(255,255,255,0.45)"
              seed={42 + i * 17 + active.key.charCodeAt(0)}
              lineWidth={0.9}
              cellSize={6}
              numContours={5}
              waveScale={9}
            />

            {/* Image area */}
            <div className="relative aspect-[1/1] flex items-center justify-center">
              {/* Halo behind image */}
              <span
                aria-hidden
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[78%] h-[78%] rounded-full transition-all duration-700 group-hover:scale-110"
                style={{
                  background: `radial-gradient(circle, ${active.accent}2E 0%, transparent 60%)`,
                }}
              />

              <img
                src={p.image}
                alt={p.name}
                className="relative z-[1] w-[100%] h-[100%] object-contain translate-y-[15%] transition-transform duration-700 group-hover:-rotate-3 group-hover:translate-y-[5%]"
                style={{ filter: "drop-shadow(0 28px 32px rgba(10,37,32,0.22))" }}
              />

              {/* CBD chip top-left */}
              <span
                className="absolute top-3 left-3 z-10 text-[10px] font-bold tracking-[0.18em] uppercase px-2.5 py-1 rounded-full"
                style={{
                  background: "#ffffff",
                  color: INK,
                  border: `1px solid ${HAIRLINE}`,
                  fontFamily: "var(--font-heading)",
                }}
              >
                CBD {p.cbd}
              </span>

              {/* Quick-add top-right (hover) */}
              <span
                aria-hidden
                className="absolute top-3 right-3 z-10 inline-flex items-center justify-center w-9 h-9 rounded-full transition-all duration-500 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                style={{
                  background: "#ffffff",
                  color: CATEGORY_TONES.fleurs,
                  boxShadow: "0 8px 20px -6px rgba(0,0,0,0.35)",
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </div>

            {/* Apple-style banner */}
            <div
              className="relative z-[2] px-4 py-2 md:py-2.5 text-center"
              style={{
                background: "#042d24",
                borderTop: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 -8px 18px -8px rgba(0, 0, 0, 0.35)",
              }}
            >
              <h3
                className="text-base md:text-lg font-semibold tracking-tight truncate"
                style={{ color: "#ffffff", fontFamily: "var(--font-heading)" }}
              >
                {p.name}
              </h3>
              <p
                className="text-[13px] md:text-sm mt-1 tabular-nums"
                style={{ color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-heading)" }}
              >
                À partir de <span style={{ color: "#ffffff", fontWeight: 500 }}>{p.price} €</span>
              </p>
            </div>
          </a>
        ))}
        </div>
      </div>

      <div className="mt-6 md:mt-7 flex justify-center">
        <a
          href="/products"
          className="inline-flex items-center justify-center px-6 py-4 leading-none rounded-full text-xs font-bold uppercase tracking-[0.18em] transition-all duration-300 hover:scale-[1.03]"
          style={{
            background: "#ffffff",
            color: "#0a0a0a",
            border: "1px solid rgba(10,37,32,0.06)",
            boxShadow: "0 8px 20px -10px rgba(10,37,32,0.18), 0 2px 6px -2px rgba(10,37,32,0.08)",
            fontFamily: "var(--font-heading)",
          }}
        >
          Voir nos gammes
        </a>
      </div>
    </>
  );
}

/* ── Trust bento (reassurance) ── */
function TrustBento() {
  const card = {
    background: "#ffffff",
    border: "1px solid rgba(10,37,32,0.06)",
    boxShadow: "0 18px 50px -28px rgba(0,0,0,0.5)",
  };
  const iconCircle = {
    background: "rgba(10,37,32,0.05)",
    border: "1px solid rgba(10,37,32,0.08)",
    color: INK,
  };
  const titleFont = { fontFamily: "var(--font-heading)" };
  const display = { fontFamily: "Glorify, var(--font-heading)", fontWeight: 400 };

  return (
    <section className="relative z-10 py-12 md:py-16 px-6 md:px-14 lg:px-24">
      {/* Header */}
      <ScrollReveal className="mb-4 md:mb-5 max-w-3xl">
        <p
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] mb-4 md:mb-5 px-3 py-1 rounded-full"
          style={{
            color: "rgba(255,255,255,0.7)",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            fontFamily: "var(--font-heading)",
          }}
        >
          <span className="block w-1.5 h-1.5 rounded-full bg-white/60" />
          Au quotidien
        </p>
        <h2
          className="text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-tight text-white/95 whitespace-nowrap"
          style={display}
        >
          Juste <span className="text-white/40">l&apos;essentiel</span>
        </h2>
        <p className="mt-2 md:mt-2.5 text-sm md:text-base text-white/55 leading-relaxed max-w-xl">
          Ce qu&apos;il faut savoir avant de commander, condensé en un coup d&apos;oeil.
        </p>
      </ScrollReveal>

      {/* Bento grid */}
      <ScrollReveal>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-24 gap-4 md:gap-5 md:auto-rows-[170px]"
        >
          {/* CARD 1 — Livraison hero (cols 1-3, rows 1-2) */}
          <div
            className="relative overflow-hidden rounded-[28px] p-7 md:p-9 sm:col-span-2 md:col-span-10 md:row-span-2 group transition-transform duration-700"
            style={card}
          >
            {/* Dotted route line + animated traveling dot */}
            <svg
              aria-hidden
              className="absolute inset-0 w-full h-full pointer-events-none"
              preserveAspectRatio="none"
              viewBox="0 0 600 400"
            >
              <path
                id="route-path"
                d="M 68 348 C 580 360, 580 90, 560 74"
                fill="none"
                stroke={INK}
                strokeWidth="1.2"
                strokeDasharray="2 8"
                opacity="0.22"
              />
              <g opacity="0.9">
                <rect x="-12" y="-7" width="14" height="11" fill="#ffffff" stroke={INK} strokeWidth="1.2" />
                <path d="M2 -4 h5 l3 4 v4 h-8" fill="#ffffff" stroke={INK} strokeWidth="1.2" />
                <circle cx="-8" cy="5" r="1.6" fill={INK} />
                <circle cx="7" cy="5" r="1.6" fill={INK} />
                <animateMotion
                  dur="3.1s"
                  repeatCount="indefinite"
                  rotate="auto"
                  keyPoints="0;0.98"
                  keyTimes="0;1"
                >
                  <mpath href="#route-path" />
                </animateMotion>
              </g>
            </svg>
            {/* soft radial glow on hover */}
            <div
              aria-hidden
              className="absolute -top-24 -right-20 w-72 h-72 rounded-full blur-3xl opacity-25 group-hover:opacity-50 transition-opacity duration-700 pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(10,37,32,0.18), transparent 70%)" }}
            />
            {/* truck icon top-right */}
            <div
              className="absolute top-7 right-7 flex items-center justify-center w-9 h-9 rounded-full"
              style={iconCircle}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M3 11l9-7 9 7" />
                <path d="M5 10v10h14V10" />
                <path d="M10 20v-5h4v5" />
              </svg>
            </div>

            <div className="relative h-full flex flex-col">
              <p className="text-[10px] uppercase tracking-[0.28em]" style={{ ...titleFont, color: INK_DIM }}>
                Livraison
              </p>
              <div className="flex-1 flex flex-col justify-center pb-16 md:pb-20">
                <h3
                  className="text-3xl md:text-[3.25rem] leading-[1.05] tracking-tight"
                  style={{ ...display, color: INK }}
                >
                  Expedie en 24h.
                </h3>
                <p className="mt-4 text-sm md:text-[15px] leading-relaxed" style={{ color: INK_MUTED }}>
                  <span className="whitespace-nowrap">Conditionnée sous vide pour préserver la fraîcheur, expédiée sous 24h.</span><br />Livraison sécurisée et suivie en temps réel jusqu&apos;à votre porte.
                </p>
              </div>
            </div>

            {/* bottom row: micro-stats */}
            <div className="absolute bottom-7 left-7 right-7 flex items-end justify-between gap-4">
              <span
                className="flex items-center justify-center w-9 h-9 rounded-full shrink-0"
                style={iconCircle}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M3 8l9-5 9 5v8l-9 5-9-5V8z" />
                  <path d="M3 8l9 5 9-5" />
                  <path d="M12 13v8" />
                </svg>
              </span>
            </div>
          </div>

          {/* CARD 2 — 0,3% THC (cols 4-5, row 1) */}
          <div
            className="relative overflow-hidden rounded-[28px] p-7 md:col-span-8 md:row-span-1"
            style={card}
          >
            <p className="text-[10px] uppercase tracking-[0.28em]" style={{ ...titleFont, color: INK_DIM }}>
              Cadre légal
            </p>
            <h3
              className="mt-2 text-3xl md:text-4xl leading-none tracking-tight"
              style={{ ...display, color: INK }}
            >
              0,3<span style={{ color: INK_DIM }}>%</span>
            </h3>
            <p className="mt-3 text-[13px] leading-relaxed" style={{ color: INK_MUTED }}>
              Le seuil légal de THC, garanti sur chaque lot.<br />Conforme à la réglementation française et européenne.
            </p>
          </div>

          {/* CARD 3 — Paiement sécurisé (col 6, rows 1-2) */}
          <div
            className="relative overflow-hidden rounded-[28px] p-6 sm:col-span-2 md:col-span-6 md:row-span-2 flex flex-col"
            style={card}
          >
            {/* soft INK glow */}
            <div
              aria-hidden
              className="absolute -bottom-20 -left-16 w-56 h-56 rounded-full blur-3xl pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(10,37,32,0.08), transparent 70%)" }}
            />
            <h3
              className="relative text-2xl md:text-3xl leading-[1] tracking-tight"
              style={{ ...display, color: INK }}
            >
              Paiement securise
            </h3>
            <p className="relative mt-3 text-[13px] md:text-sm leading-relaxed" style={{ color: INK_MUTED }}>
              Paiement chiffré via Stripe.<br />Aucune donnée stockée sur nos serveurs.
            </p>
            <img
              src="/stripe-mockup.png"
              alt=""
              aria-hidden
              className="relative mt-6 mx-auto -mb-6 block max-w-full h-auto pointer-events-none select-none"
              style={{ filter: "drop-shadow(0 18px 30px rgba(10,37,32,0.22)) drop-shadow(0 6px 10px rgba(10,37,32,0.12))" }}
            />
          </div>

          {/* CARD 4 — Analyses HPLC (cols 4-5, row 2) */}
          <div
            className="relative overflow-hidden rounded-[28px] p-7 md:col-span-8 md:row-span-1"
            style={card}
          >
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em]" style={{ ...titleFont, color: INK_DIM }}>
                  Analyses HPLC
                </p>
                <h3
                  className="mt-2 text-2xl md:text-3xl leading-tight tracking-tight max-w-[16ch]"
                  style={{ ...display, color: INK }}
                >
                  Chaque lot est certifie.
                </h3>
                <p className="mt-3 text-[12px] leading-relaxed" style={{ color: INK_MUTED }}>
                  Cannabinoïdes, pesticides, métaux lourds.<br />Certificats accessibles sur chaque fiche produit.
                </p>
              </div>
              <span
                className="shrink-0 flex items-center justify-center w-11 h-11 rounded-full"
                style={iconCircle}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                  <path d="M9 3h6v4l5 12c1 2-1 4-3 4H7c-2 0-4-2-3-4l5-12V3z" />
                  <path d="M8 13h8" />
                </svg>
              </span>
            </div>
          </div>

          {/* CARD 5 — Made in France + map (cols 1-2, row 3) */}
          <div
            className="relative overflow-hidden rounded-[28px] p-7 md:col-span-8 md:row-span-1"
            style={card}
          >
            <img
              src="/carte.svg"
              alt=""
              aria-hidden
              className="pointer-events-none absolute right-0 top-[58%] -translate-y-1/2 h-[140%] w-auto opacity-30"
            />
            <div className="relative h-full flex flex-col justify-center">
              <p className="text-[10px] uppercase tracking-[0.28em]" style={{ ...titleFont, color: INK_DIM }}>
                Filiere
              </p>
              <h3 className="mt-1.5 text-3xl md:text-4xl leading-none tracking-tight" style={{ ...display, color: INK }}>
                100<span style={{ color: INK_DIM }}>%</span>
              </h3>
              <p className="mt-1 text-sm font-semibold inline-flex items-center gap-1.5" style={{ ...titleFont, color: "rgba(10,37,32,0.78)" }}>
                Made in <span className="text-base leading-none">🇫🇷</span>
              </p>
              <p className="mt-1.5 text-[12px] leading-snug" style={{ color: INK_MUTED }}>
                Cultivé en Europe,<br />Traité et expédié depuis la France.
              </p>
            </div>
          </div>

          {/* CARD 6 — Conseil humain (cols 3-4, row 3) */}
          <div
            className="relative overflow-hidden rounded-[28px] p-6 md:col-span-8 md:row-span-1"
            style={card}
          >
            {/* chat bubble dots */}
            <div className="absolute top-6 right-6 flex gap-1.5">
              <span className="block w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: INK }} />
              <span className="block w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "rgba(10,37,32,0.55)", animationDelay: "0.2s" }} />
              <span className="block w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "rgba(10,37,32,0.3)", animationDelay: "0.4s" }} />
            </div>
            <p className="text-[10px] uppercase tracking-[0.28em]" style={{ ...titleFont, color: INK_DIM }}>
              Conseil humain
            </p>
            <h3 className="mt-2 text-xl md:text-2xl leading-tight tracking-tight" style={{ ...display, color: INK }}>
              On vous <RotatingHelpWord />
            </h3>
            <p className="mt-2 text-[12px] leading-tight whitespace-nowrap inline-flex items-center gap-2" style={{ color: INK_MUTED }}>
              <span
                aria-hidden
                className="block w-1 h-1 rounded-full dot-pulse shrink-0"
                style={{ background: "#7aaa8e", color: "#7aaa8e" }}
              />
              <span>Équipe joignable 7jrs/7 par email et chat.</span>
            </p>
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-3">
              <p className="text-[10px] uppercase tracking-[0.25em]" style={{ ...titleFont, color: INK_DIM }}>
                Reponse moyenne 2h
              </p>
            </div>
          </div>

          {/* CARD 7 — Achats responsables / eco-packaging (cols 5-6, row 3) */}
          <div
            className="relative overflow-hidden rounded-[28px] p-6 md:col-span-8 md:row-span-1"
            style={card}
          >
            <p className="text-[10px] uppercase tracking-[0.28em]" style={{ ...titleFont, color: INK_DIM }}>
              Achats responsables
            </p>
            <h3
              className="mt-2 text-5xl md:text-6xl leading-none tracking-tight"
              style={{ ...display, color: INK }}
            >
              0 <RotatingPlasticWord />
            </h3>
            <p className="mt-1 text-sm font-semibold" style={{ ...titleFont, color: "rgba(10,37,32,0.78)" }}>
              Emballages eco-concus
            </p>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

/* ── FAQ section state holder ── */
function FAQList() {
  const [openIdx, setOpenIdx] = useState(0);
  return (
    <div>
      {FAQS.map((item, i) => (
        <FAQItem
          key={i}
          index={i}
          q={item.q}
          a={item.a}
          isOpen={openIdx === i}
          onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [email, setEmail] = useState("");

  return (
    <>
      {/* ── Fond fixe ── */}
      <div className="fixed inset-0 z-0" style={{ backgroundColor: "#042D24" }} />

      {/* ── Pochon 3D scroll-driven ── */}
      <ScrollPochon />

      {/* ══════════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════════ */}
      <section className="relative z-20 min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 md:px-14 lg:px-24">
        <FadeIn delay={400} className="mb-6">
          <p
            className="text-sm md:text-base uppercase tracking-[0.3em] font-medium shimmer-text"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            CBD Premium
          </p>
        </FadeIn>

        <h1
          className="text-center text-6xl sm:text-7xl md:text-8xl lg:text-9xl uppercase leading-[0.9] tracking-tight"
          style={{ fontFamily: "Ahsing, var(--font-heading)", fontWeight: 400, color: "rgba(255,255,255,0.9)" }}
        >
          <SplitText text="La Fleur" staggerMs={50} durationMs={700} delayMs={600} />
        </h1>

        <FadeIn delay={1200} className="mt-8 max-w-md text-center">
          <p className="text-white/40 text-base md:text-lg leading-relaxed" style={{ fontFamily: "var(--font-heading)" }}>
            Le CBD Français rigoureusement sélectionné. Fleurs, huiles, résines de haute qualité.
          </p>
        </FadeIn>

        <FadeIn delay={1500} className="mt-12">
          <a
            href="/products"
            className="group relative inline-flex items-center gap-3 rounded-full overflow-hidden"
          >
            <span
              className="absolute inset-0 rounded-full transition-all duration-500 group-hover:scale-105"
              style={{
                background: "#ffffff",
                border: "1px solid rgba(10,37,32,0.06)",
                boxShadow: "0 8px 20px -10px rgba(10,37,32,0.25), 0 2px 6px -2px rgba(10,37,32,0.12)",
              }}
            />
            <span className="relative flex items-center justify-center px-8 py-4 text-sm font-semibold uppercase tracking-widest transition-colors" style={{ color: "#0a0a0a" }}>
              Découvrir
            </span>
          </a>
        </FadeIn>

        <FadeIn delay={2000} className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.25em] shimmer-text">Scroll</span>
            <div className="w-px h-8 shimmer-line" />
          </div>
        </FadeIn>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 2 — CATEGORIES & TOP VENTES
      ══════════════════════════════════════════════ */}
      <section id="section-catégories" className="relative z-10 py-12 md:py-16 px-6 md:px-14 lg:px-24">
        <div className="relative w-full">
          <ScaleReveal>
            <div
              className="relative overflow-hidden rounded-[28px] md:rounded-[36px] p-4 md:p-10 lg:p-12"
              style={{
                background: "#fdfcf8",
                boxShadow:
                  "0 1px 0 rgba(255,255,255,0.07) inset, 0 30px 60px -30px rgba(0,0,0,0.45), 0 16px 40px -20px rgba(0,0,0,0.35)",
                border: "1px solid rgba(255,255,255,0.09)",
              }}
            >
              <div className="mb-4 md:mb-5 flex flex-col items-center text-center">
                <p
                  className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.24em] mb-4 md:mb-5 px-2.5 py-0.5 rounded-full"
                  style={{
                    color: INK_MUTED,
                    background: "rgba(10,37,32,0.05)",
                    border: `1px solid ${HAIRLINE}`,
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  <span className="w-1 h-1 rounded-full" style={{ background: INK }} />
                  Best sellers
                </p>
                <h2
                  className="text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-tight"
                  style={{
                    fontFamily: "Glorify, var(--font-heading)",
                    fontWeight: 400,
                    color: INK,
                    transform: "translateX(-1.5em)",
                  }}
                >
                  Découvrez nos <RotatingCategoryWord />
                </h2>
              </div>

              <BestSellers />
            </div>
          </ScaleReveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 3 — TRUST BENTO (reassurance)
      ══════════════════════════════════════════════ */}
      <TrustBento />

      {/* ══════════════════════════════════════════════
          SECTION 4 — NOUVEAUTES
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 py-12 md:py-16 px-6 md:px-14 lg:px-24">
        <ScrollReveal className="mb-4 md:mb-5 flex items-end justify-between gap-8 flex-wrap">
          <div className="max-w-xl">
            <p
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] mb-4 md:mb-5 px-3 py-1 rounded-full"
              style={{
                color: "rgba(255,255,255,0.7)",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                fontFamily: "var(--font-heading)",
              }}
            >
              <span className="block w-1.5 h-1.5 rounded-full bg-white/60" />
              Nouveautés
            </p>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-tight text-white/95"
              style={{ fontFamily: "Glorify, var(--font-heading)", fontWeight: 400 }}
            >
              Fraichement <span className="text-white/40">arrives</span>
            </h2>
            <p className="mt-2 md:mt-2.5 text-sm md:text-base text-white/45 leading-relaxed">
              Découvrez notre dernière gamme de produits.<br />Récoltes fraîches, stocks limités, qualité premium.
            </p>
          </div>
          <a
            href="/products"
            className="group inline-flex items-center gap-2 text-xs md:text-sm font-semibold uppercase tracking-widest px-4 py-2.5 rounded-full transition-all duration-500"
            style={{
              color: "#ffffff",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              fontFamily: "var(--font-heading)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.12)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
            }}
          >
            Tout voir
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 transition-transform group-hover:translate-x-1">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </ScrollReveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {NEW_ARRIVALS.map((p, i) => (
            <ScrollReveal key={p.name} delay={i * 100}>
              <a
                href="/products"
                className="group block relative overflow-hidden rounded-[28px] transition-all duration-500 backdrop-blur-xl"
                style={{
                  background: "rgba(255,255,255,0.8)",
                  border: "1px solid rgba(255,255,255,0.45)",
                  WebkitBackdropFilter: "blur(10px)",
                  backdropFilter: "blur(10px)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 28px 60px -24px rgba(130,95,195,0.45), 0 8px 24px -12px rgba(10,37,32,0.18)";
                  e.currentTarget.style.borderColor = "rgba(130,95,195,0.45)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
                }}
              >
                <StaticFlowingBackground color="rgba(130, 95, 195, 0.28)" seed={42 + i * 17} lineWidth={1.4} cellSize={6} numContours={5} waveScale={4} />

                <div className="relative aspect-[4/5] flex items-center justify-center">
                  {/* Halo violet derrière l'image — pulse au hover */}
                  <span
                    aria-hidden
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[78%] h-[78%] rounded-full transition-all duration-700 group-hover:scale-110"
                    style={{
                      background: "radial-gradient(circle, rgba(130,95,195,0.18) 0%, transparent 60%)",
                    }}
                  />

                  <img
                    src={p.image}
                    alt={p.name}
                    className="relative z-[1] w-[100%] h-[100%] object-contain translate-y-[15%] transition-transform duration-700 group-hover:-rotate-3 group-hover:translate-y-[5%]"
                    style={{ filter: "drop-shadow(0 28px 32px rgba(10,37,32,0.22))" }}
                  />

                  {/* CBD chip bottom-left */}
                  <span
                    className="absolute bottom-5 left-5 z-10 text-[10px] font-bold tracking-[0.18em] uppercase px-2.5 py-1 rounded-full"
                    style={{
                      background: "#ffffff",
                      color: INK,
                      border: `1px solid ${HAIRLINE}`,
                      fontFamily: "var(--font-heading)",
                    }}
                  >
                    CBD {p.cbd}
                  </span>

                  {/* Quick-add bouton bottom-right — révélé au hover */}
                  <span
                    aria-hidden
                    className="absolute bottom-5 right-5 z-10 inline-flex items-center justify-center w-9 h-9 rounded-full transition-all duration-500 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                    style={{
                      background: "#7d57c4",
                      color: "#ffffff",
                      boxShadow: "0 8px 20px -6px rgba(130,95,195,0.65)",
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </div>

                <div
                  className="relative z-[2] px-5 py-3 md:py-4 text-center"
                  style={{
                    background: "rgba(245,245,247,0.8)",
                    borderTop: "1px solid rgba(255,255,255,0.4)",
                    boxShadow: "0 -8px 18px -8px rgba(10, 37, 32, 0.18)",
                    WebkitBackdropFilter: "blur(8px)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <span
                    className="block text-[10px] font-semibold uppercase tracking-[0.22em] mb-1"
                    style={{ color: "#7d57c4", fontFamily: "var(--font-heading)" }}
                  >
                    Nouveau
                  </span>
                  <h3
                    className="text-base md:text-lg font-semibold tracking-tight truncate"
                    style={{ color: INK, fontFamily: "var(--font-heading)" }}
                  >
                    {p.name}
                  </h3>
                  <p
                    className="text-[13px] md:text-sm mt-1.5 tabular-nums"
                    style={{ color: INK_MUTED, fontFamily: "var(--font-heading)" }}
                  >
                    À partir de <span style={{ color: INK, fontWeight: 500 }}>{p.price} €</span>
                  </p>
                </div>
              </a>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 5 — BESOINS & INFOS
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 py-12 md:py-16 px-6 md:px-14 lg:px-24">
        <ScrollReveal className="mb-4 md:mb-5 max-w-3xl">
          <p
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] mb-4 md:mb-5 px-3 py-1 rounded-full"
            style={{
              color: "rgba(255,255,255,0.7)",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              fontFamily: "var(--font-heading)",
            }}
          >
            <span className="block w-1.5 h-1.5 rounded-full bg-white/60" />
            Pour quel besoin
          </p>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-tight text-white/95"
            style={{ fontFamily: "Glorify, var(--font-heading)", fontWeight: 400 }}
          >
            À chaque besoin, son <span className="text-white/40">CBD</span>
          </h2>
          <p className="mt-2 md:mt-2.5 text-sm md:text-base text-white/55 leading-relaxed max-w-xl">
            Pas la même attente le matin et le soir. Trois usages, trois réponses.
          </p>
        </ScrollReveal>

        {/* Use cases — 3 cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-4 md:mb-5">
          {USE_CASES.map((c, i) => (
            <ScrollReveal key={c.title} delay={i * 100}>
              <a
                href="/products"
                className="group relative block h-full overflow-hidden rounded-[28px] transition-all duration-500"
                style={{
                  background: "#fdfcf8",
                  border: `1px solid ${HAIRLINE}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = c.accent;
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = `0 24px 60px -24px ${c.glowStrong.replace("0.42", "0.55")}, 0 8px 24px -12px rgba(10,37,32,0.18)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = HAIRLINE;
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Accent halo bottom-right */}
                <div
                  aria-hidden
                  className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
                  style={{
                    background: `
                      radial-gradient(55% 65% at 90% 100%, ${c.glowStrong} 0%, transparent 60%),
                      radial-gradient(45% 55% at 0% 0%, ${c.glowSoft} 0%, transparent 65%)
                    `,
                  }}
                />

                {/* Top accent bar */}
                <div
                  aria-hidden
                  className="absolute top-0 inset-x-0 h-[3px] origin-left transition-transform duration-700 group-hover:scale-x-100"
                  style={{
                    background: c.accent,
                    transform: "scaleX(0.18)",
                  }}
                />

                {/* Content — horizontal layout */}
                <div className="relative flex items-center gap-5 md:gap-6 h-full p-5 md:p-6">
                  {/* Icon halo */}
                  <div className="relative shrink-0">
                    <span
                      aria-hidden
                      className="absolute -inset-2 rounded-full transition-all duration-700 group-hover:scale-110"
                      style={{
                        background: `radial-gradient(circle, ${c.glowStrong} 0%, transparent 70%)`,
                      }}
                    />
                    <span
                      aria-hidden
                      className="relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full transition-transform duration-700 group-hover:rotate-6"
                      style={{
                        background: "#ffffff",
                        border: `1.5px solid ${c.accent}`,
                        color: INK,
                        boxShadow: `0 8px 24px -10px ${c.glowStrong}`,
                      }}
                    >
                      <span className="block w-6 h-6 md:w-7 md:h-7">{c.icon}</span>
                    </span>
                  </div>

                  {/* Text column */}
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-[10px] uppercase tracking-[0.32em] mb-1.5"
                      style={{ color: c.accent === "#9CB7E8" ? "#5e7eb8" : c.accent === "#A8D5BA" ? "#5a9a78" : "#5a9b8a", fontFamily: "var(--font-heading)" }}
                    >
                      {c.subtitle}
                    </p>
                    <h3
                      className="text-2xl md:text-[28px] leading-[1] tracking-tight mb-3"
                      style={{
                        color: INK,
                        fontFamily: "Glorify, var(--font-heading)",
                        fontWeight: 400,
                      }}
                    >
                      {c.title}
                    </h3>
                    <span
                      className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] px-3 py-1.5 rounded-full transition-all duration-500"
                      style={{
                        color: INK,
                        background: c.accent,
                        fontFamily: "var(--font-heading)",
                      }}
                    >
                      Découvrir
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </a>
            </ScrollReveal>
          ))}
        </div>

        {/* Info cards — 2 wide cream cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {INFO_CARDS.map((card, i) => (
            <ScrollReveal key={card.title} delay={i * 100}>
              <a
                href={card.href}
                className="group relative block h-full p-8 md:p-10 lg:p-12 rounded-3xl overflow-hidden transition-all duration-500"
                style={{
                  background: "#fdfcf8",
                  border: `1px solid ${HAIRLINE}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 20px 48px -20px rgba(0,0,0,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {card.image && (
                  <img
                    src={card.image}
                    alt=""
                    aria-hidden
                    className="pointer-events-none absolute -bottom-12 -right-12 md:-bottom-16 md:-right-16 w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 object-cover rounded-full transition-transform duration-700 group-hover:scale-105 group-hover:-rotate-2"
                    style={{ filter: "drop-shadow(0 24px 32px rgba(10,37,32,0.18))" }}
                  />
                )}
                <div className="relative z-10 max-w-[70%] md:max-w-[65%]">
                  <p
                    className="italic text-sm md:text-base mb-5"
                    style={{ color: INK_MUTED }}
                  >
                    {card.label}
                  </p>
                  <h3
                    className="text-3xl md:text-4xl lg:text-5xl leading-[0.95] tracking-tight mb-6"
                    style={{
                      fontFamily: "Glorify, var(--font-heading)",
                      fontWeight: 400,
                      color: INK,
                    }}
                  >
                    {card.title}
                  </h3>
                  <p
                    className="text-sm md:text-base leading-relaxed mb-8"
                    style={{ color: INK_MUTED }}
                  >
                    {card.body}
                  </p>
                  <span
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all"
                    style={{ color: INK, fontFamily: "var(--font-heading)" }}
                  >
                    {card.cta}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </a>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 5.5 — ENGAGEMENTS
      ══════════════════════════════════════════════ */}
      <Engagements />

      {/* ══════════════════════════════════════════════
          SECTION 6 — A PROPOS / NOTRE HISTOIRE
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 py-12 md:py-16 px-6 md:px-14 lg:px-24">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-12 md:mb-20">
          <p
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] mb-4 md:mb-5 px-3 py-1 rounded-full"
            style={{
              color: "rgba(255,255,255,0.7)",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              fontFamily: "var(--font-heading)",
            }}
          >
            <span className="block w-1.5 h-1.5 rounded-full bg-white/60" />
            Notre histoire
          </p>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-tight text-white/95"
            style={{ fontFamily: "Glorify, var(--font-heading)", fontWeight: 400 }}
          >
            Une passion, une exigence
          </h2>
          <p className="mt-2 md:mt-2.5 text-sm md:text-base text-white/55 leading-relaxed max-w-xl mx-auto">
            De la sélection à la livraison, chaque étape garantit un CBD d&apos;exception.
          </p>
        </ScrollReveal>

        <StoryTimeline />
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 6.5 — CBD EXPLAINED (toggle 3 onglets)
      ══════════════════════════════════════════════ */}
      <CBDExplained />

      {/* ══════════════════════════════════════════════
          SECTION 7 — GUIDE CBD (educatif / SEO)
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 py-12 md:py-16 px-6 md:px-14 lg:px-24">
        <ScaleReveal>
          <div
            className="relative overflow-hidden rounded-[28px] md:rounded-[36px] p-6 md:p-10 lg:p-14"
            style={{
              background: "#fdfcf8",
              boxShadow:
                "0 30px 60px -30px rgba(0,0,0,0.45), 0 16px 40px -20px rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.09)",
            }}
          >
            <div className="mb-4 md:mb-5 flex flex-col items-center text-center">
              <p
                className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.24em] mb-4 md:mb-5 px-2.5 py-0.5 rounded-full"
                style={{
                  color: "#2d7a4a",
                  background: "rgba(45,122,74,0.08)",
                  border: "1px solid rgba(45,122,74,0.18)",
                  fontFamily: "var(--font-heading)",
                }}
              >
                <span className="w-1 h-1 rounded-full" style={{ background: "#2d7a4a" }} />
                Guide CBD
              </p>
              <h2
                className="text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-tight"
                style={{
                  fontFamily: "Glorify, var(--font-heading)",
                  fontWeight: 400,
                  color: INK,
                }}
              >
                Le CBD, expliqué <span style={{ color: INK_DIM }}>simplement</span>
              </h2>
              <p className="mt-2 md:mt-2.5 text-sm md:text-base leading-relaxed" style={{ color: INK_MUTED }}>
                Des réponses claires aux questions les plus fréquentes sur le CBD.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {GUIDE_CARDS.map((card, i) => (
                <ScrollReveal key={card.title} delay={i * 80}>
                  <a
                    href="/blog"
                    className="group block h-full rounded-2xl overflow-hidden transition-all duration-500"
                    style={{
                      background: "#ffffff",
                      border: `1px solid ${HAIRLINE}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 12px 32px -12px rgba(10,37,32,0.18)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden" style={{ background: SURFACE }}>
                      <img
                        src={card.image}
                        alt={card.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5 flex flex-col items-center text-center">
                      <p
                        className="text-[10px] uppercase tracking-[0.25em] mb-3"
                        style={{ color: INK_DIM, fontFamily: "var(--font-heading)" }}
                      >
                        {card.cat}
                      </p>
                      <h3
                        className="text-base md:text-lg font-bold tracking-tight mb-2 leading-snug"
                        style={{ color: INK, fontFamily: "var(--font-heading)" }}
                      >
                        {card.title}
                      </h3>
                      <p className="text-xs leading-relaxed" style={{ color: INK_MUTED }}>
                        {card.excerpt}
                      </p>
                      <span
                        className="inline-flex items-center gap-1.5 mt-4 text-[11px] font-semibold uppercase tracking-widest transition-all"
                        style={{ color: INK, fontFamily: "var(--font-heading)" }}
                      >
                        Lire l'article
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 transition-transform group-hover:translate-x-1">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </a>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </ScaleReveal>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 8 — AVIS CLIENTS
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 py-12 md:py-16 overflow-hidden">
        <div className="px-6 md:px-14 lg:px-24">
          <ScrollReveal className="mb-4 md:mb-5 flex items-end justify-between gap-8 flex-wrap">
            <div>
              <p
                className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] mb-4 md:mb-5 px-3 py-1 rounded-full"
                style={{
                  color: "rgba(255,255,255,0.7)",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  fontFamily: "var(--font-heading)",
                }}
              >
                <span className="block w-1.5 h-1.5 rounded-full bg-white/60" />
                Ils nous font confiance
              </p>
              <h2
                className="text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-tight text-white/95"
                style={{ fontFamily: "Glorify, var(--font-heading)", fontWeight: 400 }}
              >
                Avis <span className="text-white/40">clients</span>
              </h2>
            </div>

            <div
              className="flex items-center gap-4 px-5 py-3 rounded-full"
              style={{
                background: "rgba(4,45,36,0.55)",
                border: "1px solid rgba(255,255,255,0.09)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
            >
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <svg key={n} viewBox="0 0 24 24" fill="rgba(255,255,255,0.95)" className="w-4 h-4">
                    <path d="M12 2l2.9 6.9L22 10l-5.5 4.8L18 22l-6-3.6L6 22l1.5-7.2L2 10l7.1-1.1z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-semibold text-white/90" style={{ fontFamily: "var(--font-heading)" }}>
                4,8 / 5
              </span>
              <span className="text-xs text-white/40">sur 1 284 avis</span>
            </div>
          </ScrollReveal>
        </div>

        {/* Marquee testimonials (auto scroll - first row) */}
        <div className="relative overflow-hidden group mb-6" style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}>
          <div className="flex gap-6 animate-marquee w-max group-hover:[animation-play-state:paused]" style={{ animationDuration: "60s" }}>
            {[...REVIEWS, ...REVIEWS].map((r, i) => (
              <article
                key={i}
                className="w-[320px] md:w-[400px] shrink-0 p-7 md:p-8 rounded-3xl"
                style={{
                  background: "rgba(4,45,36,0.55)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                }}
              >
                <div className="flex items-center gap-1 mb-5">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <svg key={idx} viewBox="0 0 24 24" fill={idx < r.rating ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.15)"} className="w-3.5 h-3.5">
                      <path d="M12 2l2.9 6.9L22 10l-5.5 4.8L18 22l-6-3.6L6 22l1.5-7.2L2 10l7.1-1.1z" />
                    </svg>
                  ))}
                </div>
                <p className="text-white/75 text-sm md:text-base leading-relaxed mb-8 min-h-[5.5em]">
                  « {r.text} »
                </p>
                <div className="flex items-center gap-3 pt-5 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  <span
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white/80"
                    style={{
                      background: "rgba(255,255,255,0.09)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      fontFamily: "var(--font-heading)",
                    }}
                  >
                    {r.name.charAt(0)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white/90" style={{ fontFamily: "var(--font-heading)" }}>
                      {r.name}
                    </p>
                    <p className="text-[11px] text-white/35">{r.city}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Marquee testimonials (auto scroll - second row, reverse direction) */}
        <div className="relative overflow-hidden group" style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}>
          <div className="flex gap-6 animate-marquee-reverse w-max group-hover:[animation-play-state:paused]" style={{ animationDuration: "75s" }}>
            {[...REVIEWS_2, ...REVIEWS_2].map((r, i) => (
              <article
                key={i}
                className="w-[320px] md:w-[400px] shrink-0 p-7 md:p-8 rounded-3xl"
                style={{
                  background: "rgba(4,45,36,0.55)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                }}
              >
                <div className="flex items-center gap-1 mb-5">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <svg key={idx} viewBox="0 0 24 24" fill={idx < r.rating ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.15)"} className="w-3.5 h-3.5">
                      <path d="M12 2l2.9 6.9L22 10l-5.5 4.8L18 22l-6-3.6L6 22l1.5-7.2L2 10l7.1-1.1z" />
                    </svg>
                  ))}
                </div>
                <p className="text-white/75 text-sm md:text-base leading-relaxed mb-8 min-h-[5.5em]">
                  « {r.text} »
                </p>
                <div className="flex items-center gap-3 pt-5 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  <span
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white/80"
                    style={{
                      background: "rgba(255,255,255,0.09)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      fontFamily: "var(--font-heading)",
                    }}
                  >
                    {r.name.charAt(0)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white/90" style={{ fontFamily: "var(--font-heading)" }}>
                      {r.name}
                    </p>
                    <p className="text-[11px] text-white/35">{r.city}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 9 — FAQ
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 py-12 md:py-16 px-6 md:px-14 lg:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
          <ScrollReveal className="lg:col-span-4 lg:sticky lg:top-32 lg:self-start">
            <p
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] mb-4 md:mb-5 px-3 py-1 rounded-full"
              style={{
                color: "rgba(255,255,255,0.7)",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                fontFamily: "var(--font-heading)",
              }}
            >
              <span className="block w-1.5 h-1.5 rounded-full bg-white/60" />
              FAQ
            </p>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-tight text-white/90 mb-4 md:mb-5"
              style={{ fontFamily: "Glorify, var(--font-heading)", fontWeight: 400 }}
            >
              Questions <span className="text-white/40">frequentes</span>
            </h2>
            <p className="text-white/40 text-sm md:text-base leading-relaxed">
              Une question qui n&apos;apparait pas ici ?<br />Notre équipe vous répond sous 24h.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 mt-8 text-xs md:text-sm font-semibold uppercase tracking-widest text-white/70 hover:text-white transition-colors"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Nous contacter
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </ScrollReveal>

          <div className="lg:col-span-8">
            <FAQList />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 10 — BLOG / DERNIERS ARTICLES
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 py-12 md:py-16 px-6 md:px-14 lg:px-24">
        <ScrollReveal className="mb-12 md:mb-16 flex items-end justify-between gap-8 flex-wrap">
          <div>
            <p
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] mb-4 md:mb-5 px-3 py-1 rounded-full"
              style={{
                color: "rgba(255,255,255,0.7)",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                fontFamily: "var(--font-heading)",
              }}
            >
              <span className="block w-1.5 h-1.5 rounded-full bg-white/60" />
              Le journal
            </p>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-tight text-white/95"
              style={{ fontFamily: "Glorify, var(--font-heading)", fontWeight: 400 }}
            >
              Derniers <span className="text-white/40">articles</span>
            </h2>
          </div>
          <a
            href="/blog"
            className="group inline-flex items-center gap-2 text-xs md:text-sm font-semibold uppercase tracking-widest text-white/50 hover:text-white transition-colors"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Tout le blog
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 transition-transform group-hover:translate-x-1">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {BLOG_POSTS.map((post, i) => (
            <ScrollReveal key={post.title} delay={i * 100}>
              <a
                href="/blog"
                className="group block h-full rounded-3xl overflow-hidden transition-all duration-500"
                style={{
                  background: "rgba(4,45,36,0.55)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(4,45,36,0.7)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(4,45,36,0.55)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
                }}
              >
                <div className="relative aspect-[16/10] flex items-center justify-center overflow-hidden" style={{ background: "rgba(0,0,0,0.18)" }}>
                  <span
                    className="absolute top-4 left-4 z-10 text-[10px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.95)",
                      color: "#042D24",
                      fontFamily: "var(--font-heading)",
                    }}
                  >
                    {post.cat}
                  </span>
                  <img
                    src={post.image}
                    alt={post.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 md:p-7">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/35 mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                    {post.date}
                  </p>
                  <h3
                    className="text-lg md:text-xl font-bold tracking-tight text-white/90 mb-3 leading-snug"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {post.title}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed mb-5">
                    {post.excerpt}
                  </p>
                  <span
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/80"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Lire la suite
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 transition-transform group-hover:translate-x-1">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </a>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 10.5 — PRODUCT UNIVERSE (SEO families)
      ══════════════════════════════════════════════ */}
      <ProductUniverse />

      {/* ══════════════════════════════════════════════
          SECTION 11 — NEWSLETTER
      ══════════════════════════════════════════════ */}
      <section id="section-cta" className="relative z-10 py-12 md:py-16 px-6 md:px-14 lg:px-24">
        <ScaleReveal>
          <div
            className="relative overflow-hidden rounded-[28px] md:rounded-[36px] p-10 md:p-16 lg:p-20"
            style={{
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.09)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            <StaticFlowingBackground color="rgba(4, 45, 36, 0.12)" seed={117} lineWidth={0.7} cellSize={6} numContours={5} waveScale={4} />

            {/* Decorative orb */}
            <div
              aria-hidden
              className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
              style={{
                background: "radial-gradient(circle, rgba(4,45,36,0.3) 0%, transparent 70%)",
                filter: "blur(40px)",
              }}
            />

            <div className="relative max-w-2xl mx-auto text-center">
              <ScrollReveal>
                <p
                  className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] mb-4 md:mb-5 px-3 py-1 rounded-full"
                  style={{
                    color: "rgba(4,45,36,0.7)",
                    background: "rgba(4,45,36,0.06)",
                    border: "1px solid rgba(4,45,36,0.12)",
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  <span className="block w-1.5 h-1.5 rounded-full" style={{background: "rgba(4,45,36,0.6)"}} />
                  Newsletter
                </p>
                <h2
                  className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight mb-4 md:mb-5"
                  style={{ fontFamily: "var(--font-heading)", color: "#042D24" }}
                >
                  Restez informé
                </h2>
                <p className="text-base md:text-lg leading-relaxed mb-4 md:mb-5 max-w-md mx-auto" style={{color: "rgba(4,45,36,0.6)"}}>
                  Nouveautés, conseils et offres exclusives, directement dans votre boîte mail. Pas de spam, promis.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={150}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setEmail("");
                  }}
                  className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="flex-1 px-6 py-4 rounded-full text-sm placeholder:text-gray-400 focus:outline-none transition-colors"
                    style={{
                      background: "rgba(4,45,36,0.07)",
                      border: "1px solid rgba(4,45,36,0.1)",
                      fontFamily: "var(--font-heading)",
                      color: "#042D24",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(4,45,36,0.3)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(4,45,36,0.1)")}
                  />
                  <button
                    type="submit"
                    className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-500 hover:scale-105 whitespace-nowrap"
                    style={{
                      background: "#042D24",
                      color: "#ffffff",
                      fontFamily: "var(--font-heading)",
                    }}
                  >
                    S'inscrire
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </form>
                <p className="text-[11px] mt-5" style={{color: "rgba(4,45,36,0.4)"}}>
                  En vous inscrivant, vous acceptez notre politique de confidentialité.
                </p>
              </ScrollReveal>
            </div>
          </div>
        </ScaleReveal>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════ */}
      <footer
        className="relative z-10 px-6 md:px-14 lg:px-24 pt-16 md:pt-20 pb-40 md:pb-56"
        style={{ background: "#ffffff", color: "#0a2520" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-12 md:mb-16">
            {/* Brand */}
            <div>
              <p
                className="text-2xl uppercase tracking-tight mb-4"
                style={{ fontFamily: "Ahsing, var(--font-heading)", color: "#0a2520" }}
              >
                LaFleurCBD
              </p>
              <p className="text-sm leading-relaxed max-w-xs" style={{ color: "rgba(10,37,32,0.6)" }}>
                Le CBD Francais rigoureusement selectionne. Fleurs, huiles, resines de haute qualite.
              </p>
            </div>

            {/* Boutique */}
            <div>
              <p
                className="text-[10px] uppercase tracking-[0.28em] mb-5"
                style={{ fontFamily: "var(--font-heading)", color: "rgba(10,37,32,0.45)" }}
              >
                Boutique
              </p>
              <ul className="space-y-3 text-sm" style={{ color: "rgba(10,37,32,0.7)" }}>
                {["Fleurs CBD", "Huiles CBD", "Resines CBD", "Nouveautes"].map((item) => (
                  <li key={item}>
                    <a
                      href="/products"
                      className="transition-colors"
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#0a2520")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(10,37,32,0.7)")}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Aide */}
            <div>
              <p
                className="text-[10px] uppercase tracking-[0.28em] mb-5"
                style={{ fontFamily: "var(--font-heading)", color: "rgba(10,37,32,0.45)" }}
              >
                Infos pratiques
              </p>
              <ul className="space-y-3 text-sm" style={{ color: "rgba(10,37,32,0.7)" }}>
                {[
                  { label: "Livraison", href: "/livraison" },
                  { label: "Mentions legales", href: "/mentions-legales" },
                  { label: "CGV", href: "/cgv" },
                  { label: "Confidentialite", href: "/confidentialite" },
                ].map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="transition-colors"
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#0a2520")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(10,37,32,0.7)")}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p
                className="text-[10px] uppercase tracking-[0.28em] mb-5"
                style={{ fontFamily: "var(--font-heading)", color: "rgba(10,37,32,0.45)" }}
              >
                Nous contacter
              </p>
              <ul className="space-y-3 text-sm" style={{ color: "rgba(10,37,32,0.7)" }}>
                <li>
                  <a
                    href="tel:+33189720196"
                    className="inline-flex items-center gap-2 transition-colors"
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#0a2520")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(10,37,32,0.7)")}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5" style={{ color: "rgba(10,37,32,0.4)" }}>
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    01 89 72 01 96
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:contact@lafleurcbd.fr"
                    className="inline-flex items-center gap-2 transition-colors"
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#0a2520")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(10,37,32,0.7)")}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5" style={{ color: "rgba(10,37,32,0.4)" }}>
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M3 7l9 6 9-6" />
                    </svg>
                    contact@lafleurcbd.fr
                  </a>
                </li>
                <li className="text-xs pt-1" style={{ color: "rgba(10,37,32,0.4)" }}>
                  Lun – Ven · 10h – 18h
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t"
            style={{ borderColor: "rgba(10,37,32,0.08)" }}
          >
            <p className="text-xs" style={{ fontFamily: "var(--font-heading)", color: "rgba(10,37,32,0.4)" }}>
              © {new Date().getFullYear()} LaFleurCBD. Tous droits reserves.
            </p>

            <div className="flex items-center gap-3">
              {[
                {
                  name: "Instagram",
                  href: "#",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                      <rect x="3" y="3" width="18" height="18" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                    </svg>
                  ),
                },
                {
                  name: "TikTok",
                  href: "#",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                    </svg>
                  ),
                },
                {
                  name: "Facebook",
                  href: "#",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  ),
                },
                {
                  name: "YouTube",
                  href: "#",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
                      <path d="M9.75 15.02V8.48L15.5 11.75z" fill="currentColor" />
                    </svg>
                  ),
                },
              ].map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  aria-label={s.name}
                  className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300"
                  style={{
                    background: "rgba(10,37,32,0.04)",
                    border: "1px solid rgba(10,37,32,0.1)",
                    color: "rgba(10,37,32,0.55)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(10,37,32,0.1)";
                    e.currentTarget.style.borderColor = "rgba(10,37,32,0.2)";
                    e.currentTarget.style.color = "#0a2520";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(10,37,32,0.04)";
                    e.currentTarget.style.borderColor = "rgba(10,37,32,0.1)";
                    e.currentTarget.style.color = "rgba(10,37,32,0.55)";
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
