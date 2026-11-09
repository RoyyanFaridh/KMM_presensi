
"use client";

import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { flushSync } from "react-dom";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import JSZip from "jszip";

import type { Mudamudi } from "./types";
import { toTitleCase } from "./format";

type ExportQROptions = {
  data: Mudamudi[];
  adminDesa: string | null;
};

const CARD_WIDTH = 280;
const CARD_HEIGHT = 400;

function sanitizeFileName(value: string): string {
  return value
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, " ")
    .replace(/[. ]+$/g, "");
}

function getTimestamp(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate(),
  )}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
}

function createCard(data: Mudamudi): {
  card: HTMLDivElement;
  root: Root;
} {
  const card = document.createElement("div");

  card.style.width = `${CARD_WIDTH}px`;
  card.style.height = `${CARD_HEIGHT}px`;
  card.style.boxSizing = "border-box";
  card.style.padding = "11px";
  card.style.backgroundColor = "#F5F7F5";
  card.style.fontFamily = "Arial, sans-serif";

  const content = createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        border: "1px solid #E5EAE6",
        borderRadius: "16px",
        backgroundColor: "#FFFFFF",
        boxSizing: "border-box",
        padding: "20px 18px",
      },
    },
    createElement(
      "div",
      { style: { textAlign: "center" } },
      createElement(
        "p",
        {
          style: {
            margin: 0,
            color: "#287A50",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "2px",
          },
        },
        "GENARA",
      ),
      createElement(
        "h3",
        {
          style: {
            margin: "5px 0 0",
            color: "#202824",
            fontSize: "20px",
            fontWeight: 600,
          },
        },
        "Kartu QR Presensi",
      ),
      createElement("div", {
        style: {
          width: "28px",
          height: "2px",
          margin: "10px auto 0",
          borderRadius: "999px",
          backgroundColor: "#287A50",
        },
      }),
    ),
    createElement(
      "div",
      {
        style: {
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        },
      },
      createElement(
        "div",
        {
          style: {
            padding: "12px",
            border: "1px solid #E5EAE6",
            borderRadius: "14px",
            backgroundColor: "#FFFFFF",
          },
        },
        createElement(QRCodeSVG, {
          value: `SIKEMA:MUDA_MUDI:${data.qr_id}`,
          level: "M",
          includeMargin: true,
          size: 190,
        }),
      ),
    ),
    createElement(
      "div",
      { style: { textAlign: "center" } },
      createElement(
        "p",
        {
          style: {
            margin: 0,
            color: "#202824",
            fontSize: "17px",
            fontWeight: 600,
            lineHeight: 1.3,
            overflowWrap: "anywhere",
          },
        },
        toTitleCase(data.nama),
      ),
      createElement(
        "p",
        {
          style: {
            margin: "7px 0 0",
            color: "#78827C",
            fontSize: "11px",
            lineHeight: 1.4,
          },
        },
        `${data.desa} · ${data.kelompok}`,
      ),
    ),
    createElement(
      "div",
      {
        style: {
          marginTop: "17px",
          paddingTop: "10px",
          borderTop: "1px solid #E5EAE6",
          textAlign: "center",
        },
      },
      createElement(
        "p",
        {
          style: {
            margin: 0,
            color: "#9AA39D",
            fontFamily: "monospace",
            fontSize: "9px",
          },
        },
        String(data.qr_id),
      ),
    ),
  );

  const root = createRoot(card);

  flushSync(() => {
    root.render(content);
  });

  return { card, root };
}

function uniqueFileName(
  baseName: string,
  usedNames: Set<string>,
): string {
  if (!usedNames.has(baseName)) {
    usedNames.add(baseName);
    return baseName;
  }

  const extensionIndex = baseName.lastIndexOf(".");
  const name =
    extensionIndex >= 0 ? baseName.slice(0, extensionIndex) : baseName;
  const extension =
    extensionIndex >= 0 ? baseName.slice(extensionIndex) : "";

  let counter = 2;
  let candidate = `${name}_${counter}${extension}`;

  while (usedNames.has(candidate)) {
    counter += 1;
    candidate = `${name}_${counter}${extension}`;
  }

  usedNames.add(candidate);
  return candidate;
}

export async function exportMudamudiQR({
  data,
  adminDesa,
}: ExportQROptions): Promise<void> {
  const scopedData = adminDesa
    ? data.filter((item) => item.desa === adminDesa)
    : data;

  if (scopedData.length === 0) {
    throw new Error("Tidak ada data yang dapat diekspor.");
  }

  const zip = new JSZip();
  const container = document.createElement("div");

  container.style.position = "fixed";
  container.style.left = "-10000px";
  container.style.top = "0";
  container.style.width = `${CARD_WIDTH}px`;
  container.style.height = `${CARD_HEIGHT}px`;
  container.style.overflow = "hidden";

  document.body.appendChild(container);

  const usedNamesByFolder = new Map<string, Set<string>>();

  try {
    await document.fonts?.ready;

    for (const item of scopedData) {
      if (!item.qr_id) {
        throw new Error(
          `QR ID tidak tersedia untuk anggota ${item.nama}.`,
        );
      }

      const desaFolder = sanitizeFileName(item.desa || "Tanpa Desa");
      const kelompokFolder = sanitizeFileName(
        item.kelompok || "Tanpa Kelompok",
      );

      const folderPath = `${desaFolder}/${kelompokFolder}`;
      const folder = zip.folder(folderPath);

      if (!folder) {
        throw new Error(`Gagal membuat folder ${folderPath}.`);
      }

      let usedNames = usedNamesByFolder.get(folderPath);

      if (!usedNames) {
        usedNames = new Set<string>();
        usedNamesByFolder.set(folderPath, usedNames);
      }

      const safeName =
        sanitizeFileName(toTitleCase(item.nama)) || "Generus";
      const baseName = `QR_${safeName}_${kelompokFolder}.png`;
      const fileName = uniqueFileName(baseName, usedNames);

      const { card, root } = createCard(item);

      container.appendChild(card);

      try {
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        });

        const dataUrl = await toPng(card, {
          pixelRatio: 4,
          backgroundColor: "#F5F7F5",
          cacheBust: true,
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
        });

        const response = await fetch(dataUrl);
        const blob = await response.blob();

        folder.file(fileName, blob);
      } finally {
        root.unmount();
        card.remove();
      }
    }

    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 6,
      },
    });

    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `QR-Generus_${getTimestamp()}.zip`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  } finally {
    container.remove();
  }
}
