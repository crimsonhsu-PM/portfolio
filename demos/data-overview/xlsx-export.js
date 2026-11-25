// Small, dependency-free XLSX writer for the dashboard's demonstration export.
(() => {
  const encoder = new TextEncoder();
  const escapeXml = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]);
  const column = index => {
    let name = "";
    for (let n = index + 1; n; n = Math.floor((n - 1) / 26)) name = String.fromCharCode(65 + (n - 1) % 26) + name;
    return name;
  };
  const crcTable = Uint32Array.from({ length: 256 }, (_, index) => {
    let value = index;
    for (let bit = 0; bit < 8; bit++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    return value >>> 0;
  });
  const crc32 = bytes => {
    let value = 0xffffffff;
    for (const byte of bytes) value = crcTable[(value ^ byte) & 255] ^ (value >>> 8);
    return (value ^ 0xffffffff) >>> 0;
  };
  const header = size => {
    const bytes = new Uint8Array(size);
    const view = new DataView(bytes.buffer);
    return { bytes, u16: (at, value) => view.setUint16(at, value, true), u32: (at, value) => view.setUint32(at, value, true) };
  };
  const zip = entries => {
    const parts = [], directory = [];
    let offset = 0, directorySize = 0;
    for (const [path, content] of entries) {
      const name = encoder.encode(path), data = encoder.encode(content), checksum = crc32(data);
      const local = header(30);
      local.u32(0, 0x04034b50); local.u16(4, 20); local.u16(6, 0x0800);
      local.u16(10, 0); local.u16(12, 33); local.u32(14, checksum);
      local.u32(18, data.length); local.u32(22, data.length); local.u16(26, name.length);
      parts.push(local.bytes, name, data);
      const central = header(46);
      central.u32(0, 0x02014b50); central.u16(4, 20); central.u16(6, 20);
      central.u16(8, 0x0800); central.u16(12, 0); central.u16(14, 33);
      central.u32(16, checksum); central.u32(20, data.length); central.u32(24, data.length);
      central.u16(28, name.length); central.u32(42, offset);
      directory.push(central.bytes, name);
      offset += local.bytes.length + name.length + data.length;
      directorySize += central.bytes.length + name.length;
    }
    const end = header(22);
    end.u32(0, 0x06054b50); end.u16(8, entries.length); end.u16(10, entries.length);
    end.u32(12, directorySize); end.u32(16, offset);
    return new Blob([...parts, ...directory, end.bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  };
  window.createSimpleXlsx = rows => {
    const sheetRows = rows.map((row, rowIndex) => `<row r="${rowIndex + 1}">${row.map((value, columnIndex) => {
      const ref = `${column(columnIndex)}${rowIndex + 1}`;
      return typeof value === "number" && Number.isFinite(value)
        ? `<c r="${ref}"><v>${value}</v></c>`
        : `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value ?? "")}</t></is></c>`;
    }).join("")}</row>`).join("");
    return zip([
      ["[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'],
      ["_rels/.rels", '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
      ["xl/workbook.xml", '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="當前代理數據" sheetId="1" r:id="rId1"/></sheets></workbook>'],
      ["xl/_rels/workbook.xml.rels", '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>'],
      ["xl/worksheets/sheet1.xml", `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData></worksheet>`]
    ]);
  };
})();
