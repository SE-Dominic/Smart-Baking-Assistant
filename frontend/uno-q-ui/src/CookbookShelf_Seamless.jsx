import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

/*
  SMART BAKING ASSISTANT — 3D COOKBOOK LIBRARY (cozy + realistic edition)

  What's new compared with the first version:
  - Real hardcover construction: front board, back board, rounded spine,
    and a recessed paper block with fine sheet lines (before, the page
    block was hidden inside the cover, which is why it looked flat).
  - Covers are painted onto a canvas texture: photo + cloth hinge strip,
    inset border, cream label with washi tape, hearts and a soft sheen.
  - Linen cloth texture on the boards, wood grain on the shelf.
  - Real soft shadows (books cast onto the shelf and onto the wall).
  - Books now actually sit ON the shelf (they used to float above it).
  - Shelf is wide enough for all five books, with little brackets.
  - Cute extras: ribbon bookmarks, a smiling plant, a steaming mug.
  - Bouncy hover: the book slides out, tilts and gently wiggles.

  Same props as before: <CookbookShelf onSelect={(name) => ...} />
  Cover images are still read from /public (e.g. /breakfast-cover.jpg).
*/

// -----------------------------------------------------
// 1. COOKBOOK COLLECTION
// -----------------------------------------------------

const BOOKS = [
  {
    name: "Breakfast",
    subtitle: "GOOD MORNING",
    color: "#D6A66D",
    ribbon: "#8FB9D6",
    image: "/breakfast-cover.jpg",
  },
  {
    name: "Entrées",
    subtitle: "THE MAIN EVENT",
    color: "#81947A",
    ribbon: "#F2D98D",
    image: "/entrees-cover.jpg",
  },
  {
    name: "Sides",
    subtitle: "THE PERFECT PAIRING",
    color: "#D8B96C",
    ribbon: "#E58CA1",
    image: "/sides-cover.jpg",
  },
  {
    name: "Starters",
    subtitle: "A LITTLE SOMETHING",
    color: "#BC8069",
    ribbon: "#F7E2A1",
    image: "/starters-cover.jpg",
  },
  {
    name: "Desserts",
    subtitle: "SOMETHING SWEET",
    color: "#C98F9D",
    ribbon: "#8FC1B5",
    image: "/desserts-cover.jpg",
  },
  // ---- Dietary collections (scroll right to find them) ----
  // If a cover photo is missing from /public, a pastel placeholder
  // cover is drawn automatically, so nothing breaks.
  {
    name: "Diabetes",
    subtitle: "BALANCED & BRIGHT",
    color: "#8DB3C4",
    ribbon: "#F4C27A",
    image: "/diabetes-cover.jpg",
  },
  {
    name: "Vegan",
    subtitle: "PLANT POWERED",
    color: "#A5C289",
    ribbon: "#F29CB0",
    image: "/vegan-cover.jpg",
  },
  {
    name: "Vegetarian",
    subtitle: "GARDEN FRESH",
    color: "#D88C5A",
    ribbon: "#BFD8A0",
    image: "/vegetarian-cover.jpg",
  },
  {
    name: "Celiac",
    subtitle: "GLUTEN-FREE JOY",
    color: "#B9A5D3",
    ribbon: "#F6D98B",
    image: "/celiac-cover.jpg",
  },
  
];

const EVERYDAY_BOOKS = BOOKS.slice(0, 5);

const DIETARY_BOOKS = BOOKS.slice(5);

// Book dimensions in Three.js world units.
const BOOK_WIDTH = 1.65;
const BOOK_HEIGHT = 2.45;
const BOOK_DEPTH = 0.26;
const BOARD_T = 0.045; // thickness of each hard cover board
const BOOK_SPACING = 1.95;
const SHELF_WIDTH = 11.6;
const SHELF_TOP = -BOOK_HEIGHT / 2; // books stand exactly on this height

const CORNER_LEFT = 0.015; // spine side stays crisp
const CORNER_RIGHT = 0.035; // fore-edge corners are soft and cute

const SERIF =
  '"Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif';

// -----------------------------------------------------
// 2. SMALL CANVAS HELPERS
// -----------------------------------------------------

function makeCanvas(w, h) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  return [canvas, canvas.getContext("2d")];
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

// Rounded rectangle with different radii on the left and right sides.
function roundRect(g, x, y, w, h, rl, rr) {
  g.beginPath();
  g.moveTo(x + rl, y);
  g.lineTo(x + w - rr, y);
  g.arcTo(x + w, y, x + w, y + rr, rr);
  g.lineTo(x + w, y + h - rr);
  g.arcTo(x + w, y + h, x + w - rr, y + h, rr);
  g.lineTo(x + rl, y + h);
  g.arcTo(x, y + h, x, y + h - rl, rl);
  g.lineTo(x, y + rl);
  g.arcTo(x, y, x + rl, y, rl);
  g.closePath();
}

