/**
 * تصدير الرواية والمحتوى بصيغ متعددة وطباعة المخطوطة
 */

class ExportManager {
  constructor() {
    this.modal = document.getElementById('export-modal');
    this.initEvents();
  }

  initEvents() {
    document.getElementById('export-modal-btn').addEventListener('click', () => {
      this.modal.classList.remove('hidden');
    });

    document.getElementById('export-print-btn').addEventListener('click', () => {
      this.printBook();
    });

    document.getElementById('export-txt-btn').addEventListener('click', () => {
      this.exportTxt();
    });

    document.getElementById('export-md-btn').addEventListener('click', () => {
      this.exportMarkdown();
    });

    document.getElementById('export-json-btn').addEventListener('click', () => {
      this.exportJson();
    });

    document.getElementById('import-json-input').addEventListener('change', (e) => {
      this.importJson(e.target.files[0]);
    });
  }

  // معاينة وطباعة الكتاب كاملاً
  printBook() {
    const data = window.appStorage.data;
    const printArea = document.getElementById('printable-area');
    
    let html = `
      <div class="print-book-title">
        <h1>${data.title}</h1>
        <p style="font-size: 14pt; margin-top: 20px; color: #555;">مخطوطة روائية كاملة</p>
      </div>
    `;

    (data.chapters || []).forEach((ch, idx) => {
      html += `
        <div class="print-chapter">
          <h2 class="print-chapter-title">${ch.title}</h2>
          ${ch.subtitle ? `<p style="text-align: center; color: #666; margin-bottom: 25pt;">${ch.subtitle}</p>` : ''}
          <div class="print-chapter-body">${ch.content}</div>
        </div>
      `;
    });

    printArea.innerHTML = html;
    printArea.classList.remove('hidden');

    this.modal.classList.add('hidden');
    setTimeout(() => {
      window.print();
      printArea.classList.add('hidden');
    }, 300);
  }

  // تصدير كملف نصي عادي
  exportTxt() {
    const data = window.appStorage.data;
    let txt = `====================================================\n`;
    txt += `  ${data.title}\n`;
    txt += `====================================================\n\n`;

    (data.chapters || []).forEach((ch, idx) => {
      txt += `\n----------------------------------------------------\n`;
      txt += `[ ${ch.title} ]\n`;
      if (ch.subtitle) txt += `${ch.subtitle}\n`;
      txt += `----------------------------------------------------\n\n`;

      const tmp = document.createElement('div');
      tmp.innerHTML = ch.content;
      txt += tmp.innerText + `\n\n`;
    });

    this.downloadFile(txt, `${data.title || 'story'}.txt`, 'text/plain;charset=utf-8');
  }

  // تصدير كملف ماركداون
  exportMarkdown() {
    const data = window.appStorage.data;
    let md = `# ${data.title}\n\n`;

    (data.chapters || []).forEach(ch => {
      md += `## ${ch.title}\n\n`;
      if (ch.subtitle) md += `*${ch.subtitle}*\n\n`;

      let body = ch.content
        .replace(/<h2>(.*?)<\/h2>/gi, '### $1\n\n')
        .replace(/<blockquote>(.*?)<\/blockquote>/gi, '> $1\n\n')
        .replace(/<hr\s*\/?>/gi, '\n***\n\n')
        .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
        .replace(/<b>(.*?)<\/b>/gi, '**$1**')
        .replace(/<i>(.*?)<\/i>/gi, '*$1*')
        .replace(/<[^>]+>/g, '');

      md += body + '\n\n';
    });

    // إضافة الشخصيات كملحق اختياري
    if (data.characters && data.characters.length > 0) {
      md += `\n---\n\n## شخصيات العمل\n\n`;
      data.characters.forEach(c => {
        md += `- **${c.name}** (${c.role}): ${c.ageOccupation}. الدافع: ${c.goal}\n`;
      });
    }

    this.downloadFile(md, `${data.title || 'story'}.md`, 'text/markdown;charset=utf-8');
  }

  // تنزيل نسخة احتياطية JSON
  exportJson() {
    const jsonStr = JSON.stringify(window.appStorage.data, null, 2);
    const filename = `${window.appStorage.data.title || 'sard-story'}-backup.json`;
    this.downloadFile(jsonStr, filename, 'application/json');
  }

  // استيراد نسخة احتياطية
  importJson(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed.chapters && Array.isArray(parsed.chapters)) {
          window.appStorage.data = parsed;
          window.appStorage.save();
          location.reload();
        } else {
          alert('الملف لا يحتوي على بنية قصة صالحة.');
        }
      } catch (err) {
        alert('تعذر قراءة ملف النسخة الاحتياطية.');
      }
    };
    reader.readAsText(file, 'utf-8');
  }

  downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

window.exportManager = new ExportManager();
