/**
 * التطبيق الرئيسي: التحكم بالنوافذ والسمات والتبويبات واختصارات لوحة المفاتيح
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. تطبيق السمة المحفوظة
  const savedSettings = window.appStorage.data.settings || {};
  const currentTheme = savedSettings.theme || 'warm';
  setAppTheme(currentTheme);

  // 2. ربط عنوان القصة بالرأس
  const storyTitleInput = document.getElementById('story-title-input');
  storyTitleInput.value = window.appStorage.data.title || 'رواية بلا عنوان';
  storyTitleInput.addEventListener('input', (e) => {
    window.appStorage.data.title = e.target.value.trim() || 'رواية بلا عنوان';
    window.appStorage.save();
  });

  // 3. التبديل بين تبويبات القائمة الجانبية
  const tabs = document.querySelectorAll('.sidebar-tab');
  const panes = document.querySelectorAll('.tab-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const pane = document.getElementById(`tab-content-${target}`);
      if (pane) pane.classList.add('active');
    });
  });

  // 4. زر طي وإظهار القائمة الجانبية
  const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
  const sidebar = document.getElementById('app-sidebar');
  toggleSidebarBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });

  // 5. زر ومحدد السمة
  const themeBtn = document.getElementById('theme-btn');
  const themeDropdown = document.getElementById('theme-dropdown');
  themeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    themeDropdown.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!themeDropdown.contains(e.target)) {
      themeDropdown.classList.add('hidden');
    }
  });

  document.querySelectorAll('.theme-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      const theme = opt.dataset.theme;
      setAppTheme(theme);
      themeDropdown.classList.add('hidden');
    });
  });

  function setAppTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    document.querySelectorAll('.theme-opt').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.theme === themeName);
    });
    if (!window.appStorage.data.settings) window.appStorage.data.settings = {};
    window.appStorage.data.settings.theme = themeName;
    window.appStorage.save();
  }

  // 6. وضع السكون والتركيز النقي Zen Mode
  const zenBtn = document.getElementById('zen-mode-btn');
  const exitZenBtn = document.getElementById('exit-zen-btn');

  function toggleZenMode(enable) {
    if (enable) {
      document.body.classList.add('zen-mode');
      exitZenBtn.classList.remove('hidden');
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      document.body.classList.remove('zen-mode');
      exitZenBtn.classList.add('hidden');
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  zenBtn.addEventListener('click', () => toggleZenMode(true));
  exitZenBtn.addEventListener('click', () => toggleZenMode(false));

  // 7. نافذة مشغل الأصوات
  const ambientBtn = document.getElementById('ambient-audio-btn');
  const ambientModal = document.getElementById('ambient-modal');
  ambientBtn.addEventListener('click', () => {
    ambientModal.classList.remove('hidden');
  });

  document.querySelectorAll('.track-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sound = btn.dataset.sound;
      const isPlaying = window.ambientAudio.toggleTrack(sound);
      btn.classList.toggle('playing', isPlaying);
      btn.textContent = isPlaying ? 'إيقاف' : 'تشغيل';
    });
  });

  document.querySelectorAll('.volume-slider[data-volume]').forEach(slider => {
    slider.addEventListener('input', (e) => {
      const sound = e.target.dataset.volume;
      const val = parseFloat(e.target.value) / 100;
      window.ambientAudio.setTrackVolume(sound, val);
    });
  });

  document.getElementById('master-volume').addEventListener('input', (e) => {
    const val = parseFloat(e.target.value) / 100;
    window.ambientAudio.setMasterVolume(val);
  });

  // 8. نافذة شرارة الإلهام
  const sparksBtn = document.getElementById('sparks-btn');
  const sparksModal = document.getElementById('sparks-modal');
  const sparkQuote = document.getElementById('spark-quote');
  let currentSparkCategory = 'twist';

  sparksBtn.addEventListener('click', () => {
    sparksModal.classList.remove('hidden');
    updateSpark();
  });

  document.querySelectorAll('.spark-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.spark-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSparkCategory = btn.dataset.cat;
      updateSpark();
    });
  });

  document.getElementById('new-spark-btn').addEventListener('click', () => {
    updateSpark();
  });

  document.getElementById('insert-spark-btn').addEventListener('click', () => {
    const quote = sparkQuote.textContent.trim();
    if (quote) {
      document.getElementById('story-editor').focus();
      document.execCommand('insertHTML', false, `<blockquote>${quote}</blockquote><p></p>`);
      window.storyEditor.handleInput();
      sparksModal.classList.add('hidden');
    }
  });

  function updateSpark() {
    sparkQuote.textContent = `"${window.storySparks.getRandom(currentSparkCategory)}"`;
  }

  // 9. إغلاق النوافذ عند الضغط على زر الإغلاق أو الخلفية
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.close;
      document.getElementById(modalId).classList.add('hidden');
    });
  });

  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.add('hidden');
      }
    });
  });

  // 10. ومضة اليوم في تبويب الأهداف
  document.getElementById('daily-writing-tip').textContent = window.storySparks.getRandomTip();

  // 11. أزرار تذييل القائمة الجانبية (تحميل النموذج / مسح جديد)
  document.getElementById('load-sample-btn').addEventListener('click', () => {
    if (confirm('هل ترغب في استبدال العمل الحالي برواية تجريبية نموذجية ("موسم السفرجل العتيق")؟')) {
      window.appStorage.resetToSample();
      location.reload();
    }
  });

  document.getElementById('new-project-btn').addEventListener('click', () => {
    if (confirm('هل ترغب في إفراغ المسودة والبدء برواية جديدة كلياً؟ تأكد من تصدير نسختك الحالية أولاً.')) {
      window.appStorage.createNewProject();
      location.reload();
    }
  });

  // 12. اختصارات لوحة المفاتيح
  document.addEventListener('keydown', (e) => {
    // Ctrl + S: حفظ فوري
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      window.storyEditor.saveCurrentChapterContent();
      window.storyEditor.indicateSaving(false);
    }
    // Ctrl + B: طي / إظهار القائمة الجانبية
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b' && !e.target.isContentEditable) {
      e.preventDefault();
      sidebar.classList.toggle('collapsed');
    }
    // Esc: خروج من وضع السكون أو النوافذ
    if (e.key === 'Escape') {
      toggleZenMode(false);
      document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.add('hidden'));
    }
  });

  // 13. بدء تشغيل المحررات والشخصيات والعوالم
  window.charactersManager.render();
  window.worldManager.render();
  window.storyEditor.loadActiveChapter();

  // استعادة الخط المحدد مسبقاً
  if (savedSettings.font) {
    document.getElementById('font-family-select').value = savedSettings.font;
    window.storyEditor.setFontFamily(savedSettings.font);
  }
  if (savedSettings.fontSize) {
    document.getElementById('story-editor').style.fontSize = savedSettings.fontSize + 'px';
  }
});