function heartPath(g, cx, cy, s) {
  g.beginPath();
  g.moveTo(cx, cy + s * 0.9);
  g.bezierCurveTo(cx - s * 1.5, cy - s * 0.1, cx - s * 0.6, cy - s * 1.1, cx, cy - s * 0.35);
  g.bezierCurveTo(cx + s * 0.6, cy - s * 1.1, cx + s * 1.5, cy - s * 0.1, cx, cy + s * 0.9);
  g.closePath();
}

// -----------------------------------------------------
// 3. SHARED PROCEDURAL TEXTURES (created once)
// -----------------------------------------------------

let linenTexture;
function getLinenTexture() {
  if (linenTexture) return linenTexture;
  const [canvas, g] = makeCanvas(256, 256);
  g.fillStyle = "#ffffff";
  g.fillRect(0, 0, 256, 256);

  // Woven cloth: faint horizontal + vertical threads.
  for (let i = 0; i < 256; i += 2) {
    g.fillStyle = `rgba(60,40,20,${rand(0.04, 0.11)})`;
    g.fillRect(0, i, 256, 1);
    g.fillStyle = `rgba(60,40,20,${rand(0.04, 0.11)})`;
    g.fillRect(i, 0, 1, 256);
  }
  for (let i = 0; i < 900; i++) {
    g.fillStyle = `rgba(255,255,255,${rand(0.05, 0.18)})`;
    g.fillRect(rand(0, 256), rand(0, 256), 1.5, 1.5);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 4);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  linenTexture = tex;
  return tex;
}

// Fine paper sheets on the fore-edge (vertical lines) and top/bottom.
const edgeTextures = {};
function getEdgeTexture(vertical) {
  const key = vertical ? "v-photoreal" : "h-photoreal";
  if (edgeTextures[key]) return edgeTextures[key];
  // A high-resolution page block with hundreds of extremely fine sheet seams.
  // Fore-edge sheets run along the depth; top and bottom sheets run across depth.
  const [canvas, g] = vertical ? makeCanvas(1024, 64) : makeCanvas(64, 1024);
  const W = canvas.width, H = canvas.height;
  g.fillStyle = "#eee3cf";
  g.fillRect(0, 0, W, H);
  const n = 650;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const p = Math.round(t * (vertical ? W : H));
    const seam = i % 9 === 0 ? 0.19 : i % 3 === 0 ? 0.12 : 0.065;
    g.fillStyle = `rgba(77,58,41,${seam})`;
    if (vertical) g.fillRect(p, 0, 1, H);
    else g.fillRect(0, p, W, 1);
    if (i % 4 === 0) {
      g.fillStyle = "rgba(255,252,239,0.45)";
      if (vertical) g.fillRect(p + 1, 0, 1, H);
      else g.fillRect(0, p + 1, W, 1);
    }
  }
  // Darken the outer corners of the page block, where light is occluded.
  const shade = vertical ? g.createLinearGradient(0, 0, W, 0)
                         : g.createLinearGradient(0, 0, 0, H);
  shade.addColorStop(0, "rgba(72,48,26,0.19)");
  shade.addColorStop(0.1, "rgba(72,48,26,0.02)");
  shade.addColorStop(0.85, "rgba(72,48,26,0.01)");
  shade.addColorStop(1, "rgba(72,48,26,0.22)");
  g.fillStyle = shade;
  g.fillRect(0, 0, W, H);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  edgeTextures[key] = tex;
  return tex;
}

