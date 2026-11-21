/**
 * 浏览器端纯本地 PDF 文本提取器（基于 Mozilla pdfjs-dist）：
 * 按 Y 坐标容差分组 + X 坐标排序还原银行对账单真实表格行，
 * 无需将敏感财务 PDF 上传至第三方服务器即可完成解析。
 */
export async function extractTextFromPdfBytes(
  bytes: Uint8Array
): Promise<{ text: string; pages: number }> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const loadingTask = pdfjs.getDocument({ data: bytes });
  const doc = await loadingTask.promise;

  const pageTexts: string[] = [];

  try {
    for (let pageNum = 1; pageNum <= doc.numPages; pageNum += 1) {
      const page = await doc.getPage(pageNum);
      const content = await page.getTextContent();

      const items = content.items
        .map((item) => {
          if (!("str" in item) || !item.str.trim()) return null;
          const transform = item.transform as number[];
          return {
            text: item.str,
            x: transform[4] ?? 0,
            y: transform[5] ?? 0,
          };
        })
        .filter((v): v is { text: string; x: number; y: number } => v !== null);

      // PDF 坐标系 Y 轴自底向上，按 Y 降序、同 Y 行内按 X 升序排列
      items.sort((a, b) => {
        if (Math.abs(a.y - b.y) > 3) return b.y - a.y;
        return a.x - b.x;
      });

      const lines: string[] = [];
      let currentLine: string[] = [];
      let currentY: number | null = null;

      for (const item of items) {
        if (currentY === null || Math.abs(item.y - currentY) <= 3) {
          currentLine.push(item.text);
          if (currentY === null) currentY = item.y;
        } else {
          lines.push(currentLine.join(" ").replace(/\s+/g, " ").trim());
          currentLine = [item.text];
          currentY = item.y;
        }
      }
      if (currentLine.length > 0) {
        lines.push(currentLine.join(" ").replace(/\s+/g, " ").trim());
      }

      if (lines.length > 0) {
        pageTexts.push(lines.join("\n"));
      }
    }
  } finally {
    await loadingTask.destroy();
  }

  return {
    text: pageTexts.join("\n"),
    pages: doc.numPages,
  };
}
