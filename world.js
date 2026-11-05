/**
 * إدارة الأماكن والعوالم والملاحظات السردية (World & Lore)
 */

class WorldManager {
  constructor() {
    this.listEl = document.getElementById('lore-list');
    this.modal = document.getElementById('lore-modal');
    this.form = document.getElementById('lore-form');
    this.initEvents();
  }

  initEvents() {
    document.getElementById('add-lore-btn').addEventListener('click', () => {
      this.openModal();
    });

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveLore();
    });
  }

  render() {
    const lores = window.appStorage.data.lore || [];
    this.listEl.innerHTML = '';

    if (lores.length === 0) {
      this.listEl.innerHTML = `
        <div style="text-align: center; padding: 2rem 1rem; color: var(--text-muted); font-size: 0.85rem;">
          لا توجد ملاحظات أو أماكن مدونة بعد.<br>دوّن خيوط الحبكة، جغرافيا الأماكن، والتفاصيل الزمنية.
        </div>
      `;
      return;
    }

    lores.forEach(item => {
      const card = document.createElement('div');
      card.className = 'lore-card';

      card.innerHTML = `
        <div class="lore-header">
          <span class="lore-title">${item.title}</span>
          <span class="lore-cat-tag">${item.category || 'ملاحظة'}</span>
        </div>
        <div class="lore-body">${item.desc || ''}</div>
      `;

      card.addEventListener('click', () => {
        this.openModal(item);
      });

      this.listEl.appendChild(card);
    });
  }

  openModal(item = null) {
    document.getElementById('lore-modal-title').textContent = item ? 'تعديل الملاحظة/المكان' : 'إضافة مكان أو ملاحظة';
    document.getElementById('lore-id').value = item ? item.id : '';
    document.getElementById('lore-title').value = item ? item.title : '';
    document.getElementById('lore-category').value = item ? item.category : 'مكان';
    document.getElementById('lore-desc').value = item ? (item.desc || '') : '';

    this.modal.classList.remove('hidden');
    document.getElementById('lore-title').focus();
  }

  closeModal() {
    this.modal.classList.add('hidden');
    this.form.reset();
  }

  saveLore() {
    const id = document.getElementById('lore-id').value || ('lore_' + Date.now());
    const title = document.getElementById('lore-title').value.trim();
    if (!title) return;

    const category = document.getElementById('lore-category').value;
    const desc = document.getElementById('lore-desc').value.trim();

    const loreData = { id, title, category, desc };
    const lores = window.appStorage.data.lore || [];
    const index = lores.findIndex(l => l.id === id);

    if (index >= 0) {
      lores[index] = loreData;
    } else {
      lores.push(loreData);
    }

    window.appStorage.data.lore = lores;
    window.appStorage.save();
    this.closeModal();
    this.render();
  }
}

window.worldManager = new WorldManager();