let woodTexture;
function getWoodTexture() {
  if (woodTexture) return woodTexture;
  const [canvas, g] = makeCanvas(1024, 128);

  const base = g.createLinearGradient(0, 0, 0, 128);
  base.addColorStop(0, "#C99E75");
  base.addColorStop(0.5, "#B98A62");
  base.addColorStop(1, "#C49669");
  g.fillStyle = base;
  g.fillRect(0, 0, 1024, 128);

  // Long soft grain streaks
  for (let i = 0; i < 170; i++) {
    const x = rand(-100, 1024);
    const y = rand(0, 128);
    const len = rand(120, 600);
    g.strokeStyle =
      Math.random() > 0.5
        ? `rgba(110,70,40,${rand(0.05, 0.14)})`
        : `rgba(255,230,200,${rand(0.05, 0.12)})`;
    g.lineWidth = rand(0.6, 2.4);
    g.beginPath();
    g.moveTo(x, y);
    g.bezierCurveTo(
      x + len * 0.3, y + rand(-3, 3),
      x + len * 0.7, y + rand(-3, 3),
      x + len, y + rand(-2, 2)
    );
    g.stroke();
  }

  // A couple of little knots for character
  [[240, 52], [790, 88]].forEach(([kx, ky]) => {
    for (let r = 14; r > 2; r -= 4) {
      g.strokeStyle = `rgba(100,62,36,${0.18 - r * 0.006})`;
      g.lineWidth = 1.4;
      g.beginPath();
      g.ellipse(kx, ky, r * 2.4, r * 0.8, 0, 0, Math.PI * 2);
      g.stroke();
    }
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  woodTexture = tex;
  return tex;
}

// -----------------------------------------------------
// 4. COVER ARTWORK (photo + label painted onto a canvas)
// -----------------------------------------------------

function drawCoverTexture(book, img) {
  const W = 1024;
  const H = Math.round((W * BOOK_HEIGHT) / BOOK_WIDTH);
  const pxPerUnit = W / BOOK_WIDTH;
  const rl = CORNER_LEFT * pxPerUnit;
  const rr = CORNER_RIGHT * pxPerUnit;
  const [canvas, g] = makeCanvas(W, H);

  g.save();
  roundRect(g, 0, 0, W, H, rl, rr);
  g.clip();

  // --- Photograph, "object-fit: cover" style ---
  const imageAspect = img.width / img.height;
  const coverAspect = W / H;
  let sw, sh, sx, sy;
  if (imageAspect > coverAspect) {
    sh = img.height;
    sw = sh * coverAspect;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = sw / coverAspect;
    sx = 0;
    sy = (img.height - sh) / 2;
  }
  g.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);

  // --- Warm film-like grade + soft darkening at the bottom ---
  g.fillStyle = "rgba(255, 214, 170, 0.07)";
  g.fillRect(0, 0, W, H);

  const shade = g.createLinearGradient(0, H * 0.5, 0, H);
  shade.addColorStop(0, "rgba(40,24,14,0)");
  shade.addColorStop(1, "rgba(40,24,14,0.38)");
  g.fillStyle = shade;
  g.fillRect(0, 0, W, H);

  // --- Soft diagonal sheen (laminated cover look) ---
  const sheen = g.createLinearGradient(0, 0, W, H * 0.6);
  sheen.addColorStop(0, "rgba(255,255,255,0.0)");
  sheen.addColorStop(0.35, "rgba(255,255,255,0.13)");
  sheen.addColorStop(0.5, "rgba(255,255,255,0.0)");
  g.fillStyle = sheen;
  g.fillRect(0, 0, W, H);

  // --- Cloth hinge strip along the spine side ---
  g.globalAlpha = 0.95;
  g.fillStyle = book.color;
  g.fillRect(0, 0, 70, H);
  g.globalAlpha = 1;
  g.fillStyle = "rgba(0,0,0,0.22)";
  g.fillRect(70, 0, 5, H);
  g.fillStyle = "rgba(255,255,255,0.3)";
  g.fillRect(75, 0, 3, H);

  // --- Inset border ---
  roundRect(g, 112, 46, W - 112 - 46, H - 92, 14, 34);
  g.strokeStyle = "rgba(255,255,255,0.85)";
  g.lineWidth = 4;
  g.stroke();

  // --- Cream label ---
  const labelW = 690;
  const labelH = 300;
  const cx = (W + 70) / 2;
  const lx = cx - labelW / 2;
  const ly = H - labelH - 130;

  g.save();
  g.shadowColor = "rgba(40,20,10,0.35)";
  g.shadowBlur = 36;
  g.shadowOffsetY = 12;
  roundRect(g, lx, ly, labelW, labelH, 40, 40);
  g.fillStyle = "#FFF8EC";
  g.fill();
  g.restore();

  // Stitched / dashed inner border
  roundRect(g, lx + 16, ly + 16, labelW - 32, labelH - 32, 28, 28);
  g.setLineDash([12, 10]);
  g.lineWidth = 3;
  g.strokeStyle = book.color;
  g.stroke();
  g.setLineDash([]);

  // Washi tape on the top corners
  [
    [lx + 70, ly + 6, -0.38],
    [lx + labelW - 70, ly + 6, 0.38],
  ].forEach(([tx, ty, rot]) => {
    g.save();
    g.translate(tx, ty);
    g.rotate(rot);
    g.globalAlpha = 0.88;
    g.fillStyle = book.ribbon;
    g.fillRect(-70, -20, 140, 40);
    g.globalAlpha = 0.35;
    g.fillStyle = "#ffffff";
    for (let i = -60; i < 70; i += 20) g.fillRect(i, -20, 8, 40);
    g.restore();
  });

  // Title (shrinks to fit longer words)
  g.textAlign = "center";
  g.textBaseline = "middle";
  let size = 118;
  g.font = `700 ${size}px ${SERIF}`;
  while (g.measureText(book.name).width > labelW - 120 && size > 50) {
    size -= 4;
    g.font = `700 ${size}px ${SERIF}`;
  }
  g.fillStyle = "#4B3226";
  g.fillText(book.name, cx, ly + labelH * 0.44);

  // Subtitle with little hearts
  g.font = `600 27px ${SERIF}`;
  if ("letterSpacing" in g) g.letterSpacing = "6px";
  g.fillStyle = "#8A6A58";
  const subY = ly + labelH * 0.76;
  g.fillText(book.subtitle, cx, subY);
  const subW = g.measureText(book.subtitle).width;
  if ("letterSpacing" in g) g.letterSpacing = "0px";

  g.fillStyle = "#E58CA1";
  heartPath(g, cx - subW / 2 - 34, subY, 11);
  g.fill();
  heartPath(g, cx + subW / 2 + 34, subY, 11);
  g.fill();

  // Fine paper grain over everything
  for (let i = 0; i < 5000; i++) {
    g.fillStyle = `rgba(255,255,255,${rand(0.02, 0.07)})`;
    g.fillRect(rand(0, W), rand(0, H), 2, 2);
  }

  g.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function CoverFace({ book }) {
  const loaded = useLoader(THREE.TextureLoader, book.image);
  const texture = useMemo(
    () => drawCoverTexture(book, loaded.image),
    [book, loaded]
  );

  useEffect(() => () => texture.dispose(), [texture]);

  const faceGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(BOOK_WIDTH, BOOK_HEIGHT, 32, 16);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i) / (BOOK_WIDTH / 2);
      positions.setZ(i, 0.006 * (1 - x * x));
    }
    geometry.computeVertexNormals();
    return geometry;
  }, []);
  useEffect(() => () => faceGeometry.dispose(), [faceGeometry]);

  return (
    <mesh geometry={faceGeometry} position={[0, 0, BOOK_DEPTH / 2 + 0.002]} userData={{ skip: true }}>
      {/*
        The emissive copy of the photo keeps the colours bright and
        appetising under any lighting. Lower emissiveIntensity if you
        want the cover to react more to the lights.
      */}
      <meshStandardMaterial
        map={texture}
        emissiveMap={texture}
        emissive="#ffffff"
        emissiveIntensity={0.065}
        roughness={0.84}
        metalness={0}
        transparent
        alphaTest={0.5}
      />
    </mesh>
  );
}

