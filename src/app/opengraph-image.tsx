import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = `${siteConfig.name} のOG画像`;
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: "#F7FAF9",
          color: "#183B4E",
          border: "24px solid #183B4E",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div
            style={{
              width: "148px",
              height: "148px",
              borderRadius: "24px",
              background: "#183B4E",
              color: "#F7FAF9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 64,
              fontWeight: 700,
            }}
          >
            松
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontSize: 54, fontWeight: 700 }}>{siteConfig.name}</div>
            <div style={{ fontSize: 28, color: "#2A7F9E" }}>{siteConfig.englishName}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "920px" }}>
          <div style={{ fontSize: 46, fontWeight: 700, lineHeight: 1.25 }}>
            統計調査を主軸に、日本社会をより正確に理解するための知見を積み上げる
          </div>
          <div style={{ fontSize: 28, lineHeight: 1.5, color: "#24323D" }}>
            方法と根拠を公開しながら、誰もが参照できる知見を届ける独立系シンクタンク
          </div>
        </div>
      </div>
    ),
    size,
  );
}
