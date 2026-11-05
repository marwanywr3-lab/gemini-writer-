/**
 * إدارة الشخصيات (Character Codex)
 */

class CharactersManager {
  constructor() {
    this.listEl = document.getElementById('characters-list');
    this.modal = document.getElementById('character-modal');
    this.form = document.getElementById('character-form');
    this.initEvents();
  }

  initEvents() {
    document.getElementById('add-character-btn').addEventListener('click', () => {
      this.openModal();
    });

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveCharacter();
    });
  }

  render() {
    const chars = window.appStorage.data.characters || [];
    this.listEl.innerHTML = '';

    if (chars.length === 0) {
      this.listEl.innerHTML = `
        <div style="text-align: center; padding: 2rem 1rem; color: var(--text-muted); font-size: 0.85rem;">
          لا توجد شخصيات مسجلة بعد.<br>أضف أبطال روايتك لتتبع أدوارهم وسماتهم.
        </div>
      `;
      return;
    }

    chars.forEach(char => {
      const card = document.createElement('div');
      card.className = 'char-card';
      const initial = char.name ? char.name.trim().charAt(0) : '؟';

      card.innerHTML = `
        <div class="char-avatar">${initial}</div>
        <div class="char-info">
          <div class="char-header">
            <span class="char-name">${char.name}</span>
            <span class="char-role-badge">${char.role || 'شخصية'}</span>
          </div>
          <div class="char-summary">
            <strong>${char.ageOccupation || ''}</strong>
          </div>
          ${char.goal ? `<div style="font-size: 0.73rem; color: var(--accent); margin-top: 2px;">🎯 ${char.goal}</div>` : ''}
        </div>
      `;

      card.addEventListener('click', () => {
        this.openModal(char);
      });

      this.listEl.appendChild(card);
    });
  }

  openModal(char = null) {
    document.getElementById('character-modal-title').textContent = char ? 'تعديل الشخصية' : 'إضافة شخصية جديدة';
    document.getElementById('char-id').value = char ? char.id : '';
    document.getElementById('char-name').value = char ? char.name : '';
    document.getElementById('char-role').value = char ? char.role : 'بطل';
    document.getElementById('char-age-occupation').value = char ? (char.ageOccupation || '') : '';
    document.getElementById('char-goal').value = char ? (char.goal || '') : '';
    document.getElementById('char-flaw').value = char ? (char.flaw || '') : '';
    document.getElementById('char-notes').value = char ? (char.notes || '') : '';

    this.modal.classList.remove('hidden');
    document.getElementById('char-name').focus();
  }

  closeModal() {
    this.modal.classList.add('hidden');
    this.form.reset();
  }

  saveCharacter() {
    const id = document.getElementById('char-id').value || ('char_' + Date.now());
    const name = document.getElementById('char-name').value.trim();
    if (!name) return;

    const role = document.getElementById('char-role').value;
    const ageOccupation = document.getElementById('char-age-occupation').value.trim();
    const goal = document.getElementById('char-goal').value.trim();
    const flaw = document.getElementById('char-flaw').value.trim();
    const notes = document.getElementById('char-notes').value.trim();

    const charData = { id, name, role, ageOccupation, goal, flaw, notes };

    const chars = window.appStorage.data.characters || [];
    const index = chars.findIndex(c => c.id === id);

    if (index >= 0) {
      chars[index] = charData;
    } else {
      chars.push(charData);
    }

    window.appStorage.data.characters = chars;
    window.appStorage.save();
    this.closeModal();
    this.render();
  }

  deleteCharacter(id) {
    if (!confirm('هل تريد حذف هذه الشخصية من السجل؟')) return;
    window.appStorage.data.characters = (window.appStorage.data.characters || []).filter(c => c.id !== id);
    window.appStorage.save();
    this.closeModal();
    this.render();
  }
}

window.charactersManager = new CharactersManager();