// -----------------------------------------------------
// 5. HARDCOVER BOOK
// -----------------------------------------------------

// Cover board with softly rounded fore-edge corners and a tiny bevel.
function makeBoardGeometry() {
  const bevel = 0.006;
  const sw = BOOK_WIDTH - bevel * 2;
  const sh = BOOK_HEIGHT - bevel * 2;
  const x0 = -sw / 2, x1 = sw / 2, y0 = -sh / 2, y1 = sh / 2;
  const rl = CORNER_LEFT, rr = CORNER_RIGHT;

  const shape = new THREE.Shape();
  shape.moveTo(x0 + rl, y0);
  shape.lineTo(x1 - rr, y0);
  shape.quadraticCurveTo(x1, y0, x1, y0 + rr);
  shape.lineTo(x1, y1 - rr);
  shape.quadraticCurveTo(x1, y1, x1 - rr, y1);
  shape.lineTo(x0 + rl, y1);
  shape.quadraticCurveTo(x0, y1, x0, y1 - rl);
  shape.lineTo(x0, y0 + rl);
  shape.quadraticCurveTo(x0, y0, x0 + rl, y0);

  const depth = BOARD_T - bevel * 2;
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 16,
  });
  geometry.translate(0, 0, -depth / 2);
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) / (BOOK_WIDTH / 2);
    pos.setZ(i, pos.getZ(i) + 0.006 * (1 - x * x));
  }
  geometry.computeVertexNormals();
  return geometry;
}

// The entire interaction lives inside this component; RecipePage.jsx stays unchanged.
const MAGICAL_MODE = false; // restrained, physical book motion
const ANIMATION_SECONDS = 3.20;
const smoothstep = (a, b, x) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

