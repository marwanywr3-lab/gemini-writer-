/**
 * محرك التحرير الأدبي وإدارة الفصول والإحصائيات الحية
 */

class StoryEditor {
  constructor() {
    this.editorEl = document.getElementById('story-editor');
    this.titleInput = document.getElementById('current-chapter-title');
    this.subtitleInput = document.getElementById('current-chapter-subtitle');
    this.chaptersListEl = document.getElementById('chapters-list');
    this.saveIndicator = document.getElementById('save-status-indicator');
    this.canvasContainer = document.getElementById('canvas-container');

    this.saveTimeout = null;
    this.typewriterActive = false;
    this.sessionStartWords = 0;

    this.initEvents();
  }

  initEvents() {
    // رصد تغييرات النص للحفظ التلقائي وحساب الإحصائيات
    this.editorEl.addEventListener('input', () => {
      this.handleInput();
      if (this.typewriterActive) this.centerActiveLine();
    });

    this.titleInput.addEventListener('input', () => {
      this.updateCurrentChapterMeta();
    });

    this.subtitleInput.addEventListener('input', () => {
      this.updateCurrentChapterMeta();
    });

    // أدوات شريط التنسيق الخفيف
    document.querySelectorAll('.tool-btn[data-cmd]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const cmd = btn.dataset.cmd;
        this.executeCommand(cmd);
      });
    });

    // تغيير الخط
    const fontSelect = document.getElementById('font-family-select');
    fontSelect.addEventListener('change', (e) => {
      this.setFontFamily(e.target.value);
    });

    // تكبير وتصغير الخط
    document.getElementById('font-size-inc').addEventListener('click', () => this.adjustFontSize(2));
    document.getElementById('font-size-dec').addEventListener('click', () => this.adjustFontSize(-2));

    // زر وضع الآلة الكاتبة
    const twBtn = document.getElementById('typewriter-toggle-btn');
    twBtn.addEventListener('click', () => {
      this.typewriterActive = !this.typewriterActive;
      twBtn.classList.toggle('active', this.typewriterActive);
      if (this.typewriterActive) this.centerActiveLine();
    });

    // إضافة فصل جديد
    document.getElementById('add-chapter-btn').addEventListener('click', () => {
      this.addNewChapter();
    });

    // هدف الكلمات اليومي
    const goalInput = document.getElementById('daily-goal-input');
    goalInput.addEventListener('change', (e) => {
      const val = parseInt(e.target.value, 10) || 1000;
      window.appStorage.data.settings.dailyGoal = val;
      window.appStorage.save();
      this.updateStats();
    });
  }

  loadActiveChapter() {
    const chapters = window.appStorage.data.chapters;
    if (!chapters || chapters.length === 0) {
      this.addNewChapter();
      return;
    }

    let activeId = window.appStorage.data.activeChapterId;
    let chapter = chapters.find(c => c.id === activeId);
    if (!chapter) {
      chapter = chapters[0];
      window.appStorage.data.activeChapterId = chapter.id;
    }

    this.titleInput.value = chapter.title || '';
    this.subtitleInput.value = chapter.subtitle || '';
    this.editorEl.innerHTML = chapter.content || '<p></p>';

    this.renderChaptersList();
    this.updateStats();
    this.sessionStartWords = this.countWords(this.editorEl.innerText);
  }

  handleInput() {
    this.indicateSaving(true);
    clearTimeout(this.saveTimeout);

    this.saveTimeout = setTimeout(() => {
      this.saveCurrentChapterContent();
      this.updateStats();
      this.indicateSaving(false);
    }, 400);
  }

  saveCurrentChapterContent() {
    const activeId = window.appStorage.data.activeChapterId;
    const chapters = window.appStorage.data.chapters;
    const chapter = chapters.find(c => c.id === activeId);
    if (chapter) {
      chapter.title = this.titleInput.value.trim() || 'فصل بلا عنوان';
      chapter.subtitle = this.subtitleInput.value.trim();
      chapter.content = this.editorEl.innerHTML;
      window.appStorage.save();
      this.renderChaptersList();
    }
  }

  updateCurrentChapterMeta() {
    const activeId = window.appStorage.data.activeChapterId;
    const chapters = window.appStorage.data.chapters;
    const chapter = chapters.find(c => c.id === activeId);
    if (chapter) {
      chapter.title = this.titleInput.value.trim() || 'فصل بلا عنوان';
      chapter.subtitle = this.subtitleInput.value.trim();
      window.appStorage.save();
      this.renderChaptersList();
    }
  }

  renderChaptersList() {
    const chapters = window.appStorage.data.chapters || [];
    const activeId = window.appStorage.data.activeChapterId;
    this.chaptersListEl.innerHTML = '';

    chapters.forEach((ch, index) => {
      const item = document.createElement('div');
      item.className = 'chapter-item' + (ch.id === activeId ? ' active' : '');
      const words = this.countWords(this.extractTextFromHtml(ch.content));

      const statusLabels = {
        draft: 'مسودة',
        review: 'مراجعة',
        complete: 'مكتمل'
      };

      item.innerHTML = `
        <div class="chapter-item-top">
          <span class="chapter-title-text" title="${ch.title}">${ch.title}</span>
          <div class="chapter-actions">
            <button class="mini-icon-btn status-toggle-btn" title="تغيير حالة الفصل">
              <span class="chapter-status-tag ${ch.status || 'draft'}">${statusLabels[ch.status] || 'مسودة'}</span>
            </button>
            <button class="mini-icon-btn move-up-btn" title="تحريك لأعلى">▲</button>
            <button class="mini-icon-btn move-down-btn" title="تحريك لأسفل">▼</button>
            <button class="mini-icon-btn delete-chapter-btn" title="حذف الفصل">✕</button>
          </div>
        </div>
        <div class="chapter-item-bottom">
          <span>${words} كلمة</span>
          <span>فصل ${index + 1}</span>
        </div>
      `;

      // التبديل إلى هذا الفصل
      item.addEventListener('click', (e) => {
        if (e.target.closest('.chapter-actions')) return;
        this.saveCurrentChapterContent();
        window.appStorage.data.activeChapterId = ch.id;
        window.appStorage.save();
        this.loadActiveChapter();
      });

      // تبديل حالة الفصل
      const statusBtn = item.querySelector('.status-toggle-btn');
      statusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cycle = { draft: 'review', review: 'complete', complete: 'draft' };
        ch.status = cycle[ch.status] || 'draft';
        window.appStorage.save();
        this.renderChaptersList();
      });

      // تحريك لأعلى
      const upBtn = item.querySelector('.move-up-btn');
      upBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (index > 0) {
          const temp = chapters[index];
          chapters[index] = chapters[index - 1];
          chapters[index - 1] = temp;
          window.appStorage.save();
          this.renderChaptersList();
        }
      });

      // تحريك لأسفل
      const downBtn = item.querySelector('.move-down-btn');
      downBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (index < chapters.length - 1) {
          const temp = chapters[index];
          chapters[index] = chapters[index + 1];
          chapters[index + 1] = temp;
          window.appStorage.save();
          this.renderChaptersList();
        }
      });

      // حذف الفصل
      const delBtn = item.querySelector('.delete-chapter-btn');
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (chapters.length <= 1) {
          alert('يجب أن تحتوي الرواية على فصل واحد على الأقل.');
          return;
        }
        if (confirm(`هل أنت متأكد من حذف "${ch.title}"؟`)) {
          window.appStorage.data.chapters = chapters.filter(c => c.id !== ch.id);
          if (window.appStorage.data.activeChapterId === ch.id) {
            window.appStorage.data.activeChapterId = window.appStorage.data.chapters[0].id;
          }
          window.appStorage.save();
          this.loadActiveChapter();
        }
      });

      this.chaptersListEl.appendChild(item);
    });
  }

  addNewChapter() {
    this.saveCurrentChapterContent();
    const count = (window.appStorage.data.chapters || []).length + 1;
    const newCh = {
      id: "ch_" + Date.now(),
      title: `الفصل ${count}`,
      subtitle: "مشهد جديد...",
      status: "draft",
      content: "<p></p>"
    };

    if (!window.appStorage.data.chapters) window.appStorage.data.chapters = [];
    window.appStorage.data.chapters.push(newCh);
    window.appStorage.data.activeChapterId = newCh.id;
    window.appStorage.save();

    this.loadActiveChapter();
    this.titleInput.focus();
    this.titleInput.select();
  }

  executeCommand(cmd) {
    this.editorEl.focus();
    if (cmd === 'bold') {
      document.execCommand('bold', false, null);
    } else if (cmd === 'italic') {
      document.execCommand('italic', false, null);
    } else if (cmd === 'heading') {
      document.execCommand('formatBlock', false, '<h2>');
    } else if (cmd === 'quote') {
      document.execCommand('formatBlock', false, '<blockquote>');
    } else if (cmd === 'divider') {
      document.execCommand('insertHorizontalRule', false, null);
    }
    this.handleInput();
  }

  setFontFamily(fontKey) {
    this.editorEl.classList.remove('font-amiri', 'font-alexandria', 'font-tajawal', 'font-system');
    this.editorEl.classList.add('font-' + fontKey);
    window.appStorage.data.settings.font = fontKey;
    window.appStorage.save();
  }

  adjustFontSize(delta) {
    let current = parseInt(window.getComputedStyle(this.editorEl).fontSize, 10) || 18;
    current = Math.max(14, Math.min(32, current + delta));
    this.editorEl.style.fontSize = current + 'px';
    window.appStorage.data.settings.fontSize = current;
    window.appStorage.save();
  }

  centerActiveLine() {
    const selection = window.getSelection();
    if (!selection || !selection.focusNode) return;
    const node = selection.focusNode.nodeType === 3 ? selection.focusNode.parentNode : selection.focusNode;
    if (node && this.editorEl.contains(node)) {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  indicateSaving(isSaving) {
    if (isSaving) {
      this.saveIndicator.classList.add('saving');
      this.saveIndicator.querySelector('.save-label').textContent = 'جارٍ الحفظ...';
    } else {
      this.saveIndicator.classList.remove('saving');
      this.saveIndicator.querySelector('.save-label').textContent = 'تم الحفظ تلقائياً';
    }
  }

  countWords(text) {
    if (!text) return 0;
    const clean = text.replace(/<[^>]*>/g, ' ').replace(/[\n\r\t]+/g, ' ').trim();
    if (!clean) return 0;
    const matches = clean.match(/[\u0600-\u06FF\w\d_-]+/g);
    return matches ? matches.length : 0;
  }

  extractTextFromHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html || '';
    return tmp.innerText || tmp.textContent || '';
  }

  updateStats() {
    const chapters = window.appStorage.data.chapters || [];
    let totalWords = 0;
    let totalChars = 0;

    chapters.forEach(ch => {
      const text = this.extractTextFromHtml(ch.content);
      totalWords += this.countWords(text);
      totalChars += text.length;
    });

    const activeText = this.editorEl.innerText || '';
    const chapterWords = this.countWords(activeText);

    // تحديث الأرقام في الواجهة
    document.getElementById('status-chapter-words').textContent = chapterWords.toLocaleString('ar-SA');
    document.getElementById('status-total-words').textContent = totalWords.toLocaleString('ar-SA');
    document.getElementById('stats-total-words').textContent = totalWords.toLocaleString('ar-SA');
    document.getElementById('stats-total-chapters').textContent = chapters.length.toLocaleString('ar-SA');
    document.getElementById('stats-total-chars').textContent = totalChars.toLocaleString('ar-SA');

    // زمن القراءة: 180 كلمة بالدقيقة
    const minutes = Math.ceil(totalWords / 180);
    const readStr = minutes <= 1 ? 'أقل من دقيقة' : `${minutes} دقائق`;
    document.getElementById('status-read-time').textContent = readStr;
    document.getElementById('stats-reading-time').textContent = `${minutes} د`;

    // هدف الجلسة اليومي
    const goal = window.appStorage.data.settings.dailyGoal || 1000;
    document.getElementById('daily-goal-input').value = goal;
    const pct = Math.min(100, Math.round((totalWords / goal) * 100));
    document.getElementById('goal-progress-fill').style.width = pct + '%';
    document.getElementById('goal-progress-text').textContent = `${totalWords.toLocaleString('ar-SA')} من ${goal.toLocaleString('ar-SA')} كلمة (${pct}%)`;
  }
}

window.storyEditor = new StoryEditor();