// Printed paper is a single texture on the deforming surface, not separate
// floating rectangles. This keeps the ink attached to the curling sheet.
function makeInteriorTexture(book, side = "right", pageNumber = 1) {
  const [canvas, g] = makeCanvas(768, 1120);
  const W = canvas.width, H = canvas.height;
  g.fillStyle = "#f7f0e2";
  g.fillRect(0, 0, W, H);
  // Subtle paper fibres and warm shading near the binding.
  const shade = g.createLinearGradient(0, 0, W, 0);
  if (side === "right") {
    shade.addColorStop(0, "rgba(82,58,38,.17)");
    shade.addColorStop(.12, "rgba(82,58,38,.035)");
    shade.addColorStop(1, "rgba(255,255,255,.025)");
  } else {
    shade.addColorStop(0, "rgba(255,255,255,.025)");
    shade.addColorStop(.88, "rgba(82,58,38,.035)");
    shade.addColorStop(1, "rgba(82,58,38,.17)");
  }
  g.fillStyle = shade; g.fillRect(0, 0, W, H);
  let seed = pageNumber * 193 + 71;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < 13000; i++) {
    g.fillStyle = random() > .5 ? "rgba(104,82,53,.022)" : "rgba(255,255,255,.11)";
    g.fillRect(random()*W, random()*H, 1, 1);
  }
  g.fillStyle = "#8b7663";
  g.font = '19px Georgia, serif';
  g.textAlign = "center";
  g.fillText("THE RECIPE BOOK", W/2, 80);
  g.fillStyle = "#49372b";
  g.font = 'bold 51px Georgia, serif';
  g.fillText(book.name, W/2, 180);
  g.strokeStyle = "#c6ac8a"; g.lineWidth = 2;
  g.beginPath(); g.moveTo(95, 217); g.lineTo(W-95, 217); g.stroke();
  // A recipe-like editorial layout, with real texture rather than 3D bars.
  const lengths = [.93,.84,.96,.88,.76,.94,.86,.91,.69,.95,.81,.89];
  lengths.forEach((length, i) => {
    const y = 280 + i * 54;
    g.fillStyle = i % 4 === 0 ? "rgba(79,58,43,.52)" : "rgba(79,58,43,.28)";
    g.fillRect(95, y, (W-190)*length, i%4===0 ? 5 : 3);
  });
  g.fillStyle = "#998775"; g.font = '19px Georgia, serif';
  g.fillText(String(pageNumber).padStart(2, '0'), W/2, H-65);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function InteriorSpread({ book }) {
  const right = useMemo(() => makeInteriorTexture(book, "right", 3), [book]);
  useEffect(() => () => { right.dispose(); }, [right]);
  const w = BOOK_WIDTH - .17, h = BOOK_HEIGHT - .15;
  return (
    <group position={[-BOOK_WIDTH/2 + .085, 0, BOOK_DEPTH/2 - BOARD_T + .009]}>
      {/* Right-hand page lies on the page block; the left page is visible
          when the front cover swings open. */}
      <mesh position={[w/2, 0, 0.008]}>
        <planeGeometry args={[w, h, 16, 1]} />
        <meshStandardMaterial map={right} roughness={1} side={THREE.DoubleSide} />
      </mesh>

    </group>
  );
}

function InsideCover({ book }) {
  const texture = useMemo(() => makeInteriorTexture(book, "left", 2), [book]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={[0, 0, BOOK_DEPTH/2 - BOARD_T - .004]}>
      <planeGeometry args={[BOOK_WIDTH - .14, BOOK_HEIGHT - .13]} />
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} roughness={1} />
    </mesh>
  );
}

function TurningPage({ index, progress, book }) {
  const pivot = useRef();
  const w = BOOK_WIDTH - .17;
  const h = BOOK_HEIGHT - .15;
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(w, h, 32, 10);
    g.translate(w/2, 0, 0); // bind the actual mesh at its left edge
    return g;
  }, [w, h]);
  const front = useMemo(() => makeInteriorTexture(book, "right", index * 2 + 5), [book, index]);
  const back = useMemo(() => makeInteriorTexture(book, "left", index * 2 + 6), [book, index]);
  useEffect(() => () => { geometry.dispose(); front.dispose(); back.dispose(); }, [geometry, front, back]);
  useFrame(() => {
    const start = 1.45 + index * .23;
    const turn = smoothstep(start, start + .68, progress.current);
    if (pivot.current) pivot.current.rotation.y = -Math.PI * .96 * turn;
    const pos = geometry.attributes.position;
    // The sheet starts and ends nearly flat, arching naturally in transit.
    const curl = Math.sin(Math.PI * turn);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const u = x / w;
      const y = pos.getY(i);
      const verticalTaper = .92 + .08 * Math.cos(y/h * Math.PI);
      pos.setZ(i, Math.sin(u * Math.PI) * .21 * curl * verticalTaper + .018 * u * curl);
    }
    pos.needsUpdate = true;
    geometry.computeVertexNormals();
  });
  return (
    <group ref={pivot} position={[-BOOK_WIDTH/2 + .085, 0, BOOK_DEPTH/2 - BOARD_T + .018 + index*.003]}>
      <mesh geometry={geometry}>
        <meshStandardMaterial map={front} side={THREE.FrontSide} roughness={1} />
      </mesh>
      <mesh geometry={geometry}>
        <meshStandardMaterial map={back} side={THREE.BackSide} roughness={1} />
      </mesh>
    </group>
  );
}

function Sparkles({ progress }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = state.clock.elapsedTime * 0.2;
    ref.current.visible = progress.current > 0.4 && progress.current < 3.15;
  });
  return (
    <group ref={ref} position={[0, 0, 0.4]} visible={false}>
      {Array.from({ length: 22 }, (_, i) => {
        const angle = i * 2.39996;
        const radius = 1.55 + (i % 4) * 0.18;
        return (
          <mesh key={i} position={[Math.cos(angle) * radius, Math.sin(angle) * radius * 1.1, (i % 3) * 0.09]}>
            <octahedronGeometry args={[0.025 + (i % 3) * 0.015, 0]} />
            <meshBasicMaterial color={i % 3 === 0 ? '#F4C77B' : i % 3 === 1 ? '#FFF8D6' : '#E7A5BA'} />
          </mesh>
        );
      })}
    </group>
  );
}

function Cookbook({ book, position, onSelect, activeBook, onBookClick, magical = false }) {
  const groupRef = useRef();
  const coverRef = useRef();
  const progress = useRef(0);
  const finished = useRef(false);
  const [hovered, setHovered] = useState(false);
  const active = activeBook === book.name;
  const busy = activeBook !== null;

  const boardGeometry = useMemo(() => makeBoardGeometry(), []);
  useEffect(() => () => boardGeometry.dispose(), [boardGeometry]);
  const linen = getLinenTexture();
  const edgeSide = getEdgeTexture(true);
  const edgeTop = getEdgeTexture(false);
  useEffect(() => () => { document.body.style.cursor = 'auto'; }, []);

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;
    if (active) {
      progress.current = Math.min(ANIMATION_SECONDS + 0.1, progress.current + delta);
      const t = progress.current;
      const approach = smoothstep(0, magical ? 1.2 : 1.0, t);
      const float = magical ? Math.sin(t * 6) * 0.08 * approach : 0;
      // Translate from its own shelf slot to the middle of the scene.
      // Final beat: move INTO the open book. The parent page switches
      // to the selected recipe collection at the end of this push.
      const enter = smoothstep(2.38, 3.12, t);
      g.position.set(
        -position[0] * approach,
        (-position[1] - 0.65) * approach + float,
        5.5 * approach + 7.0 * enter
      );
      const grow = (1 + (magical ? 0.75 : 0.62) * approach) * (1 + 3.2 * enter);
      g.scale.setScalar(grow);
      g.rotation.set(0, -0.075 * (1 - approach), magical ? Math.sin(t * 3) * 0.045 * (1 - approach) : 0);
      if (coverRef.current) {
        coverRef.current.rotation.y = -Math.PI * 0.92 * smoothstep(magical ? 1.05 : 0.95, magical ? 1.85 : 1.75, t);
      }
      if (t >= ANIMATION_SECONDS && !finished.current) {
        finished.current = true;
        onSelect?.(book.name);
      }
    } else {
      const k = 1 - Math.exp(-8 * delta);
      g.position.z = THREE.MathUtils.lerp(g.position.z, !busy && hovered ? 0.7 : 0, k);
      g.position.y = THREE.MathUtils.lerp(g.position.y, !busy && hovered ? 0.16 : 0, k);
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, !busy && hovered ? -0.2 : -0.075, k);
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, !busy && hovered ? Math.sin(state.clock.elapsedTime * 3.2) * 0.012 : 0, k);
    }
  });

  const pageW = BOOK_WIDTH - 0.12;
  const pageH = BOOK_HEIGHT - 0.1;
  const pageD = BOOK_DEPTH - BOARD_T * 2;

  return (
    <group position={position}>
      <group
        ref={groupRef}
        rotation={[0, -0.075, 0]}
        onPointerOver={(event) => {
          event.stopPropagation();
          if (!busy) { setHovered(true); document.body.style.cursor = 'pointer'; }
        }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
        onClick={(event) => {
          event.stopPropagation();
          if (!busy) { setHovered(false); document.body.style.cursor = 'auto'; onBookClick(book.name); }
        }}
      >
        {/* Back hardcover board */}
        <mesh geometry={boardGeometry} position={[0, 0, -BOOK_DEPTH / 2 + BOARD_T / 2]}>
          <meshStandardMaterial color={book.color} map={linen} roughness={0.94} />
        </mesh>
        {/* Book spine */}
        
{/* Cloth-wrapped, rounded spine: understated rather than decorative. */}
        <group position={[-BOOK_WIDTH / 2 + 0.025, 0, 0]}>
          <RoundedBox args={[0.115, BOOK_HEIGHT - 0.015, BOOK_DEPTH + 0.01]} radius={0.05} smoothness={10}>
            <meshPhysicalMaterial color={book.color} map={linen} roughness={0.93} clearcoat={0.03} />
          </RoundedBox>
          {/* Recessed hinge grooves at the junction with each board. */}
          {[-1, 1].map((side) => (
            <mesh key={side} position={[0.068, 0, side * (BOOK_DEPTH / 2 - 0.016)]}>
              <boxGeometry args={[0.009, BOOK_HEIGHT - 0.035, 0.004]} />
              <meshStandardMaterial color="#382d26" transparent opacity={0.24} roughness={1} />
            </mesh>
          ))}
        </group>

        {/* Fine paper block, recessed behind the overhanging covers. */}
        <mesh position={[0.035, 0, 0]}>
          <boxGeometry args={[pageW - 0.05, pageH - 0.02, pageD]} />
          <meshStandardMaterial attach="material-0" map={edgeSide} roughness={1} />
          <meshStandardMaterial attach="material-1" map={edgeSide} roughness={1} />
          <meshStandardMaterial attach="material-2" map={edgeTop} roughness={1} />
          <meshStandardMaterial attach="material-3" map={edgeTop} roughness={1} />
          <meshStandardMaterial attach="material-4" color="#f5ecd9" roughness={1} />
          <meshStandardMaterial attach="material-5" color="#e8dcc6" roughness={1} />
        </mesh>

        {/* Ribbon bookmark */}
        <mesh position={[0.35, BOOK_HEIGHT / 2 - 0.055, 0]} rotation={[0, 0, -0.1]}>
          <boxGeometry args={[0.055, 0.4, 0.012]} />
          <meshStandardMaterial color={book.ribbon} roughness={0.55} />
        </mesh>
        {/* Front cover and cover art swing together from the left spine. */}
        <group ref={coverRef} position={[-BOOK_WIDTH / 2, 0, 0]}>
          <group position={[BOOK_WIDTH / 2, 0, 0]}>
            <mesh geometry={boardGeometry} position={[0, 0, BOOK_DEPTH / 2 - BOARD_T / 2]}>
              <meshStandardMaterial color={book.color} map={linen} roughness={0.94} side={THREE.DoubleSide} />
            </mesh>
            <CoverFace book={book} />
            {active && <InsideCover book={book} />}
          </group>
        </group>
        {/* Printed pages become visible as the hardcover opens. */}
        {active && <InteriorSpread book={book} />}
        {active && Array.from({ length: 4 }, (_, i) => (
          <TurningPage key={i} index={i} progress={progress} book={book} />
        ))}
        {magical && active && <Sparkles progress={progress} />}
      </group>
    </group>
  );
}

// -----------------------------------------------------
// 6. WOODEN SHELF
// -----------------------------------------------------

function WoodenShelf() {
  const wood = getWoodTexture();
  const plankH = 0.16;

  return (
    <group>
      {/* Main plank with softly rounded edges */}
      <RoundedBox
        args={[SHELF_WIDTH, plankH, 1.05]}
        radius={0.045}
        smoothness={4}
        position={[0, SHELF_TOP - plankH / 2, 0]}
      >
        <meshStandardMaterial map={wood} roughness={0.8} />
      </RoundedBox>

      {/* Cute little corbel brackets underneath */}
      {[-1, 1].map((side) => (
        <RoundedBox
          key={side}
          args={[0.2, 0.36, 0.7]}
          radius={0.05}
          smoothness={4}
          position={[side * 4.3, SHELF_TOP - plankH - 0.15, -0.02]}
        >
          <meshStandardMaterial color="#9A6C48" map={wood} roughness={0.85} />
        </RoundedBox>
      ))}
    </group>
  );
}

// -----------------------------------------------------
// 7. CUTE EXTRAS: SMILING PLANT + STEAMING MUG
// -----------------------------------------------------

function Face({ y = 0, z, spread, size = 0.02 }) {
  const ink = "#3B2A24";
  return (
    <group position={[0, y, 0]}>
      {[-1, 1].map((s) => (
        <group key={s}>
          {/* eyes */}
          <mesh position={[s * spread, 0.02, z]}>
            <sphereGeometry args={[size, 12, 12]} />
            <meshStandardMaterial color={ink} roughness={0.4} />
          </mesh>
          {/* rosy cheeks */}
          <mesh
            position={[s * spread * 1.55, -0.015, z - 0.012]}
            scale={[1.6, 0.9, 0.3]}
          >
            <sphereGeometry args={[size * 1.1, 12, 12]} />
            <meshStandardMaterial color="#F4A6B4" roughness={0.9} />
          </mesh>
        </group>
      ))}
      {/* smile */}
      <mesh position={[0, -0.012, z]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[size * 1.1, size * 0.28, 8, 16, Math.PI]} />
        <meshStandardMaterial color={ink} />
      </mesh>
    </group>
  );
}

function Plant(props) {
  const leaves = [
    { count: 8, radius: 0.09, rise: 0.15, scale: [0.065, 0.2, 0.035], tilt: 0.6, color: "#8FB996" },
    { count: 6, radius: 0.045, rise: 0.12, scale: [0.05, 0.15, 0.03], tilt: 0.25, color: "#A8CDA0" },
  ];

  return (
    <group {...props}>
      {/* pot */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.22, 0.17, 0.3, 32]} />
        <meshStandardMaterial color="#F3D9C4" roughness={0.7} />
      </mesh>
      {/* rim */}
      <mesh position={[0, 0.29, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.05, 32]} />
        <meshStandardMaterial color="#EBC9AE" roughness={0.7} />
      </mesh>
      {/* soil */}
      <mesh position={[0, 0.315, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.2, 32]} />
        <meshStandardMaterial color="#5A4033" roughness={1} />
      </mesh>

      <Face y={0.13} z={0.187} spread={0.07} />

      {/* succulent rosette */}
      {leaves.map((ring, r) =>
        Array.from({ length: ring.count }, (_, i) => {
          const angle = (i / ring.count) * Math.PI * 2 + r * 0.4;
          return (
            <group key={`${r}-${i}`} rotation={[0, angle, 0]}>
              <mesh
                position={[0, 0.31 + ring.rise, ring.radius]}
                rotation={[ring.tilt, 0, 0]}
                scale={ring.scale}
              >
                <sphereGeometry args={[1, 16, 16]} />
                <meshStandardMaterial color={ring.color} roughness={0.6} />
              </mesh>
            </group>
          );
        })
      )}
    </group>
  );
}

function Mug(props) {
  const steamRef = useRef();

  useFrame((state) => {
    if (!steamRef.current) return;
    steamRef.current.children.forEach((puff, i) => {
      const t = (state.clock.elapsedTime * 0.3 + i / 3) % 1;
      puff.position.y = t * 0.55;
      puff.position.x = Math.sin(t * 6 + i * 2) * 0.035;
      puff.scale.setScalar(0.6 + t * 0.9);
      puff.material.opacity = 0.32 * (1 - t);
    });
  });

  return (
    <group {...props}>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.15, 0.14, 0.3, 32]} />
        <meshStandardMaterial color="#F6C9D0" roughness={0.35} />
      </mesh>
      {/* coffee */}
      <mesh position={[0, 0.285, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.13, 32]} />
        <meshStandardMaterial color="#6B4430" roughness={0.3} />
      </mesh>
      {/* handle */}
      <mesh position={[0.15, 0.15, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <torusGeometry args={[0.085, 0.022, 12, 24, Math.PI]} />
        <meshStandardMaterial color="#F6C9D0" roughness={0.35} />
      </mesh>

      <Face y={0.12} z={0.142} spread={0.05} size={0.017} />

      {/* steam */}
      <group ref={steamRef} position={[0, 0.3, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} userData={{ skip: true }}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.3} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// -----------------------------------------------------
// 8. RESPONSIVE SCENE
// -----------------------------------------------------

function BookshelfScene({ onSelect, onStart }) {
  const { viewport } = useThree();
  const sceneRef = useRef();
  const [activeBook, setActiveBook] = useState(null);

  // Everything casts + receives soft shadows (except meshes flagged "skip").
  useEffect(() => {
    sceneRef.current?.traverse((object) => {
      if (object.isMesh && !object.userData.skip) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
  });

  // Scale the whole shelf to fit the canvas width.
  const scale = Math.min(1.12, viewport.width / 12.4);

  return (
    <>
      {/* Soft, warm studio lighting */}
      <hemisphereLight args={["#FFF6E8", "#C9A98A", 0.85]} />
      <directionalLight
        position={[-4, 6, 9]}
        intensity={1.65}
        color="#FFF1DE"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-radius={3}
      />
      <directionalLight position={[6, 2, 6]} intensity={0.35} color="#FFE3C7" />

      <group ref={sceneRef} scale={scale} position={[0, 1.2 * scale, 0]}>
         <mesh position={[0, 0, -0.8]} receiveShadow userData={{ skip: true }}>
          <planeGeometry args={[30, 14]} />
          <shadowMaterial opacity={0.14} />
        </mesh>

        
{/* TOP SHELF — Everyday Cookbooks */}
{EVERYDAY_BOOKS.map((book, index) => (
  <Cookbook
    key={book.name}
    book={book}
    position={[(index - 2) * BOOK_SPACING, 1.65, 0.1]}
    onSelect={onSelect}
    activeBook={activeBook}
    onBookClick={(name) => { setActiveBook(name); onStart?.(name); }}
    magical={MAGICAL_MODE}
  />
))}

{/* BOTTOM SHELF — Dietary Cookbooks */}
{DIETARY_BOOKS.map((book, index) => (
  <Cookbook
    key={book.name}
    book={book}
    position={[(index - 1.5) * BOOK_SPACING, -2.2, 0.1]}
    onSelect={onSelect}
    activeBook={activeBook}
    onBookClick={(name) => { setActiveBook(name); onStart?.(name); }}
    magical={MAGICAL_MODE}
  />
))}


        
{/* Top shelf — Everyday Collection */}
<group position={[0, 1.65, 0]}>
  <WoodenShelf />
</group>

{/* Bottom shelf — Special Diet Collection */}
<group position={[0, -2.2, 0]}>
  <WoodenShelf />
</group>


        {/* Decorations sitting on the shelf ends */}
        <Plant position={[-5.2, 1.65 + SHELF_TOP, 0.12]} />
        <Mug position={[5.25, 1.65 + SHELF_TOP, 0.12]} />
      </group>
    </>
  );
}

// -----------------------------------------------------
// 9. MAIN EXPORTED COMPONENT
// -----------------------------------------------------

export default function CookbookShelf({ onSelect, onStart }) {
  return (
    <div
      className="cookbook-shelf-container"
      style={{
        width: "100%",
        height: "clamp(550px, 55vw, 700px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Canvas
        shadows
        orthographic
        
camera={{
  position: [0, 0, 18],
  zoom: 75,
  near: 0.1,
  far: 100,
}}

        onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
        gl={{
          antialias: true,
          alpha: true,
        }}
        dpr={[1, 2]}
        style={{
          background: "transparent",
        }}
      >
        <Suspense fallback={null}>
          <BookshelfScene onSelect={onSelect} onStart={onStart} />
        </Suspense>
      </Canvas>
    </div>
  );
}
